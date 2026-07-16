import React from 'react';

const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-primary-505 border-t-transparent animate-spin rounded-full`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/70 dark:bg-darkBg/70 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default Loader;
