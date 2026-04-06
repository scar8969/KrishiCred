/**
 * PSEUDO DATABASE FOR KRISHICRED
 * Complete mock data for development and demo purposes
 */

// ============================================================
// PUNJAB DISTRICTS DATA
// ============================================================
export const districts = [
  { id: 'DIST001', name: 'Ludhiana', namePa: 'ਲੁਧਿਆਣਾ', lat: 30.9010, lng: 75.8573, farms: 125000, fires_today: 47 },
  { id: 'DIST002', name: 'Sangrur', namePa: 'ਸੰਗਰੂਰ', lat: 30.2473, lng: 75.8474, farms: 98000, fires_today: 35 },
  { id: 'DIST003', name: 'Bathinda', namePa: 'ਬਠਿੰਡਾ', lat: 30.2038, lng: 74.9479, farms: 87000, fires_today: 28 },
  { id: 'DIST004', name: 'Patiala', namePa: 'ਪਟਿਆਲਾ', lat: 30.3398, lng: 76.3869, farms: 92000, fires_today: 31 },
  { id: 'DIST005', name: 'Firozpur', namePa: 'ਫਿਰੋਜ਼ਪੁਰ', lat: 30.9163, lng: 74.6038, farms: 76000, fires_today: 22 },
  { id: 'DIST006', name: 'Jalandhar', namePa: 'ਜਲੰਧਰ', lat: 31.3260, lng: 75.5762, farms: 81000, fires_today: 19 },
  { id: 'DIST007', name: 'Amritsar', namePa: 'ਅੰਮ੍ਰਿਤਸਰ', lat: 31.6340, lng: 74.8723, farms: 95000, fires_today: 25 },
  { id: 'DIST008', name: 'Kapurthala', namePa: 'ਕਪੂਰਥਲਾ', lat: 31.3776, lng: 75.3855, farms: 52000, fires_today: 12 },
  { id: 'DIST009', name: 'Gurdaspur', namePa: 'ਗੁਰਦਾਸਪੁਰ', lat: 32.0375, lng: 75.3995, farms: 78000, fires_today: 18 },
  { id: 'DIST010', name: 'Barnala', namePa: 'ਬਰਨਾਲਾ', lat: 30.3763, lng: 75.5422, farms: 41000, fires_today: 15 },
  { id: 'DIST011', name: 'Mansa', namePa: 'ਮਾਨਸਾ', lat: 29.9875, lng: 75.3875, farms: 48000, fires_today: 21 },
  { id: 'DIST012', name: 'Moga', namePa: 'ਮੋਗਾ', lat: 30.8167, lng: 75.1655, farms: 55000, fires_today: 16 },
  { id: 'DIST013', name: 'Fazilka', namePa: 'ਫਾਜ਼ਿਲਕਾ', lat: 30.4048, lng: 74.0299, farms: 38000, fires_today: 11 },
  { id: 'DIST014', name: 'Faridkot', namePa: 'ਫਰੀਦਕੋਟ', lat: 30.6749, lng: 74.7551, farms: 44000, fires_today: 13 },
  { id: 'DIST015', name: 'Muktsar', namePa: 'ਮੁਕਤਸਰ', lat: 30.2876, lng: 74.5058, farms: 46000, fires_today: 14 },
  { id: 'DIST016', name: 'Rupnagar', namePa: 'ਰੂਪਨਗਰ', lat: 30.9658, lng: 76.5254, farms: 42000, fires_today: 9 },
  { id: 'DIST017', name: 'Nawanshahr', namePa: 'ਨਵਾਂਸ਼ਹਰ', lat: 31.1226, lng: 76.0835, farms: 35000, fires_today: 7 },
  { id: 'DIST018', name: 'Hoshiarpur', namePa: 'ਹੁਸ਼ਿਆਰਪੁਰ', lat: 31.5295, lng: 75.9082, farms: 58000, fires_today: 11 },
  { id: 'DIST019', name: 'Pathankot', namePa: 'ਪਠਾਨਕੋਟ', lat: 32.2655, lng: 75.6499, farms: 28000, fires_today: 5 },
  { id: 'DIST020', name: 'Mohali', namePa: 'ਮੋਹਾਲੀ', lat: 30.7046, lng: 76.7179, farms: 32000, fires_today: 8 },
  { id: 'DIST021', name: 'Tarn Taran', namePa: 'ਤਰਨ ਤਾਰਨ', lat: 31.4522, lng: 74.9239, farms: 54000, fires_today: 17 },
  { id: 'DIST022', name: 'Kapurthala', namePa: 'ਸ਼ਹੀਦ ਭਗਤ ਸਿੰਘ', lat: 31.1438, lng: 75.3501, farms: 36000, fires_today: 6 },
  { id: 'DIST023', name: 'Fatehgarh Sahib', namePa: 'ਫਤਿਹਗੜ੍ਹ ਸਾਹਿਬ', lat: 30.6487, lng: 76.3778, farms: 39000, fires_today: 10 },
];

