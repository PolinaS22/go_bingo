import type { CSSProperties, ReactNode } from 'react';
import { BingoTheme } from '../../types/bingo';
import { DEFAULT_THEME } from '../../core/defaults';

interface ThemeWrapperProps {
  theme: BingoTheme | undefined;
  children: ReactNode;
}

type ThemeCssVariables = CSSProperties & {
  '--primary-color': string;
  '--secondary-color': string;
  '--background-color': string;
  '--text-color': string;
};

export const ThemeWrapper = ({ theme, children }: ThemeWrapperProps) => {
  const resolved = theme ?? DEFAULT_THEME;
  const cssVariables: ThemeCssVariables = {
    '--primary-color': resolved.primaryColor,
    '--secondary-color': resolved.secondaryColor,
    '--background-color': resolved.backgroundColor,
    '--text-color': resolved.textColor,
  };

  return <div style={cssVariables}>{children}</div>;
};
