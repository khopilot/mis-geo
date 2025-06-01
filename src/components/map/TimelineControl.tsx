'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

type TimelineControlProps = {
  value: number;
  onChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  timeMarkers?: { value: number; label: string }[];
  autoPlayEnabled?: boolean;
};

export default function TimelineControl({
  value,
  onChange,
  minLabel = 'Start',
  maxLabel = 'End',
  min = 0,
  max = 100,
  step = 1,
  timeMarkers,
  autoPlayEnabled = true,
}: TimelineControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Default time markers if none provided
  const defaultTimeMarkers = [
    { value: 0, label: 'Jan 2024' },
    { value: 25, label: 'Mar 2024' },
    { value: 50, label: 'Jun 2024' },
    { value: 75, label: 'Sep 2024' },
    { value: 100, label: 'Current' },
  ];

  const markers = timeMarkers || defaultTimeMarkers;

  // Format the current time based on the value
  const formatCurrentTime = () => {
    const percentage = ((currentValue - min) / (max - min)) * 100;
    
    // Find the closest markers before and after the current value
    const sortedMarkers = [...markers].sort((a, b) => a.value - b.value);
    const lowerMarker = sortedMarkers.filter(m => m.value <= percentage).pop();
    const upperMarker = sortedMarkers.filter(m => m.value > percentage).shift();
    
    if (!lowerMarker) return upperMarker?.label || minLabel;
    if (!upperMarker) return lowerMarker?.label || maxLabel;
    
    // If exactly on a marker, return that marker's label
    if (percentage === lowerMarker.value) return lowerMarker.label;
    
    // Interpolate between markers
    const range = upperMarker.value - lowerMarker.value;
    const position = percentage - lowerMarker.value;
    const ratio = position / range;
    
    if (ratio <= 0.25) return lowerMarker.label;
    if (ratio >= 0.75) return upperMarker.label;
    
    return `${lowerMarker.label} - ${upperMarker.label}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Jump to start
  const jumpToStart = () => {
    setCurrentValue(min);
    onChange(min);
  };

  // Jump to end
  const jumpToEnd = () => {
    setCurrentValue(max);
    onChange(max);
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setCurrentValue(newValue);
    onChange(newValue);
  };

  // Handle slider click for direct navigation
  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentage = clickPosition / rect.width;
    const newValue = Math.round(min + percentage * (max - min));
    
    setCurrentValue(newValue);
    onChange(newValue);
  };

  // Handle mouse move over slider for hover preview
  const handleSliderHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const hoverPosition = e.clientX - rect.left;
    const percentage = hoverPosition / rect.width;
    const newValue = Math.round(min + percentage * (max - min));
    
    setHoverValue(newValue);
  };

  // Clear hover state when mouse leaves
  const handleSliderLeave = () => {
    setHoverValue(null);
  };

  // Auto-play effect
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentValue(prev => {
          const newValue = prev + step;
          if (newValue > max) {
            setIsPlaying(false);
            return max;
          }
          return newValue;
        });
      }, 500);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, max, step]);

  // Update onChange when currentValue changes during auto-play
  useEffect(() => {
    if (isPlaying) {
      onChange(currentValue);
    }
  }, [currentValue, isPlaying, onChange]);

  // Calculate progress percentage
  const progressPercentage = ((currentValue - min) / (max - min)) * 100;

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg p-2 w-full border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        {/* Time display and selector */}
        <div className="relative">
          <button
            className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setShowTimeSelector(!showTimeSelector)}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{formatCurrentTime()}</span>
          </button>
          
          {/* Time selector dropdown */}
          <AnimatePresence>
            {showTimeSelector && (
              <motion.div
                className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-1">
                  {markers.map((marker) => (
                    <button
                      key={marker.value}
                      className={`w-full text-left px-3 py-1 text-sm rounded-md ${
                        Math.abs(((marker.value - min) / (max - min) * 100) - progressPercentage) < 5
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => {
                        const newValue = min + (marker.value / 100) * (max - min);
                        setCurrentValue(newValue);
                        onChange(newValue);
                        setShowTimeSelector(false);
                      }}
                    >
                      {marker.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Playback controls */}
        <div className="flex items-center space-x-1">
          <button
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={jumpToStart}
            title="Jump to start"
          >
            <BackwardIcon className="w-4 h-4" />
          </button>
          
          <button
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            disabled={!autoPlayEnabled}
          >
            {isPlaying ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5" />
            )}
          </button>
          
          <button
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={jumpToEnd}
            title="Jump to end"
          >
            <ForwardIcon className="w-4 h-4" />
          </button>
          
          {/* Playback speed control */}
          <div className="relative ml-2">
            <button
              className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Playback speed"
            >
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs">1x</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Timeline slider */}
      <div
        className="relative h-8 px-2 cursor-pointer"
        ref={sliderRef}
        onClick={handleSliderClick}
        onMouseMove={handleSliderHover}
        onMouseLeave={handleSliderLeave}
      >
        {/* Slider track background */}
        <div className="absolute top-1/2 left-2 right-2 h-1 -mt-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div
            className="h-full bg-blue-500 dark:bg-blue-600"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Markers */}
        {markers.map((marker) => (
          <div
            key={marker.value}
            className="absolute top-1/2 -mt-1 w-0.5 h-2 bg-gray-400 dark:bg-gray-500"
            style={{ left: `calc(${marker.value}% + 8px)` }}
            title={marker.label}
          />
        ))}
        
        {/* Hover indicator */}
        {hoverValue !== null && (
          <motion.div
            className="absolute top-0 pointer-events-none"
            style={{ left: `calc(${((hoverValue - min) / (max - min)) * 100}% + 8px)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            <div className="relative -left-1/2">
              <div className="absolute bottom-full mb-1 -left-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {formatCurrentTime()}
              </div>
              <div className="w-0.5 h-8 bg-gray-800 dark:bg-gray-400" />
            </div>
          </motion.div>
        )}
        
        {/* Slider thumb */}
        <motion.div
          className="absolute top-1/2 -mt-2 -ml-2 w-4 h-4 bg-white dark:bg-gray-200 border-2 border-blue-500 dark:border-blue-600 rounded-full shadow-md cursor-grab active:cursor-grabbing"
          style={{ left: `calc(${progressPercentage}% + 8px)` }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 1.1 }}
          drag="x"
          dragConstraints={sliderRef}
          dragElastic={0}
          dragMomentum={false}
          onDrag={(e, info) => {
            if (!sliderRef.current) return;
            const rect = sliderRef.current.getBoundingClientRect();
            const dragPosition = info.point.x - rect.left;
            const percentage = Math.max(0, Math.min(1, dragPosition / rect.width));
            const newValue = Math.round(min + percentage * (max - min));
            setCurrentValue(newValue);
            onChange(newValue);
          }}
        />
        
        {/* Hidden input for accessibility */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleSliderChange}
          className="sr-only"
          aria-label="Timeline slider"
        />
      </div>
      
      {/* Time labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-2 mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}
