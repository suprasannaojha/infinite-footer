/**
 * Infinite Footer Web Component
 *
 * A framework-agnostic web component that creates an infinite scrolling footer
 * with a canvas-based trailing text effect.
 *
 * @element infinite-footer
 *
 * @attr {string} text - Primary footer text (default: "DEVELOPERS")
 * @attr {string} text-color - Text stroke color (default: "#1d1d1d")
 * @attr {string} bg-color - Background color (default: "#f5f5f5")
 * @attr {number} stroke-width - Text outline width (default: 2.5)
 * @attr {string} font-family - Font family (default: "sans-serif")
 * @attr {boolean} loop-enabled - Enable infinite loop (default: true)
 * @attr {string} texts - JSON array of texts for each loop iteration
 * @attr {number} lerp-factor - Animation smoothness 0-1 (default: 0.1)
 *
 * @fires loop-complete - Fired when infinite loop resets
 * @fires scroll-progress - Fired on scroll with progress details
 *
 * @example
 * <infinite-footer
 *   text="HELLO WORLD"
 *   text-color="#000">
 * </infinite-footer>
 */
class InfiniteFooter extends HTMLElement {
  static get observedAttributes() {
    return [
      "text",
      "text-color",
      "bg-color",
      "stroke-width",
      "font-family",
      "loop-enabled",
      "texts",
      "lerp-factor",
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Internal state
    this._state = {
      dpr: 1,
      prevScrollTop: 0,
      scrollDelta: 0,
      normalizedScroll: 0,
      tockCount: 0,
      maxWidth: 1728,
      windowHeight: 0,
      currentY: 0,
      targetY: 0,
      currentFontSize: 0,
      targetFontSize: 0,
      clearOffset: 0,
      lastClearY: Infinity,
      initialized: false,
    };

    // Config with defaults
    this._config = {
      text: "DEVELOPERS",
      textColor: "#1d1d1d",
      bgColor: "#f5f5f5",
      strokeWidth: 2.5,
      fontFamily: "sans-serif",
      loopEnabled: true,
      texts: null, // Will be computed from text
      lerpFactor: 0.1,
    };

    // Animation frame ID for cleanup
    this._rafId = null;

    // Bound methods for event listeners
    this._boundHandleScroll = this._handleScroll.bind(this);
    this._boundHandleResize = this._handleResize.bind(this);

    // Canvas context
    this._canvas = null;
    this._ctx = null;
    this._container = null;
  }

  connectedCallback() {
    // SSR safety check
    if (typeof window === "undefined") return;

    this._render();
    this._setupCanvas();
    this._attachListeners();
    this._init();
  }

  disconnectedCallback() {
    this._cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "text":
        this._config.text = newValue || "DEVELOPERS";
        // Reset texts array to use new primary text
        if (!this.hasAttribute("texts")) {
          this._config.texts = null;
        }
        break;

      case "text-color":
        this._config.textColor = newValue || "#1d1d1d";
        break;

      case "bg-color":
        this._config.bgColor = newValue || "#f5f5f5";
        if (this._container) {
          this._container.style.background = this._config.bgColor;
        }
        break;

      case "stroke-width":
        this._config.strokeWidth = parseFloat(newValue) || 2.5;
        break;

      case "font-family":
        this._config.fontFamily = newValue || "sans-serif";
        break;

      case "loop-enabled":
        this._config.loopEnabled = newValue !== "false" && newValue !== null;
        break;

      case "texts":
        try {
          this._config.texts = newValue ? JSON.parse(newValue) : null;
        } catch (e) {
          console.warn("Invalid JSON for texts attribute:", e);
          this._config.texts = null;
        }
        break;

      case "lerp-factor":
        this._config.lerpFactor = Math.max(
          0,
          Math.min(1, parseFloat(newValue) || 0.1)
        );
        break;
    }
  }

  // Property getters/setters for framework compatibility
  get text() {
    return this._config.text;
  }
  set text(value) {
    this._config.text = value;
    this.setAttribute("text", value);
  }

  get textColor() {
    return this._config.textColor;
  }
  set textColor(value) {
    this._config.textColor = value;
    this.setAttribute("text-color", value);
  }

  get bgColor() {
    return this._config.bgColor;
  }
  set bgColor(value) {
    this._config.bgColor = value;
    this.setAttribute("bg-color", value);
  }

  get strokeWidth() {
    return this._config.strokeWidth;
  }
  set strokeWidth(value) {
    this._config.strokeWidth = value;
    this.setAttribute("stroke-width", String(value));
  }

  get fontFamily() {
    return this._config.fontFamily;
  }
  set fontFamily(value) {
    this._config.fontFamily = value;
    this.setAttribute("font-family", value);
  }