// ============================================================
// VILLAGES (Sample for each district)
// ============================================================
const villageNames = [
  'Rampura', 'Nangal', 'Kalasingh', 'Dharampura', 'Ghadhali', 'Bhaini', 'Mehla',
  'Haripur', 'Pajjian', 'Kular', 'Bhalwan', 'Rureke', 'Thande', 'Nyre',
  'Mau', 'Saidoke', 'Machhiwara', 'Samrala', 'Khanna', 'Doraha'
];

export const generateVillages = (districtId) => {
  return villageNames.slice(0, 8 + Math.floor(Math.random() * 7)).map((name, i) => ({
    id: `VILL${districtId}${i + 1}`,
    districtId,
    name,
    namePa: name,
    farms: 150 + Math.floor(Math.random() * 500),
    enrolledFarmers: Math.floor((150 + Math.floor(Math.random() * 500)) * (0.3 + Math.random() * 0.4))
  }));
};

// ============================================================
// FARMERS
// ============================================================
const farmerNames = [
  { first: 'Rajesh', last: 'Kumar', firstPa: 'ਰਾਜੇਸ਼', lastPa: 'ਕੁਮਾਰ' },
  { first: 'Gurpreet', last: 'Singh', firstPa: 'ਗੁਰਪ੍ਰੀਤ', lastPa: 'ਸਿੰਘ' },
  { first: 'Harinder', last: 'Singh', firstPa: 'ਹਰਿੰਦਰ', lastPa: 'ਸਿੰਘ' },
  { first: 'Mohan', last: 'Singh', firstPa: 'ਮੋਹਨ', lastPa: 'ਸਿੰਘ' },
  { first: 'Jaswant', last: 'Kaur', firstPa: 'ਜਸਵੰਤ', lastPa: 'ਕੌਰ' },
  { first: 'Balwinder', last: 'Kaur', firstPa: 'ਬਲਵਿੰਦਰ', lastPa: 'ਕੌਰ' },
  { first: 'Amritpal', last: 'Singh', firstPa: 'ਅਮ੍ਰਿਤਪਾਲ', lastPa: 'ਸਿੰਘ' },
  { first: 'Paramjit', last: 'Kaur', firstPa: 'ਪਰਮਜੀਤ', lastPa: 'ਕੌਰ' },
  { first: 'Sukhdev', last: 'Singh', firstPa: 'ਸੁਖਦੇਵ', lastPa: 'ਸਿੰਘ' },
  { first: 'Kulwinder', last: 'Kaur', firstPa: 'ਕੁਲਵਿੰਦਰ', lastPa: 'ਕੌਰ' },
  { first: 'Davinder', last: 'Singh', firstPa: 'ਦਵਿੰਦਰ', lastPa: 'ਸਿੰਘ' },
  { first: 'Manpreet', last: 'Kaur', firstPa: 'ਮਨਪ੍ਰੀਤ', lastPa: 'ਕੌਰ' },
];

