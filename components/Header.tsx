import React from 'react';

/**
 * Header component for the Automated News Aggregation Web Application
 * 
 * Displays the application logo and title in a responsive layout.
 * Compact design for Bangladeshi news aggregator.
 */
const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center sm:justify-start space-x-2">
          {/* Logo */}
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="News Aggregator Logo"
            >
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 7H17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M7 11H17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M7 15H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Title */}
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight">
              বাংলাদেশ সংবাদ
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
