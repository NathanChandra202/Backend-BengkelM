import React, { useState, useRef } from 'react';

const DEBOUNCE_THRESHOLD = 80; // ms — clicks within this window are flagged as double clicks

const DoubleClickTest: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const [doubleClickCount, setDoubleClickCount] = useState(0);
  const [fastestClick, setFastestClick] = useState<number | null>(null);
  const [isDoubleClick, setIsDoubleClick] = useState(false);
  const [clickLog, setClickLog] = useState<{ id: number; time: number; isDouble: boolean }[]>([]);
  const lastClickTime = useRef<number>(0);
  const logIdRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only track left click for this specific test
    if (e.button !== 0) return;

    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime.current;
    const newCount = clickCount + 1;
    setClickCount(newCount);

    let detected = false;

    if (lastClickTime.current !== 0) {
      if (timeDiff < DEBOUNCE_THRESHOLD) {
        detected = true;
        setDoubleClickCount(prev => prev + 1);
        setIsDoubleClick(true);
      } else {
        setIsDoubleClick(false);
      }

      setFastestClick(prev => prev === null ? timeDiff : Math.min(prev, timeDiff));
    }

    // Add to log (keep last 6)
    const newEntry = { id: logIdRef.current++, time: timeDiff, isDouble: detected };
    setClickLog(prev => [newEntry, ...prev].slice(0, 6));

    lastClickTime.current = currentTime;
  };

  const reset = () => {
    setClickCount(0);
    setDoubleClickCount(0);
    setFastestClick(null);
    setIsDoubleClick(false);
    setClickLog([]);
    lastClickTime.current = 0;
  };

  return (
    <div className="glass-panel">
      <h2>Double Click Test</h2>
      <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '15px' }}>
        Klik area di bawah secepat mungkin. Double click terdeteksi jika interval &lt; {DEBOUNCE_THRESHOLD}ms.
      </p>

      <div
        className={`click-area ${isDoubleClick ? 'click-area--error' : ''}`}
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => e.preventDefault()}
      >
        {isDoubleClick ? (
          <>
            <span style={{ fontSize: '1.8rem', pointerEvents: 'none' }}>⚠️</span>
            <h3 style={{ pointerEvents: 'none', color: 'var(--error)', marginTop: '6px' }}>DOUBLE CLICK!</h3>
          </>
        ) : (
          <h3 style={{ pointerEvents: 'none', color: 'var(--text-main)' }}>KLIK DISINI</h3>
        )}
      </div>

      {/* Click log */}
      <div className="click-log">
        {clickLog.length === 0 ? (
          <span className="click-log-empty">Belum ada klik...</span>
        ) : (
          clickLog.map((entry) => (
            <span
              key={entry.id}
              className={`click-log-entry ${entry.isDouble ? 'log-double' : 'log-normal'}`}
            >
              {entry.id === clickLog[0].id
                ? '● Click'
                : `${entry.time}ms`}
              {entry.isDouble && ' ⚡ DOUBLE'}
            </span>
          ))
        )}
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-label">Total Clicks</span>
          <span className="stat-value">{clickCount}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Fastest (ms)</span>
          <span className="stat-value">{fastestClick !== null ? fastestClick : '-'}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Double Clicks</span>
          <span className={`stat-value ${doubleClickCount > 0 ? 'text-error' : 'text-success'}`}>
            {doubleClickCount}
          </span>
        </div>
      </div>

      <button className="btn-primary" style={{ marginTop: '20px', width: '100%' }} onClick={reset}>Reset</button>
    </div>
  );
};

export default DoubleClickTest;
