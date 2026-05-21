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
    const maxVal = Math.max(...items.map(i => i.value), 1);
  
    return (
      <El 
        className="lmn-d-flex lmn-justify-content-center" 
        style={{ 
          height: '240px', // 1. Increased slightly to accommodate the label dropdown footprint
          gap: '16px',     // Increased spacing slightly between the data clusters
          padding: '0 8px', 
          width: '100%',
          // 2. Extends container boundary down to give the tilted words plenty of room
          marginBottom: rotateLabels ? '65px' : '20px' 
        }}
      >
        {items.map((item) => {
          const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
          const computedHeight = `${Math.max(pct, 6)}%`;
  
          return (
            <El 
              key={item.label} 
              className="lmn-d-flex lmn-flex-column lmn-align-items-center lmn-justify-content-end" 
              style={{ 
                flex: 1, 
                height: '100%', 
                position: 'relative', 
                minWidth: '40px' // Added comfortable scaling room per column cluster
              }}
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
  
              {/* 3. NEW: Dedicated Layout Label Container to act as a clear baseline barrier */}
              <El 
                style={{ 
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '100%',
                  height: '20px', // Solid spacing buffer that clears the bar graphic area
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {rotateLabels ? (
                  <El 
                    style={{ 
                      position: 'absolute', 
                      top: '12px', // Pushes the pivot point comfortably below the baseline floor
                      left: '50%', // Centers the origin hook directly under the bar
                      whiteSpace: 'nowrap',
                      // 4. Combined translation with rotation aligns the text start-edge nicely
                      transform: 'translateX(-30%) rotate(-45deg)', 
                      transformOrigin: 'top left', 
                      fontSize: '10px',
                      lineHeight: '14px',
                      textAlign: 'left'
                    }}
                    title={item.label}
                  >
                    {item.label}
                  </El>
                ) : (
                  <El 
                    className="lmn-text-truncate lmn-text-center" 
                    style={{ 
                      fontSize: '10px', 
                      marginTop: '8px', 
                      width: '100%',
                      whiteSpace: 'nowrap'
                    }} 
                    title={item.label}
                  >
                    {item.label}
                  </El>
                )}
              </El>
  
            </El>
          );
        })}
      </El>
    );
  }

  <VerticalBarChart items={statusBarItems} rotateLabels={true} />