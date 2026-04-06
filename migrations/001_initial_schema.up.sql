-- ============================================================================
-- KrishiCred Database Schema - PostgreSQL + PostGIS
-- ============================================================================
-- Platform: Agricultural Carbon Credit Management System for Punjab, India
-- Features: Geospatial queries, Time-series satellite data, Carbon credits
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "postgis-topology";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- User roles for the admin dashboard
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'district_admin',
    'village_admin',
    'plant_manager',
    'baler_operator',
    'field_officer',
    'viewer'
);

-- User status
CREATE TYPE user_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending'
);

-- Verification status for farmers and farms
CREATE TYPE verification_status AS ENUM (
    'pending',
    'verified',
    'rejected',
    'needs_review'
);

-- Farm status
CREATE TYPE farm_status AS ENUM (
    'active',
    'inactive',
    'archived'
);

-- Crop types commonly grown in Punjab
CREATE TYPE crop_type AS ENUM (
    'wheat',
    'rice',
    'cotton',
    'maize',
    'sugarcane',
    'vegetables',
    'other'
);

-- Season types
CREATE TYPE season_type AS ENUM (
    'kharif',
    'rabi',
    'zaid'
);

-- Biogas plant status
CREATE TYPE plant_status AS ENUM (
    'operational',
    'maintenance',
    'under_construction',
    'inactive'
);

-- Baler status
CREATE TYPE baler_status AS ENUM (
    'available',
    'in_use',
    'maintenance',
    'inactive'
);

-- Satellite fire confidence levels
CREATE TYPE fire_confidence AS ENUM (
    'low',
    'nominal',
    'high'
);

-- Satellite data sources
CREATE TYPE satellite_source AS ENUM (
    'modis_terra',
    'modis_aqua',
    'viirs_snpp',
    'viirs_noaa20',
    'sentinel_3a',
    'sentinel_3b'
);

-- Carbon credit status
CREATE TYPE credit_status AS ENUM (
    'pending',
    'verified',
    'approved',
    'retired',
    'rejected'
);

-- Transaction types
CREATE TYPE transaction_type AS ENUM (
    'stubble_sale',
    'credit_issuance',
    'credit_transfer',
    'credit_retirement',
    'payment',
    'refund'
);

-- Transaction status
CREATE TYPE transaction_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'cancelled',
    'reversed'
);

-- Route status
CREATE TYPE route_status AS ENUM (
    'planned',
    'active',
    'completed',
    'cancelled'
);

-- ============================================================================
-- LOCATION HIERARCHY TABLES
-- ============================================================================

-- Districts of Punjab (with administrative boundaries)
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(100) NOT NULL,
    name_pa VARCHAR(100),  -- Punjabi name
    district_code VARCHAR(10) UNIQUE NOT NULL,
    state_code VARCHAR(10) DEFAULT 'PB',
    boundary GEOGRAPHY(POLYGON, 4326),  -- WGS84 coordinate system
    population INTEGER,
    area_hectares NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Villages/Localities (lowest administrative unit)
CREATE TABLE villages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    name_en VARCHAR(150) NOT NULL,
    name_pa VARCHAR(150),  -- Punjabi name
    village_code VARCHAR(20) UNIQUE NOT NULL,
    tehsil_en VARCHAR(100),
    tehsil_pa VARCHAR(100),
    boundary GEOGRAPHY(POLYGON, 4326),
    centroid GEOGRAPHY(POINT, 4326),
    population INTEGER,
    num_farmers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- Users for admin dashboard and operations
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    status user_status NOT NULL DEFAULT 'pending',
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    village_id UUID REFERENCES villages(id) ON DELETE SET NULL,
    plant_id UUID,  -- Will reference biogas_plants when created
    full_name_en VARCHAR(150),
    full_name_pa VARCHAR(150),
    profile_image_url VARCHAR(500),
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for security audit
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    location GEOGRAPHY(POINT, 4326),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FARMER AND FARM TABLES
-- ============================================================================

