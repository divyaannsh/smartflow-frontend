import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, BoxProps } from '@mui/material';

interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number; // Number of items to render outside visible area
  onScroll?: (scrollTop: number) => void;
  sx?: BoxProps['sx'];
}

/**
 * Virtual scrolling component for performance with large lists
 * Only renders visible items plus a small buffer
 */
export const VirtualScroll: React.FC<VirtualScrollProps> = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  onScroll,
  sx,
  ...boxProps
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const newScrollTop = target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  };

  return (
    <Box
      ref={scrollElementRef}
      sx={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        ...sx
      }}
      onScroll={handleScroll}
      {...boxProps}
    >
      <Box
        sx={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        <Box
          sx={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <Box
              key={visibleRange.startIndex + index}
              sx={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {renderItem(item, visibleRange.startIndex + index)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default VirtualScroll;
