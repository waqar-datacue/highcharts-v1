import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '../../lib/utils';
import { Loader2, RefreshCw } from 'lucide-react';

// Use the provided token
const MAPBOX_TOKEN = 'pk.eyJ1Ijoid2FxYXI5NSIsImEiOiJjbWFndzI0cTMwM3lnMm1zNGNjYWZmOWN6In0.9YEWbHlASaPbXYCxIq9qSw';

// Set the mapbox token globally
mapboxgl.accessToken = MAPBOX_TOKEN;

interface HeatmapWidgetProps {
  id: string;
  title: string;
  data: Array<{
    location: [number, number];
    value: number;
  }>;
  className?: string;
}

export const HeatmapWidget: React.FC<HeatmapWidgetProps> = ({
  id,
  title,
  data,
  className
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const loadTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      
      if (loadTimeout.current) {
        clearTimeout(loadTimeout.current);
      }
    };
  }, []);
  
  // Initialize the map when the component mounts
  useEffect(() => {
    if (!mapContainer.current) return;
    
    setIsLoading(true);
    setMapError(null);
    
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    
    initializeMap();
    
    // Set a timeout to detect if the map fails to load
    loadTimeout.current = setTimeout(() => {
      if (isLoading) {
        setMapError('Map took too long to load. Please check your connection and try again.');
        setIsLoading(false);
      }
    }, 15000);
    
    return () => {
      if (loadTimeout.current) {
        clearTimeout(loadTimeout.current);
      }
    };
  }, [data, mapContainer.current]);
  
  const initializeMap = async () => {
    if (!mapContainer.current) return;
    
    try {
      let didLoad = false;
      
      console.log("Initializing map with token:", MAPBOX_TOKEN);
      
      // Double-check token is set
      if (!mapboxgl.accessToken) {
        console.log("Token not set globally, setting it now");
        mapboxgl.accessToken = MAPBOX_TOKEN;
      }
      
      // Create a new map instance
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Use a lighter style for better visibility
        center: [46.7, 24.65], // Center on Riyadh
        zoom: 9.5,
        attributionControl: false,
        accessToken: MAPBOX_TOKEN, // Also pass token directly to constructor
      });
      
      map.current = newMap;
      
      // Handle errors
      newMap.on('error', (e) => {
        console.error('Mapbox error:', e);
        
        // Check specifically for token errors
        const errorMsg = e.error?.message || 'Unknown error';
        if (errorMsg.includes('token') || errorMsg.includes('access')) {
          setMapError(`API token error: ${errorMsg}. Please check your Mapbox API token.`);
        } else if (!didLoad) {
          setMapError(`Failed to load map: ${errorMsg}`);
        }
        setIsLoading(false);
      });
      
      // Wait for the map to load before adding data
      newMap.on('load', () => {
        didLoad = true;
        if (loadTimeout.current) clearTimeout(loadTimeout.current);
        try {
          // Add the data source
          newMap.addSource('sales-data', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: data.map(point => ({
                type: 'Feature',
                properties: { value: point.value },
                geometry: { type: 'Point', coordinates: point.location }
              }))
            }
          });
          
          // Add a heatmap layer
          newMap.addLayer({
            id: 'sales-heatmap',
            type: 'heatmap',
            source: 'sales-data',
            paint: {
              // Increase the heatmap weight based on value
              'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', 'value'],
                500000, 0.1,
                2500000, 1
              ],
              // Increase the heatmap color weight by zoom level
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                8, 0.5,
                12, 1
              ],
              // Color ramp for heatmap from blue to red
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(24, 81, 115, 0)', // datacue-primary with 0 opacity
                0.2, 'rgba(24, 81, 115, 0.3)', // lighter datacue-primary
                0.4, 'rgba(24, 81, 115, 0.5)', 
                0.6, 'rgba(24, 81, 115, 0.7)',
                0.8, 'rgba(24, 81, 115, 0.85)',
                1, 'rgba(24, 81, 115, 1)' // full datacue-primary
              ],
              // Adjust the heatmap radius by zoom level
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                8, 10,
                12, 30
              ],
              // Transition from heatmap to circle radius by zoom level
              'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                8, 0.8,
                12, 0.5
              ]
            }
          });
          
          // Also add circle points for more detailed view
          newMap.addLayer({
            id: 'sales-points',
            type: 'circle',
            source: 'sales-data',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['get', 'value'],
                500000, 5,
                2500000, 15
              ],
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'value'],
                500000, 'rgba(24, 81, 115, 0.5)', // lighter datacue-primary
                1000000, 'rgba(24, 81, 115, 0.6)',
                1500000, 'rgba(24, 81, 115, 0.7)', 
                2000000, 'rgba(24, 81, 115, 0.85)',
                2500000, 'rgba(24, 81, 115, 1)' // full datacue-primary
              ],
              'circle-opacity': 0.8,
              'circle-stroke-width': 1,
              'circle-stroke-color': 'white'
            }
          });
          
          // Update state
          setIsLoading(false);
          
          // Force a resize to ensure the map fills the container
          setTimeout(() => {
            if (map.current) {
              map.current.resize();
            }
          }, 100);
          
        } catch (error) {
          console.error("Error adding map data:", error);
          setMapError('Failed to load sales data on the map. ' + (error instanceof Error ? error.message : 'Unknown error'));
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      // Special handling for token errors
      if (errorMsg.includes('token') || errorMsg.includes('access')) {
        setMapError(`API token error: ${errorMsg}. Please check your Mapbox API token.`);
      } else {
        setMapError('Failed to initialize map. ' + errorMsg);
      }
      
      setIsLoading(false);
    }
  };
  
  const handleRetry = () => {
    setIsLoading(true);
    setMapError(null);
    
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
    
    // Ensure token is set again before retry
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    setTimeout(() => {
      initializeMap();
    }, 500);
  };
  
  return (
    <div className={cn('w-full h-full flex flex-col relative', className)}>
      <div ref={mapContainer} className="w-full h-full rounded-md" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-10">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 text-datacue-primary animate-spin" />
            <p className="text-sm text-gray-500">Loading sales distribution map...</p>
          </div>
        </div>
      )}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-10">
          <div className="flex flex-col items-center space-y-3 p-4 text-center">
            <p className="text-gray-500 font-bold">{mapError}</p>
            <button 
              className="flex items-center gap-1 px-3 py-1 bg-datacue-primary text-white text-sm rounded-md hover:bg-datacue-primary/90 transition-colors"
              onClick={handleRetry}
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