-- Farmers (primary stakeholders)
CREATE TABLE farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    village_id UUID NOT NULL REFERENCES villages(id) ON DELETE RESTRICT,
    farmer_id VARCHAR(20) UNIQUE NOT NULL,  -- Unique farmer identifier
    aadhaar_number VARCHAR(12) UNIQUE,  -- India's national ID (encrypted)
    name_en VARCHAR(150) NOT NULL,
    name_pa VARCHAR(150),  -- Punjabi name
    father_name_en VARCHAR(150),
    father_name_pa VARCHAR(150),
    phone VARCHAR(15) NOT NULL,
    alternate_phone VARCHAR(15),
    email VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(20),
    address_en TEXT,
    address_pa TEXT,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    profile_image_url VARCHAR(500),
    aadhaar_document_url VARCHAR(500),
    land_document_url VARCHAR(500),
    total_land_hectares NUMERIC(10, 2) DEFAULT 0,
    bank_account_number VARCHAR(30),
    bank_ifsc VARCHAR(15),
    bank_name VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farms (individual land holdings)
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    village_id UUID NOT NULL REFERENCES villages(id) ON DELETE RESTRICT,
    farm_id VARCHAR(30) UNIQUE NOT NULL,
    khasra_number VARCHAR(50),  -- Land record number
    khatauni_number VARCHAR(50),
    area_hectares NUMERIC(10, 2) NOT NULL,
    boundary GEOGRAPHY(POLYGON, 4326) NOT NULL,  -- Farm boundary for spatial queries
    centroid GEOGRAPHY(POINT, 4326),  -- Computed centroid
    soil_type VARCHAR(50),
    irrigation_type VARCHAR(50),
    status farm_status NOT NULL DEFAULT 'active',
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT farms_area_positive CHECK (area_hectares > 0)
);

-- Farm seasons (crop cycles)
CREATE TABLE farm_seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    season season_type NOT NULL,
    year INTEGER NOT NULL,
    crop_type crop_type NOT NULL,
    sowing_date DATE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    stubble_estimated_tonnes NUMERIC(10, 2),
    stubble_collected_tonnes NUMERIC(10, 2),
    stubble_remaining_tonnes NUMERIC(10, 2),
    stubble_burned BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT farm_seasons_unique UNIQUE (farm_id, season, year)
);

-- ============================================================================
-- INFRASTRUCTURE TABLES
-- ============================================================================

-- Biogas Plants (stubble collection and processing)
CREATE TABLE biogas_plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    village_id UUID REFERENCES villages(id) ON DELETE SET NULL,
    plant_code VARCHAR(20) UNIQUE NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    name_pa VARCHAR(200),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    boundary GEOGRAPHY(POLYGON, 4326),
    capacity_tonnes_per_day NUMERIC(10, 2),
    current_storage_tonnes NUMERIC(10, 2) DEFAULT 0,
    max_storage_tonnes NUMERIC(10, 2),
    status plant_status NOT NULL DEFAULT 'operational',
    operator_name VARCHAR(200),
    contact_phone VARCHAR(15),
    contact_email VARCHAR(255),
    commissioning_date DATE,
    biogas_output_capacity_m3_per_day NUMERIC(10, 2),
    electricity_generation_capacity_kw NUMERIC(10, 2),
    fertilizer_output_tonnes_per_year NUMERIC(10, 2),
    manager_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Balers (machinery for stubble collection)
