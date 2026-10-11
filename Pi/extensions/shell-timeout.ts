/**
 * Caps the execution time of the built-in bash/powershell tools.
 *
 * The `tool_call` event fires before the tool runs, so rewriting
 * `event.input.timeout` here transparently clamps whatever the model
 * requested: unset or non-positive values fall back to
 * {@link DEFAULT_TIMEOUT_S}, and anything above {@link MAX_TIMEOUT_S}
 * is reduced to the ceiling.
 *
 * @module
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";

/** Timeout (in seconds) used when the model omits `timeout`. */
const DEFAULT_TIMEOUT_S = 300;
/** Hard upper bound (in seconds); larger explicit requests are clamped. */
const MAX_TIMEOUT_S = 600;

/**
 * Extension entry point: installs the timeout clamp on shell tool calls.
 *
 * @param pi - Extension API used to subscribe to the `tool_call` event.
 */
export default function (pi: ExtensionAPI) {
  pi.on("tool_call", (event) => {
    // Only touch the built-in shell tools; every other tool passes through.
    if (
      isToolCallEventType("bash", event) ||
      isToolCallEventType("powershell", event)
    ) {
      // Treat unset/invalid timeouts as "use the default".
      const requested =
        typeof event.input.timeout === "number" && event.input.timeout > 0
          ? event.input.timeout
          : DEFAULT_TIMEOUT_S;
      const capped = Math.min(requested, MAX_TIMEOUT_S);
      // Mutate the event input in place only when the value changes.
      if (capped !== event.input.timeout) {
        event.input.timeout = capped;
      }
    }
  });
}
