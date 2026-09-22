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




// 1. Fix the SCSS Layout
// Change .profile-name-wrap to hug the text instead of stretching, and add the tooltip style:


.profile-name-wrap {
  /* Remove or unset flex: 1 if you don't want it expanding across columns */
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  width: fit-content; /* Keeps the name + icon clustered together */
}

/* Ensure suspect-icon sits snug without flex-grow */
.suspect-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #e68a00;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}


//2. Add the Popover/Tooltip Styling
// Add this block at the bottom of selection-panel.component.scss 
// (or inside your root styles.scss) to style the black Material 
// tooltip into the white card shown in Figma:

::ng-deep {
  /* Targets both Material 15+ MDC tooltips and older legacy tooltips */
  .mat-mdc-tooltip.suspect-tooltip-panel,
  .mat-tooltip.suspect-tooltip-panel {
    background-color: #ffffff !important;
    color: #1a1a1a !important;
    border-radius: 4px !important;
    padding: 12px 16px !important;
    max-width: 320px !important;
    font-size: 13px !important;
    line-height: 1.45 !important;
    letter-spacing: 0.1px !important;
    white-space: pre-line !important; /* Preserves the line break */
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16) !important;
    overflow: visible !important;
    position: relative !important;

    /* Bold only the first sentence/line */
    &::first-line {
      font-weight: 700;
      color: #000000;
    }

    /* Left pointing pointer triangle */
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
      filter: drop-shadow(-2px 0 1px rgba(0, 0, 0, 0.04));
    }
  }
}


// 3. Update the Template Verbiage & Position
// In your template (selection-panel.component.html), 
// update the text from "are placed on hold" to "are selected." 
// and add matTooltipPosition="right"


<span
  class="suspect-icon"
  matTooltipPosition="right"
  matTooltipClass="suspect-tooltip-panel"
  matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected."
>!</span>