CREATE TABLE balers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID REFERENCES biogas_plants(id) ON DELETE SET NULL,
    baler_code VARCHAR(20) UNIQUE NOT NULL,
    baler_type VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    registration_number VARCHAR(20),
    capacity_bales_per_hour NUMERIC(8, 2),
    bale_weight_kg NUMERIC(8, 2),
    status baler_status NOT NULL DEFAULT 'available',
    current_location GEOGRAPHY(POINT, 4326),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    purchase_date DATE,
    operator_name VARCHAR(150),
    operator_phone VARCHAR(15),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routes for baler operations
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baler_id UUID NOT NULL REFERENCES balers(id) ON DELETE RESTRICT,
    plant_id UUID NOT NULL REFERENCES biogas_plants(id) ON DELETE RESTRICT,
    route_code VARCHAR(20) UNIQUE NOT NULL,
    name_en VARCHAR(200),
    name_pa VARCHAR(200),
    route_path GEOGRAPHY(LINESTRING, 4326),  -- Planned route
    actual_path GEOGRAPHY(LINESTRING, 4326),  -- Actual path taken
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    status route_status NOT NULL DEFAULT 'planned',
    total_distance_km NUMERIC(10, 2),
    estimated_collection_tonnes NUMERIC(10, 2),
    actual_collection_tonnes NUMERIC(10, 2),
    farm_ids UUID[],  -- Array of farm IDs to visit
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SATELLITE FIRE DETECTION (PARTITIONED TIME-SERIES DATA)
-- ============================================================================

-- Parent table for satellite fire detections
CREATE TABLE satellite_fire_events (
    id BIGSERIAL PRIMARY KEY,
    event_uuid UUID NOT NULL DEFAULT uuid_generate_v4(),
    source satellite_source NOT NULL,
    detection_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    confidence fire_confidence NOT NULL,
    brightness NUMERIC(8, 2),
    brightness_t31 NUMERIC(8, 2),
    frp NUMERIC(10, 2),  -- Fire Radiative Power
    scan NUMERIC(10, 2),
    track NUMERIC(10, 2),
    satellite VARCHAR(50),
    instrument VARCHAR(50),
    pixel_size_km NUMERIC(6, 2),
    affected_farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    is_confirmed_farm_fire BOOLEAN DEFAULT FALSE,
    verification_status verification_status DEFAULT 'pending',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (detection_time);

-- Create partitions for satellite data (one per year for now)
-- More granular partitions (monthly) can be added for better performance
CREATE TABLE satellite_fire_events_2024 PARTITION OF satellite_fire_events
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE satellite_fire_events_2025 PARTITION OF satellite_fire_events
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE satellite_fire_events_2026 PARTITION OF satellite_fire_events
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE satellite_fire_events_2027 PARTITION OF satellite_fire_events
    FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');

-- ============================================================================
-- CARBON CREDIT MANAGEMENT
-- ============================================================================

-- Carbon credit ledger
CREATE TABLE carbon_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_code VARCHAR(30) UNIQUE NOT NULL,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE RESTRICT,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
    season_id UUID NOT NULL REFERENCES farm_seasons(id) ON DELETE RESTRICT,
    stubble_collected_tonnes NUMERIC(10, 2) NOT NULL,
    co2_prevented_tonnes NUMERIC(12, 4) NOT NULL,
    credit_amount NUMERIC(12, 4) NOT NULL,  -- Carbon credits generated
    verification_status credit_status NOT NULL DEFAULT 'pending',
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    blockchain_tx_hash VARCHAR(255),  -- For blockchain integration
    blockchain_block_number BIGINT,
    minted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    retired_at TIMESTAMP WITH TIME ZONE,
    project_id VARCHAR(100),  -- Carbon project identifier
    methodology VARCHAR(100),  -- Carbon credit methodology used
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT carbon_credits_positive CHECK (
        stubble_collected_tonnes >= 0 AND
        co2_prevented_tonnes >= 0 AND
        credit_amount >= 0
    )
);

-- Credit transaction history
CREATE TABLE carbon_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_code VARCHAR(30) UNIQUE NOT NULL,
    transaction_type transaction_type NOT NULL,
    transaction_status transaction_status NOT NULL DEFAULT 'pending',
    carbon_credit_id UUID REFERENCES carbon_credits(id) ON DELETE SET NULL,
    from_farmer_id UUID REFERENCES farmers(id) ON DELETE SET NULL,
    to_farmer_id UUID REFERENCES farmers(id) ON DELETE SET NULL,
    amount NUMERIC(12, 4) NOT NULL,
    price_per_credit NUMERIC(12, 4),
    total_value NUMERIC(14, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settled_at TIMESTAMP WITH TIME ZONE,
    blockchain_tx_hash VARCHAR(255),
    blockchain_block_number BIGINT,
    payment_reference VARCHAR(100),
    payment_method VARCHAR(50),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT carbon_transactions_positive CHECK (amount >= 0)
);