export const generateFarmers = (count = 100) => {
  return Array.from({ length: count }, (_, i) => {
    const name = farmerNames[Math.floor(Math.random() * farmerNames.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];
    return {
      id: `FARM${String(i + 1).padStart(5, '0')}`,
      name: `${name.first} ${name.last}`,
      namePa: `${name.firstPa} ${name.lastPa}`,
      phone: `+91${98 + Math.floor(Math.random() * 2)}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      districtId: district.id,
      district: district.name,
      village: villageNames[Math.floor(Math.random() * villageNames.length)],
      landArea: 2 + Math.floor(Math.random() * 18), // 2-20 acres
      language: Math.random() > 0.7 ? 'pa' : 'hi',
      enrolled: Math.random() > 0.4,
      khasraNumber: `KHS-${Math.floor(Math.random() * 10000)}`,
      totalEarned: Math.random() > 0.4 ? Math.floor(Math.random() * 50000) : 0,
      carbonCredits: Math.random() > 0.4 ? Math.floor(Math.random() * 200) : 0,
      stubbleSold: Math.random() > 0.4 ? Math.floor(Math.random() * 100) : 0,
      joinedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      location: {
        lat: district.lat + (Math.random() - 0.5) * 0.5,
        lng: district.lng + (Math.random() - 0.5) * 0.5,
      }
    };
  });
};

// ============================================================
// FARMS
// ============================================================
export const generateFarms = (farmerId, districtId) => {
  const numFarms = 1 + Math.floor(Math.random() * 3);
  return Array.from({ length: numFarms }, (_, i) => ({
    id: `FRM${farmerId}-${i + 1}`,
    farmerId,
    districtId,
    khasraNumber: `KHS-${Math.floor(Math.random() * 10000)}-${i + 1}`,
    area: 1 + Math.floor(Math.random() * 10),
    currentCrop: Math.random() > 0.5 ? 'rice' : 'wheat',
    stubbleReady: Math.random() > 0.6,
    stubbleTons: Math.floor((1 + Math.floor(Math.random() * 10)) * 4),
    expectedHarvest: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

// ============================================================
// BIOMASS/ BIOGAS PLANTS
// ============================================================
export const biogasPlants = [
  {
    id: 'PLANT001',
    name: 'Satnam BioEnergy',
    operator: 'Satnam Renewable Pvt Ltd',
    districtId: 'DIST001',
    district: 'Ludhiana',
    location: { lat: 30.9010, lng: 75.8573 },
    address: 'Industrial Area B, Ludhiana',
    capacity: { daily: 100, unit: 'tons', currentUtilization: 65 },
    storage: { capacity: 500, current: 325, unit: 'tons' },
    pricePerTon: 550,
    status: 'active',
    contact: '+919876543210',
    certifications: ['ISO 14001', 'CDM Registered'],
    digesters: 3,
    powerGeneration: '1 MW',
    operatingHours: { start: '06:00', end: '22:00' },
  },
  {
    id: 'PLANT002',
    name: 'Punjab Green Energy',
    operator: 'AgriVidyut Ltd',
    districtId: 'DIST002',
    district: 'Sangrur',
    location: { lat: 30.2473, lng: 75.8474 },
    address: 'NH 7, Barnala Road, Sangrur',
    capacity: { daily: 80, unit: 'tons', currentUtilization: 45 },
    storage: { capacity: 400, current: 180, unit: 'tons' },
    pricePerTon: 520,
    status: 'active',
    contact: '+919876543211',
    certifications: ['ISO 50001'],
    digesters: 2,
    powerGeneration: '0.8 MW',
    operatingHours: { start: '07:00', end: '21:00' },
  },
  {
    id: 'PLANT003',
    name: 'Bathinda BioGas',
    operator: 'EcoEnergy Punjab',
    districtId: 'DIST003',
    district: 'Bathinda',
    location: { lat: 30.2038, lng: 74.9479 },
    address: 'Focal Point, Bathinda',
    capacity: { daily: 60, unit: 'tons', currentUtilization: 70 },
    storage: { capacity: 300, current: 210, unit: 'tons' },
    pricePerTon: 500,
    status: 'active',
    contact: '+919876543212',
    certifications: ['ISO 14001'],
    digesters: 2,
    powerGeneration: '0.6 MW',
    operatingHours: { start: '06:00', end: '22:00' },
  },
  {
    id: 'PLANT004',
    name: 'Patiala Green Fuels',
    operator: 'Sustainergy Solutions',
    districtId: 'DIST004',
    district: 'Patiala',
    location: { lat: 30.3398, lng: 76.3869 },
    address: 'Rajpura Road, Patiala',
    capacity: { daily: 50, unit: 'tons', currentUtilization: 55 },
    storage: { capacity: 250, current: 137, unit: 'tons' },
    pricePerTon: 540,
    status: 'active',
    contact: '+919876543213',
    certifications: ['ISO 14001', 'CDM Registered'],
    digesters: 2,
    powerGeneration: '0.5 MW',
    operatingHours: { start: '06:30', end: '21:30' },
  },
  {
    id: 'PLANT005',
    name: 'Amritsar BioEnergy',
    operator: 'GreenPath Energy',
    districtId: 'DIST007',
    district: 'Amritsar',
    location: { lat: 31.6340, lng: 74.8723 },
    address: 'GT Road, Amritsar',
    capacity: { daily: 70, unit: 'tons', currentUtilization: 40 },
    storage: { capacity: 350, current: 140, unit: 'tons' },
    pricePerTon: 560,
    status: 'active',
    contact: '+919876543214',
    certifications: ['ISO 14001'],
    digesters: 2,
    powerGeneration: '0.7 MW',
    operatingHours: { start: '07:00', end: '20:00' },
  },
  {
    id: 'PLANT006',
    name: 'Jalandhar Clean Energy',
    operator: 'BioWatt Systems',
    districtId: 'DIST006',
    district: 'Jalandhar',
    location: { lat: 31.3260, lng: 75.5762 },
    address: 'Industrial Estate, Jalandhar',
    capacity: { daily: 45, unit: 'tons', currentUtilization: 60 },
    storage: { capacity: 225, current: 135, unit: 'tons' },
    pricePerTon: 530,
    status: 'active',
    contact: '+919876543215',
    certifications: ['ISO 50001'],
    digesters: 1,
    powerGeneration: '0.45 MW',
    operatingHours: { start: '06:00', end: '22:00' },
  },
];

// ============================================================
// FIRE INCIDENTS
// ============================================================
export const generateFireIncidents = (count = 50) => {
  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['active', 'responding', 'contained', 'resolved'];

  return Array.from({ length: count }, (_, i) => {
    const district = districts[Math.floor(Math.random() * districts.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const area = 0.5 + Math.random() * 5;
    const lat = district.lat + (Math.random() - 0.5) * 0.3;
    const lng = district.lng + (Math.random() - 0.5) * 0.3;

    return {
      id: `FIRE${new Date().getFullYear()}${String(i + 1).padStart(4, '0')}`,
      districtId: district.id,
      district: district.name,
      location: { lat, lng },
      severity,
      status,
      estimatedArea: parseFloat(area.toFixed(2)),
      confidence: 70 + Math.floor(Math.random() * 30),
      detectedAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
      reportedBy: Math.random() > 0.5 ? 'satellite' : 'farmer',
      nearbyFarms: Math.floor(Math.random() * 10),
      responseTeamAssigned: status !== 'active',
      estimatedContainment: status === 'active' ? new Date(Date.now() + Math.random() * 6 * 60 * 60 * 1000).toISOString() : null,
      containedAt: status === 'resolved' || status === 'contained' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
    };
  });
};

// ============================================================
// STUBBLE LISTINGS
// ============================================================
export const generateStubbleListings = (count = 30) => {
  const crops = ['wheat', 'rice', 'maize'];
  const statuses = ['available', 'matched', 'collected', 'expired'];

  return Array.from({ length: count }, (_, i) => {
    const district = districts[Math.floor(Math.random() * districts.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const crop = crops[Math.floor(Math.random() * crops.length)];
    const quantity = 2 + Math.floor(Math.random() * 15);

    return {
      id: `LIST${String(i + 1).padStart(5, '0')}`,
      farmerId: `FARM${String(Math.floor(Math.random() * 100) + 1).padStart(5, '0')}`,
      farmerName: farmerNames[Math.floor(Math.random() * farmerNames.length)].first,
      districtId: district.id,
      district: district.name,
      cropType: crop,
      quantity,
      quantityUnit: 'tons',
      pricePerTon: 450 + Math.floor(Math.random() * 150),
      availabilityDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status,
      moistureContent: 12 + Math.floor(Math.random() * 10),
      location: {
        lat: district.lat + (Math.random() - 0.5) * 0.2,
        lng: district.lng + (Math.random() - 0.5) * 0.2,
      },
      transportAvailable: Math.random() > 0.6,
      negotiable: Math.random() > 0.5,
    };
  });
};

// ============================================================
// CARBON CREDITS
// ============================================================
export const generateCarbonCredits = (count = 25) => {
  const statuses = ['pending', 'verified', 'approved', 'retired'];
  const buyers = ['CarbonCorp India', 'ESG Global Ltd', 'GreenTech Ventures', 'Sustainable Future Fund', 'Clean Energy Partners'];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const stubbleTons = 2 + Math.floor(Math.random() * 20);
    const credits = parseFloat((stubbleTons * 0.6).toFixed(2)); // ~0.6 credits per ton
    const pricePerCredit = 380 + Math.floor(Math.random() * 100);

    return {
      id: `CRDT${String(i + 1).padStart(5, '0')}`,
      batchId: `BATCH${Math.floor(new Date().getFullYear() / 100)}${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`,
      farmerId: `FARM${String(Math.floor(Math.random() * 100) + 1).padStart(5, '0')}`,
      stubbleTons,
      baselineEmissions: parseFloat((stubbleTons * 2.5).toFixed(2)),
      projectEmissions: parseFloat((stubbleTons * 0.1).toFixed(2)),
      netReductions: parseFloat((stubbleTons * 2.4).toFixed(2)),
      buffer: parseFloat((stubbleTons * 2.4 * 0.2).toFixed(2)),
      netCredits: credits,
      verificationMethod: 'satellite',
      verificationStatus: status,
      verifiedAt: status !== 'pending' ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : null,
      verifiedBy: status !== 'pending' ? 'KrishiCred Validator v1.0' : null,
      buyerId: status === 'retired' ? buyers[Math.floor(Math.random() * buyers.length)] : null,
      salePrice: status === 'retired' ? Math.floor(credits * pricePerCredit) : null,
      saleDate: status === 'retired' ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() : null,
      pricePerCredit: status === 'retired' ? pricePerCredit : null,
      certificateUrl: status === 'verified' || status === 'approved' || status === 'retired' ? `https://certs.krishicred.com/${i + 1}` : null,
    };
  });
};

// ============================================================
// COLLECTION ROUTES
// ============================================================
export const generateRoutes = (plantId, date) => {
  const route = {
    id: `ROUTE${Date.now()}${Math.floor(Math.random() * 1000)}`,
    plantId,
    date: date || new Date().toISOString().split('T')[0],
    vehicle: {
      id: `VEH${Math.floor(Math.random() * 20) + 1}`,
      type: 'tractor_trolley',
      registration: `PB${Math.floor(Math.random() * 100)}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      driver: `Driver ${Math.floor(Math.random() * 10) + 1}`,
      capacity: 10,
      capacityUnit: 'tons',
    },
    status: ['scheduled', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
    stops: [],
    totalQuantity: 0,
    totalDistance: 0,
    estimatedDuration: '',
  };

  // Generate 3-6 stops
  const numStops = 3 + Math.floor(Math.random() * 4);
  const district = districts.find(d => d.id === biogasPlants.find(p => p.id === plantId)?.districtId);

  for (let i = 0; i < numStops; i++) {
    const farmer = farmerNames[Math.floor(Math.random() * farmerNames.length)];
    const quantity = 2 + Math.floor(Math.random() * 6);
    const lat = district?.lat + (Math.random() - 0.5) * 0.15 || 30.9;
    const lng = district?.lng + (Math.random() - 0.5) * 0.15 || 75.85;

    route.stops.push({
      sequence: i + 1,
      farmerId: `FARM${String(Math.floor(Math.random() * 100) + 1).padStart(5, '0')}`,
      farmerName: `${farmer.first} ${farmer.last}`,
      phone: `+91${98 + Math.floor(Math.random() * 2)}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      village: villageNames[Math.floor(Math.random() * villageNames.length)],
      location: { lat, lng },
      quantity,
      estimatedArrival: `${8 + i * 1.5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      estimatedDeparture: `${8 + i * 1.5 + 0.5}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      status: ['pending', 'completed', 'skipped'][Math.floor(Math.random() * 3)],
    });
    route.totalQuantity += quantity;
  }

  route.totalDistance = parseFloat((10 + Math.random() * 30).toFixed(1));
  route.estimatedDuration = `${2 + Math.floor(route.stops.length * 0.5)}h ${route.stops.length * 20}m`;

  return route;
};

// ============================================================
// DASHBOARD STATS
// ============================================================
export const getDashboardStats = (period = 'today') => {
  const multipliers = { today: 1, week: 7, month: 30, season: 90 };

  return {
    period,
    fires: {
      total: Math.floor(23 * multipliers[period]),
      active: Math.floor(5 * multipliers[period]),
      resolved: Math.floor(18 * multipliers[period]),
      changePercentage: -15,
    },
    farmers: {
      total: 15234,
      new: Math.floor(234 * multipliers[period]),
      active: 12456,
      changePercentage: 5.2,
    },
    stubble: {
      collected: Math.floor(456 * multipliers[period]),
      unit: 'tons',
      changePercentage: 22,
      preventedBurning: Math.floor(456 * multipliers[period]),
    },
    carbonCredits: {
      issued: Math.floor(228 * multipliers[period]),
      unit: 'tCO2e',
      sold: Math.floor(120 * multipliers[period]),
      revenue: Math.floor(1800000 * multipliers[period]),
      currency: 'INR',
    },
    plants: {
      total: 6,
      active: 6,
      operationalCapacity: 62,
      capacityUnit: 'percentage',
    },
  };
};

// ============================================================
// FIRE TREND DATA (for charts)
// ============================================================
export const getFireTrendData = (days = 30) => {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate seasonal pattern with random variation
    const base = Math.sin((i / days) * Math.PI * 2) * 20 + 30;
    const random = Math.random() * 30 - 15;
    const fires = Math.max(0, Math.floor(base + random));

    data.push({
      date: date.toISOString().split('T')[0],
      fires,
      resolved: Math.floor(fires * (0.6 + Math.random() * 0.3)),
      active: Math.floor(fires * (0.2 + Math.random() * 0.2)),
    });
  }

  return data;
};

