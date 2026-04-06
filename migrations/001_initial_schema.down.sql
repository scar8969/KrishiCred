-- ============================================================================
-- KrishiCred Database Rollback Script
-- ============================================================================
-- This script reverses the initial schema migration
-- ============================================================================

-- Drop materialized views
DROP MATERIALIZED VIEW IF EXISTS mv_farmer_credit_summary CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_village_fire_stats CASCADE;

-- Drop indexes (automatically dropped with tables, but explicitly listing for clarity)
-- Note: Most indexes are automatically dropped when tables are dropped

-- Drop functions
DROP FUNCTION IF EXISTS find_nearest_plants CASCADE;
DROP FUNCTION IF EXISTS find_farms_near_fire CASCADE;
DROP FUNCTION IF EXISTS calculate_farm_centroid CASCADE;
DROP FUNCTION IF EXISTS generate_farmer_id CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Drop triggers (automatically dropped with tables/functions)
-- Explicitly listed for documentation:
-- DROP TRIGGER IF EXISTS updated_at_districts ON districts;
-- DROP TRIGGER IF EXISTS updated_at_villages ON villages;
-- DROP TRIGGER IF EXISTS updated_at_users ON users;
-- DROP TRIGGER IF EXISTS updated_at_farmers ON farmers;
-- DROP TRIGGER IF EXISTS updated_at_farms ON farms;
-- DROP TRIGGER IF EXISTS updated_at_biogas_plants ON biogas_plants;
-- DROP TRIGGER IF EXISTS updated_at_balers ON balers;
-- DROP TRIGGER IF EXISTS updated_at_routes ON routes;
-- DROP TRIGGER IF EXISTS updated_at_carbon_credits ON carbon_credits;
-- DROP TRIGGER IF EXISTS updated_at_carbon_transactions ON carbon_transactions;
-- DROP TRIGGER IF EXISTS calculate_farm_centroid_trigger ON farms;

-- Drop tables in correct order (respecting foreign key dependencies)

-- Drop notifications
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop translations
DROP TABLE IF EXISTS translations CASCADE;

-- Drop audit logs (partitions first)
DROP TABLE IF EXISTS audit_logs_2027 CASCADE;
DROP TABLE IF EXISTS audit_logs_2026 CASCADE;
DROP TABLE IF EXISTS audit_logs_2025 CASCADE;
DROP TABLE IF EXISTS audit_logs_2024 CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Drop stubble sales
DROP TABLE IF EXISTS stubble_sales CASCADE;

-- Drop carbon transactions
DROP TABLE IF EXISTS carbon_transactions CASCADE;

-- Drop carbon credits
DROP TABLE IF EXISTS carbon_credits CASCADE;

-- Drop satellite fire events (partitions first)
DROP TABLE IF EXISTS satellite_fire_events_2027 CASCADE;
DROP TABLE IF EXISTS satellite_fire_events_2026 CASCADE;
DROP TABLE IF EXISTS satellite_fire_events_2025 CASCADE;
DROP TABLE IF EXISTS satellite_fire_events_2024 CASCADE;
DROP TABLE IF EXISTS satellite_fire_events CASCADE;

-- Drop routes
DROP TABLE IF EXISTS routes CASCADE;

-- Drop balers
DROP TABLE IF EXISTS balers CASCADE;

-- Drop biogas plants
DROP TABLE IF EXISTS biogas_plants CASCADE;

-- Drop farm seasons
DROP TABLE IF EXISTS farm_seasons CASCADE;

-- Drop farms
DROP TABLE IF EXISTS farms CASCADE;

-- Drop farmers
DROP TABLE IF EXISTS farmers CASCADE;

-- Drop user sessions
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Drop users
DROP TABLE IF EXISTS users CASCADE;

-- Drop villages
DROP TABLE IF EXISTS villages CASCADE;

-- Drop districts
DROP TABLE IF EXISTS districts CASCADE;

-- Drop ENUM types (must be done last after all tables are dropped)
DROP TYPE IF EXISTS route_status CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS credit_status CASCADE;
DROP TYPE IF EXISTS fire_confidence CASCADE;
DROP TYPE IF EXISTS satellite_source CASCADE;
DROP TYPE IF EXISTS baler_status CASCADE;
DROP TYPE IF EXISTS plant_status CASCADE;
DROP TYPE IF EXISTS season_type CASCADE;
DROP TYPE IF EXISTS crop_type CASCADE;
DROP TYPE IF EXISTS farm_status CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Note: Extensions are not dropped as they may be used by other schemas
-- To drop extensions, uncomment the following:
-- DROP EXTENSION IF EXISTS pg_trgm CASCADE;
-- DROP EXTENSION IF EXISTS btree_gist CASCADE;
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
-- DROP EXTENSION IF EXISTS "postgis-topology" CASCADE;
-- DROP EXTENSION IF EXISTS postgis CASCADE;
