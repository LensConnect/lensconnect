import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number;
}

export const NairaSign = ({ 
  size = 24, 
  strokeWidth = 2, 
  color = 'currentColor', 
  ...props 
}: IconProps) => {
  return (
    <svg
      xmlns="http://w3.org"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* The letter 'N' */}
      <path d="M6 19V5l12 14V5" />
      {/* Double strikethrough bars */}
      <path d="M5 10h14" />
      <path d="M5 14h14" />
    </svg>
  );
};


