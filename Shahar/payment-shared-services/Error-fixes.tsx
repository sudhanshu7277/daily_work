export default defineConfig({
  base: '/nextgengab/ui',
  plugins: [react()],
  // 1. Tell build to target modern ES
  build: {
    target: 'esnext',
  },
  // 2. Tell esbuild (dev server pre-bundling) to target modern ES
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 4200,
    proxy: {
      '/nextgengab/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/shared-services': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // ... rest of config
});




// 1. Update Global SCSS / Stylesheet
// Add this to your root stylesheet (e.g., src/styles.scss 
// or wherever global overlay styles live) or inside ::ng-deep in your component SCSS:


::ng-deep {
  /* 1. Reset MDC Tooltip wrapper */
  .mat-mdc-tooltip.suspect-tooltip {
    overflow: visible !important;
  }

  /* 2. Style the actual surface containing the text */
  .mat-mdc-tooltip.suspect-tooltip .mdc-tooltip__surface,
  .mat-tooltip.suspect-tooltip {
    background-color: #ffffff !important;
    color: #212121 !important;
    border-radius: 4px !important;
    padding: 14px 18px !important;
    max-width: 310px !important;
    font-size: 13.5px !important;
    line-height: 1.45 !important;
    white-space: pre-line !important; /* Preserves newline between title & body */
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.16) !important;
    overflow: visible !important;
    position: relative !important;
    text-align: left !important;

    /* Bold first line (Suspect profile(s) found for this profile) */
    &::first-line {
      font-weight: 700 !important;
      color: #000000 !important;
    }

    /* Left-pointing arrow tail pointing directly to the icon */
    &::before {
      content: '';
      position: absolute;
      top: 14px;
      left: -6px;
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-right: 6px solid #ffffff;
      filter: drop-shadow(-1px 0 1px rgba(0, 0, 0, 0.04));
    }
  }
}


// 2. Verify Template (selection-panel.component.html)
// Make sure your template uses matTooltipClass="suspect-tooltip" 
// and explicitly sets matTooltipPosition="right":


<span
  class="suspect-icon"
  matTooltipPosition="right"
  matTooltipClass="suspect-tooltip"
  matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected."
>!</span>


// 3. Move the Icon Beside the Name (Fix Overlap on ID)

.profile-name-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content; /* Hug the name and icon together instead of expanding */
}