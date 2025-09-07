'use client';

import { useState } from 'react';

// Simple test component to isolate the animation
export default function TestAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    setIsAnimating(false);
    // Force reflow to reset animation
    setTimeout(() => setIsAnimating(true), 50);
  };

  return (
    <div className="min-h-screen">
      {/* CSS for animations */}
      <style jsx>{`
        .animation-container {
          position: relative;
          min-height: 100vh;
        }
        
        /* Background animation - 0 to 2s */
        .bg-layer {
          position: fixed;
          inset: 0;
          background: #000000;
        }
        
        .bg-layer.animate {
          animation: backgroundTransition 2s ease-out forwards;
        }
        
        @keyframes backgroundTransition {
          0% { background: #000000; }
          100% { background: #F2F2F2; }
        }
        
        /* Title animations */
        .title {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          opacity: 0;
          text-align: center;
        }
        
        .title.animate {
          animation: 
            titleAppear 0.5s ease-out 2s forwards,
            titleMoveUp 1s ease-out 3s forwards;
        }
        
        @keyframes titleAppear {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes titleMoveUp {
          0% { 
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          100% { 
            top: 2rem;
            left: 50%;
            transform: translate(-50%, 0);
          }
        }
        
        /* Content animation - appears at 4s */
        .content {
          position: relative;
          z-index: 10;
          max-width: 64rem;
          margin: 6rem auto 0;
          padding: 2rem;
          opacity: 0;
          transform: translateY(1rem);
        }
        
        .content.animate {
          animation: contentFadeIn 1s ease-out 4s forwards;
        }
        
        @keyframes contentFadeIn {
          0% { 
            opacity: 0; 
            transform: translateY(1rem);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        .controls {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          z-index: 20;
        }
      `}</style>

      <div className="animation-container">
        {/* Background layer */}
        <div className={`bg-layer ${isAnimating ? 'animate' : ''}`} />

        {/* Title */}
        <h1 className={`title ${isAnimating ? 'animate' : ''}`}>
          Now you see why FM is the answer
        </h1>

        {/* Content */}
        <div className={`content ${isAnimating ? 'animate' : ''}`}>
          <div style={{ borderLeft: '4px solid #f97316', paddingLeft: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Test Content</h2>
            <p>This is test content that should fade in smoothly after the title animation.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          <button 
            onClick={startAnimation}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Start Animation
          </button>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
            Status: {isAnimating ? 'Running' : 'Stopped'}
          </div>
        </div>
      </div>
    </div>
  );
}