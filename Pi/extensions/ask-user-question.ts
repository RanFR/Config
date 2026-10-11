/**
 * Interactive `ask_user_question` tool for pi.
 *
 * Registers a coding-agent tool that pauses the agent and prompts the user
 * with a TUI dialog. Three interaction modes are derived from the parameters:
 *
 * - `text` — free-form input in an inline editor (no `options` given).
 * - `single-select` — arrow-key list with an "Other" free-text escape hatch.
 * - `multi-select` — checkbox list with an additional "Submit" action.
 *
 * In interactive (TUI) mode the dialogs render through `ctx.ui.custom()`;
 * free-text mode also works over RPC via the extension UI protocol.
 *
 * @module
 */
import {
  type ExtensionAPI,
  type ExtensionToolContext,
  keyHint,
  rawKeyHint,
  type Theme,
} from "@earendil-works/pi-coding-agent";
import {
  Editor,
  type EditorTheme,
  getKeybindings,
  Key,
  Text,
  matchesKey,
  truncateToWidth,
  wrapTextWithAnsi,
} from "@earendil-works/pi-tui";
import { Type } from "typebox";

/** A normalized, user-visible option of a question. */
interface AskOption {
  /** Text shown to the user in the list. */
  label: string;
  /** Machine-readable value returned to the model; falls back to `label`. */
  value: string;
  /** Optional secondary text rendered below the label. */
  description?: string;
}

/** An {@link AskOption} augmented with list bookkeeping for rendering. */
interface DisplayOption extends AskOption {
  /** Stable identity used by the multi-select selection map. */
  id: string;
  /** 1-based position shown next to the label (absent for synthetic items). */
  index?: number;
  /** True for the synthetic "Other (custom)" free-text entry. */
  isOther?: boolean;
  /** True for the synthetic "Submit" entry (multi-select only). */
  isSubmit?: boolean;
}

/** Free-form answer submitted through the text-mode editor. */
interface TextAnswer {
  type: "text";
  label: string;
  value: string;
}

/** A pre-defined option chosen by the user. */
interface OptionAnswer {
  type: "option";
  /** Display label of the chosen option. */
  label: string;
  /** Machine-readable value of the chosen option. */
  value: string;
  /** 1-based position of the option in the original list. */
  index: number;
}

/** A custom answer typed into the "Other" editor. */
interface OtherAnswer {
  type: "other";
  label: string;
  value: string;
}

/** Discriminated union of everything the user can submit. */
type AskAnswer = TextAnswer | OptionAnswer | OtherAnswer;

/** Terminal state of a question. */
type AskUserQuestionStatus = "answered" | "cancelled" | "unavailable";

/** Interaction mode derived from the tool parameters. */
type AskUserQuestionMode = "text" | "single-select" | "multi-select";

/**
 * Structured payload attached to the tool result via `details`, letting
 * programmatic consumers (RPC hosts, other extensions) read the outcome
 * without parsing the human-readable text.
 */
interface AskUserQuestionResultDetails {
  status: AskUserQuestionStatus;
  /** The question that was asked. */
  question: string;
  /** Optional extra context that was shown under the question. */
  context?: string;
  /** Interaction mode that was used. */
  mode: AskUserQuestionMode;
  /** Answers in canonical order: by option index, then "other", then "text". */
  answers: AskAnswer[];
  /** Human-readable explanation for non-`answered` statuses. */
  message?: string;
}

/** TypeBox schema for a single entry of the `options` tool parameter. */
const OptionSchema = Type.Object({
  label: Type.String({
    description:
      'Display label for the option. If you recommend an option, place it first and append "(Recommended)" to the label.',
  }),
  value: Type.Optional(
    Type.String({
      description:
        "Optional machine-readable value returned for the option. Defaults to the label.",
    }),
  ),
  description: Type.Optional(
    Type.String({
      description: "Optional extra detail shown below the option.",
    }),
  ),
});

