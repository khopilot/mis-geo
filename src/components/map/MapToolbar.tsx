'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowsPointingOutIcon,
  PencilSquareIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  MapPinIcon,
  SquaresPlusIcon,
  PhotoIcon,
  ViewfinderCircleIcon,
  ArrowUturnLeftIcon,
  ArrowsPointingInIcon,
  GlobeAltIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

// Custom Ruler Icon component since RulerIcon doesn't exist
const RulerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

type MapToolbarProps = {
  onSearch?: () => void;
  onRefresh?: () => void;
  onZoomToFit?: () => void;
  onResetView?: () => void;
  onDrawComplete?: (type: string, data: any) => void;
  onMeasureComplete?: (type: string, value: number, unit: string) => void;
  isRefreshing?: boolean;
};

export default function MapToolbar({
  onSearch,
  onRefresh,
  onZoomToFit,
  onResetView,
  onDrawComplete,
  onMeasureComplete,
  isRefreshing = false,
}: MapToolbarProps) {
  const [activeToolGroup, setActiveToolGroup] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // Handle tool activation
  const handleToolActivation = (toolId: string, groupId: string | null) => {
    if (activeTool === toolId) {
      setActiveTool(null);
      return;
    }
    
    setActiveTool(toolId);
    
    // If this tool is not part of the current active group, update the active group
    if (groupId && activeToolGroup !== groupId) {
      setActiveToolGroup(groupId);
    }
  };

  // Close active tool group
  const closeToolGroup = () => {
    setActiveToolGroup(null);
    setActiveTool(null);
  };

  // Tool definitions with icons and labels
  const tools = [
    {
      id: 'search',
      icon: <MagnifyingGlassIcon className="w-5 h-5" />,
      label: 'Search',
      action: () => {
        onSearch?.();
        setActiveToolGroup(null);
      },
      group: null,
    },
    {
      id: 'refresh',
      icon: <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />,
      label: 'Refresh',
      action: () => {
        onRefresh?.();
        setActiveToolGroup(null);
      },
      group: null,
    },
    {
      id: 'measure',
      icon: <RulerIcon className="w-5 h-5" />,
      label: 'Measure',
      action: () => {
        setActiveToolGroup(activeToolGroup === 'measure' ? null : 'measure');
        setActiveTool(null);
      },
      group: 'measure',
      subTools: [
        {
          id: 'measure-distance',
          icon: <ArrowsPointingOutIcon className="w-4 h-4" />,
          label: 'Distance',
          action: () => handleToolActivation('measure-distance', 'measure'),
          onComplete: (value: number) => onMeasureComplete?.('distance', value, 'meters'),
        },
        {
          id: 'measure-area',
          icon: <SquaresPlusIcon className="w-4 h-4" />,
          label: 'Area',
          action: () => handleToolActivation('measure-area', 'measure'),
          onComplete: (value: number) => onMeasureComplete?.('area', value, 'sq.meters'),
        },
        {
          id: 'measure-radius',
          icon: <ViewfinderCircleIcon className="w-4 h-4" />,
          label: 'Radius',
          action: () => handleToolActivation('measure-radius', 'measure'),
          onComplete: (value: number) => onMeasureComplete?.('radius', value, 'meters'),
        },
      ],
    },
    {
      id: 'draw',
      icon: <PencilSquareIcon className="w-5 h-5" />,
      label: 'Draw',
      action: () => {
        setActiveToolGroup(activeToolGroup === 'draw' ? null : 'draw');
        setActiveTool(null);
      },
      group: 'draw',
      subTools: [
        {
          id: 'draw-point',
          icon: <MapPinIcon className="w-4 h-4" />,
          label: 'Point',
          action: () => handleToolActivation('draw-point', 'draw'),
          onComplete: (data: any) => onDrawComplete?.('point', data),
        },
        {
          id: 'draw-line',
          icon: <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-3 h-0.5 bg-current transform rotate-45"></div>
          </div>,
          label: 'Line',
          action: () => handleToolActivation('draw-line', 'draw'),
          onComplete: (data: any) => onDrawComplete?.('line', data),
        },
        {
          id: 'draw-polygon',
          icon: <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-3 h-3 border border-current transform rotate-45"></div>
          </div>,
          label: 'Polygon',
          action: () => handleToolActivation('draw-polygon', 'draw'),
          onComplete: (data: any) => onDrawComplete?.('polygon', data),
        },
        {
          id: 'draw-text',
          icon: <div className="w-4 h-4 flex items-center justify-center text-xs font-bold">T</div>,
          label: 'Text',
          action: () => handleToolActivation('draw-text', 'draw'),
          onComplete: (data: any) => onDrawComplete?.('text', data),
        },
      ],
    },
    {
      id: 'view',
      icon: <GlobeAltIcon className="w-5 h-5" />,
      label: 'View',
      action: () => {
        setActiveToolGroup(activeToolGroup === 'view' ? null : 'view');
        setActiveTool(null);
      },
      group: 'view',
      subTools: [
        {
          id: 'zoom-to-fit',
          icon: <ArrowsPointingInIcon className="w-4 h-4" />,
          label: 'Zoom to Fit',
          action: () => {
            onZoomToFit?.();
            closeToolGroup();
          },
        },
        {
          id: 'reset-view',
          icon: <ArrowUturnLeftIcon className="w-4 h-4" />,
          label: 'Reset View',
          action: () => {
            onResetView?.();
            closeToolGroup();
          },
        },
      ],
    },
    {
      id: 'print',
      icon: <PrinterIcon className="w-5 h-5" />,
      label: 'Print',
      action: () => {
        console.log('Print map');
        setActiveToolGroup(null);
      },
      group: null,
    },
    {
      id: 'export',
      icon: <ArrowDownTrayIcon className="w-5 h-5" />,
      label: 'Export',
      action: () => {
        setActiveToolGroup(activeToolGroup === 'export' ? null : 'export');
        setActiveTool(null);
      },
      group: 'export',
      subTools: [
        {
          id: 'export-image',
          icon: <PhotoIcon className="w-4 h-4" />,
          label: 'Image',
          action: () => console.log('Export as image'),
        },
        {
          id: 'export-geojson',
          icon: <div className="w-4 h-4 flex items-center justify-center text-xs font-bold">GJ</div>,
          label: 'GeoJSON',
          action: () => console.log('Export as GeoJSON'),
        },
        {
          id: 'export-kml',
          icon: <div className="w-4 h-4 flex items-center justify-center text-xs font-bold">KML</div>,
          label: 'KML',
          action: () => console.log('Export as KML'),
        },
        {
          id: 'export-csv',
          icon: <div className="w-4 h-4 flex items-center justify-center text-xs font-bold">CSV</div>,
          label: 'CSV',
          action: () => console.log('Export as CSV'),
        },
      ],
    },
    {
      id: 'settings',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      label: 'Settings',
      action: () => {
        console.log('Map settings');
        setActiveToolGroup(null);
      },
      group: null,
    },
  ];

  return (
    <div className="relative">
      <motion.div
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Main toolbar */}
        <div className="p-1 flex flex-col space-y-1">
          {tools.map((tool) => (
            <div key={tool.id} className="relative">
              <motion.button
                className={`p-2 rounded-md flex items-center justify-center transition-colors ${
                  activeToolGroup === tool.group
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={tool.action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={tool.label}
              >
                {tool.icon}
              </motion.button>

              {/* Sub-tools panel */}
              <AnimatePresence>
                {activeToolGroup === tool.group && tool.subTools && (
                  <motion.div
                    className="absolute left-full ml-2 top-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 min-w-40 z-10"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium">{tool.label}</span>
                      <button
                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={closeToolGroup}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {tool.subTools.map((subTool) => (
                        <motion.button
                          key={subTool.id}
                          className={`w-full flex items-center space-x-2 p-2 rounded-md text-sm transition-colors ${
                            activeTool === subTool.id
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          onClick={subTool.action}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>{subTool.icon}</span>
                          <span>{subTool.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Active tool indicator */}
      {activeTool && (
        <motion.div
          className="absolute -right-3 top-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <span>Active</span>
        </motion.div>
      )}
    </div>
  );
}
