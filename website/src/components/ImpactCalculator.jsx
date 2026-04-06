import React, { useState, useMemo } from 'react';
import { TrendingUp, Trees, Leaf, IndianRupee } from 'lucide-react';

const ImpactCalculator = () => {
  const [farmSize, setFarmSize] = useState(5);

  // Calculations based on farm size
  const calculations = useMemo(() => {
    const stubblePerAcre = 4; // tons
    const stubblePricePerAcre = 2200; // INR
    const carbonCreditsPerAcre = 800; // INR
    const co2PreventedPerTon = 2.9; // tons CO2e
    const treesPerTonCO2 = 45; // equivalent trees

    const stubbleTons = farmSize * stubblePerAcre;
    const stubbleEarnings = farmSize * stubblePricePerAcre;
    const carbonEarnings = farmSize * carbonCreditsPerAcre;
    const totalEarnings = stubbleEarnings + carbonEarnings;
    const co2Prevented = stubbleTons * co2PreventedPerTon;
    const treesEquivalent = Math.floor(co2Prevented * treesPerTonCO2);

    return {
      stubbleTons,
      stubbleEarnings,
      carbonEarnings,
      totalEarnings,
      co2Prevented,
      treesEquivalent,
    };
  }, [farmSize]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Input Section */}
        <div className="bg-gradient-to-r from-kc-green to-kc-light p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Calculate Your Impact</h3>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="block text-sm text-green-100 mb-2">Farm Size (Acres)</label>
              <input
                type="range"
                min="1"
                max="50"
                value={farmSize}
                onChange={(e) => setFarmSize(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-green-200 mt-1">
                <span>1 acre</span>
                <span className="text-2xl font-bold text-white">{farmSize} acres</span>
                <span>50 acres</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Stubble Generated */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{calculations.stubbleTons}</div>
            <div className="text-sm text-gray-600 mt-1">Tons Stubble</div>
            <div className="text-xs text-gray-400 mt-1">{farmSize} acres × 4 tons/acre</div>
          </div>

          {/* Earnings Breakdown */}
          <div className="bg-green-50 rounded-xl p-4 text-center border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600">₹{calculations.totalEarnings.toLocaleString()}</div>
            <div className="text-sm text-green-700 mt-1 font-medium">Total Earnings</div>
            <div className="text-xs text-green-600 mt-1">
              ₹{calculations.stubbleEarnings.toLocaleString()} + ₹{calculations.carbonEarnings.toLocaleString()}
            </div>
          </div>

          {/* CO2 Prevented */}
          <div className="bg-blue-50 rounded-xl p-4 text-center border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{calculations.co2Prevented}</div>
            <div className="text-sm text-blue-700 mt-1 font-medium">Tons CO₂ Prevented</div>
            <div className="text-xs text-blue-600 mt-1">{calculations.stubbleTons} × 2.9 tons/ton</div>
          </div>

          {/* Trees Equivalent */}
          <div className="bg-emerald-50 rounded-xl p-4 text-center border-2 border-emerald-200">
            <div className="flex items-center justify-center gap-1">
              <Trees className="w-6 h-6 text-emerald-600" />
              <div className="text-2xl font-bold text-emerald-600">
                {calculations.treesEquivalent.toLocaleString()}
              </div>
            </div>
            <div className="text-sm text-emerald-700 mt-1 font-medium">Trees Equivalent</div>
            <div className="text-xs text-emerald-600 mt-1">Per year impact</div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Earnings Breakdown</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  🌾
                </div>
                <div>
                  <div className="font-medium">Stubble Sale</div>
                  <div className="text-sm text-gray-500">{calculations.stubbleTons} tons @ ₹550/ton</div>
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900">₹{calculations.stubbleEarnings.toLocaleString()}</div>
            </div>

            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  🌱
                </div>
                <div>
                  <div className="font-medium">Carbon Credits</div>
                  <div className="text-sm text-gray-500">{Math.floor(calculations.co2Prevented / 2.9)} tons @ ₹400/ton</div>
                </div>
              </div>
              <div className="text-lg font-bold text-green-600">₹{calculations.carbonEarnings.toLocaleString()}</div>
            </div>

            <div className="flex justify-between items-center p-3 bg-kc-green/10 rounded-lg border-2 border-kc-green">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-kc-green flex items-center justify-center text-white">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-kc-green">Total Earnings</div>
                  <div className="text-sm text-green-700">Per season</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-kc-green">₹{calculations.totalEarnings.toLocaleString()}</div>
            </div>
          </div>

          {/* Environmental Impact */}
          <h4 className="font-semibold text-gray-900 mt-6 mb-4">Environmental Impact</h4>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
              <span className="text-2xl">🏭</span>
              <div>
                <div className="text-sm text-gray-500">CO₂ Prevented</div>
                <div className="font-bold">{calculations.co2Prevented} tons</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
              <span className="text-2xl">🚗</span>
              <div>
                <div className="text-sm text-gray-500">Car Km Equivalent</div>
                <div className="font-bold">{Math.floor(calculations.co2Prevented * 500).toLocaleString()} km</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
              <span className="text-2xl">💡</span>
              <div>
                <div className="text-sm text-gray-500">Light Bulb Years</div>
                <div className="font-bold">{Math.floor(calculations.co2Prevented * 200)} years</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactCalculator;
