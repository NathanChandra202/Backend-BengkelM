import React, { useState, useEffect, useRef } from 'react';

const ScrollTest: React.FC = () => {
  const [scrollDir, setScrollDir] = useState<'UP' | 'DOWN' | null>(null);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [scrollUpCount, setScrollUpCount] = useState(0);
  const [scrollDownCount, setScrollDownCount] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStarted = useRef(false);
  const isMovingRef = useRef(false);
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingModalRef = useRef(false);

  // Track cursor movement
  useEffect(() => {
    const handleMouseMove = () => {
      isMovingRef.current = true;
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = setTimeout(() => {
        isMovingRef.current = false;
        if (pendingModalRef.current) {
          pendingModalRef.current = false;
          setShowModal(true);
        }
      }, 300);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (!isMovingRef.current) {
        setShowModal(true);
      } else {
        pendingModalRef.current = true;
      }
    }, 3000);
  };

  const resetAll = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    pendingModalRef.current = false;
    hasStarted.current = false;
    setScrollUpCount(0);
    setScrollDownCount(0);
    setMaxSpeed(0);
    setScrollDir(null);
    setScrollSpeed(0);
    setShowModal(false);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const direction = e.deltaY > 0 ? 'DOWN' : 'UP';
      setScrollDir(direction);
      
      const speed = Math.abs(e.deltaY);
      setScrollSpeed(speed);
      hasStarted.current = true;

      if (direction === 'UP') setScrollUpCount(prev => prev + 1);
      else setScrollDownCount(prev => prev + 1);
      setMaxSpeed(prev => Math.max(prev, speed));

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setScrollDir(null);
        setScrollSpeed(0);
      }, 150);

      resetIdleTimer();
    };

    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    };
  }, []);

  return (
    <div className="glass-panel" style={{ position: 'relative' }}>
      <h2>Scroll Test</h2>
      <p style={{ opacity: 0.7, fontSize: '0.9rem', textAlign: 'center' }}>
        Scroll your mouse wheel.
      </p>

      <div className="scroll-indicator">
        <div className={`scroll-arrow ${scrollDir === 'UP' ? 'active' : ''}`}>
          ▲
        </div>
        
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }} className="text-neon">
            {scrollDir || 'IDLE'}
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Speed: {scrollSpeed}
          </div>
        </div>

        <div className={`scroll-arrow ${scrollDir === 'DOWN' ? 'active' : ''}`}>
          ▼
        </div>
      </div>

      <div className="stats-row" style={{ marginTop: '20px' }}>
        <div className="stat-box">
          <span className="stat-label">Scroll Up</span>
          <span className="stat-value">{scrollUpCount}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Scroll Down</span>
          <span className="stat-value">{scrollDownCount}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Max Speed</span>
          <span className="stat-value">{maxSpeed || '-'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={resetAll}>
          Reset
        </button>
      </div>

      {/* Result Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-badge badge-success">Hasil Scroll Test</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="verdict-box verdict-success">
              <div style={{ fontSize: '2rem' }}>🖱️</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-highlight)' }}>
                  Scroll wheel terekam
                </h4>
                <p style={{ margin: '6px 0 0', fontSize: '0.85rem', opacity: 0.85 }}>
                  Ringkasan aktivitas scroll selama sesi ini.
                </p>
              </div>
            </div>

            <div className="stats-row" style={{ margin: '20px 0' }}>
              <div className="stat-box">
                <span className="stat-label">Scroll Up</span>
                <span className="stat-value">{scrollUpCount}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Scroll Down</span>
                <span className="stat-value">{scrollDownCount}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Max Speed</span>
                <span className="stat-value">{maxSpeed || '-'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => { resetAll(); }}>
                Reset & Uji Lagi
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

export default ScrollTest;