/** TypeBox schema describing the `ask_user_question` tool parameters. */
const AskUserQuestionParams = Type.Object({
  question: Type.String({
    description:
      "The single question to ask the user. Ask exactly one question per tool call.",
  }),
  details: Type.Optional(
    Type.String({
      description:
        "Optional extra context or instructions shown under the question.",
    }),
  ),
  options: Type.Optional(
    Type.Array(OptionSchema, {
      description:
        "Optional multiple-choice options. Omit or pass an empty array for free-form text input. Users will always be able to choose Other and type a custom answer when options are provided.",
    }),
  ),
  multiSelect: Type.Optional(
    Type.Boolean({
      description:
        "Set to true to allow multiple answers to be selected for a question.",
    }),
  ),
});

/**
 * Normalizes the raw `options` parameter: trims all fields, drops options
 * with empty labels, and falls `value` back to `label` when absent.
 *
 * @param options - Raw options as provided by the model (may be undefined).
 * @returns Sanitized options guaranteed to have non-empty labels.
 */
function normalizeOptions(
  options:
    | Array<{ label: string; value?: string; description?: string }>
    | undefined,
): AskOption[] {
  return (options || [])
    .map((option) => ({
      label: option.label.trim(),
      value: option.value?.trim() || option.label.trim(),
      description: option.description?.trim() || undefined,
    }))
    .filter((option) => option.label.length > 0);
}

/**
 * Returns the label for the synthetic "Other" entry, disambiguating to
 * "Other (custom)" when the caller already supplied an option labeled
 * "other" (case-insensitive).
 */
function getOtherLabel(options: AskOption[]): string {
  return options.some((option) => option.label.toLowerCase() === "other")
    ? "Other (custom)"
    : "Other";
}

/** Maps the active pi theme onto the pi-tui editor and select-list roles. */
function createEditorTheme(theme: Theme): EditorTheme {
  return {
    borderColor: (s) => theme.fg("accent", s),
    selectList: {
      selectedPrefix: (t) => theme.fg("accent", t),
      selectedText: (t) => theme.fg("accent", t),
      description: (t) => theme.fg("muted", t),
      scrollInfo: (t) => theme.fg("dim", t),
      noMatch: (t) => theme.fg("warning", t),
    },
  };
}

/**
 * Appends `text` to `lines`, word-wrapped to the content width and truncated
 * to the total width (ANSI-aware via pi-tui helpers).
 *
 * @param lines - Destination array receiving the rendered lines.
 * @param text - Text (may contain ANSI styling) to wrap and append.
 * @param width - Total available width, including the indent.
 * @param indent - Prefix prepended to every wrapped line.
 */
function addWrapped(
  lines: string[],
  text: string,
  width: number,
  indent = "",
): void {
  const contentWidth = Math.max(1, width - indent.length);
  for (const line of wrapTextWithAnsi(text, contentWidth)) {
    lines.push(truncateToWidth(`${indent}${line}`, width));
  }
}

/**
 * Renders the shared frame header: top border, the question text, and an
 * optional muted context paragraph beneath it.
 */
function frameHeader(
  lines: string[],
  theme: Theme,
  width: number,
  question: string,
  context: string | undefined,
): void {
  lines.push(truncateToWidth(theme.fg("accent", "─".repeat(width)), width));
  addWrapped(lines, theme.fg("text", ` ${question}`), width);
  if (context) {
    lines.push("");
    addWrapped(lines, theme.fg("muted", ` ${context}`), width);
  }
  lines.push("");
}

/**
 * Renders the inline editor used to type a custom "Other" answer while
 * edit mode is active.
 */
function frameEditorBlock(
  lines: string[],
  theme: Theme,
  width: number,
  editor: Editor,
): void {
  lines.push("");
  lines.push(
    truncateToWidth(theme.fg("muted", " Write your custom answer:"), width),
  );
  for (const line of editor.render(Math.max(1, width - 2))) {
    lines.push(truncateToWidth(` ${line}`, width));
  }
}

