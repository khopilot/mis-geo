'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { useTranslations } from 'next-intl'; // Temporarily commented out for minimal setup
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Mock useTranslations for minimal setup
const useTranslations = (key: string) => {
  return (textKey: string) => {
    // This is a placeholder. In a full setup, this would fetch translations.
    // For now, it just returns the key itself.
    const translations: { [k: string]: string } = {
      'Legend': 'Legend',
      'Expand legend': 'Expand legend',
      'Collapse legend': 'Collapse legend',
      'Risk Levels': 'Risk Levels',
      'Data Points': 'Data Points',
      'Low Risk': 'Low Risk',
      'Medium Risk': 'Medium Risk',
      'High Risk': 'High Risk',
      'Critical Risk': 'Critical Risk',
      'Survey': 'Survey',
      'Sensor': 'Sensor',
      'Incident': 'Incident',
      'Alert': 'Alert',
      'Heatmap Intensity': 'Heatmap Intensity',
      'Low': 'Low',
      'High': 'High',
      'Description': 'Description',
      'Value': 'Value',
      'Close': 'Close',
      'Clusters': 'Clusters',
      'Small Cluster': 'Small Cluster',
      'Medium Cluster': 'Medium Cluster',
      'Large Cluster': 'Large Cluster',
      'Administrative Boundaries': 'Administrative Boundaries',
      'Province': 'Province',
      'District': 'District',
      'Commune': 'Commune',
      'Village': 'Village',
      'Environmental Layers': 'Environmental Layers',
      'Forest Cover': 'Forest Cover',
      'Water Bodies': 'Water Bodies',
      'Protected Areas': 'Protected Areas',
      'Elevation': 'Elevation'
    };
    return translations[textKey] || textKey;
  };
};

// Types for legend items
type LegendItem = {
  color: string;
  label: string;
  description?: string;
  value?: number | string;
  symbol?: React.ReactNode; // For custom symbols like icons or shapes
};

type LegendSection = {
  title: string;
  items: LegendItem[];
  expanded?: boolean;
};

