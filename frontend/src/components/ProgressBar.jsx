import React from 'react';

const ProgressBar = ({ progress }) => (
  <div style={{
    width: '100%',
    background: '#e0e0e0',
    borderRadius: '8px',
    height: '18px',
    margin: '1rem 0'
  }}>
    <div style={{
      width: `${progress}%`,
      background: '#2b3a67',
      height: '100%',
      borderRadius: '8px',
      transition: 'width 0.2s'
    }} />
  </div>
);

export default ProgressBar;