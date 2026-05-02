# Header Component Test Documentation

## Component Overview
The Header component displays the application logo and title in a responsive layout that adapts to different screen sizes.

## Requirements Validation
- **Requirement 8.1**: The Frontend_Interface SHALL render correctly on screen widths from 320 pixels to 2560 pixels

## Responsive Breakpoints

### Mobile (320px - 639px)
- Logo: 32px × 32px (w-8 h-8)
- Title: text-xl (1.25rem / 20px)
- Subtitle: text-xs (0.75rem / 12px)
- Padding: py-4 (1rem vertical)
- Layout: Centered with flex items-center justify-center

### Small (640px - 767px)
- Logo: 40px × 40px (sm:w-10 sm:h-10)
- Title: sm:text-2xl (1.5rem / 24px)
- Subtitle: sm:text-sm (0.875rem / 14px)
- Padding: sm:py-6 (1.5rem vertical)
- Layout: Left-aligned with sm:justify-start

### Medium (768px - 1023px)
- Logo: 48px × 48px (md:w-12 md:h-12)
- Title: md:text-3xl (1.875rem / 30px)
- Subtitle: md:text-base (1rem / 16px)

### Large (1024px+)
- Title: lg:text-4xl (2.25rem / 36px)
- All other styles inherited from medium breakpoint

## Styling Features
- Gradient background: from-blue-600 to-blue-800
- White text for contrast
- Shadow for depth: shadow-lg
- Container with horizontal padding: px-4
- Responsive spacing between logo and title: space-x-3 sm:space-x-4
- Subtitle with lighter blue: text-blue-100

## Accessibility
- SVG logo includes aria-label="News Aggregator Logo"
- Semantic HTML with proper header tag
- High contrast text on colored background

## Manual Testing Checklist
- [ ] Component renders at 320px width (minimum)
- [ ] Component renders at 640px width (small breakpoint)
- [ ] Component renders at 768px width (medium breakpoint)
- [ ] Component renders at 1024px width (large breakpoint)
- [ ] Component renders at 2560px width (maximum)
- [ ] Logo scales appropriately at each breakpoint
- [ ] Text is readable at all sizes
- [ ] Layout switches from centered to left-aligned at sm breakpoint
- [ ] No horizontal scrolling at any width
- [ ] Component integrates properly with other page components
