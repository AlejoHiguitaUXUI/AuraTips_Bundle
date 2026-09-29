---
description: "Run, debug, or record Playwright tests and live browser automations"
---

# Playwright Workflow

Automate browser interactions, run and debug Playwright test suites, or generate new test specs.

## Command Execution Convention
In this project, always use the local runner:
```bash
npx playwright cli <command> [options]
```
For standard test suite runs:
```bash
npx playwright test [options]
```

## Modes of Operation

When the user invokes `/playwright` with an optional target or instruction:

### 1. Test Suite Execution (`/playwright test` or test verification)
- Run tests: `npx playwright test`
- Run a specific file: `npx playwright test tests/<filename>.spec.ts`
- Headed mode or UI mode: `npx playwright test --ui` or inspect HTML report: `npx playwright show-report`
- If tests fail, analyze the failures, inspect snapshots/traces, and propose or apply fixes.

### 2. Live Browser Navigation & Inspection (`/playwright open <url>`)
- Open target URL: `npx playwright cli open <url>`
- Capture DOM snapshot: `npx playwright cli snapshot`
- Find elements: `npx playwright cli find "<text>"`
- Interact: `npx playwright cli click <target>`, `npx playwright cli fill <target> "<value>"`
- Visual inspection: `npx playwright cli screenshot --filename=<name>.png`
- Console & Network diagnostics: `npx playwright cli console`, `npx playwright cli requests`
- Clean up: `npx playwright cli close`

### 3. Test Generation & Recording (`/playwright record <url>`)
- Start recording session:
  ```bash
  npx playwright cli open <url>
  npx playwright cli recording-start
  ```
- Guide or perform interactions.
- Stop recording: `npx playwright cli recording-stop`
- Assemble the generated code into clean, robust test files in `tests/`.

### 4. Interactive UI Review (`/playwright review <url>`)
- Launch interactive annotation session:
  ```bash
  npx playwright cli open <url>
  npx playwright cli show --annotate
  ```
