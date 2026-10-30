import React, { useState, useEffect, useRef } from 'react';

const BUTTON_NAMES: Record<number, string> = {
  0: 'Left Click',
  1: 'Middle Click',
  2: 'Right Click',
  3: 'Back Button',
  4: 'Forward Button',
};

interface LogEntry {
  id: number;
  button: number;
  type: 'down' | 'up';
}

const ButtonTest: React.FC = () => {
  const [activeButtons, setActiveButtons] = useState<Record<number, boolean>>({});
  const [clickLog, setClickLog] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setActiveButtons(prev => ({ ...prev, [e.button]: true }));
      const entry: LogEntry = { id: logIdRef.current++, button: e.button, type: 'down' };
      setClickLog(prev => [entry, ...prev].slice(0, 6));
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setActiveButtons(prev => ({ ...prev, [e.button]: false }));
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleWheel = (e: WheelEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    // Attach to the document so side buttons are also caught easily
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div ref={containerRef} className="glass-panel">
      <h2>Button Test</h2>
      <p style={{ opacity: 0.7, fontSize: '0.9rem', textAlign: 'center' }}>
        Tekan tombol mouse manapun.
      </p>

      <div className="mouse-graphic">
        {/* SVG Mouse - 100% sesuai gambar */}
        <svg 
          width="220" 
          height="380" 
          viewBox="0 0 220 380" 
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Body mouse hitam */}
          <path
            d="M 110 5
               C 80 5, 60 10, 45 25
               C 30 40, 20 60, 18 90
               L 18 150
               C 18 160, 20 165, 25 168
               L 25 220
               C 25 260, 35 300, 55 330
               C 75 360, 90 375, 110 375
               C 130 375, 145 360, 165 330
               C 185 300, 195 260, 195 220
               L 195 168
               C 200 165, 202 160, 202 150
               L 202 90
               C 200 60, 190 40, 175 25
               C 160 10, 140 5, 110 5 Z"
            fill="#000"
            stroke="#fff"
            strokeWidth="3"
          />
          
          {/* Outline tombol kiri */}
          <path
            d="M 110 5
               C 80 5, 60 10, 45 25
               C 30 40, 20 60, 18 90
               L 18 150
               C 18 155, 19 160, 22 163
               L 105 163
               L 105 5
               L 110 5 Z"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            className={activeButtons[0] ? 'button-active-left' : ''}
          />
          
          {/* Outline tombol kanan */}
          <path
            d="M 110 5
               C 140 5, 160 10, 175 25
               C 190 40, 200 60, 202 90
               L 202 150
               C 202 155, 201 160, 198 163
               L 115 163
               L 115 5
               L 110 5 Z"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            className={activeButtons[2] ? 'button-active-right' : ''}
          />
          
          {/* Scroll wheel tengah */}
          <rect
            x="95"
            y="30"
            width="30"
            height="105"
            rx="15"
            fill="#fff"
            stroke="#000"
            strokeWidth="2"
          />
          
          {/* Garis horizontal di scroll wheel */}
          {[...Array(11)].map((_, i) => (
            <line
              key={i}
              x1="98"
              y1={38 + i * 9}
              x2="122"
              y2={38 + i * 9}
              stroke="#000"
              strokeWidth="2"
            />
          ))}
          
          {/* Garis pembatas horizontal melengkung */}
          <path
            d="M 22 163 Q 110 168, 198 163"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
          />
          
          {/* Tombol samping atas */}
          <rect
            x="8"
            y="140"
            width="15"
            height="65"
            rx="7"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            className={activeButtons[4] ? 'button-active-side' : ''}
          />
          
          {/* Tombol samping bawah */}
          <rect
            x="8"
            y="210"
            width="15"
            height="80"
            rx="7"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            className={activeButtons[3] ? 'button-active-side' : ''}
          />
          
          {/* Logo 26 COMPUTER */}
          <g transform="translate(110, 280)">
            {/* 3 lingkaran konsentris */}
            <circle cx="0" cy="0" r="48" fill="none" stroke="#fff" strokeWidth="3" />
            <circle cx="0" cy="0" r="42" fill="none" stroke="#fff" strokeWidth="3" />
            <circle cx="0" cy="0" r="36" fill="none" stroke="#fff" strokeWidth="3" />
            
            {/* Bintang-bintang di sekitar lingkaran */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180;
              const x = 33 * Math.cos(angle);
              const y = 33 * Math.sin(angle);
              return <circle key={i} cx={x} cy={y} r="2" fill="#fff" />;
            })}
            
            {/* Text 26 */}
            <text
              x="0"
              y="-5"
              textAnchor="middle"
              fill="#fff"
              fontSize="22"
              fontWeight="900"
              fontFamily="Outfit, sans-serif"
            >
              26
            </text>
            
            {/* Text COMPUTER */}
            <text
              x="0"
              y="8"
              textAnchor="middle"
              fill="#fff"
              fontSize="8"
              fontWeight="700"
              fontFamily="Outfit, sans-serif"
              letterSpacing="1.5"
            >
              COMPUTER
            </text>
          </g>
        </svg>
        
        {/* Clickable areas overlay */}
        <div 
          className={`mouse-btn mouse-left ${activeButtons[0] ? 'active' : ''}`}
          style={{ 
            position: 'absolute',
            top: '8px',
            left: '18px',
            width: '87px',
            height: '155px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10
          }}
        />
        <div 
          className={`mouse-btn mouse-right ${activeButtons[2] ? 'active' : ''}`}
          style={{ 
            position: 'absolute',
            top: '8px',
            right: '18px',
            width: '87px',
            height: '155px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10
          }}
        />
        <div 
          className={`mouse-btn mouse-middle ${activeButtons[1] ? 'active' : ''}`}
          style={{ 
            position: 'absolute',
            top: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '30px',
            height: '105px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10
          }}
        />
        <div 
          className={`mouse-btn mouse-side mouse-side-forward ${activeButtons[4] ? 'active' : ''}`}
          style={{ 
            position: 'absolute',
            top: '140px',
            left: '8px',
            width: '15px',
            height: '65px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10
          }}
        />
        <div 
          className={`mouse-btn mouse-side mouse-side-back ${activeButtons[3] ? 'active' : ''}`}
          style={{ 
            position: 'absolute',
            top: '210px',
            left: '8px',
            width: '15px',
            height: '80px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10
          }}
        />
      </div>

      {/* Click Log */}
      <div className="click-log">
        {clickLog.length === 0 ? (
          <span className="click-log-empty">Belum ada input...</span>
        ) : (
          clickLog.map((entry) => (
            <span key={entry.id} className="click-log-entry log-normal">
              ● {BUTTON_NAMES[entry.button] ?? `Button ${entry.button}`}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default ButtonTest;
