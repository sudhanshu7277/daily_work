// =========================================================================
// Dynamic Bidirectional Chart Processor Matrix
// =========================================================================
const bidirectionalSourceChartSlices = useMemo(() => {
    const activeRecords = overdueInstructions || [];
  
    // SCENARIO A: Both filters are clear, or only the Left (Source) filter is active
    // -> Show Status breakdown for all/selected sources
    if (!sourceStatusFilter) {
      const statusCounts: Record<string, number> = {};
      
      activeRecords.forEach((item: any) => {
        const src = item.sourceCategory || item.source || 'UNKNOWN';
        let normalizedSrc = 'UNKNOWN';
        if (src.includes('SFT')) normalizedSrc = 'CITI_SFT';
        else if (src.includes('Manual') || src.includes('MANUAL')) normalizedSrc = 'MANUAL';
        else if (src.includes('Email') || src.includes('POLLER')) normalizedSrc = 'EMAIL_POLLER';
        else if (src.includes('Billing') || src.includes('BILLING')) normalizedSrc = 'Billing';
  
        // Filter by source if the left dropdown is active
        if (sourceFilter && normalizedSrc !== sourceFilter) return;
  
        const currentStatus = item.status || 'UNKNOWN';
        statusCounts[currentStatus] = (statusCounts[currentStatus] || 0) + 1;
      });
  
      return Object.entries(statusCounts).map(([statusKey, totalCount], idx) => ({
        label: statusKey.replace(/_/g, ' '),
        value: totalCount,
        // Map to your corporate status colors dictionary, fallback to pie array index sequence
        color: STATUS_COLORS[statusKey] || PIE_COLORS[idx % PIE_COLORS.length]
      }));
    }
  
    // SCENARIO B: The Right (Status) filter is explicitly active
    // -> Pivot chart logic to show a breakdown of SOURCES for that status
    const directionalSourceCounts: Record<string, number> = {};
  
    activeRecords.forEach((item: any) => {
      const currentStatus = item.status || 'UNKNOWN';
      
      // Only look at records matching the selected status
      if (sourceStatusFilter && currentStatus !== sourceStatusFilter) return;
  
      const src = item.sourceCategory || item.source || 'UNKNOWN';
      let normalizedSrc = 'UNKNOWN';
      if (src.includes('SFT')) normalizedSrc = 'CITI_SFT';
      else if (src.includes('Manual') || src.includes('MANUAL')) normalizedSrc = 'MANUAL';
      else if (src.includes('Email') || src.includes('POLLER')) normalizedSrc = 'EMAIL_POLLER';
      else if (src.includes('Billing') || src.includes('BILLING')) normalizedSrc = 'Billing';
  
      // If a left source filter is also selected, ensure it matches
      if (sourceFilter && normalizedSrc !== sourceFilter) return;
  
      directionalSourceCounts[normalizedSrc] = (directionalSourceCounts[normalizedSrc] || 0) + 1;
    });
  
    return Object.entries(directionalSourceCounts).map(([sourceKey, totalCount]) => {
      // Map colors to semantic source tags stably
      const sourceColors: Record<string, string> = {
        'CITI_SFT': '#337ab7',
        'MANUAL': '#5cb85c',
        'EMAIL_POLLER': '#f0ad4e',
        'Billing': '#5bc0de',
        'UNKNOWN': '#9b59b6'
      };
  
      return {
        label: sourceKey,
        value: totalCount,
        color: sourceColors[sourceKey] || '#95a5a6'
      };
    });
  }, [overdueInstructions, sourceFilter, sourceStatusFilter]);

  ///

  <Card body>
  <SimplePieChart slices={bidirectionalSourceChartSlices} />
</Card>