/**
 * Renders the keyboard hint lines and the closing border of the frame.
 */
function frameFooter(
  lines: string[],
  theme: Theme,
  width: number,
  hintLines: string[],
): void {
  lines.push("");
  for (const hint of hintLines) {
    lines.push(truncateToWidth(hint, width));
  }
  lines.push(truncateToWidth(theme.fg("accent", "─".repeat(width)), width));
}

/** Cached frame renderer contract shared by the choice dialogs. */
interface FrameRenderer {
  /** Returns the rendered lines, re-rendering only when `width` changes. */
  render(width: number): string[];
  /** Drops the cache so the next `render()` rebuilds every line. */
  invalidate(): void;
}

/**
 * Wraps `renderContent` in a width-keyed render cache.
 *
 * The cache MUST be keyed on width: pi-tui calls requestRender() but NOT
 * invalidate() on terminal resize, so render() can be re-entered with a new
 * width. Returning stale wider lines trips the TUI width guard and crashes
 * the process.
 *
 * @param requestRender - Repaint trigger passed to the TUI (cache-bust hook).
 * @param renderContent - Renderer producing the full frame for a given width.
 * @returns A memoized {@link FrameRenderer}.
 */
function createFrameRenderer(
  requestRender: () => void,
  renderContent: (width: number) => string[],
): FrameRenderer {
  let cachedLines: string[] | undefined;
  let cachedWidth = -1;
  return {
    render(width: number): string[] {
      if (cachedLines && cachedWidth === width) return cachedLines;
      cachedLines = renderContent(width);
      cachedWidth = width;
      return cachedLines;
    },
    invalidate() {
      cachedLines = undefined;
    },
  };
}

/**
 * Formats one answer the way the model sees it in the tool-result text,
 * e.g. `2. Option label` or `Other: custom text`.
 */
function formatAnswerForModel(answer: AskAnswer): string {
  switch (answer.type) {
    case "text":
      return answer.label;
    case "other":
      return `Other: ${answer.label}`;
    case "option":
      return `${answer.index}. ${answer.label}`;
  }
}

/**
 * Sort key for {@link sortAnswers}: options keep their list order,
 * "other" answers come last, free-text answers last of all.
 */
function answerSortRank(answer: AskAnswer): number {
  switch (answer.type) {
    case "option":
      return answer.index;
    case "other":
      return Number.MAX_SAFE_INTEGER - 1;
    case "text":
      return Number.MAX_SAFE_INTEGER;
  }
}

/** Returns a stable, sorted copy of `answers` ordered by {@link answerSortRank}. */
function sortAnswers(answers: AskAnswer[]): AskAnswer[] {
  return [...answers].sort((a, b) => answerSortRank(a) - answerSortRank(b));
}

/** Assembles the structured `details` payload shared by all tool results. */
function buildStructuredResult(
  status: AskUserQuestionStatus,
  question: string,
  mode: AskUserQuestionMode,
  answers: AskAnswer[],
  context?: string,
  message?: string,
): AskUserQuestionResultDetails {
  return { status, question, context, mode, answers, message };
}

/**
 * Builds the tool result for a question the user dismissed (Esc) or that was
 * aborted mid-flight; reported as `status: "cancelled"`.
 */
function cancelledResult(
  question: string,
  mode: AskUserQuestionMode,
  context?: string,
) {
  const message = "User cancelled the question";
  return {
    content: [{ type: "text" as const, text: message }],
    details: buildStructuredResult(
      "cancelled",
      question,
      mode,
      [],
      context,
      message,
    ),
  };
}

/**
 * Builds the tool result for a question that cannot be shown in the current
 * mode (e.g. no interactive TUI); reported as `status: "unavailable"`.
 */
