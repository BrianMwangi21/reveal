'use client';

import { useTheme } from '@/app/contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative group">
      <button
        className="bg-white dark:bg-gray-700 text-gray-700 dark:text-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        title="Change theme"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          <button
            onClick={() => setTheme('default')}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${theme === 'default' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 via-pink-400 to-blue-400 mr-2"></span>
            Default
          </button>
          <button
            onClick={() => setTheme('gender')}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${theme === 'gender' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-pink-400 to-blue-400 mr-2"></span>
            Gender Reveal
          </button>
          <button
            onClick={() => setTheme('baby')}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${theme === 'baby' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-emerald-300 via-violet-300 to-orange-300 mr-2"></span>
            Baby Reveal
          </button>
          <button
            onClick={() => setTheme('birthday')}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${theme === 'birthday' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-pink-400 via-blue-400 to-violet-400 mr-2"></span>
            Birthday
          </button>
          <button
            onClick={() => setTheme('elegant')}
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${theme === 'elegant' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-blue-900 via-amber-400 to-gray-500 mr-2"></span>
            Elegant
          </button>
        </div>
      </div>
    </div>
  );
}
