// =========================================================================
// Safe Dynamic Bidirectional Chart Processor Matrix
// =========================================================================
const bidirectionalSourceChartSlices = useMemo(() => {
    // SCENARIO A: Right filter is clear, or only Left (Source) filter is active
    // -> Default to showing Status breakdowns (Your working Left-to-Right relationship)
    if (!sourceStatusFilter) {
      // If a source is chosen on the left, show only that single status package slice
      const operationalData = sourceCounts || {};
      
      return Object.entries(operationalData).map(([statusKey, totalCount], idx) => ({
        label: statusKey.replace(/_/g, ' '),
        value: totalCount,
        color: STATUS_COLORS[statusKey] || PIE_COLORS[idx % PIE_COLORS.length]
      }));
    }
  
    // SCENARIO B: Right (Status) filter is explicitly active
    // -> Pivot chart logic to show a breakdown of SOURCES for that status (Right-to-Left relationship)
    const directionalSourceCounts: Record<string, number> = {};
  
    // Safeguard: Read metrics dynamically from your base counts object safely
    const baseMetrics = counts || {};
    
    Object.entries(baseMetrics).forEach(([sourceKey, metricPack]: [string, any]) => {
      // Only map sources that have active values under the selected status dropdown string
      if (metricPack && typeof metricPack === 'object' && metricPack[sourceStatusFilter]) {
        let normalizedSrc = sourceKey;
        if (sourceKey.includes('SFT')) normalizedSrc = 'CITI_SFT';
        else if (sourceKey.includes('Manual') || sourceKey.includes('MANUAL')) normalizedSrc = 'MANUAL';
        else if (sourceKey.includes('Email') || sourceKey.includes('POLLER')) normalizedSrc = 'EMAIL_POLLER';
        else if (sourceKey.includes('Billing') || sourceKey.includes('BILLING')) normalizedSrc = 'Billing';
  
        // If a left source filter is also selected, enforce it matches
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
    // Tracks your exact, real local file state triggers safely
  }, [counts, sourceCounts, sourceFilter, sourceStatusFilter]);

  <Card body>
  {/* 🚀 FIXED: Pointed straight to your safe bidirectional memo pipeline */}
  <SimplePieChart slices={bidirectionalSourceChartSlices} />
</Card>