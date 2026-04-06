import React, { useState, useEffect, useMemo } from 'react';
import { Flame, MapPin, AlertTriangle, Clock, Filter, TrendingUp, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import pseudoDatabase, { generateFireIncidents } from '../services/pseudoDatabase';
import FireMap from '../components/FireMap';
import { useFireStore } from '../stores';

const FireMonitorPage = () => {
  const { fires, districts, filters, setFilters, setStats } = useFireStore();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fireData = pseudoDatabase.fireIncidents;
  const allDistricts = pseudoDatabase.districts;

  // Initialize fire data
  useEffect(() => {
    useFireStore.getState().setFires(fireData);
    useFireStore.getState().setStats({
      total: fireData.length,
      active: fireData.filter(f => f.status === 'active').length,
      resolved: fireData.filter(f => f.status === 'resolved' || f.status === 'contained').length,
    });
  }, []);

  // Auto refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Simulate new fire detection
      if (Math.random() > 0.7) {
        const newFire = generateFireIncidents(1)?.[0] || fireData[0];
        if (newFire) {
          useFireStore.getState().setFires([newFire, ...fires.slice(0, -1)]);
        }
      }
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, fires]);

  const filteredFires = useMemo(() => {
    return fireData.filter((fire) => {
      if (filters.district !== 'all' && fire.districtId !== filters.district) return false;
      if (selectedSeverity !== 'all' && fire.severity !== selectedSeverity) return false;
      return true;
    });
  }, [fireData, filters, selectedSeverity]);

  const stats = useMemo(() => {
    return {
      total: filteredFires.length,
      active: filteredFires.filter(f => f.status === 'active' || f.status === 'responding').length,
      critical: filteredFires.filter(f => f.severity === 'critical' && f.status === 'active').length,
      resolved: filteredFires.filter(f => f.status === 'resolved' || f.status === 'contained').length,
    };
  }, [filteredFires]);

  const activeFires = filteredFires.filter(f => f.status === 'active' || f.status === 'responding');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fire Monitor</h1>
                <p className="text-sm text-gray-600">Real-time stubble fire detection</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {autoRefresh ? 'Live' : 'Paused'}
              </button>
              <Link
                to="/dashboard/government"
                className="px-4 py-2 bg-kc-green text-white rounded-lg text-sm font-medium hover:bg-kc-light transition-colors"
              >
                Full Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-500">Total Fires</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Flame className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{stats.active}</div>
                <div className="text-xs text-gray-500">Active Now</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-500">{stats.critical}</div>
                <div className="text-xs text-gray-500">Critical</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-xs text-gray-500">Resolved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <select
              value={filters.district}
              onChange={(e) => setFilters({ district: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Districts</option>
              {allDistricts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900">Live Fire Map</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </div>
              </div>
              <FireMap fires={filteredFires} districts={allDistricts} height="400px" />
            </div>
          </div>

          {/* Active Fires List */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-500" />
                Active Alerts ({activeFires.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeFires.slice(0, 10).map((fire) => (
                  <div key={fire.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{fire.district}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {fire.location?.lat?.toFixed(4)}, {fire.location?.lng?.toFixed(4)}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          fire.severity === 'critical'
                            ? 'bg-red-100 text-red-600'
                            : fire.severity === 'high'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        {fire.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(fire.detectedAt).toLocaleTimeString()}
                      </span>
                      <span>~{fire.estimatedArea} acres</span>
                    </div>
                  </div>
                ))}
                {activeFires.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Flame className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No active fires</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-kc-green to-kc-light rounded-xl p-4 text-white">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/marketplace"
                  className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span className="text-sm">Buy Carbon Credits</span>
                  <span>→</span>
                </Link>
                <a
                  href="tel:+919876543210"
                  className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <span className="text-sm">Emergency Contact</span>
                  <span>📞</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Spacer */}
      <div className="h-20" />
    </div>
  );
};

export default FireMonitorPage;
