'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Components
import LayerControl from '../components/map/LayerControl';
import MapToolbar from '../components/map/MapToolbar';
import TimelineControl from '../components/map/TimelineControl';
import QuickActions from '../components/dashboard/QuickActions';
import CoordinateDisplay from '../components/map/CoordinateDisplay';
import MapLegend from '../components/map/MapLegend';

// Icons
import { 
  SunIcon, 
  MoonIcon, 
  ChartBarIcon, 
  MapIcon, 
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HomeIcon,
  BellIcon,
  UserGroupIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  XMarkIcon,
  InformationCircleIcon,
  PresentationChartBarIcon,
  ClipboardDocumentListIcon,
  ShareIcon,
  CogIcon
} from '@heroicons/react/24/outline';

type Page = 'dashboard' | 'maps' | 'analytics' | 'collaboration' | 'reports' | 'settings';

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('maps'); // Start with maps since it's fully featured
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mouseCoordinates, setMouseCoordinates] = useState<[number, number]>([104.9182, 11.5564]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([104.9182, 11.5564]);
  const [selectedLayer, setSelectedLayer] = useState('dark-matter');
  const [timelineValue, setTimelineValue] = useState(75);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [contextPanelData, setContextPanelData] = useState<any>(null);
  
  // Define available map layers
  const mapLayers = [
    { id: 'dark-matter', name: 'Dark Theme', icon: '🌙' },
    { id: 'positron', name: 'Light Theme', icon: '☀️' },
    { id: 'osm-bright', name: 'Street Map', icon: '🗺️' },
    { id: 'terrain', name: 'Terrain', icon: '🏔️' },
    { id: 'satellite', name: 'Satellite', icon: '🛰️' }
  ];
  
  const stats = [
    { id: 'data-points', title: 'Data Points', value: 24863, change: 12.4, changeType: 'increase' },
    { id: 'areas', title: 'Areas Monitored', value: 187, change: 5.2, changeType: 'increase' },
    { id: 'risk-areas', title: 'High Risk Areas', value: 28, change: 3.5, changeType: 'decrease' },
    { id: 'coverage', title: 'Data Coverage', value: 78, change: 4.2, changeType: 'increase' },
  ];

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'maps', label: 'Maps', icon: MapIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'collaboration', label: 'Collaboration', icon: UserGroupIcon },
    { id: 'reports', label: 'Reports', icon: DocumentTextIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark, mounted]);

  useEffect(() => {
    if (currentPage === 'maps' && !map.current && mapContainer.current) {
      initializeMap();
    }
  }, [currentPage, selectedLayer]);

  const initializeMap = () => {
    if (map.current || !mapContainer.current) return;
    
    const mapStyle = getMapStyle(selectedLayer);
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [104.9182, 11.5564],
      zoom: 5,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.AttributionControl({
      customAttribution: 'MIS Geospatial Platform © 2025'
    }), 'bottom-right');

    // Add mouse coordinate tracking
    map.current.on('mousemove', (e) => {
      setMouseCoordinates([e.lngLat.lng, e.lngLat.lat]);
    });

    // Track map center changes
    map.current.on('moveend', () => {
      if (map.current) {
        const center = map.current.getCenter();
        setMapCenter([center.lng, center.lat]);
      }
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add sample data points
      if (map.current) {
        addSampleData();
      }
    });
  };

  const getMapStyle = (layerId: string) => {
    const styleUrls = {
      'dark-matter': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      'positron': 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      'osm-bright': 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      'terrain': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      'satellite': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    };
    return styleUrls[layerId as keyof typeof styleUrls] || styleUrls['dark-matter'];
  };

  const addSampleData = () => {
    if (!map.current) return;

    // Add sample markers
    const sampleLocations = [
      { lng: 104.9182, lat: 11.5564, type: 'survey', risk: 'low' },
      { lng: 105.8542, lat: 21.0285, type: 'sensor', risk: 'medium' },
      { lng: 108.2022, lat: 16.0471, type: 'incident', risk: 'high' },
      { lng: 106.6297, lat: 10.8231, type: 'alert', risk: 'critical' },
    ];

    sampleLocations.forEach((location, index) => {
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold capitalize">${location.type} Point</h3>
          <p class="text-sm text-gray-600">Risk Level: ${location.risk}</p>
          <p class="text-xs text-gray-500">Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}</p>
        </div>
      `);

      const el = document.createElement('div');
      el.className = `w-4 h-4 rounded-full cursor-pointer ${
        location.risk === 'low' ? 'bg-green-500' :
        location.risk === 'medium' ? 'bg-yellow-500' :
        location.risk === 'high' ? 'bg-orange-500' : 'bg-red-500'
      }`;

      new maplibregl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler for context panel
      el.addEventListener('click', () => {
        setContextPanelData({
          title: `${location.type.charAt(0).toUpperCase() + location.type.slice(1)} Point`,
          type: location.type,
          risk: location.risk,
          coordinates: [location.lng, location.lat],
          timestamp: new Date().toISOString(),
          description: `Sample ${location.type} data point for demonstration purposes.`
        });
        setShowContextPanel(true);
      });
    });
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleLayerChange = (layerId: string) => {
    setSelectedLayer(layerId);
  };

  const handleTimelineChange = (value: number) => {
    setTimelineValue(value);
  };

  const handleNavigation = (pageId: string) => {
    setCurrentPage(pageId as Page);
    setShowContextPanel(false); // Close context panel when switching pages
  };

  // Page content components
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Dashboard Overview</h1>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      {stat.id === 'data-points' ? (
                        <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      ) : stat.id === 'areas' ? (
                        <MapIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : stat.id === 'risk-areas' ? (
                        <GlobeAltIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                      ) : (
                        <PresentationChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      stat.changeType === 'increase' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {stat.changeType === 'increase' ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
                      )}
                      <span>{Math.abs(stat.change)}%</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {stat.id === 'coverage' ? `${stat.value}%` : stat.value.toLocaleString()}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>New data collection completed in Region A</span>
                  <span className="text-sm text-gray-500 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Alert threshold reached for monitoring station #47</span>
                  <span className="text-sm text-gray-500 ml-auto">4 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Monthly report generated and distributed</span>
                  <span className="text-sm text-gray-500 ml-auto">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'maps':
        return (
          <div className="relative w-full h-full">
            <div ref={mapContainer} className="w-full h-full" />
            
            {/* Map Controls - Top Left */}
            <div className="absolute top-4 left-4 z-10 space-y-3">
              <LayerControl 
                layers={mapLayers} 
                selectedLayer={selectedLayer} 
                onSelectLayer={handleLayerChange} 
              />
              <MapToolbar 
                onSearch={() => console.log('Search initiated')}
                onRefresh={() => console.log('Refresh initiated')}
                onZoomToFit={() => map.current?.fitBounds([
                  [102, 8], [108, 14] // Bounds for Cambodia/region
                ])}
                onResetView={() => {
                  map.current?.flyTo({ center: [104.9182, 11.5564], zoom: 5 });
                }}
                onDrawComplete={(type, data) => console.log('Draw complete:', type, data)}
                onMeasureComplete={(type, value, unit) => console.log('Measure complete:', type, value, unit)}
              />
            </div>
            
            {/* Quick Stats Panel - Top Right */}
            <motion.div 
              className="absolute top-4 right-4 z-10 max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Quick Stats</h3>
                <div className="flex items-center space-x-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Live Data</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.id}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                        {stat.id === 'data-points' ? (
                          <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : stat.id === 'areas' ? (
                          <MapIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : stat.id === 'risk-areas' ? (
                          <GlobeAltIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div className={`flex items-center text-xs font-medium ${
                        stat.changeType === 'increase' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                        )}
                        <span>{Math.abs(stat.change)}%</span>
                      </div>
                    </div>
                    
                    <motion.div 
                      className="text-2xl font-semibold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + 0.1 * index }}
                    >
                      {stat.id === 'coverage' ? `${stat.value}%` : stat.value.toLocaleString()}
                    </motion.div>
                    
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {stat.title}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Timeline Control - Bottom */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-96">
              <TimelineControl 
                value={timelineValue}
                onChange={handleTimelineChange}
                minLabel="Jan 2024"
                maxLabel="Current"
              />
            </div>
            
            {/* Coordinate Display - Bottom Left */}
            <div className="absolute bottom-4 left-4 z-10">
              <CoordinateDisplay 
                coordinates={mouseCoordinates}
                mapCenter={mapCenter}
                defaultFormat="decimal"
              />
            </div>
            
            {/* Map Legend - Bottom Right */}
            <MapLegend position="bottom-right" />
            
            {/* Quick Actions - Floating */}
            <QuickActions position="bottom-right" />
            
            {/* Demo Mode Indicator */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md px-3 py-1 rounded-full text-xs flex items-center gap-2 shadow-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>Demo Mode - Maps View</span>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Data Trends</h2>
                <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PresentationChartBarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Interactive charts would be displayed here</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Risk Analysis</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span>Low Risk Areas</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">142</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span>Medium Risk Areas</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">28</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span>High Risk Areas</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">17</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'collaboration':
        return (
          <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Collaboration Hub</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">JD</div>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-sm text-gray-500">GIS Analyst</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">SM</div>
                    <div>
                      <div className="font-medium">Sarah Miller</div>
                      <div className="text-sm text-gray-500">Data Scientist</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">TW</div>
                    <div>
                      <div className="font-medium">Tom Wilson</div>
                      <div className="text-sm text-gray-500">Project Manager</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Shared Views</h2>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                    <span>Risk Assessment Q4</span>
                    <ShareIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
                    <span>Environmental Survey</span>
                    <ShareIcon className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Recent Comments</h2>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="font-medium">John Doe</div>
                    <div className="text-gray-600 dark:text-gray-400">Updated data validation rules</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="font-medium">Sarah Miller</div>
                    <div className="text-gray-600 dark:text-gray-400">Added new analysis layer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Reports</h1>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Generate New Report
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <ClipboardDocumentListIcon className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Monthly Summary</h3>
                    <p className="text-sm text-gray-500">November 2024</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Comprehensive overview of all data collection activities and analysis results.</p>
                <button className="text-blue-600 hover:text-blue-700 font-medium">Download PDF</button>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <PresentationChartBarIcon className="w-8 h-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Risk Assessment</h3>
                    <p className="text-sm text-gray-500">Q4 2024</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Detailed analysis of risk factors and recommendations for mitigation strategies.</p>
                <button className="text-blue-600 hover:text-blue-700 font-medium">Download PDF</button>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <DocumentTextIcon className="w-8 h-8 text-purple-500" />
                  <div>
                    <h3 className="font-semibold">Data Quality Report</h3>
                    <p className="text-sm text-gray-500">December 2024</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Quality metrics and validation results for all collected datasets.</p>
                <button className="text-blue-600 hover:text-blue-700 font-medium">Download PDF</button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Display Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="font-medium">Dark Mode</label>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDark ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                      onClick={toggleTheme}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="font-medium">Language</label>
                    <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1">
                      <option>English</option>
                      <option>Vietnamese</option>
                      <option>Khmer</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="font-medium">Map Default Style</label>
                    <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1">
                      <option>Dark Matter</option>
                      <option>Light Positron</option>
                      <option>Street Map</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Email Notifications</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Daily summaries</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Alert notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>Weekly reports</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading MIS Geospatial Platform...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-bold">
              MIS
            </div>
            <span className="font-semibold text-lg">MIS Geospatial Platform</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <BellIcon className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            
            {/* User Profile */}
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-sm font-medium">JD</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
        {/* Enhanced Sidebar */}
        <div className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 md:h-full overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center space-x-2 p-2 rounded-md transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {renderPageContent()}
        </div>
        
        {/* Context Panel */}
        <AnimatePresence>
          {showContextPanel && contextPanelData && (
            <motion.div
              className="fixed right-0 top-16 bottom-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-40 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{contextPanelData.title}</h3>
                  <button
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowContextPanel(false)}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Type</label>
                    <p className="capitalize font-medium">{contextPanelData.type}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Risk Level</label>
                    <p className={`capitalize font-medium ${
                      contextPanelData.risk === 'low' ? 'text-green-600' :
                      contextPanelData.risk === 'medium' ? 'text-yellow-600' :
                      contextPanelData.risk === 'high' ? 'text-orange-600' : 'text-red-600'
                    }`}>{contextPanelData.risk}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Coordinates</label>
                    <p className="font-mono text-sm">{contextPanelData.coordinates[1].toFixed(6)}, {contextPanelData.coordinates[0].toFixed(6)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Timestamp</label>
                    <p className="text-sm">{new Date(contextPanelData.timestamp).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Description</label>
                    <p className="text-sm">{contextPanelData.description}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
