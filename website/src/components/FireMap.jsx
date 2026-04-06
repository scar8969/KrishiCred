import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Custom icons for fire markers
const createFireIcon = (severity) => {
  const colors = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
  };

  const sizes = {
    low: 20,
    medium: 25,
    high: 30,
    critical: 35,
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${sizes[severity]}px;
        height: ${sizes[severity]}px;
        background: ${colors[severity]};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        animation: pulse 2s ease-in-out infinite;
      "></div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      </style>
    `,
    iconSize: [sizes[severity], sizes[severity]],
    iconAnchor: [sizes[severity] / 2, sizes[severity] / 2],
  });
};

const plantIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #4A7C23 0%, #2E4D14 100%);
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">⚡</div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const FireMap = ({ fires = [], districts = [], plants = [], height = '400px' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedFire, setSelectedFire] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Punjab center coordinates
  const CENTER = [30.7333, 76.7794];
  const DEFAULT_ZOOM = 8;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add fire markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add fire markers
    fires.forEach((fire) => {
      const marker = L.marker([fire.location.lat, fire.location.lng], {
        icon: createFireIcon(fire.severity),
      });

      marker.bindPopup(`
        <div class="p-2">
          <div class="flex items-center gap-2 mb-2">
            <div style="width: 20px; height: 20px; background: ${
              fire.severity === 'critical' ? '#ef4444' :
              fire.severity === 'high' ? '#f97316' :
              fire.severity === 'medium' ? '#eab308' : '#22c55e'
            }; border-radius: 50%;"></div>
            <h3 class="font-bold text-lg">Fire Detected</h3>
          </div>
          <p class="text-sm text-gray-600">${fire.district}</p>
          <div class="mt-2 space-y-1 text-sm">
            <p><strong>Severity:</strong> <span class="text-${
              fire.severity === 'critical' ? 'red' :
              fire.severity === 'high' ? 'orange' : 'yellow'
            }-600">${fire.severity.toUpperCase()}</span></p>
            <p><strong>Area:</strong> ${fire.estimatedArea} acres</p>
            <p><strong>Confidence:</strong> ${fire.confidence}%</p>
            <p><strong>Status:</strong> ${fire.status}</p>
            <p><strong>Detected:</strong> ${new Date(fire.detectedAt).toLocaleString()}</p>
          </div>
        </div>
      `);

      marker.addTo(map);
    });

    // Add plant markers
    plants.forEach((plant) => {
      const marker = L.marker([plant.location.lat, plant.location.lng], {
        icon: plantIcon,
      });

      marker.bindPopup(`
        <div class="p-2">
          <div class="flex items-center gap-2 mb-2">
            <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #4A7C23 0%, #2E4D14 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;">⚡</div>
            <h3 class="font-bold text-lg">${plant.name}</h3>
          </div>
          <p class="text-sm text-gray-600">${plant.address}</p>
          <div class="mt-2 space-y-1 text-sm">
            <p><strong>Capacity:</strong> ${plant.capacity.daily} tons/day</p>
            <p><strong>Utilization:</strong> ${plant.capacity.currentUtilization}%</p>
            <p><strong>Price:</strong> ₹${plant.pricePerTon}/ton</p>
            <p><strong>Status:</strong> <span class="text-green-600">${plant.status}</span></p>
          </div>
        </div>
      `);

      marker.addTo(map);
    });

    // Add district circles for fire counts
    districts.forEach((district) => {
      if (district.fires_today > 0) {
        const radius = Math.sqrt(district.fires_today) * 3000;
        L.circle([district.lat, district.lng], {
          radius: radius,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.1,
          weight: 1,
        }).addTo(map).bindTooltip(`${district.name}: ${district.fires_today} fires`);
      }
    });
  }, [fires, districts, plants, mapReady]);

  return (
    <div className="relative">
      <div ref={mapRef} style={{ height, width: '100%', borderRadius: '1rem' }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="font-semibold text-sm mb-2">Fire Severity</h4>
        <div className="space-y-1">
          {['low', 'medium', 'high', 'critical'].map((severity) => (
            <div key={severity} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background:
                    severity === 'low'
                      ? '#22c55e'
                      : severity === 'medium'
                      ? '#eab308'
                      : severity === 'high'
                      ? '#f97316'
                      : '#ef4444',
                }}
              />
              <span className="capitalize">{severity}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-agri-green to-agri-green-dark"></div>
            <span>Biogas Plants</span>
          </div>
        </div>
      </div>

      {/* Fire Count Badge */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">{fires.length}</div>
          <div className="text-xs text-gray-600">Active Fires</div>
        </div>
      </div>
    </div>
  );
};

export default FireMap;
