-- ============================================================================
-- KrishiCred - Partition Maintenance Migration
-- ============================================================================
-- This migration adds functions and procedures for managing time-series partitions
-- ============================================================================

-- ============================================================================
-- PARTITION MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to create a new partition for satellite fire events
CREATE OR REPLACE FUNCTION create_satellite_fire_partition(
    partition_year INTEGER
)
RETURNS TEXT AS $$
DECLARE
    partition_name TEXT;
    start_date TIMESTAMP WITH TIME ZONE;
    end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    partition_name := 'satellite_fire_events_' || partition_year::TEXT;
    start_date := (partition_year || '-01-01')::timestamp with time zone;
    end_date := ((partition_year + 1) || '-01-01')::timestamp with time zone;

    -- Create partition
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF satellite_fire_events
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );

    -- Create indexes for the new partition
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%s_location ON %I USING GIST(location)',
        partition_name, partition_name
    );

    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%s_detection_time ON %I(detection_time DESC)',
        partition_name, partition_name
    );

    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%s_source ON %I(source)',
        partition_name, partition_name
    );

    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%s_confidence ON %I(confidence)',
        partition_name, partition_name
    );

    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%s_affected_farm_id ON %I(affected_farm_id)',
        partition_name, partition_name
    );

    RETURN 'Created partition: ' || partition_name;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new partition for audit logs
CREATE OR REPLACE FUNCTION create_audit_log_partition(
    partition_year INTEGER
)
RETURNS TEXT AS $$
DECLARE
    partition_name TEXT;
    start_date TIMESTAMP WITH TIME ZONE;
    end_date TIMESTAMP WITH TIME ZONE;
BEGIN
    partition_name := 'audit_logs_' || partition_year::TEXT;
    start_date := (partition_year || '-01-01')::timestamp with time zone;
    end_date := ((partition_year + 1) || '-01-01')::timestamp with time zone;

    -- Create partition
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF audit_logs
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );

    -- Create indexes for the new partition
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%s_entity ON %I(entity_type, entity_id)',
        partition_name, partition_name
    );

    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%s_changed_at ON %I(changed_at DESC)',
        partition_name, partition_name
    );

    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%s_changed_by ON %I(changed_by)',
        partition_name, partition_name
    );

    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%s_action ON %I(action)',
        partition_name, partition_name
    );

    RETURN 'Created partition: ' || partition_name;
END;
$$ LANGUAGE plpgsql;

