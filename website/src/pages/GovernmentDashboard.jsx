import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pseudoDatabase from '../services/pseudoDatabase';

const GovernmentDashboard = () => {
  const { districts, getDashboardStats, getFireTrendData, fireIncidents } = pseudoDatabase;
  const navigate = useNavigate();

  // State
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  // Get filtered fires based on selected district
  const filteredFires = selectedDistrict === 'all'
    ? fireIncidents
    : fireIncidents.filter(f => f.districtId === selectedDistrict || f.district === selectedDistrict);

  // Get active fires only
  const activeFires = filteredFires
    .filter(f => f.status === 'active' || f.status === 'responding')
    .slice(0, 6);

  // Calculate rankings dynamically based on fires
  const districtRankings = [...districts]
    .map(d => ({
      ...d,
      fireCount: fireIncidents.filter(f => f.districtId === d.id).length,
      totalFarms: d.farms,
    }))
    .sort((a, b) => b.fireCount - a.fireCount)
    .slice(0, 5)
    .map((d, i) => {
      // Calculate compliance as inverse of fires per farm
      const firesPerFarm = d.fireCount / Math.max(d.totalFarms, 1);
      const compliance = Math.max(0, 100 - (firesPerFarm * 10));
      return {
        name: d.name,
        percentage: Math.round(compliance * 10) / 10,
        color: compliance > 80 ? 'emerald-500' : compliance > 50 ? 'secondary' : 'tertiary',
      };
    });

  // Update data when period or district changes
  useEffect(() => {
    setStats(getDashboardStats(selectedPeriod));
    setTrendData(getFireTrendData(30));
  }, [selectedPeriod, selectedDistrict]);

  // Helper functions
  const getTrendHeight = (fires) => {
    if (!trendData.length) return '0%';
    const maxFires = Math.max(...trendData.map(d => d.fires));
    return `${Math.min((fires / maxFires) * 100, 100)}%`;
  };

  const getBarColor = (fires) => {
    if (!trendData.length) return 'bg-surface-container-high';
    const maxFires = Math.max(...trendData.map(d => d.fires));
    const ratio = fires / maxFires;
    if (ratio > 0.7) return 'bg-tertiary';
    if (ratio < 0.25) return 'bg-primary-container';
    return 'bg-surface-container-high';
  };

  // Handle alert click
  const handleAlertClick = (fire) => {
    navigate(`/fire?fire=${fire.id}`);
  };

  // Handle quick actions
  const handleBrowseCredits = () => navigate('/marketplace');
  const handleDownloadReport = () => {
    alert('Report download would be generated here');
  };
  const handleAlertTeam = () => {
    alert('Emergency alert would be sent to fire response team');
  };

  if (!stats) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl animate-spin text-primary mb-4">refresh</span>
          <p className="text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Government Monitor Dashboard</h2>
            <p className="text-on-surface-variant font-medium">Real-time agricultural residue management and fire prevention tracking.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Period Selector */}
            <div className="bg-surface-container-low p-1.5 rounded-xl flex items-center">
              {['today', 'week', 'month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold ${
                    selectedPeriod === period
                      ? 'bg-surface-container-lowest shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  } transition-colors`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            {/* District Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
                className="bg-surface-container-low px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer border-b-2 border-transparent hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                <span className="font-bold text-sm">
                  {selectedDistrict === 'all' ? 'All Districts' : districts.find(d => d.id === selectedDistrict)?.name || selectedDistrict}
                </span>
                <span className={`material-symbols-outlined text-on-surface-variant text-sm transition-transform ${showDistrictDropdown ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Dropdown Menu */}
              {showDistrictDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-surface-container-lowest rounded-xl shadow-xl z-50 min-w-[200px] py-2">
                  <button
                    onClick={() => { setSelectedDistrict('all'); setShowDistrictDropdown(false); }}
                    className={`w-full px-4 py-2 text-left hover:bg-surface-container-high transition-colors ${selectedDistrict === 'all' ? 'bg-surface-container-high' : ''}`}
                  >
                    All Districts
                  </button>
                  {districts.map((district) => (
                    <button
                      key={district.id}
                      onClick={() => { setSelectedDistrict(district.id); setShowDistrictDropdown(false); }}
                      className={`w-full px-4 py-2 text-left hover:bg-surface-container-high transition-colors text-sm ${selectedDistrict === district.id ? 'bg-surface-container-high' : ''}`}
                    >
                      {district.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row - Using calculated real data */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <div className="bg-surface-container-low p-6 rounded-xl">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Total Fires</p>
            <h3 className="text-3xl font-black">{filteredFires.length}</h3>
            <p className="mt-2 text-on-surface-variant text-xs font-medium">
              {selectedDistrict === 'all' ? 'Across all districts' : `In ${selectedDistrict}`}
            </p>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-tertiary">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Active Fires</p>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-black">{activeFires.length}</h3>
              {activeFires.length > 0 && (
                <span className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                  Attention
                </span>
              )}
            </div>
            <p className="mt-2 text-on-surface-variant text-xs font-medium">
              Requires action
            </p>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Districts Tracked</p>
            <h3 className="text-3xl font-black">{districts.length}</h3>
            <p className="mt-2 text-on-surface-variant text-xs font-medium">Across Punjab</p>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">Biogas Plants</p>
            <h3 className="text-3xl font-black">6</h3>
            <p className="mt-2 text-on-surface-variant text-xs font-medium">Operational</p>
          </div>

          <div className="bg-surface-container-low p-6 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white">
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Carbon Credits</p>
            <h3 className="text-3xl font-black">
              {filteredFires.filter(f => f.verifiedAt).length * 100}
              <span className="text-lg font-normal"> tCO2e</span>
            </h3>
            <p className="mt-2 text-white/90 text-xs font-medium">
              Available for trading
            </p>
          </div>
        </div>

        {/* Main Content Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Live Fire Map */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <section className="bg-surface-container-low rounded-xl overflow-hidden relative group">
              <div className="p-6 flex justify-between items-center bg-surface-container-high/50 backdrop-blur-sm absolute top-0 left-0 w-full z-10">
                <h4 className="font-bold flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                  </span>
                  Live Fire Map View
                </h4>
                <div className="flex gap-2">
                  <button className="bg-surface-container-lowest p-2 rounded-lg shadow-sm hover:scale-105 duration-150" title="Toggle layers">
                    <span className="material-symbols-outlined text-on-surface text-sm">layers</span>
                  </button>
                  <button className="bg-surface-container-lowest p-2 rounded-lg shadow-sm hover:scale-105 duration-150" title="My location">
                    <span className="material-symbols-outlined text-on-surface text-sm">my_location</span>
                  </button>
                </div>
              </div>
              <div className="h-[500px] w-full bg-surface-dim relative overflow-hidden">
                <img
                  className="w-full h-full object-cover grayscale opacity-60"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmsETM1v-B-Uos4gWskNz1eGZBcNeFmCg8MC-JL6qYrm7lgSbY7sVPhiXn_o_UftVqjozFtjVdjvmhRENPgi1jQXSkrdeDJHPXjMYgRFU7lldyejXxyr9K29IgDPNR0_aZdCMS90iqUm9gXE-TwfirWl6JZGeUtBiQBNgcrJuq-z3DNykJvqe_mjtMdfnIDsmaLkBBA25ZXcAjF5J9BpXZvPQoqAnFiPvCwtOU5yPsSiUDhOJytLNFmK7jsPVqh8dbbuvTUMDbbk"
                  alt="Satellite map"
                />
                {/* Fire Markers - show filtered fires */}
                {filteredFires.slice(0, 5).map((fire, i) => (
                  <div
                    key={fire.id}
                    className={`absolute cursor-pointer ${
                      fire.status === 'active' ? 'animate-pulse' : ''
                    }`}
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${10 + Math.random() * 80}%`,
                    }}
                    title={`${fire.district}: ${fire.status}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                        fire.severity === 'critical' ? 'bg-tertiary' :
                        fire.severity === 'high' ? 'bg-secondary' :
                        'bg-primary'
                      }`}
                    ></div>
                  </div>
                ))}

                {/* Legend */}
                <div className="absolute bottom-6 left-6 bg-surface-container-lowest/90 backdrop-blur-md p-4 rounded-xl shadow-xl max-w-xs">
                  <h5 className="font-bold text-xs mb-2">Severity Legend</h5>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-medium">
                      <span className="w-3 h-3 rounded-full bg-tertiary"></span>
                      Critical (Immediate Action)
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium">
                      <span className="w-3 h-3 rounded-full bg-secondary"></span>
                      Moderate Activity
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium">
                      <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                      Low Activity
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 30-Day Trend Chart */}
            <section className="bg-surface-container-low p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold">30-Day Fire Count Trend</h4>
                <span className="text-on-surface-variant text-xs font-medium">
                  Showing data for selected period
                </span>
              </div>
              <div className="h-48 w-full flex items-end gap-1.5 justify-between px-2">
                {trendData.map((day, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t-sm transition-all hover:opacity-80 ${getBarColor(day.fires)}`}
                    style={{ height: getTrendHeight(day.fires) }}
                    title={`${day.date}: ${day.fires} fires`}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant px-2">
                <span>30 DAYS AGO</span>
                <span>TODAY</span>
              </div>
            </section>
          </div>

          {/* Right: Lists & Actions */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Active Fires List */}
            <section className="bg-surface-container-low p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold">Active Alerts ({activeFires.length})</h4>
              </div>
              <div className="space-y-4">
                {activeFires.length > 0 ? (
                  activeFires.map((fire) => (
                    <div
                      key={fire.id}
                      onClick={() => handleAlertClick(fire)}
                      className="flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl hover:translate-x-1 transition-transform cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${
                          fire.severity === 'critical' ? 'bg-tertiary-container/30 text-tertiary' :
                          fire.severity === 'high' ? 'bg-secondary-container/30 text-secondary' :
                          'bg-surface-container-high text-on-surface-variant'
                        } flex items-center justify-center`}>
                          <span className="material-symbols-outlined">
                            local_fire_department
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-sm">{fire.district}</p>
                          <p className="text-[10px] text-on-surface-variant font-medium">
                            Reported {new Date(f.detectedAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        fire.severity === 'critical' ? 'bg-tertiary-container text-on-tertiary-container' :
                        fire.severity === 'high' ? 'bg-secondary-container text-on-secondary-container' :
                        'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {fire.severity}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                    <p>No active fires in selected area</p>
                  </div>
                )}
              </div>
            </section>

            {/* District Rankings */}
            <section className="bg-surface-container-low p-6 rounded-xl">
              <h4 className="font-bold mb-6">Fire Compliance Ranking</h4>
              <div className="space-y-3">
                {districtRankings.map((district, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-xs font-black text-on-surface-variant w-4">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold">{district.name}</p>
                        <p className={`text-[10px] font-black ${
                          district.color === 'emerald-500' ? 'text-emerald-600' :
                          district.color === 'secondary' ? 'text-secondary' :
                          'text-tertiary'
                        }`}>
                          {district.percentage}%
                        </p>
                      </div>
                      <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${district.color} transition-all duration-500`}
                          style={{ width: `${district.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="grid grid-cols-1 gap-3">
              <button
                onClick={handleBrowseCredits}
                className="w-full py-4 px-6 bg-surface-container-low hover:bg-surface-container-high text-primary font-bold rounded-xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">payments</span>
                  <span>Browse Carbon Credits</span>
                </div>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>

              <button
                onClick={handleDownloadReport}
                className="w-full py-4 px-6 bg-surface-container-low hover:bg-surface-container-high text-on-surface font-bold rounded-xl flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">download</span>
                  <span>Download Report</span>
                </div>
                <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">arrow_downward</span>
              </button>

              <button
                onClick={handleAlertTeam}
                className="w-full py-4 px-6 bg-gradient-to-br from-tertiary to-error text-white font-bold rounded-xl flex items-center justify-between shadow-lg shadow-error/20 hover:scale-[1.02] active:scale-95 duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">campaign</span>
                  <span>Alert Fire Team</span>
                </div>
                <span className="material-symbols-outlined">emergency</span>
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GovernmentDashboard;
