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



// Step 1: Fix the Icon Position in HTML & SCSS
// In selection-panel.component.html, ensure the name and 
// suspect icon stay together in the name column


<div class="profile-row">
  <div class="profile-name-wrap">
    <span class="profile-name">{{ profile.legalName || profile.profileName }}</span>
    @if (profile.isSuspect) {
      <span
        class="suspect-icon"
        matTooltipPosition="right"
        matTooltipClass="suspect-tooltip-panel"
        matTooltip="Suspect profile(s) found for this profile&#10;Search for the profile separately to make sure all associated profile(s) are selected."
      >!</span>
    }
  </div>

  <span class="profile-id">{{ profile.proxyOcifId }}</span>
  <span class="col-action">...</span>
</div>



//In selection-panel.component.scss, ensure .profile-name-wrap 
// does not stretch or push the icon across the row:


.profile-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.profile-name-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;        /* Stop it from filling row and pushing icon to the right */
  width: auto;
}

.suspect-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: #d97706;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}


//Step 2: Force Right-Bottom Placement & Arrow Position
// To position the tooltip card so it starts just below the icon 
// and hangs toward the bottom-right (matching the Figma screenshot






::ng-deep {
  /* Shift overlay pane to the right and downward */
  .cdk-overlay-pane:has(.suspect-tooltip-panel) {
    transform: translate(calc(100% + 28px), 18px) !important;
  }

  /* Fallback transform */
  .mat-mdc-tooltip.suspect-tooltip-panel {
    transform: translate(calc(100% + 28px), 18px) !important;
    overflow: visible !important;
  }

  .mat-mdc-tooltip.suspect-tooltip-panel .mdc-tooltip__surface,
  .mat-tooltip.suspect-tooltip-panel {
    background-color: #ffffff !important;
    color: #2b2b2b !important;
    border-radius: 6px !important;

    /* Narrow width + generous vertical padding and line-height */
    width: 250px !important;
    max-width: 250px !important;
    min-height: 120px !important;
    padding: 18px 20px !important;
    font-size: 13.5px !important;
    line-height: 1.55 !important;
    
    white-space: pre-line !important;
    box-shadow: 0 6px 22px rgba(0, 0, 0, 0.16) !important;
    overflow: visible !important;
    position: relative !important;
    text-align: left !important;

    /* Bold first heading line */
    &::first-line {
      font-weight: 700 !important;
      color: #000000 !important;
      line-height: 1.8 !important;
    }

    /* Left pointer notch pointing toward the suspect icon */
    &::before {
      content: '';
      position: absolute;
      top: 14px;
      left: -12px;
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-right: 12px solid #ffffff;
      filter: drop-shadow(-2px 0 1px rgba(0, 0, 0, 0.05));
    }
  }
}