// ============================================================
// MARKETPLACE DATA
// ============================================================
export const getMarketplaceListings = () => {
  return generateCarbonCredits(20)
    .filter(c => c.verificationStatus === 'verified' || c.verificationStatus === 'approved')
    .map(credit => ({
      id: `MLST${credit.id.slice(4)}`,
      sellerId: credit.farmerId,
      sellerName: farmerNames[Math.floor(Math.random() * farmerNames.length)].first,
      type: 'carbon_credit',
      title: `Verified Carbon Credits - Stubble Diversion`,
      description: 'High quality carbon credits from agricultural stubble diversion in Punjab',
      quantity: credit.netCredits,
      quantityUnit: 'tCO2e',
      pricePerUnit: 380 + Math.floor(Math.random() * 80),
      currency: 'INR',
      minimumPurchase: 1,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: ['verified', 'punjab', 'agricultural', 'premium'],
      verified: true,
      verificationStatus: credit.verificationStatus,
      certificateUrl: credit.certificateUrl,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      image: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400&h=300&fit=crop',
    }));
};

// ============================================================
// WEATHER DATA
// ============================================================
export const getWeatherData = (districtId) => {
  const district = districts.find(d => d.id === districtId) || districts[0];

  return {
    districtId: district.id,
    district: district.name,
    timestamp: new Date().toISOString(),
    temperature: 28 + Math.floor(Math.random() * 10),
    humidity: 35 + Math.floor(Math.random() * 30),
    windSpeed: 5 + Math.floor(Math.random() * 15),
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    fireRisk: ['low', 'moderate', 'high', 'very high'][Math.floor(Math.random() * 4)],
    visibility: 2 + Math.random() * 8,
    aqi: 150 + Math.floor(Math.random() * 200),
  };
};

