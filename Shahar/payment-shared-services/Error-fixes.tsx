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




// 1. Template (selection-panel.component.html)
// Position the tooltip at 'right'


<span
  class="suspect-icon"
  matTooltipPosition="right"
  matTooltipClass="suspect-tooltip-panel"
  matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected."
>!</span>


//2. Component SCSS (selection-panel.component.scss)
// Fix .profile-name-wrap so it does not stretch across the table row, 
// keeping the icon pinned right beside the name:


.profile-row {
  display: flex;
  align-items: center;
}

/* Stop this wrapper from stretching across the row */
.profile-name-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;       /* Prevents expanding into the Proxy OCIF ID column */
  width: fit-content;
  max-width: 100%;
}

.profile-name {
  font-weight: 700;
  font-size: 14px;
  color: $bmo-blue;     /* Keeps existing color variable */
  cursor: pointer;
}

.suspect-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #d97706; /* Suspect warning orange */
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}


// . Tooltip Card & Tail Notch (SCSS or styles.scss)
//Use ::ng-deep (or put this in your root styles.scss 
// without ::ng-deep) to style the white bubble card and 
// place the pointed triangle on the top-left edge:

::ng-deep {
  /* Remove clipping from overlay panel */
  .mat-mdc-tooltip.suspect-tooltip-panel {
    overflow: visible !important;
  }

  /* Style the inner card surface */
  .mat-mdc-tooltip.suspect-tooltip-panel .mdc-tooltip__surface,
  .mat-tooltip.suspect-tooltip-panel {
    background-color: #ffffff !important;
    color: #333333 !important;
    border-radius: 6px !important;
    padding: 14px 18px !important;
    max-width: 330px !important;
    font-size: 13.5px !important;
    line-height: 1.45 !important;
    white-space: pre-line !important;  /* Preserves line breaks */
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.18) !important;
    overflow: visible !important;
    position: relative !important;
    text-align: left !important;
    margin-top: 10px !important;       /* Shifts the card down relative to the icon */

    /* Bold headline */
    &::first-line {
      font-weight: 700 !important;
      color: #111111 !important;
    }

    /* Figma-style triangle pointer pointing up/left to the icon */
    &::before {
      content: '';
      position: absolute;
      top: 12px;
      left: -12px;
      width: 0;
      height: 0;
      border-top: 9px solid transparent;
      border-bottom: 9px solid transparent;
      border-right: 12px solid #ffffff;
      filter: drop-shadow(-2px 0 1px rgba(0, 0, 0, 0.05));
    }
  }
}