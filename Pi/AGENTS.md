## Python Tooling (uv)

- Use `uv` for all Python environment, dependency, and execution tasks.
- Use `uv run` to run Python scripts, modules, and tools (e.g. `uv run script.py`, `uv run python -m module`, `uv run pytest`). Do not invoke system `python` or `python3` directly.
- Use `uv add` / `uv remove` to manage dependencies. Do not use `pip`, `pip3`, `python -m pip`, or `uv pip` unless explicitly required.
- Use `uv sync` to synchronize the environment with `pyproject.toml` and `uv.lock`. In CI or reproducible runs, use `uv sync --frozen`.
- Do not edit `uv.lock` manually; update it with `uv lock`, `uv add`, or `uv remove`.
- If the project is not already set up for `uv`, run `uv init` first. Use `uv python install` / `uv python pin` when the Python version matters.
