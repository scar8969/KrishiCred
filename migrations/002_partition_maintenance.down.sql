-- ============================================================================
-- KrishiCred - Rollback Partition Maintenance Migration
-- ============================================================================

-- Drop maintenance functions
DROP FUNCTION IF EXISTS run_partition_maintenance CASCADE;
DROP FUNCTION IF EXISTS refresh_stats_views CASCADE;
DROP FUNCTION IF EXISTS reindex_partition_concurrently CASCADE;
DROP FUNCTION IF EXISTS maintain_partition_indexes CASCADE;
DROP FUNCTION IF EXISTS maintain_partitions CASCADE;
DROP FUNCTION IF EXISTS create_year_partitions CASCADE;
DROP FUNCTION IF EXISTS drop_old_partitions CASCADE;
DROP FUNCTION IF EXISTS create_audit_log_partition CASCADE;
DROP FUNCTION IF EXISTS create_satellite_fire_partition CASCADE;

-- Drop view
DROP VIEW IF EXISTS v_partition_info CASCADE;

-- Note: Partitions created by these functions are not automatically dropped
-- to prevent accidental data loss. Manually drop if needed:
-- DROP TABLE IF EXISTS satellite_fire_events_2028 CASCADE;
-- DROP TABLE IF EXISTS audit_logs_2028 CASCADE;