function unavailableResult(
  question: string,
  mode: AskUserQuestionMode,
  message: string,
  context?: string,
) {
  return {
    content: [{ type: "text" as const, text: message }],
    details: buildStructuredResult(
      "unavailable",
      question,
      mode,
      [],
      context,
      message,
    ),
  };
}

/**
 * Builds the `answered` tool result, formatting the human-readable summary
 * according to the interaction mode (single line for text/single-select,
 * one bullet per answer for multi-select).
 */
function buildResult(
  question: string,
  context: string | undefined,
  mode: AskUserQuestionMode,
  answers: AskAnswer[],
) {
  let text: string;
  if (mode === "text") {
    const answer = answers[0];
    text =
      answer.label.trim().length > 0
        ? `User answered: ${answer.label}`
        : "User submitted an empty response";
  } else if (mode === "single-select") {
    text = `User selected: ${formatAnswerForModel(answers[0])}`;
  } else {
    text = `User selected:\n${answers.map((answer) => `- ${formatAnswerForModel(answer)}`).join("\n")}`;
  }

  return {
    content: [{ type: "text" as const, text }],
    details: buildStructuredResult(
      "answered",
      question,
      mode,
      answers,
      context,
    ),
  };
}

/**
 * Resolves the custom component when the tool call is aborted (pi.abort(),
 * /tree navigation, session switch, RPC host). Without this, the question
 * stays focused forever and the tool promise never settles.
 *
 * Idempotent: the returned finisher settles exactly once and detaches the
 * abort listener afterwards.
 *
 * @param signal - Abort signal of the tool call, if any.
 * @param done - Settle callback provided by `ctx.ui.custom()`.
 * @returns A finisher to call with the result, or `null` on abort.
 */
function connectAbortSignal<T>(
  signal: AbortSignal | undefined,
  done: (result: T) => void,
): (result: T | null) => void {
  let settled = false;
  function finish(result: T | null) {
    if (settled) return;
    settled = true;
    signal?.removeEventListener("abort", onAbort);
    done(result as T);
  }
  const onAbort = () => finish(null);
  signal?.addEventListener("abort", onAbort, { once: true });
  if (signal?.aborted) finish(null);
  return finish;
}

/**
 * Shows a single-select list (options + "Other") and resolves with the
 * user's pick, or `null` if the dialog was cancelled or aborted.
 *
 * Keyboard: ↑/↓ (or j/k) navigate, Enter confirms, Esc cancels. Confirming
 * "Other" opens the inline editor; Enter there submits the custom answer.
 */
