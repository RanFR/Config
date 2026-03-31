# ClaudeCode Instructions

## Core Principles

As a ClaudeCode agent, you must strictly adhere to the following principles when generating code:

1.  **KISS (Keep It Simple, Stupid)**
    - Keep code simple and intuitive.
    - Avoid overly complex abstractions and nested logic.
    - Prefer clear standard library implementations over complex custom frameworks.

2.  **YAGNI (You Aren't Gonna Need It)**
    - Only implement features explicitly required by current needs.
    - Avoid "just in case" predictive coding and placeholder code for future features.
    - Do not add unused dependencies or configurations.

3.  **SOLID Principles**
    - **S (Single Responsibility):** Each module, class, or function should do one thing only.
    - **O (Open/Closed):** Open for extension, closed for modification; prefer adding functionality through composition rather than modifying existing code.
    - **L (Liskov Substitution):** Ensure subclasses can transparently replace their base classes without breaking program logic.
    - **I (Interface Segregation):** Don't force dependencies on methods they don't use; keep interfaces lean.
    - **D (Dependency Inversion):** Depend on abstract interfaces, not concrete implementation details.

## Interaction Guidelines

1.  **Language Requirements**
    - Native Language: Simplified Chinese
    - Unless I explicitly specify otherwise, you **must always use Simplified Chinese** for responses, comments, and explanations.

2.  **Discussion First**
    - **No blind execution:** Before writing code or performing critical operations, discuss with me to confirm requirement details and technical approaches.
    - **Solution confirmation:** Only begin execution after we reach consensus on the solution. If requirements are unclear, ask questions proactively—don't guess.

## Output Requirements

- **Simplicity:** Code should be self-explanatory; minimize comments (unless explaining "why").
- **Modularity:** Keep functions small with clear logical layering.
- **Practicality:** Deliver runnable, testable minimum viable code.
