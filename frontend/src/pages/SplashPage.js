// frontend/src/pages/SplashPage.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoK from '../pictures/LogoK.jpg';

function SplashPage() {
  const [dots, setDots]       = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Lock scroll on body while splash is active
    document.body.style.overflow  = 'hidden';
    document.body.style.height    = '100vh';
    document.body.style.position  = 'fixed';
    document.body.style.width     = '100%';
    document.documentElement.style.overflow = 'hidden';

    const dotInterval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 400);

    // Progress bar filling over 3s
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100));
    }, 30);

    const redirectTimer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        // Restore scroll before navigating
        document.body.style.overflow  = '';
        document.body.style.height    = '';
        document.body.style.position  = '';
        document.body.style.width     = '';
        document.documentElement.style.overflow = '';
        navigate('/home');
      }, 600);
    }, 3200);

    return () => {
      clearInterval(dotInterval);
      clearInterval(progressInterval);
      clearTimeout(redirectTimer);
      document.body.style.overflow  = '';
      document.body.style.height    = '';
      document.body.style.position  = '';
      document.body.style.width     = '';
      document.documentElement.style.overflow = '';
    };
  }, [navigate]);

  const dotsStr = '.'.repeat(dots);

  return (
    <>
      <style>{`
        html, body { overflow: hidden !important; height: 100% !important; }

        .splash-root {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          z-index: 99999;
          background: linear-gradient(145deg, #0d2b45 0%, #1b4d6e 40%, #1e6b8c 70%, #2a8fac 100%);
          font-family: 'Georgia', 'Palatino Linotype', serif;
        }

        /* Animated wave layers */
        .splash-waves {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 180px;
          pointer-events: none;
          z-index: 0;
        }
        .wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 200%;
          height: 100%;
          background: rgba(255,255,255,0.06);
          border-radius: 50% 50% 0 0 / 30px;
          animation: wave-move 6s ease-in-out infinite;
        }
        .wave:nth-child(2) {
          background: rgba(255,255,255,0.04);
          animation: wave-move 9s ease-in-out infinite reverse;
          bottom: 10px;
        }
        .wave:nth-child(3) {
          background: rgba(255,255,255,0.03);
          animation: wave-move 12s ease-in-out infinite;
          bottom: 20px;
        }
        @keyframes wave-move {
          0%, 100% { transform: translateX(0); }
          50%       { transform: translateX(-25%); }
        }

        /* Floating particles */
        .splash-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          animation: particle-float linear infinite;
        }
        @keyframes particle-float {
          0%   { transform: translateY(110vh) scale(0); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
        }

        /* Stars / dots in background */
        .splash-stars {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255,255,255,0.5);
          border-radius: 50%;
          animation: twinkle ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.5); }
        }

        /* Content */
        .splash-content {
          position: relative;
          z-index: 10;
          text-align: center;
          color: white;
          padding: 0 24px;
          transition: opacity 0.6s ease;
        }
        .splash-content.fading { opacity: 0; transform: scale(0.97); transition: opacity 0.6s ease, transform 0.6s ease; }

        /* Logo */
        .splash-logo-wrap {
          margin-bottom: 28px;
          animation: logo-float 3.5s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes logo-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
        }
        .splash-logo {
          width: 130px !important;
          height: 130px !important;
          max-width: 130px !important;
          border-radius: 50% !important;
          object-fit: cover !important;
          border: 4px solid rgba(255,255,255,0.5) !important;
          margin: 0 auto !important;
          display: block !important;
          box-shadow: 0 0 0 8px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4) !important;
          animation: logo-glow 3s ease-in-out infinite !important;
        }
        @keyframes logo-glow {
          0%, 100% { box-shadow: 0 0 0 8px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4); }
          50%       { box-shadow: 0 0 0 14px rgba(255,255,255,0.14), 0 8px 40px rgba(0,0,0,0.5); }
        }

        /* Title */
        .splash-title {
          font-size: clamp(28px, 6vw, 48px);
          font-weight: 700;
          margin: 0 0 6px;
          color: white;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-shadow: 0 2px 20px rgba(0,0,0,0.4);
          animation: fadeSlideUp 0.7s ease 0.2s both;
        }
        .splash-tagline {
          font-size: clamp(13px, 2vw, 16px);
          color: rgba(255,255,255,0.65);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin: 0 0 36px;
          font-style: italic;
          animation: fadeSlideUp 0.7s ease 0.4s both;
        }

        /* Progress bar */
        .splash-progress-wrap {
          width: clamp(200px, 50vw, 320px);
          margin: 0 auto 20px;
          animation: fadeSlideUp 0.7s ease 0.6s both;
        }
        .splash-progress-track {
          height: 4px;
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .splash-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6dd5ed, #ffffff);
          border-radius: 4px;
          transition: width 0.1s linear;
          box-shadow: 0 0 8px rgba(255,255,255,0.6);
        }
        .splash-loading-text {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.15em;
          font-family: 'Courier New', monospace;
        }
        .splash-dots { display: inline-block; width: 24px; text-align: left; }

        /* Compass decoration */
        .splash-compass {
          font-size: 28px;
          margin-bottom: 16px;
          display: block;
          animation: compass-spin 8s linear infinite;
        }
        @keyframes compass-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="splash-root">
        {/* Twinkling stars */}
        <div className="splash-stars">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top:  `${Math.random() * 70}%`,
                animationDuration: `${2 + Math.random() * 3}s`,
                animationDelay:    `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Floating bubbles */}
        <div className="splash-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left:   `${5 + Math.random() * 90}%`,
                width:  `${6 + Math.random() * 18}px`,
                height: `${6 + Math.random() * 18}px`,
                animationDuration: `${6 + Math.random() * 8}s`,
                animationDelay:    `${Math.random() * 6}s`,
              }}
            />
          ))}
        </div>

        {/* Wave decoration */}
        <div className="splash-waves">
          <div className="wave" />
          <div className="wave" />
          <div className="wave" />
        </div>

        {/* Main content */}
        <div className={`splash-content${isFading ? ' fading' : ''}`}>
          <div className="splash-logo-wrap">
            <img src={LogoK} alt="Travel Journal Logo" className="splash-logo" />
          </div>

          <h1 className="splash-title">Travel Journal</h1>
          <p className="splash-tagline">Explore · Document · Remember</p>

          <div className="splash-progress-wrap">
            <div className="splash-progress-track">
              <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="splash-loading-text">
              Loading<span className="splash-dots">{dotsStr}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SplashPage;