function askSingleChoice(
  ctx: ExtensionToolContext,
  question: string,
  context: string | undefined,
  options: AskOption[],
  signal: AbortSignal | undefined,
): Promise<AskAnswer | null> {
  const otherLabel = getOtherLabel(options);
  const allOptions: DisplayOption[] = [
    ...options.map((option, index) => ({
      ...option,
      id: `option:${index}`,
      index: index + 1,
    })),
    { id: "other", label: otherLabel, value: "__other__", isOther: true },
  ];

  return ctx.ui.custom<AskAnswer | null>((tui, theme, _kb, done) => {
    const finish = connectAbortSignal<AskAnswer | null>(signal, done);
    let optionIndex = 0;
    let editMode = false;
    const editor = new Editor(tui, createEditorTheme(theme));

    // Empty input is ignored so the editor stays open.
    editor.onSubmit = (value) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      finish({ type: "other", label: trimmed, value: trimmed });
    };

    function refresh() {
      frame.invalidate();
      tui.requestRender();
    }

    function handleInput(data: string) {
      const kb = getKeybindings();
      if (editMode) {
        if (kb.matches(data, "tui.select.cancel")) {
          editMode = false;
          editor.setText("");
          refresh();
          return;
        }
        editor.handleInput(data);
        refresh();
        return;
      }

      if (kb.matches(data, "tui.select.up") || data === "k") {
        optionIndex = Math.max(0, optionIndex - 1);
        refresh();
        return;
      }
      if (kb.matches(data, "tui.select.down") || data === "j") {
        optionIndex = Math.min(allOptions.length - 1, optionIndex + 1);
        refresh();
        return;
      }
      if (kb.matches(data, "tui.select.confirm") || data === "\n") {
        const selected = allOptions[optionIndex];
        if (selected.isOther) {
          editMode = true;
          editor.setText("");
          refresh();
          return;
        }
        finish({
          type: "option",
          label: selected.label,
          value: selected.value,
          index: selected.index!,
        });
        return;
      }
      if (kb.matches(data, "tui.select.cancel")) {
        finish(null);
      }
    }

    const frame = createFrameRenderer(tui.requestRender.bind(tui), (width) => {
      const lines: string[] = [];
      const add = (text: string) => lines.push(truncateToWidth(text, width));

      frameHeader(lines, theme, width, question, context);

      for (let i = 0; i < allOptions.length; i++) {
        const option = allOptions[i];
        const selected = i === optionIndex;
        const prefix = selected ? theme.fg("accent", "> ") : "  ";
        const label = option.isOther
          ? option.label
          : `${option.index}. ${option.label}`;
        const styled = selected
          ? theme.fg("accent", label)
          : theme.fg("text", label);
        add(`${prefix}${styled}`);
        if (option.description) {
          addWrapped(
            lines,
            theme.fg("muted", option.description),
            width,
            "     ",
          );
        }
      }

      const hintLines: string[] = [];
      if (editMode) {
        frameEditorBlock(lines, theme, width, editor);
        hintLines.push(
          ` ${keyHint("tui.select.confirm", "submit")}  ${keyHint("tui.select.cancel", "go back")}`,
        );
      } else {
        hintLines.push(
          ` ${rawKeyHint("↑↓", "navigate")}  ${keyHint("tui.select.confirm", "select")}  ${keyHint("tui.select.cancel", "cancel")}`,
        );
      }
      frameFooter(lines, theme, width, hintLines);
      return lines;
    });

    return {
      render: frame.render,
      invalidate: frame.invalidate,
      handleInput,
    };
  });
}

/**
 * Shows a checkbox list (options + "Other" + "Submit") and resolves with all
 * selected answers in canonical order (see {@link sortAnswers}), or `null`
 * if the dialog was cancelled or aborted.
 *
 * Keyboard: ↑/↓ (or j/k) navigate, Space toggles, Enter toggles — or submits
 * when the "Submit" row is focused — and Esc cancels. Submitting requires at
 * least one answer; "Other" opens the inline custom-answer editor.
 */
