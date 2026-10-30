import React, { useState, useEffect, useRef } from 'react';

const ScrollTest: React.FC = () => {
  const [scrollDir, setScrollDir] = useState<'UP' | 'DOWN' | null>(null);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Don't prevent default globally as it breaks page scrolling if needed,
      // but since this is a test app we might want to prevent it in the test area.
      // We will only listen on document for demo purposes, or better yet, in the component.
      
      const direction = e.deltaY > 0 ? 'DOWN' : 'UP';
      setScrollDir(direction);
      
      // Calculate a pseudo speed based on deltaY magnitude
      const speed = Math.abs(e.deltaY);
      setScrollSpeed(speed);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setScrollDir(null);
        setScrollSpeed(0);
      }, 150);
    };

    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="glass-panel">
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
    </div>
  );
};

export default ScrollTest;
