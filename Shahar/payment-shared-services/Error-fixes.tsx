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




// Step 1: Fix the Icon Position in selection-panel.component.scss
// In your SCSS, .profile-name-wrap

.profile-name-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  max-width: 100%;
}


//Step 2: Set Right-Bottom Positioning in Template
// In selection-panel.component.html

<span
  class="suspect-icon"
  matTooltipPosition="right"
  matTooltipClass="suspect-tooltip-panel"
  [matTooltipPositionAtOrigin]="true"
  matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected."
>!</span>


//Step 3: Tooltip & Prominent Arrow Styling
// In Figma, the speech notch sits near the top-left 
// edge of the box pointing up toward the badge. 
// Replace your tooltip style in selection-panel.component.scss


::ng-deep {
  .mat-mdc-tooltip.suspect-tooltip-panel {
    overflow: visible !important;
  }

  .mat-mdc-tooltip.suspect-tooltip-panel .mdc-tooltip__surface,
  .mat-tooltip.suspect-tooltip-panel {
    background-color: #ffffff !important;
    color: #2b2b2b !important;
    border-radius: 6px !important;
    padding: 16px 20px !important;
    max-width: 320px !important;
    font-size: 13.5px !important;
    line-height: 1.45 !important;
    white-space: pre-line !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.16) !important;
    overflow: visible !important;
    position: relative !important;
    text-align: left !important;

    /* Bold first heading line */
    &::first-line {
      font-weight: 700 !important;
      color: #111111 !important;
    }

    /* Substantial arrow matching Figma */
    &::before {
      content: '';
      position: absolute;
      /* Place arrow at the top-left edge pointing up/left towards the icon */
      top: 14px;
      left: -10px;
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-right: 10px solid #ffffff;
      filter: drop-shadow(-2px 0 2px rgba(0, 0, 0, 0.05));
    }
  }
}

//Note on arrow orientation: If you prefer the arrow coming off the top edge (if the card sits fully beneath the icon):

top: -10px;
left: 16px;
border-left: 8px solid transparent;
border-right: 8px solid transparent;
border-bottom: 10px solid #ffffff;
border-top: none;