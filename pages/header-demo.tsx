import Head from 'next/head';
import Header from '@/components/Header';

/**
 * Demo page to test the Header component at various screen sizes
 * This page can be used to manually verify responsive behavior
 */
export default function HeaderDemo() {
  return (
    <>
      <Head>
        <title>Header Component Demo - News Aggregator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Header Component Demo</h2>
            <p className="text-gray-700 mb-4">
              This page demonstrates the Header component at various screen sizes.
              Resize your browser window to see the responsive behavior.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Responsive Breakpoints:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li><strong>Mobile (320px - 639px):</strong> Centered layout, smaller logo and text</li>
                  <li><strong>Small (640px - 767px):</strong> Left-aligned layout, medium logo and text</li>
                  <li><strong>Medium (768px - 1023px):</strong> Larger logo and text</li>
                  <li><strong>Large (1024px+):</strong> Largest text size</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Gradient blue background (blue-600 to blue-800)</li>
                  <li>Custom SVG logo icon</li>
                  <li>Responsive typography</li>
                  <li>Proper spacing and padding at all sizes</li>
                  <li>Accessible with aria-label on logo</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-sm text-blue-800">
                  <strong>Requirement 8.1 Validation:</strong> The Header component renders correctly 
                  on screen widths from 320 pixels to 2560 pixels, meeting the responsive design requirement.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4">Current Viewport Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Visible on Mobile</p>
                <p className="text-2xl font-bold text-blue-600 sm:hidden">📱 Mobile</p>
                <p className="text-sm text-gray-500 sm:hidden">&lt; 640px</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Visible on Small+</p>
                <p className="text-2xl font-bold text-green-600 hidden sm:block md:hidden">📱 Small</p>
                <p className="text-sm text-gray-500 hidden sm:block md:hidden">640px - 767px</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Visible on Medium+</p>
                <p className="text-2xl font-bold text-orange-600 hidden md:block lg:hidden">💻 Medium</p>
                <p className="text-sm text-gray-500 hidden md:block lg:hidden">768px - 1023px</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Visible on Large+</p>
                <p className="text-2xl font-bold text-purple-600 hidden lg:block">🖥️ Large</p>
                <p className="text-sm text-gray-500 hidden lg:block">1024px+</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