-- Function to create all partitions for a given year
CREATE OR REPLACE FUNCTION create_year_partitions(
    partition_year INTEGER
)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
BEGIN
    result := result || jsonb_build_object(
        'satellite_fire_events',
        create_satellite_fire_partition(partition_year)
    );

    result := result || jsonb_build_object(
        'audit_logs',
        create_audit_log_partition(partition_year)
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to drop old partitions (for data retention)
CREATE OR REPLACE FUNCTION drop_old_partitions(
    keep_years INTEGER DEFAULT 5
)
RETURNS JSONB AS $$
DECLARE
    cutoff_year INTEGER;
    partition_name TEXT;
    result JSONB := '[]'::jsonb;
BEGIN
    cutoff_year := EXTRACT(YEAR FROM NOW()) - keep_years;

    -- Drop old satellite fire event partitions
    FOR partition_name IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
            AND tablename LIKE 'satellite_fire_events_%'
            AND substring(tablename FROM 22)::INTEGER < cutoff_year
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || partition_name || ' CASCADE';
        result := result || jsonb_build_object('table', partition_name, 'action', 'dropped');
    END LOOP;

    -- Drop old audit log partitions
    FOR partition_name IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
            AND tablename LIKE 'audit_logs_%'
            AND substring(tablename FROM 12)::INTEGER < cutoff_year
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || partition_name || ' CASCADE';
        result := result || jsonb_build_object('table', partition_name, 'action', 'dropped');
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTOMATED PARTITION MAINTENANCE
-- ============================================================================

-- Function to create future partitions (run annually)
CREATE OR REPLACE FUNCTION maintain_partitions()
RETURNS JSONB AS $$
DECLARE
    current_year INTEGER;
    next_year INTEGER;
    result JSONB := '{}';
BEGIN
    current_year := EXTRACT(YEAR FROM NOW());
    next_year := current_year + 1;

    -- Ensure current year partitions exist
    result := result || jsonb_build_object(
        'current_year',
        create_year_partitions(current_year)
    );

    -- Create next year's partitions in advance
    result := result || jsonb_build_object(
        'next_year',
        create_year_partitions(next_year)
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTITION MANAGEMENT VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW v_partition_info AS
SELECT
    'satellite_fire_events' AS table_name,
    substring(tablename FROM 22)::INTEGER AS partition_year,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size,
    (SELECT count(*) FROM satellite_fire_events
        WHERE detection_time >= (substring(tablename FROM 22) || '-01-01')::date
        AND detection_time < ((substring(tablename FROM 22)::INTEGER + 1) || '-01-01')::date
    ) AS row_count
FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'satellite_fire_events_%'

UNION ALL

SELECT
    'audit_logs' AS table_name,
    substring(tablename FROM 12)::INTEGER AS partition_year,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size,
    (SELECT count(*) FROM audit_logs
        WHERE changed_at >= (substring(tablename FROM 12) || '-01-01')::date
        AND changed_at < ((substring(tablename FROM 12)::INTEGER + 1) || '-01-01')::date
    ) AS row_count
FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'audit_logs_%'
ORDER BY table_name, partition_year;

COMMENT ON VIEW v_partition_info IS 'View showing partition sizes and row counts for time-series tables';

-- ============================================================================
-- INDEX MAINTENANCE
-- ============================================================================

-- Function to analyze and vacuum partitions
CREATE OR REPLACE FUNCTION maintain_partition_indexes()
RETURNS JSONB AS $$
DECLARE
    partition_record RECORD;
    result JSONB := '[]'::jsonb;
BEGIN
    -- Vacuum and analyze satellite fire event partitions
    FOR partition_record IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename LIKE 'satellite_fire_events_%'
    LOOP
        EXECUTE 'VACUUM ANALYZE ' || partition_record.tablename;
        result := result || jsonb_build_object(
            'table', partition_record.tablename,
            'action', 'vacuum_analyze'
        );
    END LOOP;

    -- Vacuum and analyze audit log partitions
    FOR partition_record IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename LIKE 'audit_logs_%'
    LOOP
        EXECUTE 'VACUUM ANALYZE ' || partition_record.tablename;
        result := result || jsonb_build_object(
            'table', partition_record.tablename,
            'action', 'vacuum_analyze'
        );
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CONCURRENT REINDEXING FOR PARTITIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION reindex_partition_concurrently(
    partition_name TEXT
)
RETURNS TEXT AS $$
BEGIN
    -- Reindex spatial indexes concurrently
    EXECUTE format('REINDEX INDEX CONCURRENTLY idx_%s_location', partition_name);

    -- Reindex other important indexes
    EXECUTE format('REINDEX INDEX CONCURRENTLY idx_%s_detection_time', partition_name);

    RETURN 'Reindexed partition: ' || partition_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_stats_views()
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_village_fire_stats;
    result := result || jsonb_build_object('mv_village_fire_stats', 'refreshed');

    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_farmer_credit_summary;
    result := result || jsonb_build_object('mv_farmer_credit_summary', 'refreshed');

    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_stats_views() IS 'Refresh all materialized views concurrently without blocking reads';

-- ============================================================================
-- SCHEDULED MAINTENANCE FUNCTION
-- ============================================================================

-- Main function to run all maintenance tasks
CREATE OR REPLACE FUNCTION run_partition_maintenance()
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
BEGIN
    -- Create/verify partitions
    result := result || jsonb_build_object(
        'partitions',
        maintain_partitions()
    );

    -- Refresh materialized views
    result := result || jsonb_build_object(
        'materialized_views',
        refresh_stats_views()
    );

    -- Maintain indexes
    result := result || jsonb_build_object(
        'index_maintenance',
        maintain_partition_indexes()
    );

    -- Log the maintenance run
    INSERT INTO audit_logs (entity_type, entity_id, action, new_values, changed_at)
    VALUES (
        'partition_maintenance',
        uuid_generate_v4(),
        'RUN_MAINTENANCE',
        result,
        NOW()
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION run_partition_maintenance() IS 'Main maintenance function for partition management. Should be run periodically (daily/weekly)';

-- ============================================================================
-- CREATE NEXT YEAR'S PARTITIONS (for 2028)
-- ============================================================================

SELECT create_year_partitions(2028);