// ============================================================
// WHATSAPP CONVERSATION TEMPLATES
// ============================================================
export const whatsappConversationTemplates = {
  registration: [
    { role: 'bot', text: '🙏 ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! Welcome to KrishiCred!', delay: 0 },
    { role: 'bot', text: 'I help you earn money from your paddy stubble instead of burning it.', delay: 1000 },
    { role: 'bot', text: 'Let\'s get you started. Please select your language:', delay: 2000 },
    { role: 'bot', text: '1. ਪੰਜਾਬੀ (Punjabi)\n2. हिंदी (Hindi)\n3. English', delay: 2500 },
  ],
  punjabi: [
    { role: 'user', text: '1', delay: 500 },
    { role: 'bot', text: 'ਵਧਾਈ! ਹੁਣ ਆਪਣਾ ਖੇਤ ਨੰਬਰ (Khasra) ਦੱਸੋ।', delay: 1000 },
  ],
  stubbleReady: [
    { role: 'bot', text: '🌾 Your stubble is ready to sell!', delay: 0 },
    { role: 'bot', text: '**Current Offers:**', delay: 1000 },
    { role: 'bot', text: '🏭 Satnam BioEnergy: ₹2,200/acre\n🏭 Punjab Green Energy: ₹2,150/acre', delay: 1500 },
    { role: 'bot', text: '**Plus Carbon Credits: ₹800/acre**', delay: 2000 },
    { role: 'bot', text: 'Total earnings: ₹3,000/acre', delay: 2500 },
    { role: 'bot', text: 'Tap to confirm pickup 👇', delay: 3000, action: 'confirm' },
  ],
  fireAlert: [
    { role: 'bot', text: '🔥 *FIRE ALERT*', delay: 0 },
    { role: 'bot', text: 'Fire detected 2km from your farm!', delay: 500 },
    { role: 'bot', text: 'Please do not burn. Your pickup is confirmed for tomorrow.', delay: 1000 },
    { role: 'bot', text: 'Need help? Call: +91 98765 43210', delay: 1500 },
  ],
  payment: [
    { role: 'bot', text: '✅ Payment Received!', delay: 0 },
    { role: 'bot', text: 'Amount: ₹11,000 (5 acres × ₹2,200)', delay: 500 },
    { role: 'bot', text: 'Sent to: +91 98XXX XXXX0', delay: 1000 },
    { role: 'bot', text: 'Carbon credits (₹4,000) will be processed in 30 days.', delay: 1500 },
    { role: 'bot', text: 'Thank you for not burning! 🌱', delay: 2000 },
  ],
};

