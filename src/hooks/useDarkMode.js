// hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return [darkMode, toggleDarkMode];
}

// En tu Register y Login:
import { useDarkMode } from '../hooks/useDarkMode';

export const Register = () => {
  const [darkMode, toggleDarkMode] = useDarkMode();
  // ... resto del código
};