function askMultiChoice(
  ctx: ExtensionToolContext,
  question: string,
  context: string | undefined,
  options: AskOption[],
  signal: AbortSignal | undefined,
): Promise<AskAnswer[] | null> {
  const otherLabel = getOtherLabel(options);
  const choiceItems: DisplayOption[] = options.map((option, index) => ({
    ...option,
    id: `option:${index}`,
    index: index + 1,
  }));
  const submitItem: DisplayOption = {
    id: "submit",
    label: "Submit",
    value: "__submit__",
    isSubmit: true,
  };
  const allItems: DisplayOption[] = [
    ...choiceItems,
    { id: "other", label: otherLabel, value: "__other__", isOther: true },
    submitItem,
  ];

  return ctx.ui.custom<AskAnswer[] | null>((tui, theme, _kb, done) => {
    const finish = connectAbortSignal<AskAnswer[] | null>(signal, done);
    let optionIndex = 0;
    let editMode = false;
    const selected = new Map<string, AskAnswer>();
    const editor = new Editor(tui, createEditorTheme(theme));

    // Empty input is ignored so the editor stays open.
    editor.onSubmit = (value) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      selected.set("other", {
        type: "other",
        label: trimmed,
        value: trimmed,
      });
      editMode = false;
      refresh();
    };

    function refresh() {
      frame.invalidate();
      tui.requestRender();
    }

    function toggleOption(item: DisplayOption) {
      if (selected.has(item.id)) {
        selected.delete(item.id);
      } else {
        selected.set(item.id, {
          type: "option",
          label: item.label,
          value: item.value,
          index: item.index!,
        });
      }
      refresh();
    }

    function handleInput(data: string) {
      const kb = getKeybindings();
      if (editMode) {
        if (kb.matches(data, "tui.select.cancel")) {
          editMode = false;
          editor.setText(selected.get("other")?.label || "");
          refresh();
          return;
        }
        editor.handleInput(data);
        refresh();
        return;
      }

      if (kb.matches(data, "tui.select.up") || data === "k") {
        optionIndex = Math.max(0, optionIndex - 1);
        refresh();
        return;
      }
      if (kb.matches(data, "tui.select.down") || data === "j") {
        optionIndex = Math.min(allItems.length - 1, optionIndex + 1);
        refresh();
        return;
      }

      const current = allItems[optionIndex];
      if (matchesKey(data, Key.space)) {
        if (current.isSubmit) return;
        if (current.isOther) {
          if (selected.has("other")) {
            selected.delete("other");
            refresh();
          } else {
            editMode = true;
            editor.setText("");
            refresh();
          }
          return;
        }
        toggleOption(current);
        return;
      }

      if (kb.matches(data, "tui.select.confirm") || data === "\n") {
        // Enter on "Submit" resolves only with at least one answer chosen.
        if (current.isSubmit) {
          if (selected.size > 0) {
            finish(sortAnswers(Array.from(selected.values())));
          }
          return;
        }
        if (current.isOther) {
          editMode = true;
          editor.setText(selected.get("other")?.label || "");
          refresh();
          return;
        }
        toggleOption(current);
        return;
      }

      if (kb.matches(data, "tui.select.cancel")) {
        finish(null);
      }
    }

    const frame = createFrameRenderer(tui.requestRender.bind(tui), (width) => {
      const lines: string[] = [];
      const add = (text: string) => lines.push(truncateToWidth(text, width));

      frameHeader(lines, theme, width, question, context);

      for (let i = 0; i < allItems.length; i++) {
        const item = allItems[i];
        const isFocused = i === optionIndex;
        const prefix = isFocused ? theme.fg("accent", "> ") : "  ";

        if (item.isSubmit) {
          const label =
            selected.size > 0
              ? `✓ ${item.label} (${selected.size} selected)`
              : `○ ${item.label}`;
          const styled = isFocused
            ? theme.fg("accent", label)
            : theme.fg(selected.size > 0 ? "success" : "dim", label);
          add(`${prefix}${styled}`);
          continue;
        }

        if (item.isOther) {
          const other = selected.get("other");
          const marker = other ? "[x]" : "[ ]";
          const suffix = other ? ` — ${other.label}` : "";
          const styled = isFocused
            ? theme.fg("accent", `${marker} ${item.label}${suffix}`)
            : theme.fg(
                other ? "success" : "text",
                `${marker} ${item.label}${suffix}`,
              );
          add(`${prefix}${styled}`);
          continue;
        }

        const checked = selected.has(item.id);
        const marker = checked ? "[x]" : "[ ]";
        const label = `${marker} ${item.index}. ${item.label}`;
        const styled = isFocused
          ? theme.fg("accent", label)
          : theme.fg(checked ? "success" : "text", label);
        add(`${prefix}${styled}`);
        if (item.description) {
          addWrapped(
            lines,
            theme.fg("muted", item.description),
            width,
            "     ",
          );
        }
      }

      const hintLines: string[] = [];
      if (editMode) {
        frameEditorBlock(lines, theme, width, editor);
        hintLines.push(
          ` ${keyHint("tui.select.confirm", "save")}  ${keyHint("tui.select.cancel", "go back")}`,
        );
      } else {
        if (selected.size === 0) {
          hintLines.push(
            theme.fg(
              "warning",
              " Select at least one answer before submitting.",
            ),
          );
        }
        hintLines.push(
          ` ${rawKeyHint("↑↓", "navigate")}  ${rawKeyHint("Space", "toggle")}  ${keyHint("tui.select.confirm", "toggle/submit")}  ${keyHint("tui.select.cancel", "cancel")}`,
        );
      }
      frameFooter(lines, theme, width, hintLines);
      return lines;
    });

    return {
      render: frame.render,
      invalidate: frame.invalidate,
      handleInput,
    };
  });
}

