import React, { useState, useRef, useEffect, useCallback } from 'react';

const DEBOUNCE_THRESHOLD = 80;

const DoubleClickTest: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [doubleClickCount, setDoubleClickCount] = useState(0);
  const [fastestClick, setFastestClick] = useState<number | null>(null);
  const [isDoubleClick, setIsDoubleClick] = useState(false);
  const [clickLog, setClickLog] = useState<{ id: number; time: number; isDouble: boolean }[]>([]);
  const lastClickTime = useRef<number>(0);
  const logIdRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedClicks = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const startTest = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setClickCount(0);
    setDoubleClickCount(0);
    setFastestClick(null);
    setIsDoubleClick(false);
    setClickLog([]);
    lastClickTime.current = 0;
    hasStartedClicks.current = false;
    setShowModal(false);
    setIsTesting(true);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    if (!isTesting) {
      startTest();
    }

    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime.current;
    hasStartedClicks.current = true;
    setClickCount((prev) => prev + 1);

    let detected = false;
    if (lastClickTime.current !== 0) {
      if (timeDiff < DEBOUNCE_THRESHOLD) {
        detected = true;
        setDoubleClickCount((prev) => prev + 1);
        setIsDoubleClick(true);
      } else {
        setIsDoubleClick(false);
      }
      setFastestClick((prev) => (prev === null ? timeDiff : Math.min(prev, timeDiff)));
    }

    const newEntry = { id: logIdRef.current++, time: timeDiff, isDouble: detected };
    setClickLog((prev) => [newEntry, ...prev].slice(0, 8));
    lastClickTime.current = currentTime;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsTesting(false);
      setShowModal(true);
    }, 2000);
  };

  const reset = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setIsTesting(false);
    setShowModal(false);
    setClickCount(0);
    setDoubleClickCount(0);
    setFastestClick(null);
    setIsDoubleClick(false);
    setClickLog([]);
    lastClickTime.current = 0;
    hasStartedClicks.current = false;
  };

  return (
    <div className="glass-panel" style={{ position: 'relative' }}>
      <h2>Double Click Test</h2>
      <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '15px' }}>
        {isTesting
          ? 'Pengujian aktif — Klik secepat mungkin! Berhenti 2 detik untuk hasil.'
          : 'Klik "Start Test" untuk mulai pengujian double click.'}
      </p>

      <div
        className={`click-area ${isDoubleClick ? 'click-area--error' : ''}`}
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => e.preventDefault()}
      >
        {!isTesting ? (
          <button
            type="button"
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              startTest();
            }}
          >
            ▶ Start Test
          </button>
        ) : isDoubleClick ? (
          <>
            <span style={{ fontSize: '1.8rem', pointerEvents: 'none' }}>⚠️</span>
            <h3 style={{ pointerEvents: 'none', color: 'var(--error)', marginTop: '6px' }}>DOUBLE CLICK!</h3>
          </>
        ) : (
          <>
            <h3 style={{ pointerEvents: 'none', color: 'var(--text-highlight)' }}>Klik disini</h3>
            <span style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }}>
              Berhenti klik 2 detik untuk melihat hasil
            </span>
          </>
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
              {entry.id === clickLog[0].id ? '● Click' : `${entry.time}ms`}
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

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={startTest}>
          {isTesting ? 'Restart Test' : 'Start Test'}
        </button>
        <button className="btn-primary" style={{ padding: '12px 16px' }} onClick={reset}>
          Reset
        </button>
      </div>

      {/* Result Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className={`modal-badge ${doubleClickCount > 0 ? 'badge-error' : 'badge-success'}`}>
                {doubleClickCount > 0 ? 'Double Click Terdeteksi' : 'Normal / Bebas Double Click'}
              </span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <h3 style={{ marginTop: '12px', fontSize: '1.4rem' }}>Hasil Diagnosa Double Click</h3>

            <div className={`verdict-box ${doubleClickCount > 0 ? 'verdict-error' : 'verdict-success'}`}>
              <div style={{ fontSize: '2rem' }}>{doubleClickCount > 0 ? '⚠️' : '✅'}</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: doubleClickCount > 0 ? 'var(--error)' : 'var(--success)' }}>
                  {doubleClickCount > 0
                    ? `Terdeteksi ${doubleClickCount} Kali Double Click!`
                    : 'Mouse Anda Bebas Double Click!'}
                </h4>
                <p style={{ margin: '6px 0 0', fontSize: '0.85rem', opacity: 0.85 }}>
                  {doubleClickCount > 0
                    ? `Ditemukan klik beruntun dengan interval cepat di bawah ${DEBOUNCE_THRESHOLD}ms. Switch mouse Anda terindikasi mengalami chattering.`
                    : `Dari ${clickCount} klik, tidak terdeteksi lonjakan klik di bawah ${DEBOUNCE_THRESHOLD}ms. Switch berfungsi normal.`}
                </p>
              </div>
            </div>

            <div className="stats-row" style={{ margin: '20px 0' }}>
              <div className="stat-box">
                <span className="stat-label">Double Clicks</span>
                <span className={`stat-value ${doubleClickCount > 0 ? 'text-error' : 'text-success'}`}>{doubleClickCount}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Total Clicks</span>
                <span className="stat-value">{clickCount}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Fastest</span>
                <span className="stat-value">{fastestClick !== null ? `${fastestClick}ms` : '-'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={startTest}>
                Uji Lagi (Start Test)
              </button>
              <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }} onClick={() => setShowModal(false)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubleClickTest;