-- ============================================================================
-- STUBBLE SALES TRANSACTIONS
-- ============================================================================

CREATE TABLE stubble_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_code VARCHAR(30) UNIQUE NOT NULL,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE RESTRICT,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
    season_id UUID NOT NULL REFERENCES farm_seasons(id) ON DELETE RESTRICT,
    plant_id UUID NOT NULL REFERENCES biogas_plants(id) ON DELETE RESTRICT,
    collection_date DATE NOT NULL,
    quantity_tonnes NUMERIC(10, 2) NOT NULL,
    moisture_content_percent NUMERIC(5, 2),
    price_per_tonne NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_date DATE,
    payment_reference VARCHAR(100),
    transporter_name VARCHAR(200),
    vehicle_number VARCHAR(20),
    bale_count INTEGER,
    collected_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT stubble_sales_positive CHECK (
        quantity_tonnes >= 0 AND
        price_per_tonne >= 0 AND
        total_amount >= 0
    )
);

-- ============================================================================
-- AUDIT TRAIL
-- ============================================================================

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,  -- INSERT, UPDATE, DELETE, etc.
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    metadata JSONB DEFAULT '{}'
) PARTITION BY RANGE (changed_at);

-- Audit log partitions
CREATE TABLE audit_logs_2024 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE audit_logs_2025 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE audit_logs_2026 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE audit_logs_2027 PARTITION OF audit_logs
    FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');

-- ============================================================================
-- MULTI-LANGUAGE SUPPORT TABLES
-- ============================================================================

CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    locale VARCHAR(10) NOT NULL,  -- en, pa, hi, etc.
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    context VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT translations_unique UNIQUE (locale, key)
);

-- ============================================================================
-- NOTIFICATIONS AND ALERTS
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    title_en VARCHAR(255) NOT NULL,
    title_pa VARCHAR(255),
    message_en TEXT NOT NULL,
    message_pa TEXT,
    notification_type VARCHAR(50) NOT NULL,  -- fire_alert, payment, etc.
    priority VARCHAR(20) DEFAULT 'normal',  -- low, normal, high, urgent
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Materialized view for fire statistics by village
CREATE MATERIALIZED VIEW mv_village_fire_stats AS
SELECT
    v.id AS village_id,
    v.name_en AS village_name,
    d.name_en AS district_name,
    COUNT(sfe.id) AS total_fire_events,
    COUNT(sfe.id) FILTER (WHERE sfe.detection_time >= NOW() - INTERVAL '30 days') AS fires_last_30_days,
    COUNT(sfe.id) FILTER (WHERE sfe.affected_farm_id IS NOT NULL) AS confirmed_farm_fires,
    MAX(sfe.detection_time) AS last_fire_date
FROM villages v
JOIN districts d ON v.district_id = d.id
LEFT JOIN satellite_fire_events sfe
    ON ST_Within(sfe.location::geometry, v.boundary::geometry)
GROUP BY v.id, v.name_en, d.name_en
WITH DATA;

-- Materialized view for carbon credit summary by farmer
CREATE MATERIALIZED VIEW mv_farmer_credit_summary AS
SELECT
    f.id AS farmer_id,
    f.farmer_id,
    f.name_en AS farmer_name,
    f.village_id,
    v.name_en AS village_name,
    COUNT(cc.id) AS total_credits,
    SUM(cc.credit_amount) AS total_credit_amount,
    SUM(cc.stubble_collected_tonnes) AS total_stubble_collected,
    SUM(cc.co2_prevented_tonnes) AS total_co2_prevented,
    SUM(cc.credit_amount) FILTER (WHERE cc.verification_status = 'approved') AS approved_credits,
    SUM(cc.credit_amount) FILTER (WHERE cc.verification_status = 'pending') AS pending_credits
