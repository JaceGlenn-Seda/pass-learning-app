import React from 'react';

export default function PassLogo({ className = '', light = false, showDot }) {
  return (
    <img
      src="https://media.base44.com/images/public/6a552d72363fc33d755650fa/68ebda1fd_image.png"
      alt="PASS"
      className={`h-8 w-auto object-contain rounded ${className}`}
      style={light ? { mixBlendMode: 'screen' } : {}}
    />
  );
}