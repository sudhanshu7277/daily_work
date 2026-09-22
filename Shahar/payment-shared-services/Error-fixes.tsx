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
  .mat-mdc-tooltip.suspect-tooltip-panel {
    overflow: visible !important;
    /* Shifts the overlay box so its top-left aligns with the bottom-right of the icon */
    transform: translate(12px, 16px) !important;
  }

  .mat-mdc-tooltip.suspect-tooltip-panel .mdc-tooltip__surface,
  .mat-tooltip.suspect-tooltip-panel {
    background-color: #ffffff !important;
    color: #2b2b2b !important;
    border-radius: 6px !important;
    padding: 14px 18px !important;
    max-width: 320px !important;
    font-size: 13.5px !important;
    line-height: 1.45 !important;
    white-space: pre-line !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.16) !important;
    overflow: visible !important;
    position: relative !important;
    text-align: left !important;

    /* Bold headline */
    &::first-line {
      font-weight: 700 !important;
      color: #000000 !important;
    }

    /* Arrow on top-left edge pointing UP toward the icon */
    &::before {
      content: '';
      position: absolute;
      top: -10px;          /* Sits directly on the top edge */
      left: 14px;          /* Positioned on the left corner directly under the badge */
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 10px solid #ffffff;
      filter: drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.04));
    }
  }
}