// ==========================================================================
// Status Indicators (Figma colors: Green = Active, Blue = Lifted, Red = Failed)
// ==========================================================================
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a; // Text label remains neutral dark

  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  // Active (Paused) -> Green dot
  &.status-active-paused {
    .status-dot {
      background-color: #2e7d32;
    }
  }

  // Lifted -> Blue dot
  &.status-lifted {
    .status-dot {
      background-color: $bmo-blue; // #0079c1
    }
  }

  // Failed -> Red dot
  &.status-failed {
    .status-dot {
      background-color: #d32f2f;
    }
  }

  // Submitted (initial temporary state) -> Subtle grey/slate dot
  &.status-submitted {
    .status-dot {
      background-color: #767676;
    }
  }
}


getStatusClass(status: string): string {
  switch (status) {
    case 'Active (Paused)':
      return 'status-active-paused';
    case 'Lifted':
      return 'status-lifted';
    case 'Failed':
      return 'status-failed';
    case 'Submitted':
      return 'status-submitted';
    default:
      return '';
  }
}