// Shared UI mutex. ctx.ui.custom()/editor can only handle one active call at
// a time, so ALL pop-up-style tools (ask_user_question, quiz, ...) must
// serialize against each other, not just against themselves. We stash one
// mutex on globalThis so separate extension files can share it without
// importing each other.
const SHARED_UI_LOCK_KEY = "__piSharedUiLock";
/** Minimal async mutex used to serialize pop-up-style UIs. */
interface SharedUiLock {
  /** Runs `fn` only after every previously queued task has finished. */
  withLock<T>(fn: () => T | Promise<T>): Promise<T>;
}
/**
 * Returns the process-wide UI mutex, creating it on first call. The lock is
 * stashed on `globalThis` so separate extension files share one mutex without
 * importing each other (see the rationale above {@link SHARED_UI_LOCK_KEY}).
 */
function getSharedUiLock(): SharedUiLock {
  const g = globalThis as typeof globalThis & {
    __piSharedUiLock?: SharedUiLock;
  };
  if (!g[SHARED_UI_LOCK_KEY]) {
    let chain: Promise<void> = Promise.resolve();
    g[SHARED_UI_LOCK_KEY] = {
      withLock<T>(fn: () => T | Promise<T>): Promise<T> {
        const prev = chain;
        let release: () => void;
        chain = new Promise<void>((r) => {
          release = r;
        });
        return prev.then(fn).finally(() => release!());
      },
    };
  }
  return g[SHARED_UI_LOCK_KEY]!;
}
/** Single shared mutex; every dialog-style tool must acquire it before showing UI. */
const sharedUiLock = getSharedUiLock();

/**
 * Extension entry point: registers the `ask_user_question` tool.
 *
 * The tool pauses agent execution until the user answers, then resolves with
 * a text summary plus structured {@link AskUserQuestionResultDetails}. All
 * dialogs run under the shared UI lock so concurrent pop-up tools queue up
 * instead of fighting over the terminal.
 *
 * @param pi - Extension API used to register the tool.
 */
