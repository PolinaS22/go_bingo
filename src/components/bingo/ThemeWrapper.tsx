import React from 'react';
import { BingoTheme } from '../../types/bingo';

interface ThemeWrapperProps {
  theme: BingoTheme;
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ theme, children }) => {
  const cssVariables = {
    '--primary-color': theme?.primaryColor || '#3b82f6',
    '--secondary-color': theme?.secondaryColor || '#1d4ed8',
    '--background-color': theme?.backgroundColor || '#f8fafc',
    '--text-color': theme?.textColor || '#1f2937',
  } as React.CSSProperties;

  return (
    <div style={cssVariables}>
      {children}
    </div>
  );
};
