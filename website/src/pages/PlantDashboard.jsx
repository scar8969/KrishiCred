import React, { useState, useEffect } from 'react';
import pseudoDatabase from '../services/pseudoDatabase';

const PlantDashboard = () => {
  const { biogasPlants, generateRoutes } = pseudoDatabase;
  const [selectedPlant, setSelectedPlant] = useState(biogasPlants[0]);
  const [todayRoutes, setTodayRoutes] = useState([]);
  const [expandedRoute, setExpandedRoute] = useState(null);
  const [updatingStops, setUpdatingStops] = useState({});

  // Load routes when plant changes
  useEffect(() => {
    const routes = generateRoutes(selectedPlant.id, new Date().toISOString().split('T')[0]);
    // Generate multiple routes for the plant
    const allRoutes = [
      routes,
      generateRoutes(selectedPlant.id, new Date().toISOString().split('T')[0]),
      generateRoutes(selectedPlant.id, new Date().toISOString().split('T')[0]),
    ];
    setTodayRoutes(allRoutes);
  }, [selectedPlant]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayRoutes(prevRoutes =>
        prevRoutes.map(route => ({
          ...route,
          stops: route.stops.map(stop => {
            // Randomly update stop status
            if (stop.status === 'pending' && Math.random() > 0.7) {
              return { ...stop, status: 'completed' };
            }
            if (stop.status === 'pending' && Math.random() > 0.9) {
              return { ...stop, status: 'in_transit' };
            }
            if (stop.status === 'in_transit' && Math.random() > 0.6) {
              return { ...stop, status: 'completed' };
            }
            return stop;
          }),
          status: route.stops.every(s => s.status === 'completed')
            ? 'completed'
            : route.stops.some(s => s.status === 'in_transit' || s.status === 'completed')
            ? 'in_progress'
            : 'scheduled',
        }))
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [todayRoutes]);

  // Handle plant change
  const handlePlantChange = (e) => {
    const plant = biogasPlants.find(p => p.id === e.target.value);
    if (plant) {
      setSelectedPlant(plant);
      setExpandedRoute(null);
    }
  };

  // Toggle route expansion
  const toggleRouteExpansion = (routeId) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId);
  };

  // Handle stop status change (for demo purposes)
  const handleStopStatusToggle = (routeId, stopSequence) => {
    setUpdatingStops(prev => ({ ...prev, [`${routeId}-${stopSequence}`]: true }));

    setTimeout(() => {
      setTodayRoutes(prevRoutes =>
        prevRoutes.map(route => {
          if (route.id !== routeId) return route;

          return {
            ...route,
            stops: route.stops.map(stop => {
              if (stop.sequence !== stopSequence) return stop;

              const statusFlow = ['pending', 'in_transit', 'completed'];
              const currentIndex = statusFlow.indexOf(stop.status);
              const nextStatus = statusFlow[(currentIndex + 1) % statusFlow.length];

              return { ...stop, status: nextStatus };
            }),
          };
        })
      );
      setUpdatingStops(prev => ({ ...prev, [`${routeId}-${stopSequence}`]: false }));
    }, 500);
  };

  // Calculate route progress
  const calculateRouteProgress = (route) => {
    const completedStops = route.stops.filter(s => s.status === 'completed').length;
    return Math.round((completedStops / route.stops.length) * 100);
  };

  // Get driver info from vehicle
  const getDriverInfo = (vehicle) => ({
    name: vehicle.driver || 'Driver Name',
    phone: '+91 98765 43210',
    vehicle: vehicle.registration || 'PB-XX-XXXX',
  });

  const capacityPercent = selectedPlant.capacity.currentUtilization;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (capacityPercent / 100) * circumference;

  return (
    <div className="bg-background text-on-surface">
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Plant Overview Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1 text-primary font-semibold">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="text-sm">{selectedPlant.district}, Punjab</span>
                </div>
                <h1 className="text-4xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight mb-2">{selectedPlant.name}</h1>
                <p className="text-on-surface-variant max-w-md">{selectedPlant.address}</p>
              </div>
              {/* Capacity Gauge */}
              <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" strokeWidth="12"></circle>
                  <circle
                    className="text-primary-container"
                    cx="64"
                    cy="64"
                    fill="transparent"
                    r="54"
                    stroke="currentColor"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeWidth="12"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold font-['Plus_Jakarta_Sans']">{capacityPercent}%</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Capacity</span>
                </div>
              </div>
            </div>

            {/* Plant Selector */}
            <div className="bg-surface-container-low rounded-xl p-4">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Select Plant</label>
              <select
                value={selectedPlant.id}
                onChange={handlePlantChange}
                className="w-full bg-surface-container-highest border-none rounded-xl h-12 px-4 appearance-none focus:ring-2 focus:ring-primary cursor-pointer font-medium"
              >
                {biogasPlants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name} - {plant.district}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-surface-container-low p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold font-['Plus_Jakarta_Sans']">Alerts & Updates</h3>
              <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-full">3 New</span>
            </div>
            <div className="space-y-3">
              <div className="bg-surface-container-lowest p-3 rounded-lg flex gap-3 items-start">
                <span className="material-symbols-outlined text-amber-500">list_alt</span>
                <div>
                  <p className="text-sm font-semibold">New listing: 40 Tons</p>
                  <p className="text-xs text-on-surface-variant">Village Mallah, Sangrur</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg flex gap-3 items-start">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <div>
                  <p className="text-sm font-semibold">Route #402 Completed</p>
                  <p className="text-xs text-on-surface-variant">All stops verified by Balwinder Singh</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Row: Bento Style - Dynamic */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl">
            <span className="material-symbols-outlined text-primary mb-3">recycling</span>
            <p className="text-3xl font-extrabold font-['Plus_Jakarta_Sans']">
              {todayRoutes.reduce((sum, r) => sum + r.stops.filter(s => s.status === 'completed').reduce((s, stop) => s + stop.quantity, 0), 0).toFixed(1)}
            </p>
            <p className="text-sm text-on-surface-variant">Today's Collections (Tons)</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl">
            <span className="material-symbols-outlined text-primary mb-3">local_shipping</span>
            <p className="text-3xl font-extrabold font-['Plus_Jakarta_Sans']">
              {todayRoutes.filter(r => r.status === 'in_progress').length.toString().padStart(2, '0')}
            </p>
            <p className="text-sm text-on-surface-variant">Active Routes</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl">
            <span className="material-symbols-outlined text-primary mb-3">inventory_2</span>
            <p className="text-3xl font-extrabold font-['Plus_Jakarta_Sans']">{selectedPlant.storage.current}</p>
            <p className="text-sm text-on-surface-variant">Current Stock (Tons)</p>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl">
            <span className="material-symbols-outlined text-primary mb-3">hub</span>
            <p className="text-3xl font-extrabold font-['Plus_Jakarta_Sans']">
              {todayRoutes.filter(r => r.status !== 'completed').length}/{todayRoutes.length}
            </p>
            <p className="text-sm text-on-surface-variant">Routes Status</p>
          </div>
        </section>

        {/* Main Content Area: Routes & Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Routes Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Active Transport Routes</h2>
                <p className="text-on-surface-variant text-sm">Real-time tracking of biomass collection</p>
              </div>
              <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Route Cards - Dynamic & Interactive */}
            <div className="space-y-4">
              {todayRoutes.map((route) => {
                const driverInfo = getDriverInfo(route.vehicle);
                const progress = calculateRouteProgress(route);
                const isExpanded = expandedRoute === route.id;
                const statusColor = route.status === 'completed' ? 'border-emerald-500' : route.status === 'in_progress' ? 'border-amber-500' : 'border-slate-400';

                return (
                  <div
                    key={route.id}
                    className={`bg-surface-container-lowest rounded-xl shadow-sm border-l-4 ${statusColor} overflow-hidden transition-all`}
                  >
                    {/* Route Header - Always Visible */}
                    <div className="p-6">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                              Route #{route.id.slice(-6)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              route.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              route.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {route.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold font-['Plus_Jakarta_Sans']">
                            {selectedPlant.district} - Route {route.id.slice(-3)}
                          </h3>
                          <div className="flex gap-4 mt-1">
                            <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-xs">person</span>
                              {driverInfo.name}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-xs">badge</span>
                              {driverInfo.vehicle}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-xs">scale</span>
                              {route.totalQuantity} tons
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={`tel:${driverInfo.phone}`}
                            className="signature-gradient text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform"
                          >
                            <span className="material-symbols-outlined text-sm">call</span>
                            Call
                          </a>
                          <button
                            onClick={() => toggleRouteExpansion(route.id)}
                            className="px-4 py-2.5 bg-surface-container-low text-on-surface hover:bg-surface-container-high rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                            {isExpanded ? 'Hide' : 'Details'}
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                          <span>{route.stops.filter(s => s.status === 'completed').length} / {route.stops.length} Stops Completed</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              route.status === 'completed' ? 'bg-emerald-500' :
                              route.status === 'in_progress' ? 'bg-amber-500' :
                              'bg-slate-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="border-t border-surface-container-high p-6 bg-surface-container-low/50 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          <div className="bg-surface-container-highest p-4 rounded-xl">
                            <p className="text-xs text-on-surface-variant mb-1">Estimated Duration</p>
                            <p className="font-bold">{route.estimatedDuration}</p>
                          </div>
                          <div className="bg-surface-container-highest p-4 rounded-xl">
                            <p className="text-xs text-on-surface-variant mb-1">Total Distance</p>
                            <p className="font-bold">{route.totalDistance} km</p>
                          </div>
                          <div className="bg-surface-container-highest p-4 rounded-xl">
                            <p className="text-xs text-on-surface-variant mb-1">Capacity</p>
                            <p className="font-bold">{route.totalQuantity} / {route.vehicle.capacity} tons</p>
                          </div>
                        </div>

                        <h4 className="font-bold text-sm mb-3">Route Stops</h4>
                        <div className="space-y-2">
                          {route.stops.map((stop) => {
                            const isUpdating = updatingStops[`${route.id}-${stop.sequence}`];
                            return (
                              <div
                                key={stop.sequence}
                                onClick={() => handleStopStatusToggle(route.id, stop.sequence)}
                                className={`bg-surface-container-highest p-4 rounded-xl flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-all ${
                                  isUpdating ? 'animate-pulse' : ''
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    stop.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                    stop.status === 'in_transit' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                    {stop.sequence}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold">{stop.farmerName}</p>
                                    <p className="text-xs text-on-surface-variant">
                                      {stop.village} • {stop.quantity} tons • ETA: {stop.estimatedArrival}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    stop.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                    stop.status === 'in_transit' ? 'bg-amber-100 text-amber-800' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {stop.status.replace('_', ' ')}
                                  </span>
                                  <span className="material-symbols-outlined">
                                    {stop.status === 'completed' ? 'check_circle' : stop.status === 'in_transit' ? 'local_shipping' : 'radio_button_unchecked'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-3 text-center">Click on a stop to change its status (demo)</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supply Calendar Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">Supply Calendar</h2>
            <div className="bg-surface-container-low p-6 rounded-xl space-y-6">
              <div className="flex justify-between items-center">
                <span className="font-bold">October 2023</span>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-surface-container-high rounded-full">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="p-1 hover:bg-surface-container-high rounded-full">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-400">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                <div className="aspect-square flex items-center justify-center text-sm rounded-lg text-slate-400">22</div>
                <div className="aspect-square flex items-center justify-center text-sm rounded-lg bg-emerald-100 text-emerald-800 font-bold border-2 border-emerald-500">23</div>
                <div className="aspect-square flex items-center justify-center text-sm rounded-lg bg-surface-container-highest">24</div>
                <div className="aspect-square flex items-center justify-center text-sm rounded-lg bg-surface-container-highest">25</div>
                <div className="aspect-square flex items-center justify-center text-sm rounded-lg bg-surface-container-highest font-bold">26</div>
                <div className="aspect-square flex items-center justify-center text-sm rounded-lg bg-surface-container-highest">27</div>
                <div className="aspect-square flex items-center justify-center text-sm rounded-lg bg-surface-container-highest">28</div>
              </div>
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">event_available</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold">Planned Intake: 450T</p>
                    <p className="text-[10px] text-on-surface-variant">Expected by Oct 26</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600">warning</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold">Maintenance Window</p>
                    <p className="text-[10px] text-on-surface-variant">Oct 28 | 04:00 - 08:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Map Card */}
            <div className="relative rounded-xl overflow-hidden h-48 group">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400&h=200&fit=crop"
                alt="Collection Hotspots"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <h4 className="text-white font-bold font-['Plus_Jakarta_Sans']">Collection Hotspots</h4>
                <p className="text-white/70 text-[10px]">High density areas identified in Sangrur region</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlantDashboard;