type MapLegendProps = {
  items?: LegendItem[];
  sections?: LegendSection[];
  title?: string;
  collapsible?: boolean;
  initialCollapsed?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

export default function MapLegend({ 
  items = [], 
  sections = [],
  title = 'Legend',
  collapsible = true,
  initialCollapsed = false,
  position = 'bottom-left'
}: MapLegendProps) {
  const t = useTranslations('MapLegend');
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>(() => {
    const initial: {[key: string]: boolean} = {};
    sections.forEach((section, index) => {
      initial[index.toString()] = section.expanded !== false;
    });
    return initial;
  });
  const [hoveredItem, setHoveredItem] = useState<LegendItem | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Default sections if none provided
  const defaultSections: LegendSection[] = [
    {
      title: 'Risk Levels',
      items: [
        { color: 'bg-green-500', label: 'Low Risk', description: 'Areas with minimal risk factors and good data coverage.' },
        { color: 'bg-yellow-500', label: 'Medium Risk', description: 'Areas with some risk factors or incomplete data coverage.' },
        { color: 'bg-orange-500', label: 'High Risk', description: 'Areas with significant risk factors requiring attention.' },
        { color: 'bg-red-500', label: 'Critical Risk', description: 'Areas with severe risk factors requiring immediate intervention.' }
      ],
      expanded: true
    },
    {
      title: 'Data Points',
      items: [
        { color: 'bg-blue-500', label: 'Survey', symbol: <div className="w-3 h-3 rounded-full bg-blue-500"></div>, description: 'Field survey data points collected by teams.' },
        { color: 'bg-purple-500', label: 'Sensor', symbol: <div className="w-3 h-3 transform rotate-45 bg-purple-500"></div>, description: 'Automated sensor readings from IoT devices.' },
        { color: 'bg-amber-500', label: 'Incident', symbol: <div className="w-3 h-3 rounded-sm bg-amber-500"></div>, description: 'Reported incidents requiring investigation.' },
        { color: 'bg-red-500', label: 'Alert', symbol: <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-500"></div>, description: 'System-generated alerts based on threshold violations.' }
      ],
      expanded: true
    },
    {
      title: 'Heatmap Intensity',
      items: [
        { color: 'bg-gradient-to-r from-blue-200 to-blue-300', label: 'Low', description: 'Areas with low density of data points.' },
        { color: 'bg-gradient-to-r from-blue-400 to-blue-500', label: 'Medium', description: 'Areas with moderate density of data points.' },
        { color: 'bg-gradient-to-r from-blue-600 to-blue-700', label: 'High', description: 'Areas with high density of data points.' },
        { color: 'bg-gradient-to-r from-blue-800 to-blue-900', label: 'Very High', description: 'Areas with very high density of data points.' }
      ],
      expanded: false
    },
    {
      title: 'Clusters',
      items: [
        { color: 'bg-blue-400', label: 'Small Cluster', symbol: <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold">5</div>, description: 'Groups of 2-10 data points.' },
        { color: 'bg-blue-500', label: 'Medium Cluster', symbol: <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold">25</div>, description: 'Groups of 11-50 data points.' },
        { color: 'bg-blue-600', label: 'Large Cluster', symbol: <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold">100+</div>, description: 'Groups of 50+ data points.' }
      ],
      expanded: false
    },
    {
      title: 'Administrative Boundaries',
      items: [
        { color: 'border-2 border-dashed border-purple-700', label: 'Province', description: 'Provincial administrative boundaries.' },
        { color: 'border-2 border-solid border-purple-500', label: 'District', description: 'District administrative boundaries.' },
        { color: 'border border-dotted border-purple-400', label: 'Commune', description: 'Commune administrative boundaries.' },
        { color: 'border border-dotted border-purple-300', label: 'Village', description: 'Village administrative boundaries.' }
      ],
      expanded: false
    },
    {
      title: 'Environmental Layers',
      items: [
        { color: 'bg-green-700/50', label: 'Forest Cover', description: 'Areas with forest vegetation.' },
        { color: 'bg-blue-400/50', label: 'Water Bodies', description: 'Rivers, lakes, and reservoirs.' },
        { color: 'bg-emerald-500/30 border border-dashed border-emerald-700', label: 'Protected Areas', description: 'Nationally designated conservation areas.' },
        { color: 'bg-gradient-to-r from-gray-300 to-gray-500', label: 'Elevation', description: 'Terrain elevation data.' }
      ],
      expanded: false
    }
  ];

  // Use default sections if none provided
  const displaySections = sections.length > 0 ? sections : defaultSections;
  const displayItems = items.length > 0 ? items : [];

  // Update mouse position for tooltip
  const handleMouseMove = (event: MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Toggle the entire legend
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Toggle a specific section
  const toggleSection = (sectionIndex: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex.toString()]: !prev[sectionIndex.toString()]
    }));
  };

  // Show item details on hover
  const showItemDetails = (item: LegendItem) => {
    if (item.description) {
      setHoveredItem(item);
    }
  };

  // Hide item details
  const hideItemDetails = () => {
    setHoveredItem(null);
  };

  // Determine if we should show sections or individual items
  const hasSections = displaySections.length > 0;
  const hasItems = displayItems.length > 0;

  // If no items or sections, don't render
  if (!hasItems && !hasSections) {
    return null;
  }

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} z-10 max-w-xs`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-medium">{t(title)}</h3>
          
          {collapsible && (
            <motion.button
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCollapse}
              aria-label={collapsed ? t('Expand legend') : t('Collapse legend')}
            >
              <motion.div
                animate={{ rotate: collapsed ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {collapsed ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
              </motion.div>
            </motion.button>
          )}
        </div>
        
        {/* Legend content */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Render sections if available */}
              {hasSections && (
                <div className="p-2 space-y-2">
                  {displaySections.map((section, sectionIndex) => (
                    <div key={`section-${sectionIndex}`} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      {/* Section header */}
                      <button
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between text-sm font-medium"
                        onClick={() => toggleSection(sectionIndex)}
                        aria-expanded={expandedSections[sectionIndex.toString()]}
                      >
                        <span>{t(section.title)}</span>
                        <motion.div
                          animate={{ rotate: expandedSections[sectionIndex.toString()] ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDownIcon className="w-4 h-4" />
                        </motion.div>
                      </button>
                      
                      {/* Section items */}
                      <AnimatePresence>
                        {expandedSections[sectionIndex.toString()] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-2 space-y-1">
                              {section.items.map((item, itemIndex) => (
                                <div
                                  key={`item-${sectionIndex}-${itemIndex}`}
                                  className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                  onMouseEnter={() => showItemDetails(item)}
                                  onMouseLeave={hideItemDetails}
                                >
                                  {/* Color/symbol indicator */}
                                  <div className={`w-5 h-5 rounded flex items-center justify-center ${item.color}`}>
                                    {item.symbol}
                                  </div>
                                  
                                  {/* Label */}
                                  <span className="text-sm">{t(item.label)}</span>
                                  
                                  {/* Info icon if there's a description */}
                                  {item.description && (
                                    <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Render individual items if no sections but items exist */}
              {!hasSections && hasItems && (
                <div className="p-2 space-y-1">
                  {displayItems.map((item, index) => (
                    <div
                      key={`single-item-${index}`}
                      className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                      onMouseEnter={() => showItemDetails(item)}
                      onMouseLeave={hideItemDetails}
                    >
                      {/* Color/symbol indicator */}
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${item.color}`}>
                        {item.symbol}
                      </div>
                      
                      {/* Label */}
                      <span className="text-sm">{t(item.label)}</span>
                      
                      {/* Info icon if there's a description */}
                      {item.description && (
                        <InformationCircleIcon className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Item details tooltip */}
      <AnimatePresence>
        {hoveredItem && (
          <motion.div
            className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-3 max-w-xs"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y + 10,
              pointerEvents: 'none'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-medium">{t(hoveredItem.label)}</h4>
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </div>
            
            {hoveredItem.description && (
              <div className="mb-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('Description')}</div>
                <p className="text-sm">{hoveredItem.description}</p>
              </div>
            )}
            
            {hoveredItem.value !== undefined && (
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('Value')}</div>
                <p className="text-sm font-medium">{hoveredItem.value}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
