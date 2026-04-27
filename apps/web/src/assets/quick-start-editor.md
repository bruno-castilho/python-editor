# 🚀 Quick Start Guide

Welcome to the Python IDE. This guide covers everything you need to get started writing and running Python code directly in your browser.

---

## 🖥️ IDE Overview

The IDE is a fully in-browser Python development environment. No installation or server-side execution is required — everything runs locally on your machine.

### ✨ Features

- **🖊️ Code editor** — Monaco-based editor (the same engine behind VS Code) with Python syntax highlighting, line numbers, and a minimap.
- **📂 Multi-file support** — Work with multiple `.py` files at the same time using the file tab bar. All files are available as modules to each other.
- **💻 Interactive terminal** — Real-time stdout/stderr output. Supports `input()` calls for interactive programs.
- **▶️ Run / Stop controls** — Execute your project with the **Run** button. Interrupt a running program at any time with the **Stop** button.
- **🗂️ File management** — Create new Python files, remove them (except main.py), and organize your project.
- **💾 Save & export** — Download your project as a `.zip` archive or save it on our servers via the **Save** button.

### 🏃 Basic usage

1. Write your code in `main.py`.
2. Create additional files for helper modules as needed.
3. Press **Run** to execute. Output and errors appear in the terminal below the editor.
4. Use the terminal's input field to respond to `input()` prompts while the program is running.
5. Press **Stop** to interrupt execution at any time.

---

## 🐍 Python Execution via Pyodide

The IDE uses **[Pyodide v0.29.3](https://pyodide.org/en/stable/)** to run Python entirely in the browser through WebAssembly. There is no backend server involved in code execution.

### ⚙️ How it works

- Python runs inside a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API), keeping the browser UI responsive during execution.
- `stdout` and `stderr` are streamed line-by-line to the terminal in real time.
- Standard `input()` is fully supported — the terminal prompts the user and forwards the response to the running program.
- Execution can be interrupted at any time by pressing **Stop**.

### ⚠️ Limitations

| Limitation | Details |
|---|---|
| 🗂️ No filesystem access | Python's `open()` reads/writes are limited to an in-memory virtual FS. Files do not persist between runs. |
| 🌐 No network from Python | Modules such as `socket`, `requests`, and `httpx` cannot open real network connections. |
| 🖼️ No native GUI | Libraries that create windows (`tkinter`, `pygame`, `PyQt`) are not supported. |
| 🔒 No subprocess / OS shell | `subprocess`, `os.system`, and similar calls are unavailable. |

### 📦 Supported packages

Pyodide automatically detects `import` statements and loads the required packages before running your code.

#### ✅ Packages bundled with Pyodide (always available)

These packages are pre-compiled for WebAssembly and load instantly:

`numpy` · `pandas` · `scipy` · `matplotlib` · `scikit-learn` · `sympy` · `pillow` · `cryptography` · `regex` · `lxml` · and many more.

See the full list: [pyodide.org/en/stable/usage/packages-in-pyodide.html](https://pyodide.org/en/stable/usage/packages-in-pyodide.html)

#### 🔌 Pure-Python packages from PyPI (via micropip)

Packages that are **pure Python** (no compiled C extensions) can be installed at runtime using `micropip`:

```python
import micropip
await micropip.install("httpx")
import httpx
```

#### 🚫 Packages that are NOT supported

Any package that requires compiled C extensions and is **not** in Pyodide's bundle cannot be used. Common examples: `torch`, `tensorflow`, `opencv-python`, `psycopg2`.

### 📚 Official documentation

- [Pyodide — Getting Started](https://pyodide.org/en/stable/usage/quickstart.html)
- [Bundled packages list](https://pyodide.org/en/stable/usage/packages-in-pyodide.html)
- [Loading packages with micropip](https://pyodide.org/en/stable/usage/loading-packages.html)

---

## 🤖 Integrated AI Agent

The IDE includes a built-in AI assistant powered by **[OpenRouter](https://openrouter.ai)**.

### 📋 Requirements

You need a free OpenRouter account to use the AI agent. Sign up at [openrouter.ai](https://openrouter.ai).

### 🔗 Connecting your account

1. Click the **Chat AI** button in the editor toolbar.
2. Click **Connect with OpenRouter** — you will be redirected to OpenRouter's authorisation page.
3. Approve the connection. Your API key is stored only in your browser session and is never sent to our servers.

### 💬 Using the agent

- Select which project files to include as context using the file selector in the chat panel.
- Choose a model from the dropdown.
- Type your question or describe what you want the AI to do with your code.
- Responses are streamed in real time and rendered with full markdown and syntax highlighting.

### 💳 Models and credits

| Option | Details |
|---|---|
| 🆓 Free models | Available immediately with no credits required. |
| 💰 Paid models | Require OpenRouter credits. Purchase credits at [openrouter.ai/credits](https://openrouter.ai/credits). |

Browse all available models (including which are free) at [openrouter.ai/models](https://openrouter.ai/models).