  get loopEnabled() {
    return this._config.loopEnabled;
  }
  set loopEnabled(value) {
    this._config.loopEnabled = Boolean(value);
    this.setAttribute("loop-enabled", String(value));
  }

  get texts() {
    return this._config.texts || this._getDefaultTexts();
  }
  set texts(value) {
    this._config.texts = Array.isArray(value) ? value : null;
    if (value) {
      this.setAttribute("texts", JSON.stringify(value));
    } else {
      this.removeAttribute("texts");
    }
  }

  get lerpFactor() {
    return this._config.lerpFactor;
  }
  set lerpFactor(value) {
    this._config.lerpFactor = value;
    this.setAttribute("lerp-factor", String(value));
  }

  // Read-only computed properties
  get currentLoopCount() {
    return this._state.tockCount;
  }
  get currentScrollProgress() {
    return this._state.normalizedScroll;
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          background: var(--footer-bg-color, ${this._config.bgColor});
        }

        .footer-container {
          position: relative;
          height: 200vh;
          background: var(--footer-bg-color, ${this._config.bgColor});
        }

        canvas {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          display: block;
        }
      </style>
      <div class="footer-container">
        <canvas></canvas>
      </div>
    `;

    this._container = this.shadowRoot.querySelector(".footer-container");
    this._canvas = this.shadowRoot.querySelector("canvas");
    this._ctx = this._canvas.getContext("2d");
  }

  _setupCanvas() {
    this._state.dpr = window.devicePixelRatio || 1;
    this._state.maxWidth = Math.min(1728, window.innerWidth);
    this._state.windowHeight = window.innerHeight;

    const rect = this._canvas.getBoundingClientRect();
    const newWidth = rect.width * this._state.dpr;
    const newHeight = rect.height * this._state.dpr;

    if (
      this._canvas.width !== newWidth ||
      Math.abs(this._canvas.height - newHeight) > 120
    ) {
      this._canvas.width = newWidth;
      this._canvas.height = newHeight;
    }
  }

  _getDefaultTexts() {
    return [
      this._config.text,
      "You're still here?",
      "It's over.",
      "You can go ❤️",
    ];
  }

  _getCurrentText() {
    const texts = this.texts;
    const index = Math.min(this._state.tockCount, texts.length - 1);
    return texts[index] || this._config.text;
  }

  _getBaseFontSize() {
    const baseFontSize = (this._state.maxWidth / 6.35) * this._state.dpr;
    this._ctx.font = `bold ${baseFontSize}px ${this._config.fontFamily}`;

    const text = this._getCurrentText();
    const letterSpacing = -baseFontSize / 20;
    let textWidth = 0;

    for (let i = 0; i < text.length; i++) {
      textWidth += this._ctx.measureText(text[i]).width;
    }
    textWidth += letterSpacing * (text.length - 1);

    const availableWidth = this._canvas.width * 0.9;
    if (textWidth > availableWidth) {
      return baseFontSize * (availableWidth / textWidth);
    }

    return baseFontSize;
  }

  _drawText() {
    const text = this._getCurrentText();
    const fontSize = this._state.currentFontSize;

    if (fontSize <= 0) return;

    this._ctx.font = `bold ${fontSize}px ${this._config.fontFamily}`;

    const newClearY = Math.max(
      0,
      this._state.currentY - this._state.clearOffset
    );

    if (newClearY < this._state.lastClearY) {
      this._ctx.clearRect(0, 0, this._canvas.width, newClearY);
      this._state.lastClearY = newClearY;
    }

    const letterSpacing = -fontSize / 20;
    let totalWidth = 0;

    for (let i = 0; i < text.length; i++) {
      totalWidth += this._ctx.measureText(text[i]).width;
    }
    totalWidth += letterSpacing * (text.length - 1);

    const startX = this._canvas.width / 2 - totalWidth / 2 + letterSpacing / 2;
    let currentX = startX;

    // Use CSS custom properties or fallback to attributes
    const textColor =
      getComputedStyle(this).getPropertyValue("--footer-text-color").trim() ||
      this._config.textColor;
    const strokeWidth =
      parseFloat(
        getComputedStyle(this).getPropertyValue("--footer-stroke-width").trim()
      ) || this._config.strokeWidth;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      this._ctx.globalCompositeOperation = "source-over";
      this._ctx.strokeStyle = textColor;
      this._ctx.lineWidth = strokeWidth;
      this._ctx.strokeText(char, currentX, this._state.currentY);

      this._ctx.globalCompositeOperation = "destination-out";
      this._ctx.fillStyle = "#000";
      this._ctx.fillText(char, currentX, this._state.currentY);

      currentX += this._ctx.measureText(char).width + letterSpacing;
    }

    this._ctx.globalCompositeOperation = "source-over";
  }

  _getScrollMetrics() {
    const footerRect = this.getBoundingClientRect();
    return {
      scrollTop: footerRect.top - this._state.windowHeight,
      viewportHeight: this._state.windowHeight,
    };
  }

  _handleScroll() {
    if (!this._container) return;

    const prevTop = this._state.prevScrollTop;
    const metrics = this._getScrollMetrics();

    this._state.prevScrollTop = metrics.scrollTop;

    // normalizedScroll:
    // = 0 when footer top edge is exactly at viewport bottom (footer just visible)
    // = 1 when user has scrolled one full viewport height into the footer
    // Increases as user scrolls down
    this._state.normalizedScroll = -(
      (this._state.prevScrollTop -
        this._state.tockCount * metrics.viewportHeight) /
      metrics.viewportHeight
    );

    let fontSize = this._getBaseFontSize();
    if (this._state.tockCount > 0) {
      fontSize -=
        fontSize * Math.sin(this._state.normalizedScroll - 2.2) -
        0.1 * fontSize;
    }

    const offset = fontSize - fontSize / 3.6;
    const canvasHeight = metrics.viewportHeight * this._state.dpr;

    // Text Y position calculation:
    // - Canvas coordinate system: 0 at top, canvasHeight at bottom
    // - strokeText y parameter is the text BASELINE
    // - We want text to be visible immediately when footer appears
    //
    // For the text to be visible at the bottom of canvas when normalizedScroll=0,
    // we set y = canvasHeight (baseline at bottom, text visible above it)
    // As normalizedScroll increases, text moves up (y decreases)

    const baseHeight =
      canvasHeight -
      this._state.normalizedScroll * canvasHeight +
      this._state.tockCount * canvasHeight;

    const textY =
      this._state.tockCount > 0 ? baseHeight + canvasHeight : baseHeight;

    this._state.targetY = textY;
    this._state.clearOffset = offset;
    this._state.targetFontSize = fontSize;

    this._state.scrollDelta = this._state.prevScrollTop - prevTop;

    // Dispatch scroll progress event
    this.dispatchEvent(
      new CustomEvent("scroll-progress", {
        detail: {
          progress: this._state.normalizedScroll,
          loopCount: this._state.tockCount,
          normalizedScroll: this._state.normalizedScroll,
        },
        bubbles: true,
        composed: true,
      })
    );

    // Check if we've reached the bottom (infinite loop logic)
    if (this._config.loopEnabled) {
      const footerRect = this.getBoundingClientRect();
      const footerBottom = footerRect.bottom;

      if (footerBottom < metrics.viewportHeight + 1) {
        this._state.tockCount += 1;

        // Scroll back to top of footer
        window.scrollTo(0, this.offsetTop);

        const newBaseHeight =
          canvasHeight -
          this._state.normalizedScroll * canvasHeight +
          this._state.tockCount * canvasHeight;

        this._state.targetY = newBaseHeight + canvasHeight;

        // Dispatch loop complete event
        this.dispatchEvent(
          new CustomEvent("loop-complete", {
            detail: {
              loopCount: this._state.tockCount,
              currentText: this._getCurrentText(),
            },
            bubbles: true,
            composed: true,
          })
        );
      } else if (
        this._state.scrollDelta > 0 &&
        this._state.scrollDelta < 0.9 * metrics.viewportHeight
      ) {
        this._state.tockCount = 0;
        this._state.lastClearY = Infinity;
      }
    }
  }

  _handleResize() {
    this._setupCanvas();
    this._handleScroll();
  }

  _animate() {
    this._state.currentY +=
      (this._state.targetY - this._state.currentY) * this._config.lerpFactor;
    this._state.currentFontSize +=
      (this._state.targetFontSize - this._state.currentFontSize) *
      this._config.lerpFactor;

    this._drawText();

    this._rafId = requestAnimationFrame(() => this._animate());
  }

  _attachListeners() {
    window.addEventListener("scroll", this._boundHandleScroll, {
      passive: true,
    });
    window.addEventListener("resize", this._boundHandleResize);
  }

  _detachListeners() {
    window.removeEventListener("scroll", this._boundHandleScroll);
    window.removeEventListener("resize", this._boundHandleResize);
  }

  _init() {
    this._setupCanvas();
    this._handleScroll();
    // Snap to target values immediately on init (no lerp delay)
    this._state.currentY = this._state.targetY;
    this._state.currentFontSize = this._state.targetFontSize;
    this._state.initialized = true;
    this._animate();
  }

  _cleanup() {
    this._detachListeners();

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  // Public methods
  reset() {
    this._state.tockCount = 0;
    this._state.lastClearY = Infinity;
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._handleScroll();
  }
}

// Register the custom element
if (typeof window !== "undefined" && !customElements.get("infinite-footer")) {
  customElements.define("infinite-footer", InfiniteFooter);
}

export default InfiniteFooter;
