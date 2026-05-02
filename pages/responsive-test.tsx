import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import ArticleList from '@/components/ArticleList';
import { Category } from '@/lib/models/category';
import { Article } from '@/lib/models/article';

/**
 * Responsive Design Test Page
 * 
 * This page tests the responsive breakpoints for Requirements 8.1, 8.2, 8.3:
 * - Mobile (320px - 767px): Single column layout
 * - Tablet (768px - 1023px): Two column layout
 * - Desktop (1024px+): Three column grid layout
 * 
 * Test by resizing browser window or using browser dev tools device emulation.
 */

export default function ResponsiveTest() {
  const [windowWidth, setWindowWidth] = useState<number>(0);

  // Track window width for display
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock articles for testing
  const mockArticles: Article[] = [
    {
      id: '1',
      title: 'Technology Article: AI Breakthrough in Natural Language Processing',
      summary: 'Researchers have developed a new AI model that can understand context better than ever before. This breakthrough could revolutionize how we interact with machines.',
      content: 'Full content here...',
      url: 'https://example.com/article1',
      source: 'TechCrunch',
      category: Category.TECHNOLOGY,
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      processedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Sports Article: Championship Finals Set Record Viewership',
      summary: 'The championship finals drew record-breaking viewership numbers, with millions tuning in worldwide to watch the historic match.',
      content: 'Full content here...',
      url: 'https://example.com/article2',
      source: 'ESPN',
      category: Category.SPORTS,
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      processedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'Business Article: Stock Market Reaches New Heights',
      summary: 'Major stock indices reached all-time highs today as investors showed confidence in the economic recovery and corporate earnings.',
      content: 'Full content here...',
      url: 'https://example.com/article3',
      source: 'Bloomberg',
      category: Category.BUSINESS,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      processedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '4',
      title: 'Politics Article: New Policy Announced by Government',
      summary: 'The government announced a new policy aimed at addressing climate change and promoting sustainable development across all sectors.',
      content: 'Full content here...',
      url: 'https://example.com/article4',
      source: 'Reuters',
      category: Category.POLITICS,
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      processedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '5',
      title: 'Entertainment Article: Award Show Celebrates Best Films',
      summary: 'The annual award show celebrated the best films of the year, with several surprise winners and memorable performances.',
      content: 'Full content here...',
      url: 'https://example.com/article5',
      source: 'Variety',
      category: Category.ENTERTAINMENT,
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      processedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '6',
      title: 'General Article: Community Event Brings People Together',
      summary: 'A local community event brought together residents from all walks of life to celebrate diversity and promote unity.',
      content: 'Full content here...',
      url: 'https://example.com/article6',
      source: 'Local News',
      category: Category.GENERAL,
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      processedAt: new Date(),
      createdAt: new Date(),
    },
  ];

  const categoryCounts = {
    [Category.TECHNOLOGY]: 1,
    [Category.SPORTS]: 1,
    [Category.BUSINESS]: 1,
    [Category.POLITICS]: 1,
    [Category.ENTERTAINMENT]: 1,
    [Category.GENERAL]: 1,
  };

  const getBreakpointInfo = (width: number) => {
    if (width < 768) {
      return {
        name: 'Mobile',
        range: '320px - 767px',
        columns: '1 column',
        color: 'bg-red-100 text-red-800',
        requirement: 'Requirement 8.2',
      };
    } else if (width < 1024) {
      return {
        name: 'Tablet',
        range: '768px - 1023px',
        columns: '2 columns',
        color: 'bg-yellow-100 text-yellow-800',
        requirement: 'Requirement 8.3 (partial)',
      };
    } else {
      return {
        name: 'Desktop',
        range: '1024px+',
        columns: '3 columns',
        color: 'bg-green-100 text-green-800',
        requirement: 'Requirement 8.3',
      };
    }
  };

  const breakpointInfo = windowWidth > 0 ? getBreakpointInfo(windowWidth) : null;

  return (
    <>
      <Head>
        <title>Responsive Design Test - News Aggregator</title>
        <meta name="description" content="Test page for responsive design breakpoints" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header />

        {/* Breakpoint Indicator */}
        {breakpointInfo && (
          <div className={`${breakpointInfo.color} border-b-2 border-current`}>
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{breakpointInfo.name}</span>
                  <span className="text-sm">({breakpointInfo.range})</span>
                  <span className="text-sm font-semibold">{breakpointInfo.columns}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono">Width: {windowWidth}px</span>
                  <span className="text-xs px-2 py-1 bg-white rounded">
                    {breakpointInfo.requirement}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-4">
            <h2 className="text-lg font-bold text-blue-900 mb-2">
              Responsive Design Test Page
            </h2>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <strong>Instructions:</strong> Resize your browser window or use browser dev tools
                to test different screen sizes.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <strong>Mobile (320px - 767px):</strong> Single column layout (Requirement 8.2)
                </li>
                <li>
                  <strong>Tablet (768px - 1023px):</strong> Two column layout
                </li>
                <li>
                  <strong>Desktop (1024px+):</strong> Three column grid layout (Requirement 8.3)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar onSearchChange={() => {}} />

        {/* Category Filter */}
        <CategoryFilter
          onCategoryChange={() => {}}
          categoryCounts={categoryCounts}
          selectedCategory={null}
        />

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Article Grid Layout Test
            </h3>
            <p className="text-gray-600">
              The articles below should display in {breakpointInfo?.columns || 'responsive columns'}{' '}
              based on your current screen width.
            </p>
          </div>

          {/* Articles List */}
          <ArticleList articles={mockArticles} loading={false} />
        </main>
      </div>
    </>
  );
}
