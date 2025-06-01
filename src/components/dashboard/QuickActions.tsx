'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  XMarkIcon, 
  ClipboardDocumentListIcon, 
  DocumentTextIcon, 
  BellAlertIcon, 
  UsersIcon,
  ChartBarIcon,
  MapIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

type Action = {
  id: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  badge?: number;
  color?: string;
};

type QuickActionsProps = {
  actions?: Action[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
};

export default function QuickActions({ 
  actions: customActions,
  position = 'bottom-right' 
}: QuickActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Default actions covering the requested workflow management features
  const defaultActions: Action[] = [
    {
      id: 'data-collection',
      icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
      label: 'Data Collection',
      onClick: () => console.log('Data Collection clicked'),
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'report-generation',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      label: 'Generate Report',
      onClick: () => console.log('Generate Report clicked'),
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'alert-management',
      icon: <BellAlertIcon className="w-5 h-5" />,
      label: 'Manage Alerts',
      onClick: () => console.log('Manage Alerts clicked'),
      badge: 3,
      color: 'text-amber-600 dark:text-amber-400'
    },
    {
      id: 'collaboration',
      icon: <UsersIcon className="w-5 h-5" />,
      label: 'Share View',
      onClick: () => console.log('Share View clicked'),
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'insights',
      icon: <ChartBarIcon className="w-5 h-5" />,
      label: 'Insights',
      onClick: () => console.log('Insights clicked'),
      color: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'layers',
      icon: <MapIcon className="w-5 h-5" />,
      label: 'Map Layers',
      onClick: () => console.log('Map Layers clicked'),
      color: 'text-cyan-600 dark:text-cyan-400'
    },
    {
      id: 'export',
      icon: <ArrowDownTrayIcon className="w-5 h-5" />,
      label: 'Export Data',
      onClick: () => console.log('Export Data clicked'),
      color: 'text-gray-600 dark:text-gray-400'
    },
    {
      id: 'settings',
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      label: 'Settings',
      onClick: () => console.log('Settings clicked'),
      color: 'text-gray-600 dark:text-gray-400'
    }
  ];

  const actions = customActions || defaultActions;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Main action button */}
      <motion.button
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md w-14 h-14 rounded-full flex items-center justify-center shadow-lg border border-gray-200 dark:border-gray-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleExpand}
        aria-label={isExpanded ? 'Close actions' : 'Open actions'}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? (
            <XMarkIcon className="w-7 h-7 text-gray-900 dark:text-gray-100" />
          ) : (
            <PlusIcon className="w-7 h-7 text-gray-900 dark:text-gray-100" />
          )}
        </motion.div>
      </motion.button>

      {/* Action buttons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={`absolute ${position.startsWith('top') ? 'top-16' : 'bottom-16'} ${position.endsWith('right') ? 'right-0' : 'left-0'} space-y-3`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                className="flex items-center justify-end space-x-3"
                initial={{ opacity: 0, x: position.endsWith('right') ? 20 : -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: position.endsWith('right') ? 20 : -20 }}
                transition={{ 
                  duration: 0.3, 
                  delay: 0.05 * (actions.length - index),
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              >
                {/* Action label */}
                <motion.div
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, scale: 0.8, x: position.endsWith('right') ? 10 : -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 * (actions.length - index) + 0.1 }}
                >
                  {action.label}
                </motion.div>
                
                {/* Action button */}
                <motion.button
                  className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700 relative ${action.color || ''}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={action.onClick}
                  aria-label={action.label}
                >
                  {action.icon}
                  
                  {/* Badge indicator */}
                  {action.badge && (
                    <motion.div
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {action.badge}
                    </motion.div>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
