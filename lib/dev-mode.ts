import { env } from './env';

/**
 * Utility functions for development mode features
 * Use this to conditionally enable/disable features based on NEXT_PUBLIC_DEV_MODE
 */

export const isDevMode = () => {
  return env.NEXT_PUBLIC_DEV_MODE === 'true';
};

export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Example usage:
 * - Use `isDevMode()` for features you want to control manually via env var
 * - Use `isDevelopment()` for features that should always be enabled in development
 * - Use `isProduction()` for production-specific logic
 */

export const getDevFeatures = () => {
  return {
    // Features controlled by NEXT_PUBLIC_DEV_MODE
    debugMode: isDevMode(),
    showDevTools: isDevMode(),
    bypassAuth: isDevMode(),
    
    // Features controlled by NODE_ENV
    showAnalytics: !isDevelopment(),
    enableRateLimiting: isProduction(),
    useProductionAPIs: isProduction(),
  };
};

/**
 * Example: Conditional rendering based on dev mode
 */
export const DevModeIndicator = () => {
  if (!isDevMode()) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      background: '#ff6b6b',
      color: 'white',
      padding: '4px 8px',
      fontSize: '12px',
      zIndex: 9999,
      borderRadius: '0 0 0 4px'
    }}>
      DEV MODE
    </div>
  );
};