export default function askUserQuestion(pi: ExtensionAPI) {
  pi.registerTool({
    name: "ask_user_question",
    label: "ask_user_question",
    description:
      "Ask the user a single question and pause execution until they answer. Use this when requirements are ambiguous, user preferences are needed, a decision would materially affect implementation, or you need confirmation before proceeding. Ask exactly one question per tool call, and prefer multiple separate tool calls over bundling unrelated questions together.",
    promptSnippet:
      "Use this tool to ask exactly one clarifying question, missing-requirement question, preference question, or decision question before continuing.",
    promptGuidelines: [
      "Ask exactly one question per tool call.",
      "If you need answers to multiple questions, make multiple separate ask_user_question tool calls instead of combining them into one prompt.",
      'Users will always be able to select "Other" to provide custom text input when options are provided.',
      "Use multiSelect: true only when you need multiple answers to the same question.",
      'If you recommend a specific option, make it the first option in the list and add "(Recommended)" at the end of the label.',
      "Prefer this tool over guessing when requirements, preferences, or implementation choices are unclear.",
      "Use this tool when multiple valid implementation paths exist and the preferred path depends on user choice.",
    ],
    parameters: AskUserQuestionParams,

    async execute(_toolCallId, params, signal, _onUpdate, ctx) {
      const options = normalizeOptions(params.options);
      const context = params.details?.trim() || undefined;
      // Derive the interaction mode: no options -> free-text editor,
      // otherwise single- or multi-select depending on `multiSelect`.
      const mode: AskUserQuestionMode =
        options.length === 0
          ? "text"
          : params.multiSelect
            ? "multi-select"
            : "single-select";

      if (signal?.aborted) {
        return cancelledResult(params.question, mode, context);
      }

      if (mode === "text") {
        // RPC mode forwards ui.editor() through the extension UI protocol.
        if (!ctx.hasUI) {
          return unavailableResult(
            params.question,
            mode,
            "ask_user_question requires interactive or RPC mode",
            context,
          );
        }
      } else if (ctx.mode !== "tui") {
        // ctx.ui.custom() is a no-op outside interactive mode (RPC returns
        // undefined), which would surface as a bogus "user cancelled".
        return unavailableResult(
          params.question,
          mode,
          "ask_user_question with options requires interactive mode",
          context,
        );
      }

      return sharedUiLock.withLock(async () => {
        if (mode === "text") {
          const editorTitle = context
            ? `${params.question}\n\n${context}`
            : params.question;
          const answer = await ctx.ui.editor(editorTitle);
          if (answer === undefined) {
            return cancelledResult(params.question, mode, context);
          }
          return buildResult(params.question, context, mode, [
            { type: "text", label: answer.trim(), value: answer.trim() },
          ]);
        }

        if (mode === "single-select") {
          const answer = await askSingleChoice(
            ctx,
            params.question,
            context,
            options,
            signal,
          );
          if (!answer) {
            return cancelledResult(params.question, mode, context);
          }
          return buildResult(params.question, context, mode, [answer]);
        }

        const answers = await askMultiChoice(
          ctx,
          params.question,
          context,
          options,
          signal,
        );
        if (!answers) {
          return cancelledResult(params.question, mode, context);
        }
        return buildResult(params.question, context, mode, answers);
      });
    },

    /** Renders the collapsed tool-call entry shown in the transcript. */
    renderCall(args, theme) {
      const options = normalizeOptions(
        args.options as
          | Array<{ label: string; value?: string; description?: string }>
          | undefined,
      );
      let text =
        theme.fg("toolTitle", theme.bold("ask_user_question ")) +
        theme.fg("muted", args.question);
      if (args.multiSelect) {
        text += theme.fg("dim", " [multi-select]");
      }
      if (options.length > 0) {
        const labels = [
          ...options.map((option) => option.label),
          getOtherLabel(options),
        ].join(", ");
        text += `\n${theme.fg("dim", `  Options: ${labels}`)}`;
      }
      return new Text(text, 0, 0);
    },

    /**
     * Renders the recorded outcome: warning text for cancelled/unavailable
     * results, otherwise the list of answers.
     */
    renderResult(result, _options, theme) {
      const details = result.details as
        | AskUserQuestionResultDetails
        | undefined;
      if (!details) {
        const first = result.content[0];
        return new Text(first?.type === "text" ? first.text : "", 0, 0);
      }

      if (details.status === "cancelled") {
        return new Text(
          theme.fg("warning", details.message || "Cancelled"),
          0,
          0,
        );
      }

      if (details.status === "unavailable") {
        return new Text(
          theme.fg(
            "warning",
            details.message || "ask_user_question unavailable",
          ),
          0,
          0,
        );
      }

      const lines = details.answers.map((answer) => {
        switch (answer.type) {
          case "text":
            return `${theme.fg("success", "✓ ")}${theme.fg("accent", answer.label || "(empty response)")}`;
          case "other":
            return `${theme.fg("success", "✓ ")}${theme.fg("muted", "Other: ")}${theme.fg("accent", answer.label)}`;
          case "option":
            return `${theme.fg("success", "✓ ")}${theme.fg("accent", `${answer.index}. ${answer.label}`)}`;
        }
      });
      return new Text(lines.join("\n"), 0, 0);
    },
  });
}
