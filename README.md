# Flex Web Interpreter

A browser-based interpreter for the Flex programming language. Built with modern web technologies, this interpreter runs entirely client-side, with no server required.

## Features

- **100% Client-Side**: Runs entirely in your browser - no server needed
- **Modern UI**: Clean, responsive interface with code editor and interactive terminal
- **Syntax Highlighting**: Full support for Flex language syntax
- **Error Reporting**: Clear, helpful error messages
- **Multiple Syntax Styles**: Support for English, C-style, and Arabic-inspired keywords
- **File Management**: Save and load your programs directly in the browser
- **Example Programs**: Learn Flex with included example programs
- **Standard Library**: Built-in functions for input/output, math, and string operations
- **Progressive Web App**: Install and use offline
- **GitHub Pages Compatible**: Deploy your own instance easily

## How to Use

1. Visit the [Flex Web Interpreter](https://your-username.github.io/flex-web/) on GitHub Pages
2. Or open `index.html` in your browser locally
3. Write your Flex code in the editor panel
4. Click the "Run" button (or press Ctrl+Enter) to execute your code
5. View output and interact with your program in the terminal panel
6. Use the "Save" button to save your programs for later use

## Deploying to GitHub Pages

This interpreter is designed to run entirely on GitHub Pages with no server-side components required.

### Automatic Deployment

1. Fork this repository
2. Go to your repository settings
3. Navigate to "Pages" section
4. Select the main branch as the source
5. Your Flex Web Interpreter will be deployed at `https://your-username.github.io/flex-web/`

### Manual Deployment

1. Clone this repository: `git clone https://github.com/your-username/flex-web.git`
2. Make your changes locally
3. Push to your repository: 
   ```
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
4. GitHub Actions will automatically deploy to GitHub Pages

## Flex Language Overview

Flex is a beginner-friendly programming language designed for learning. It supports multiple syntax styles:

### Basic Syntax

- **Comments**: Begin with `#` or enclosed in `/* ... */`
- **Variables**: Dynamically typed, declare with `var`
- **Printing**: Use `print()` or `etb3()`
- **Input**: Use `scan()`, `da5l()`, or `d5l()`
- **Functions**: Define with `function name(params) { ... }`
- **Conditionals**: Use `if (condition) { ... } else { ... }`
- **Loops**: Both `while` and `for` loops are supported
- **Arrays**: Use square brackets `[]` for array literals

### Example Flex Code

```
# Simple greeting program
etb3("Welcome to Flex!");
etb3("What is your name?");
name = da5l();
etb3("Hello, " + name + "!");

# Simple loop
for (i = 1; i <= 5; i = i + 1) {
  etb3("Counting: " + i);
}
```

## Project Structure

- `index.html`: Main HTML file
- `assets/css/`: Stylesheets
- `js/interpreter/`: Core interpreter components (lexer, parser, interpreter)
- `js/ui/`: UI components (editor, terminal)
- `js/stdlib/`: Standard library functions
- `js/utils/`: Utility functions (error handling, virtual file system)
- `examples/`: Example Flex programs
- `.github/workflows/`: CI/CD pipelines for GitHub Pages deployment
- `service-worker.js`: Service worker for offline capabilities
- `manifest.json`: Web App Manifest for installable PWA

## Development

This project is built with pure JavaScript, HTML, and CSS, with CodeMirror for the editor component. All interpreter components, including lexer, parser, and runtime, are implemented in JavaScript.

### Building Locally

1. Clone the repository
2. Open `index.html` in your browser
3. No build step required for development

## Offline Capabilities

The interpreter supports Progressive Web App (PWA) features, allowing users to:

1. Install it on their device (desktop or mobile)
2. Use it offline
3. Get faster loading times with service worker caching

## License

MIT License - Feel free to use, modify, and distribute this code.

## Credits

Created for learning purposes. Special thanks to the programming language design community for inspiration.
