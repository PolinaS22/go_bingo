import React from 'react';
import { BingoTheme } from '../../types/bingo';

interface ThemeWrapperProps {
  theme: BingoTheme;
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ theme, children }) => {
  const cssVariables = {
    '--primary-color': theme.primaryColor,
    '--secondary-color': theme.secondaryColor,
    '--background-color': theme.backgroundColor,
    '--text-color': theme.textColor,
  } as React.CSSProperties;

  return (
    <div style={cssVariables}>
      {children}
    </div>
  );
};
