# 🎨 Infinite Footer Web Component

A framework-agnostic web component that creates an infinite scrolling footer with a canvas-based trailing text effect. Works seamlessly with vanilla JavaScript, React, Vue, Angular, and any other framework.

![Demo](https://img.shields.io/badge/demo-live-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Size](https://img.shields.io/badge/size-~8KB-green)

## ✨ Features

- 🎯 **Framework Agnostic** - Works with React, Vue, Angular, or vanilla JS
- 🎨 **Highly Customizable** - CSS custom properties and comprehensive API
- 📱 **Responsive** - Automatically adapts to viewport and device pixel ratio
- ♾️ **Infinite Loop** - Seamlessly scrolls back to create endless effect
- 🎭 **Canvas-Based** - Smooth 60fps animations with trailing text effect
- 🔄 **Dual Scroll Mode** - Works with window scroll or custom containers
- 📦 **Zero Dependencies** - Pure vanilla JavaScript, no external libraries
- 🎪 **Event-Driven** - Custom events for loop completion and scroll progress
- ♿ **Accessible** - Semantic HTML with ARIA support

## 📦 Installation

### NPM (if published)

```bash
npm install infinite-footer-component
```

### Direct Download

Download `infinite-footer.js` and include it in your project:

```html
<script type="module" src="path/to/infinite-footer.js"></script>
```

### CDN (when available)

```html
<script
  type="module"
  src="https://cdn.example.com/infinite-footer@latest/infinite-footer.js"
></script>
```

## 🚀 Quick Start

### Vanilla HTML

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <div class="content">
      <!-- Your page content -->
    </div>

    <infinite-footer text="DEVELOPERS" footer-height="300vh"> </infinite-footer>

    <script type="module" src="infinite-footer.js"></script>
  </body>
</html>
```

## 🎯 Framework Integration

### React

```jsx
import { useRef, useEffect } from "react";
import "infinite-footer-component";

function App() {
  const footerRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;

    // Set properties (preferred in React)
    footer.text = "HELLO REACT";
    footer.textColor = "#61dafb";
    footer.texts = ["HELLO REACT", "Still scrolling?", "Goodbye!"];

    // Listen to events
    const handleLoop = (e) => {
      console.log("Loop:", e.detail.loopCount);
    };

    footer.addEventListener("loop-complete", handleLoop);

    return () => {
      footer.removeEventListener("loop-complete", handleLoop);
    };
  }, []);

  return (
    <div>
      <h1>My React App</h1>
      {/* Your content */}
      <infinite-footer ref={footerRef}></infinite-footer>
    </div>
  );
}
```

### Vue 3

```vue
<template>
  <div>
    <h1>My Vue App</h1>
    <!-- Your content -->
    <infinite-footer
      ref="footerRef"
      :text="footerText"
      text-color="#42b883"
      @loop-complete="onLoopComplete"
    >
    </infinite-footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import "infinite-footer-component";

const footerRef = ref(null);
const footerText = ref("HELLO VUE");

onMounted(() => {
  const footer = footerRef.value;
  footer.texts = ["HELLO VUE", "Keep going?", "Au revoir!"];
});

const onLoopComplete = (event) => {
  console.log("Loop:", event.detail.loopCount);
};
</script>
```

### Angular

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import "infinite-footer-component";

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}

// component.ts
import { Component, ViewChild, ElementRef } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <h1>My Angular App</h1>
    <infinite-footer
      #footer
      [text]="footerText"
      text-color="#dd0031"
      (loop-complete)="onLoopComplete($event)"
    >
    </infinite-footer>
  `,
})
export class AppComponent {
  @ViewChild("footer") footerElement!: ElementRef;
  footerText = "HELLO ANGULAR";

  ngAfterViewInit() {
    const footer = this.footerElement.nativeElement;
    footer.texts = ["HELLO ANGULAR", "Still here?", "Done!"];
  }

  onLoopComplete(event: CustomEvent) {
    console.log("Loop:", event.detail.loopCount);
  }
}
```

## 🎨 Styling with CSS Custom Properties

You can style the footer using CSS custom properties:

```css
.my-footer {
  --footer-text-color: #ff6b6b;
  --footer-bg-color: #ffffff;
  --footer-stroke-width: 3;
  --footer-font-family: "Arial", sans-serif;
}
```

```html
<infinite-footer class="my-footer" text="STYLED"></infinite-footer>
```

## ⚙️ API Reference

### Attributes

| Attribute          | Type          | Default        | Description                         |
| ------------------ | ------------- | -------------- | ----------------------------------- |
| `text`             | String        | `"DEVELOPERS"` | Primary footer text                 |
| `footer-height`    | String        | `"300vh"`      | Total scrollable height (CSS value) |
| `text-color`       | String        | `"#1d1d1d"`    | Text stroke color                   |
| `bg-color`         | String        | `"#f5f5f5"`    | Background color                    |
| `stroke-width`     | Number        | `2.5`          | Text outline width                  |
| `font-family`      | String        | `"sans-serif"` | Font family                         |
| `loop-enabled`     | Boolean       | `true`         | Enable infinite loop                |
| `texts`            | String (JSON) | `null`         | Array of texts for loop iterations  |
| `scroll-container` | String        | `null`         | CSS selector for scroll context     |
| `lerp-factor`      | Number        | `0.1`          | Animation smoothness (0-1)          |

### Properties

All attributes are also available as JavaScript properties:

```javascript
const footer = document.querySelector("infinite-footer");

