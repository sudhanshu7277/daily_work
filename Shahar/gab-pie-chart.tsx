// =========================================================================
// 🚀 SAFE BIDIRECTIONAL CHART PROCESSOR (INTACT LEFT->RIGHT & ADDED RIGHT->LEFT)
// =========================================================================
const bidirectionalSourceChartSlices = useMemo(() => {
  
    // 1. LEFT-TO-RIGHT (EXISTS & UNTOUCHED): If right filter is empty, use your original working logic
    if (!sourceStatusFilter) {
      const operationalData = sourceCounts || {};
      return Object.entries(operationalData).map(([statusKey, totalCount], idx) => ({
        label: statusKey.replace(/_/g, ' '),
        value: totalCount,
        color: STATUS_COLORS[statusKey] || PIE_COLORS[idx % PIE_COLORS.length]
      }));
    }
  
    // 2. RIGHT-TO-LEFT (ADDED FEATURE): If status filter on the right is selected, show source bifurcation
    const directionalSourceCounts: Record<string, number> = {};
    const baseMetrics = counts || {};
    
    Object.entries(baseMetrics).forEach(([sourceKey, metricPack]: [string, any]) => {
      // Only map sources that have active values under the chosen status dropdown token string
      if (metricPack && typeof metricPack === 'object' && metricPack[sourceStatusFilter]) {
        let normalizedSrc = sourceKey;
        if (sourceKey.includes('SFT')) normalizedSrc = 'CITI_SFT';
        else if (sourceKey.includes('Manual') || sourceKey.includes('MANUAL')) normalizedSrc = 'MANUAL';
        else if (sourceKey.includes('Email') || sourceKey.includes('POLLER')) normalizedSrc = 'EMAIL_POLLER';
        else if (sourceKey.includes('Billing') || sourceKey.includes('BILLING')) normalizedSrc = 'Billing';
  
        // If a left filter value is also simultaneously active, ensure context isolation matches
        if (sourceFilter && normalizedSrc !== sourceFilter) return;
  
        directionalSourceCounts[normalizedSrc] = (directionalSourceCounts[normalizedSrc] || 0) + metricPack[sourceStatusFilter];
      }
    });
  
    return Object.entries(directionalSourceCounts).map(([sourceKey, totalCount]) => {
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
  
  }, [counts, sourceCounts, sourceFilter, sourceStatusFilter]);