// ============================================================
// EXPORT COMPLETE DATABASE INSTANCE
// ============================================================
export const pseudoDatabase = {
  districts,
  farmers: generateFarmers(150),
  biogasPlants,
  fireIncidents: generateFireIncidents(75),
  stubbleListings: generateStubbleListings(40),
  carbonCredits: generateCarbonCredits(35),
  marketplaceListings: getMarketplaceListings(),

  // Query methods
  getDashboardStats,
  getFireTrendData,
  getWeatherData,
  whatsappConversationTemplates,

  // Helper methods
  getDistricts: () => districts,
  getDistrict: (id) => districts.find(d => d.id === id),
  getFarmers: (districtId) => generateFarmers(50).filter(f => !districtId || f.districtId === districtId),
  getFarmer: (id) => generateFarmers(1).find(f => f.id === id),
  getPlants: () => biogasPlants,
  getPlant: (id) => biogasPlants.find(p => p.id === id),
  getFires: (districtId) => generateFireIncidents(50).filter(f => !districtId || f.districtId === districtId),
  getListings: (districtId) => generateStubbleListings(30).filter(l => !districtId || l.districtId === districtId),
  getMatches: (farmerId) => {
    return biogasPlants.map(plant => ({
      plant,
      distance: Math.random() * 20 + 2,
      matchScore: 70 + Math.floor(Math.random() * 30),
      estimatedEarnings: Math.floor((2 + Math.random() * 8) * (plant.pricePerTon + 800)),
    })).sort((a, b) => b.matchScore - a.matchScore);
  },
  generateRoutes,
};

export default pseudoDatabase;
