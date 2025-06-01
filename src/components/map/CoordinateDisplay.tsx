'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardDocumentIcon, 
  ChevronDownIcon,
  CheckIcon,
  GlobeAltIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

// Types for coordinate formats
type CoordinateFormat = 'decimal' | 'dms' | 'utm';

type CoordinateDisplayProps = {
  coordinates: [number, number]; // [longitude, latitude]
  mapCenter?: [number, number]; // [longitude, latitude]
  defaultFormat?: CoordinateFormat;
  showMapCenter?: boolean;
};

export default function CoordinateDisplay({ 
  coordinates, 
  mapCenter,
  defaultFormat = 'decimal',
  showMapCenter = true
}: CoordinateDisplayProps) {
  const [format, setFormat] = useState<CoordinateFormat>(defaultFormat);
  const [showFormatSelector, setShowFormatSelector] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Format coordinates in decimal degrees
  const formatDecimal = (coord: number, isLongitude = true): string => {
    const direction = isLongitude 
      ? (coord >= 0 ? 'E' : 'W') 
      : (coord >= 0 ? 'N' : 'S');
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  // Format coordinates in degrees, minutes, seconds
  const formatDMS = (coord: number, isLongitude = true): string => {
    const absolute = Math.abs(coord);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);
    
    const direction = isLongitude 
      ? (coord >= 0 ? 'E' : 'W') 
      : (coord >= 0 ? 'N' : 'S');
    
    return `${degrees}° ${minutes}' ${seconds}\" ${direction}`;
  };

  // Format coordinates in UTM (Universal Transverse Mercator)
  const formatUTM = (longitude: number, latitude: number): string => {
    // This is a simplified UTM conversion for demonstration
    // In a real application, you would use a proper geodesy library
    
    // Calculate UTM zone from longitude
    const zone = Math.floor((longitude + 180) / 6) + 1;
    
    // Determine hemisphere (N or S)
    const hemisphere = latitude >= 0 ? 'N' : 'S';
    
    // Calculate easting and northing (simplified)
    // This is not accurate and should be replaced with proper conversion
    const centralMeridian = zone * 6 - 183;
    const easting = Math.floor(500000 + (longitude - centralMeridian) * 40000 / 360);
    const northing = Math.floor((latitude + 80) * 10000);
    
    return `${zone}${hemisphere} ${easting}E ${northing}N`;
  };

  // Get formatted coordinates based on selected format
  const getFormattedCoordinates = (coords: [number, number]): string => {
    const [longitude, latitude] = coords;
    
    switch (format) {
      case 'decimal':
        return `${formatDecimal(longitude, true)}, ${formatDecimal(latitude, false)}`;
      case 'dms':
        return `${formatDMS(longitude, true)}, ${formatDMS(latitude, false)}`;
      case 'utm':
        return formatUTM(longitude, latitude);
      default:
        return `${longitude.toFixed(6)}, ${latitude.toFixed(6)}`;
    }
  };

  // Get short format name for display
  const getFormatName = (): string => {
    switch (format) {
      case 'decimal':
        return 'Decimal';
      case 'dms':
        return 'DMS';
      case 'utm':
        return 'UTM';
      default:
        return 'Decimal';
    }
  };

  // Copy coordinates to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFormattedCoordinates(coordinates));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle format selector
  const toggleFormatSelector = () => {
    setShowFormatSelector(!showFormatSelector);
  };

  // Change coordinate format
  const changeFormat = (newFormat: CoordinateFormat) => {
    setFormat(newFormat);
    setShowFormatSelector(false);
  };

  // Toggle expanded view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <motion.div
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      {/* Basic view */}
      <div className="px-3 py-2 flex items-center space-x-2">
        <GlobeAltIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {getFormattedCoordinates(coordinates)}
          </div>
          {showMapCenter && mapCenter && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Center: {getFormattedCoordinates(mapCenter)}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Format selector button */}
          <motion.button
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFormatSelector}
            aria-label="Change format"
          >
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400">{getFormatName()}</span>
              <ChevronDownIcon className="w-3 h-3 text-gray-400" />
            </div>
            
            {/* Format selector dropdown */}
            <AnimatePresence>
              {showFormatSelector && (
                <motion.div
                  className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-1">
                    <button
                      className={`w-full text-left px-4 py-1.5 text-sm ${
                        format === 'decimal' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => changeFormat('decimal')}
                    >
                      Decimal
                    </button>
                    <button
                      className={`w-full text-left px-4 py-1.5 text-sm ${
                        format === 'dms' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => changeFormat('dms')}
                    >
                      DMS
                    </button>
                    <button
                      className={`w-full text-left px-4 py-1.5 text-sm ${
                        format === 'utm' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => changeFormat('utm')}
                    >
                      UTM
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Copy button */}
          <motion.button
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            aria-label="Copy coordinates"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-400" />
            ) : (
              <ClipboardDocumentIcon className="w-4 h-4 text-gray-400" />
            )}
          </motion.button>
          
          {/* Expand/collapse button */}
          <motion.button
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleExpanded}
            aria-label={expanded ? "Collapse" : "Expand"}
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowsPointingOutIcon className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>
      </div>
      
      {/* Expanded view with all formats */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="px-3 py-2 border-t border-gray-200 dark:border-gray-700"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Decimal</div>
                <div className="text-sm">{getFormattedCoordinates(coordinates)}</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">DMS</div>
                <div className="text-sm">
                  {format === 'dms' 
                    ? getFormattedCoordinates(coordinates) 
                    : `${formatDMS(coordinates[0], true)}, ${formatDMS(coordinates[1], false)}`}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">UTM</div>
                <div className="text-sm">
                  {format === 'utm' 
                    ? getFormattedCoordinates(coordinates) 
                    : formatUTM(coordinates[0], coordinates[1])}
                </div>
              </div>
              
              {showMapCenter && mapCenter && (
                <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Map Center</div>
                  <div className="text-sm">{getFormattedCoordinates(mapCenter)}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
