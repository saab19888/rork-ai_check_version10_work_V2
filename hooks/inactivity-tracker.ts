import { useEffect, useRef, useCallback, useState } from 'react';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { useAuth } from './auth-store';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const WARNING_TIME = 30 * 1000; // Show warning 30 seconds before logout

export const useInactivityTracker = () => {
  const { isAuthenticated, logout } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    lastActivityRef.current = Date.now();
    
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Hide warning if it's showing
    setShowWarning(false);
    setCountdown(30);

    // Set warning timer (4.5 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(30);
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            console.log('User inactive for 5 minutes, logging out...');
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Set logout timer (5 minutes)
    timeoutRef.current = setTimeout(() => {
      console.log('User inactive for 5 minutes, logging out...');
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [isAuthenticated, logout]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setShowWarning(false);
    setCountdown(30);
  }, []);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (!isAuthenticated) return;

    const previousAppState = appStateRef.current;
    appStateRef.current = nextAppState;

    if (previousAppState === 'background' && nextAppState === 'active') {
      // App came back to foreground, check if we should log out
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        console.log('App was in background too long, logging out...');
        logout();
        return;
      }
      
      // Reset timer when app becomes active
      resetTimer();
    } else if (nextAppState === 'background') {
      // App went to background, clear timer
      clearTimer();
    }
  }, [isAuthenticated, logout, resetTimer, clearTimer]);

  const handleUserActivity = useCallback(() => {
    if (isAuthenticated) {
      resetTimer();
    }
  }, [isAuthenticated, resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimer();
      return;
    }

    // Start the timer when user is authenticated
    resetTimer();

    // Set up app state listener for mobile
    if (Platform.OS !== 'web') {
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => {
        subscription?.remove();
        clearTimer();
      };
    } else {
      // For web, listen to visibility change and user activity events
      const handleVisibilityChange = () => {
        if (document.hidden) {
          clearTimer();
        } else {
          const timeSinceLastActivity = Date.now() - lastActivityRef.current;
          if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
            console.log('Page was hidden too long, logging out...');
            logout();
            return;
          }
          resetTimer();
        }
      };

      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, true);
      });

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity, true);
        });
        clearTimer();
      };
    }
  }, [isAuthenticated, resetTimer, clearTimer, handleAppStateChange, handleUserActivity, logout]);

  const handleStayLoggedIn = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleLogoutNow = useCallback(() => {
    clearTimer();
    logout();
  }, [clearTimer, logout]);

  // Return the activity handler and warning state for UI
  return {
    triggerActivity: handleUserActivity,
    clearInactivityTimer: clearTimer,
    showWarning,
    countdown,
    onStayLoggedIn: handleStayLoggedIn,
    onLogout: handleLogoutNow,
  };
};