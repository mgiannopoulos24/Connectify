import React from 'react';

const GifIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 8.5h.01" />
    <path d="M14 8.5h.01" />
    <path d="M10.5 13.5c.5 1.5 1.5 1.5 2 0" />
    <path d="M7 5.5c-1 2.5-1 5 0 7" />
    <path d="M17 5.5c1 2.5 1 5 0 7" />
    <path d="M2 13.3c0 2.4 1.3 4.5 3.2 5.6" />
    <path d="M22 13.3c0 2.4-1.3 4.5-3.2 5.6" />
    <path d="M17.8 4.2c1.9 1.1 3.2 3.2 3.2 5.6" />
    <path d="M3 8.9c0-2.4 1.3-4.5 3.2-5.6" />
  </svg>
);

export default GifIcon;
