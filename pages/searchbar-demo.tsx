import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';

/**
 * Demo page for SearchBar component
 * 
 * Demonstrates the SearchBar component with debounced search functionality.
 * Shows the current search query and tracks when the callback is triggered.
 */
export default function SearchBarDemo() {
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<Array<{ query: string; timestamp: string }>>([]);

  const handleSearchChange = (query: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setCurrentQuery(query);
    setSearchHistory(prev => [
      { query, timestamp },
      ...prev.slice(0, 9) // Keep last 10 searches
    ]);
  };

  return (
    <>
      <Head>
        <title>SearchBar Demo - News Aggregator</title>
        <meta name="description" content="SearchBar component demonstration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Page Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                SearchBar Component Demo
              </h2>
              <p className="text-gray-600">
                Type in the search box below. The search callback is triggered after 300ms of inactivity.
              </p>
            </div>

            {/* SearchBar Component */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <SearchBar
                onSearchChange={handleSearchChange}
                placeholder="Try typing something..."
              />
            </div>

            {/* Current Query Display */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Current Search Query
              </h3>
              <div className="bg-gray-100 rounded-md p-4">
                <code className="text-lg text-blue-600">
                  {currentQuery || '(empty)'}
                </code>
              </div>
            </div>

            {/* Search History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Search History
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Last 10 searches)
                </span>
              </h3>
              
              {searchHistory.length === 0 ? (
                <p className="text-gray-500 italic">
                  No searches yet. Start typing to see the debounced search in action!
                </p>
              ) : (
                <div className="space-y-2">
                  {searchHistory.map((item, index) => (
                    <div
                      key={`${item.timestamp}-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <span className="text-gray-900 font-medium">
                        {item.query || '(cleared)'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Implementation Notes */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Implementation Notes
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Debounce Delay:</strong> 300ms (configurable in component)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Behavior:</strong> The callback is only triggered after the user stops typing for 300ms
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Benefits:</strong> Reduces unnecessary API calls and improves performance
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Clear Button:</strong> Appears when input has text, clears the search immediately
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>Responsive:</strong> Adapts to mobile, tablet, and desktop screen sizes
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
