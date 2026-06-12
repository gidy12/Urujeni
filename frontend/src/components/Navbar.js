import React from 'react';
import { FiMenu, FiMoon, FiSun } from 'react-icons/fi';
import { useDarkMode } from '../hooks/useDarkMode';

const Navbar = ({ onMenuClick }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-10 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
      <button onClick={onMenuClick} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <FiMenu size={22} />
      </button>

      <div className="flex-1" />

      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>
    </header>
  );
};

export default Navbar;
