'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

type Layer = {
  id: string;
  name: string;
  icon: string;
};

type LayerControlProps = {
  layers: Layer[];
  selectedLayer: string;
  onSelectLayer: (layerId: string) => void;
};

export default function LayerControl({
  layers,
  selectedLayer,
  onSelectLayer,
}: LayerControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get the currently selected layer object
  const currentLayer = layers.find((layer) => layer.id === selectedLayer) || layers[0];

  return (
    <div className="relative">
      <motion.div
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with current selection */}
        <button
          className="w-full flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls="layer-options"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">{currentLayer.icon}</span>
            <span className="font-medium">Layer: {currentLayer.name}</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </motion.div>
        </button>

        {/* Layer options */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              id="layer-options"
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-2 space-y-1">
                {layers.map((layer) => (
                  <motion.button
                    key={layer.id}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      layer.id === selectedLayer
                        ? 'bg-blue-600/20 text-blue-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      onSelectLayer(layer.id);
                      setIsExpanded(false);
                    }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl">{layer.icon}</span>
                    <span>{layer.name}</span>
                    {layer.id === selectedLayer && (
                      <motion.div
                        className="w-2 h-2 rounded-full bg-blue-400 ml-auto"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick toggle for mobile */}
      <div className="md:hidden absolute -bottom-12 left-0 right-0 flex justify-center">
        <motion.button
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md px-2 py-1 rounded-md flex items-center space-x-1 shadow-sm"
          onClick={() => setIsExpanded(!isExpanded)}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-sm">Layers</span>
          {isExpanded ? (
            <ChevronUpIcon className="w-3 h-3" />
          ) : (
            <ChevronDownIcon className="w-3 h-3" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