// Set properties
footer.text = "HELLO WORLD";
footer.textColor = "#000000";
footer.footerHeight = "400vh";
footer.loopEnabled = true;

// Arrays can be set directly (not as JSON strings)
footer.texts = ["HELLO", "WORLD", "GOODBYE"];

// Get properties
console.log(footer.text); // "HELLO WORLD"
console.log(footer.currentLoopCount); // 0 (read-only)
```

### CSS Custom Properties

| Property                | Default      | Description        |
| ----------------------- | ------------ | ------------------ |
| `--footer-text-color`   | `#1d1d1d`    | Text stroke color  |
| `--footer-bg-color`     | `#f5f5f5`    | Background color   |
| `--footer-stroke-width` | `2.5`        | Text outline width |
| `--footer-font-family`  | `sans-serif` | Font family        |

### Events

#### `loop-complete`

Fired when the infinite loop resets and scrolls back to the top.

```javascript
footer.addEventListener("loop-complete", (event) => {
  console.log("Loop count:", event.detail.loopCount);
  console.log("Current text:", event.detail.currentText);
});
```

**Event Detail:**

- `loopCount` (Number) - Current iteration number
- `currentText` (String) - Text currently being displayed

#### `scroll-progress`

Fired on scroll with progress information.

```javascript
footer.addEventListener("scroll-progress", (event) => {
  console.log("Progress:", event.detail.progress);
  console.log("Loop count:", event.detail.loopCount);
  console.log("Normalized scroll:", event.detail.normalizedScroll);
});
```

**Event Detail:**

- `progress` (Number) - Normalized scroll progress
- `loopCount` (Number) - Current iteration number
- `normalizedScroll` (Number) - Scroll position accounting for loops

### Methods

#### `reset()`

Reset the footer to its initial state.

```javascript
footer.reset();
```

#### `refreshScrollContainer()`

Re-attach scroll listeners (useful if scroll container changes dynamically).

```javascript
footer.refreshScrollContainer();
```

### Read-Only Properties

```javascript
footer.currentLoopCount; // Current iteration number
footer.currentScrollProgress; // Normalized scroll position (0-1)
```

## 🔄 Container Scroll Mode

The footer can work inside a scrollable container instead of the window:

```html
<div id="scrollContainer" style="height: 500px; overflow-y: auto;">
  <div class="content">
    <!-- Your content -->
  </div>

  <infinite-footer
    text="CONTAINER"
    footer-height="600px"
    scroll-container="#scrollContainer"
  >
  </infinite-footer>
</div>
```

The component will automatically detect the scroll container and adjust calculations accordingly.

## 💡 Advanced Usage

### Custom Text Sequences

```javascript
const footer = document.querySelector("infinite-footer");

footer.texts = [
  "WELCOME",
  "KEEP SCROLLING",
  "ALMOST THERE",
  "JUST KIDDING",
  "IT'S INFINITE ♾️",
];
```

### Dynamic Property Updates

```javascript
const footer = document.querySelector("infinite-footer");

// Change text on button click
button.addEventListener("click", () => {
  footer.text = "NEW TEXT";
  footer.reset(); // Reset to show new text immediately
});
```

### Analytics Integration

```javascript
footer.addEventListener("loop-complete", (event) => {
  // Track user engagement
  analytics.track("Footer Loop", {
    loopCount: event.detail.loopCount,
    text: event.detail.currentText,
  });
});
```

### Theme Switching

```javascript
function applyDarkTheme() {
  footer.textColor = "#ffffff";
  footer.bgColor = "#1a1a1a";
}

function applyLightTheme() {
  footer.textColor = "#1d1d1d";
  footer.bgColor = "#f5f5f5";
}
```

## 🎯 Use Cases

- **Portfolio websites** - Eye-catching footer for creative portfolios
- **Product launches** - Build anticipation with scrolling messages
- **Event pages** - Countdown or promotional messaging
- **Brand experiences** - Unique scrolling interactions
- **Documentation sites** - Fun way to acknowledge readers

## 🌐 Browser Support

- Chrome 54+
- Safari 10.1+
- Firefox 63+
- Edge 79+
- Opera 41+

For older browsers, you may need to include web component polyfills.

## ⚡ Performance

- Uses `requestAnimationFrame` for smooth 60fps animations
- Passive scroll listeners for better scroll performance
- Canvas optimization with selective clearing
- Automatic device pixel ratio adjustment
- Efficient memory cleanup on disconnect

## 🐛 Troubleshooting

### Footer not appearing

Make sure the component is imported before use:

```html
<script type="module" src="infinite-footer.js"></script>
```

### React: Properties not updating

Use properties instead of attributes in React:

```javascript
// ❌ Don't do this
<infinite-footer text-color="#000"></infinite-footer>;

// ✅ Do this
const footerRef = useRef(null);
footerRef.current.textColor = "#000";
```

### Vue: Custom element not recognized

Add the component to Vue's custom elements list:

```javascript
// vite.config.js
export default {
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag === "infinite-footer",
      },
    },
  },
};
```

### Angular: Unknown element error

Add `CUSTOM_ELEMENTS_SCHEMA` to your module:

```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
```

## 📝 License

MIT License - feel free to use in personal and commercial projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Credits

Inspired by the infinite footer effect. Reimagined as a modern, framework-agnostic web component.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with ❤️ by the web component community