FROM farmers f
JOIN villages v ON f.village_id = v.id
LEFT JOIN carbon_credits cc ON f.id = cc.farmer_id
GROUP BY f.id, f.farmer_id, f.name_en, f.village_id, v.name_en
WITH DATA;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate centroid of farm boundary
CREATE OR REPLACE FUNCTION calculate_farm_centroid()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.boundary IS NOT NULL AND ST_IsEmpty(NEW.boundary::geometry) = false THEN
        NEW.centroid := ST_Centroid(NEW.boundary::geometry)::geography;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to find farms near a fire event
CREATE OR REPLACE FUNCTION find_farms_near_fire(
    fire_location GEOGRAPHY,
    radius_km NUMERIC DEFAULT 1
)
RETURNS TABLE (
    farm_id UUID,
    farm_id_code VARCHAR,
    farmer_name VARCHAR,
    distance_km NUMERIC,
    farmer_phone VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.farm_id,
        fr.name_en,
        ST_Distance(f.centroid, fire_location) / 1000 AS distance_km,
        fr.phone
    FROM farms f
    JOIN farmers fr ON f.farmer_id = fr.id
    WHERE f.status = 'active'
        AND f.centroid IS NOT NULL
        AND ST_DWithin(f.centroid, fire_location, radius_km * 1000)
    ORDER BY ST_Distance(f.centroid, fire_location);
END;
$$ LANGUAGE plpgsql;

-- Function to find nearest plants to a farm
CREATE OR REPLACE FUNCTION find_nearest_plants(
    farm_location GEOGRAPHY,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    plant_id UUID,
    plant_name VARCHAR,
    distance_km NUMERIC,
    capacity_tonnes NUMERIC,
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bp.id,
        bp.name_en,
        ST_Distance(bp.location, farm_location) / 1000 AS distance_km,
        bp.capacity_tonnes_per_day,
        bp.status::text
    FROM biogas_plants bp
    WHERE bp.status = 'operational'
        AND bp.location IS NOT NULL
    ORDER BY bp.location <-> farm_location
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique IDs
CREATE OR REPLACE FUNCTION generate_farmer_id()
RETURNS TRIGGER AS $$
DECLARE
    new_id VARCHAR(20);
    district_code VARCHAR(10);
    sequence_num INTEGER;
BEGIN
    SELECT d.district_code INTO district_code
    FROM districts d
    JOIN villages v ON d.id = v.district_id
    WHERE v.id = NEW.village_id;

    SELECT COALESCE(MAX(CAST(SUBSTRING(farmer_id FROM 5) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM farmers
    WHERE farmer_id LIKE district_code || '%';

    NEW.farmer_id := district_code || LPAD(sequence_num::TEXT, 12, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Create updated_at triggers for all relevant tables
CREATE TRIGGER updated_at_districts
    BEFORE UPDATE ON districts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER updated_at_villages
    BEFORE UPDATE ON villages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER updated_at_farmers
    BEFORE UPDATE ON farmers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER updated_at_farms
    BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER updated_at_biogas_plants
    BEFORE UPDATE ON biogas_plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER updated_at_balers
    BEFORE UPDATE ON balers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER updated_at_routes
    BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER updated_at_carbon_credits
    BEFORE UPDATE ON carbon_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER updated_at_carbon_transactions
    BEFORE UPDATE ON carbon_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to calculate farm centroid
CREATE TRIGGER calculate_farm_centroid_trigger
    BEFORE INSERT OR UPDATE OF boundary ON farms
    FOR EACH ROW EXECUTE FUNCTION calculate_farm_centroid();

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Spatial indexes (PostGIS GIST)
CREATE INDEX idx_districts_boundary ON districts USING GIST(boundary);
CREATE INDEX idx_villages_boundary ON villages USING GIST(boundary);
CREATE INDEX idx_villages_centroid ON villages USING GIST(centroid);
CREATE INDEX idx_farms_boundary ON farms USING GIST(boundary);
CREATE INDEX idx_farms_centroid ON farms USING GIST(centroid);
CREATE INDEX idx_biogas_plants_location ON biogas_plants USING GIST(location);
CREATE INDEX idx_biogas_plants_boundary ON biogas_plants USING GIST(boundary);
CREATE INDEX idx_balers_current_location ON balers USING GIST(current_location);
CREATE INDEX idx_routes_route_path ON routes USING GIST(route_path);
CREATE INDEX idx_routes_actual_path ON routes USING GIST(actual_path);
CREATE INDEX idx_satellite_fire_events_location ON satellite_fire_events USING GIST(location);
CREATE INDEX idx_satellite_fire_events_location_2024 ON satellite_fire_events_2024 USING GIST(location);
CREATE INDEX idx_satellite_fire_events_location_2025 ON satellite_fire_events_2025 USING GIST(location);
CREATE INDEX idx_satellite_fire_events_location_2026 ON satellite_fire_events_2026 USING GIST(location);

-- B-tree indexes for common lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_district_id ON users(district_id);

CREATE INDEX idx_villages_district_id ON villages(district_id);
CREATE INDEX idx_villages_name_en ON villages(name_en);
CREATE INDEX idx_villages_name_pa ON villages(name_pa);

CREATE INDEX idx_farmers_village_id ON farmers(village_id);
CREATE INDEX idx_farmers_farmer_id ON farmers(farmer_id);
CREATE INDEX idx_farmers_verification_status ON farmers(verification_status);
CREATE INDEX idx_farmers_phone ON farmers(phone);

CREATE INDEX idx_farms_farmer_id ON farms(farmer_id);
CREATE INDEX idx_farms_village_id ON farms(village_id);
CREATE INDEX idx_farms_farm_id ON farms(farm_id);
CREATE INDEX idx_farms_status ON farms(status);
CREATE INDEX idx_farms_verification_status ON farms(verification_status);

CREATE INDEX idx_farm_seasons_farm_id ON farm_seasons(farm_id);
CREATE INDEX idx_farm_seasons_season_year ON farm_seasons(season, year);
CREATE INDEX idx_farm_seasons_crop_type ON farm_seasons(crop_type);

CREATE INDEX idx_biogas_plants_district_id ON biogas_plants(district_id);
CREATE INDEX idx_biogas_plants_status ON biogas_plants(status);

CREATE INDEX idx_balers_plant_id ON balers(plant_id);
CREATE INDEX idx_balers_status ON balers(status);

CREATE INDEX idx_routes_baler_id ON routes(baler_id);
CREATE INDEX idx_routes_plant_id ON routes(plant_id);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_scheduled_dates ON routes(scheduled_start, scheduled_end);

-- Satellite fire events time-series indexes (per partition)
CREATE INDEX idx_satellite_fire_events_2024_detection_time ON satellite_fire_events_2024(detection_time DESC);
CREATE INDEX idx_satellite_fire_events_2024_source ON satellite_fire_events_2024(source);
CREATE INDEX idx_satellite_fire_events_2024_confidence ON satellite_fire_events_2024(confidence);
CREATE INDEX idx_satellite_fire_events_2024_affected_farm_id ON satellite_fire_events_2024(affected_farm_id);

CREATE INDEX idx_satellite_fire_events_2025_detection_time ON satellite_fire_events_2025(detection_time DESC);
CREATE INDEX idx_satellite_fire_events_2025_source ON satellite_fire_events_2025(source);
CREATE INDEX idx_satellite_fire_events_2025_confidence ON satellite_fire_events_2025(confidence);
CREATE INDEX idx_satellite_fire_events_2025_affected_farm_id ON satellite_fire_events_2025(affected_farm_id);

CREATE INDEX idx_satellite_fire_events_2026_detection_time ON satellite_fire_events_2026(detection_time DESC);
CREATE INDEX idx_satellite_fire_events_2026_source ON satellite_fire_events_2026(source);
CREATE INDEX idx_satellite_fire_events_2026_confidence ON satellite_fire_events_2026(confidence);
CREATE INDEX idx_satellite_fire_events_2026_affected_farm_id ON satellite_fire_events_2026(affected_farm_id);

CREATE INDEX idx_carbon_credits_farmer_id ON carbon_credits(farmer_id);
CREATE INDEX idx_carbon_credits_farm_id ON carbon_credits(farm_id);
CREATE INDEX idx_carbon_credits_season_id ON carbon_credits(season_id);
CREATE INDEX idx_carbon_credits_verification_status ON carbon_credits(verification_status);
CREATE INDEX idx_carbon_credits_credit_code ON carbon_credits(credit_code);
CREATE INDEX idx_carbon_credits_created_at ON carbon_credits(created_at DESC);

CREATE INDEX idx_carbon_transactions_carbon_credit_id ON carbon_transactions(carbon_credit_id);
CREATE INDEX idx_carbon_transactions_from_farmer_id ON carbon_transactions(from_farmer_id);
CREATE INDEX idx_carbon_transactions_to_farmer_id ON carbon_transactions(to_farmer_id);
CREATE INDEX idx_carbon_transactions_transaction_type ON carbon_transactions(transaction_type);
CREATE INDEX idx_carbon_transactions_transaction_status ON carbon_transactions(transaction_status);
CREATE INDEX idx_carbon_transactions_transaction_date ON carbon_transactions(transaction_date DESC);
CREATE INDEX idx_carbon_transactions_transaction_code ON carbon_transactions(transaction_code);

CREATE INDEX idx_stubble_sales_farm_id ON stubble_sales(farm_id);
CREATE INDEX idx_stubble_sales_farmer_id ON stubble_sales(farmer_id);
CREATE INDEX idx_stubble_sales_plant_id ON stubble_sales(plant_id);
CREATE INDEX idx_stubble_sales_collection_date ON stubble_sales(collection_date);
CREATE INDEX idx_stubble_sales_payment_status ON stubble_sales(payment_status);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at DESC);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_farmer_id ON notifications(farmer_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- JSONB indexes for metadata queries
CREATE INDEX idx_users_metadata ON users USING GIN(metadata);
CREATE INDEX idx_farmers_metadata ON farmers USING GIN(metadata);
CREATE INDEX idx_farms_metadata ON farms USING GIN(metadata);
CREATE INDEX idx_carbon_credits_metadata ON carbon_credits USING GIN(metadata);

-- Full-text search indexes
CREATE INDEX idx_translations_key_trgm ON translations USING GIN(key gin_trgm_ops);
CREATE INDEX idx_translations_value_trgm ON translations USING GIN(value gin_trgm_ops);

-- Composite indexes for common query patterns
CREATE INDEX idx_farms_farmer_village ON farms(farmer_id, village_id);
CREATE INDEX idx_carbon_credits_farmer_status ON carbon_credits(farmer_id, verification_status);
CREATE INDEX idx_satellite_fire_events_time_confidence ON satellite_fire_events(detection_time DESC, confidence);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE districts IS 'Administrative districts of Punjab with geographic boundaries';
COMMENT ON TABLE villages IS 'Villages and localities within districts';
COMMENT ON TABLE users IS 'System users for admin dashboard and operations';
COMMENT ON TABLE farmers IS 'Primary stakeholders - farmers owning agricultural land';
COMMENT ON TABLE farms IS 'Individual land holdings with geographic boundaries';
COMMENT ON TABLE farm_seasons IS 'Crop cycle information for each farm';
COMMENT ON TABLE biogas_plants IS 'Stubble collection and biogas processing facilities';
COMMENT ON TABLE balers IS 'Machinery for collecting stubble from farms';
COMMENT ON TABLE routes IS 'Operational routes for baler collections';
COMMENT ON TABLE satellite_fire_events IS 'Time-series satellite fire detection data (partitioned by year)';
COMMENT ON TABLE carbon_credits IS 'Carbon credit ledger with blockchain integration support';
COMMENT ON TABLE carbon_transactions IS 'Transaction history for carbon credit trading';
COMMENT ON TABLE stubble_sales IS 'Stubble sales transactions from farmers to plants';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all data changes (partitioned by year)';
COMMENT ON TABLE translations IS 'Multi-language support for UI and communications';
COMMENT ON TABLE notifications IS 'User and farmer notifications and alerts';

-- ============================================================================
-- INITIAL DATA - PUNJAB DISTRICTS (sample)
-- ============================================================================

-- Note: Insert actual district boundaries later using shapefile data
-- This is a placeholder structure

-- Example districts (coordinates are approximate)
INSERT INTO districts (name_en, name_pa, district_code, state_code) VALUES
('Amritsar', 'ਅੰਮ੍ਰਿਤਸਰ', 'PB001', 'PB'),
('Bathinda', 'ਬਠਿੰਡਾ', 'PB002', 'PB'),
('Barnala', 'ਬਰਨਾਲਾ', 'PB003', 'PB'),
('Faridkot', 'ਫਰੀਦਕੋਟ', 'PB004', 'PB'),
('Fatehgarh Sahib', 'ਫਤਿਹਗੜ੍ਹ ਸਾਹਿਬ', 'PB005', 'PB'),
('Fazilka', 'ਫਾਜ਼ਿਲਕਾ', 'PB006', 'PB'),
('Ferozepur', 'ਫਿਰੋਜ਼ਪੁਰ', 'PB007', 'PB'),
('Gurdaspur', 'ਗੁਰਦਾਸਪੁਰ', 'PB008', 'PB'),
('Hoshiarpur', 'ਹੁਸ਼ਿਆਰਪੁਰ', 'PB009', 'PB'),
('Jalandhar', 'ਜਲੰਧਰ', 'PB010', 'PB'),
('Kapurthala', 'ਕਪੂਰਥਲਾ', 'PB011', 'PB'),
('Ludhiana', 'ਲੁਧਿਆਣਾ', 'PB012', 'PB'),
('Mansa', 'ਮਾਨਸਾ', 'PB013', 'PB'),
('Moga', 'ਮੋਗਾ', 'PB014', 'PB'),
('Mohali', 'ਮੋਹਾਲੀ', 'PB015', 'PB'),
('Muktsar', 'ਮੁਕਤਸਰ', 'PB016', 'PB'),
('Nawanshahr', 'ਨਵਾਂਸ਼ਹਰ', 'PB017', 'PB'),
('Pathankot', 'ਪਠਾਣਕੋਟ', 'PB018', 'PB'),
('Patiala', 'ਪਟਿਆਲਾ', 'PB019', 'PB'),
('Rupnagar', 'ਰੂਪਨਗਰ', 'PB020', 'PB'),
('Sangrur', 'ਸੰਗਰੂਰ', 'PB021', 'PB'),
('Shaheed Bhagat Singh Nagar', 'ਸ਼ਹੀਦ ਭਗਤ ਸਿੰਘ ਨਗਰ', 'PB022', 'PB'),
('Tarn Taran', 'ਤਰਨ ਤਾਰਨ', 'PB023', 'PB')
ON CONFLICT (district_code) DO NOTHING;

-- ============================================================================
-- GRANTS (configure based on your application user)
-- ============================================================================

-- Create application user (adjust username/password as needed)
-- CREATE USER krishicred_app WITH PASSWORD 'your_secure_password';
-- GRANT CONNECT ON DATABASE krishicred TO krishicred_app;
-- GRANT USAGE ON SCHEMA public TO krishicred_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO krishicred_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO krishicred_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO krishicred_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO krishicred_app;

-- Create read-only user for analytics/reporting
-- CREATE USER krishicred_readonly WITH PASSWORD 'your_secure_password';
-- GRANT CONNECT ON DATABASE krishicred TO krishicred_readonly;
-- GRANT USAGE ON SCHEMA public TO krishicred_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO krishicred_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO krishicred_readonly;
