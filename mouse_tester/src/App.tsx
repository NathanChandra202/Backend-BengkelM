import React from 'react';
import DoubleClickTest from './components/DoubleClickTest';
import ButtonTest from './components/ButtonTest';
import ScrollTest from './components/ScrollTest';

const services = [
  { icon: '🖥️', name: 'Computer Sales' },
  { icon: '🔨', name: 'Auction' },
  { icon: '🌐', name: 'Web Development' },
  { icon: '🔧', name: 'Repair Services' },
  { icon: '⚙️', name: 'Custom PC Builds' },
  { icon: '🛡️', name: 'Cyber Security Services' },
];

const App: React.FC = () => {
  return (
    <div className="app-container">
      <header className="header">
        <h1>Bengkel Mouse</h1>
        <p className="header-by">by 26 Computer</p>
        <div className="services-bar">
          {services.map((s) => (
            <span key={s.name} className="service-chip">
              <span>{s.icon}</span>
              <span>{s.name}</span>
            </span>
          ))}
        </div>
      </header>

      <main className="test-grid">
        <DoubleClickTest />
        <ButtonTest />
        <ScrollTest />
      </main>
      
      <footer style={{ textAlign: 'center', marginTop: '40px', opacity: 0.5, fontSize: '0.8rem' }}>
        <p>&copy; {new Date().getFullYear()} Bengkel Mouse by 26 Computer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
