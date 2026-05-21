interface VerticalBarItem {
    label: string;
    value: number;
    color: string;
  }
  
  interface VerticalBarChartProps {
    items: VerticalBarItem[];
    barColor?: string;
    rotateLabels?: boolean;
  }
  
  function VerticalBarChart({ items = [], barColor, rotateLabels = false }: VerticalBarChartProps) {
    // 1. Calculate maxVal safely (handles your max value of 18 perfectly)
    const maxVal = Math.max(...items.map(i => i.value), 1);
  
    return (
      <El 
        className="lmn-d-flex lmn-justify-content-center" 
        style={{ 
          height: '220px', 
          gap: '12px', 
          padding: '0 8px', 
          width: '100%',
          marginBottom: rotateLabels ? '45px' : '20px' 
        }}
      >
        {items.map((item) => {
          // 2. Compute accurate percentage height
          const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
          const computedHeight = `${Math.max(pct, 6)}%`;
  
          return (
            <El 
              key={item.label} 
              className="lmn-d-flex lmn-flex-column lmn-align-items-center lmn-justify-content-end" 
              style={{ flex: 1, height: '100%', position: 'relative', minWidth: '30px' }}
            >
              {/* Value Label above the bar */}
              <El style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                {item.value}
              </El>
  
              {/* The Actual Colored Chart Bar */}
              <El 
                style={{ 
                  width: '100%', 
                  height: computedHeight, 
                  background: barColor ?? item.color ?? '#337ab7', 
                  borderRadius: '4px 4px 0 0' 
                }} 
              />
  
              {/* X-Axis Labels Handling */}
              {rotateLabels ? (
                <El 
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: '50%',
                    whiteSpace: 'nowrap',
                    transform: 'rotate(-45deg)', 
                    transformOrigin: 'top left', 
                    fontSize: 10,
                    marginTop: 6
                  }}
                  title={item.label}
                >
                  {item.label}
                </El>
              ) : (
                <El 
                  className="lmn-text-truncate lmn-text-center" 
                  style={{ fontSize: 10, marginTop: 6, width: '100%' }} 
                  title={item.label}
                >
                  {item.label}
                </El>
              )}
            </El>
          );
        })}
      </El>
    );
  }

  <VerticalBarChart items={statusBarItems} rotateLabels={true} />