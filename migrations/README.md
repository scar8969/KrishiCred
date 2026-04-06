# KrishiCred Database Migration Guide

## Overview

This directory contains SQL migration files for the KrishiCred platform database. The database is designed for PostgreSQL with PostGIS extension for geospatial capabilities.

## Migration Files

| File | Description |
|------|-------------|
| `001_initial_schema.up.sql` | Creates all tables, indexes, functions, and triggers |
| `001_initial_schema.down.sql` | Rolls back the initial schema |
| `002_partition_maintenance.up.sql` | Partition maintenance functions and procedures |
| `002_partition_maintenance.down.sql` | Rolls back partition maintenance |
| `003_initial_translations.up.sql` | Initial translations (English, Punjabi, Hindi) |
| `003_initial_translations.down.sql` | Rolls back translations |

## Prerequisites

1. PostgreSQL 14+ (recommended 15+)
2. PostGIS 3.3+
3. Required extensions:
   - `postgis`
   - `uuid-ossp`
   - `btree_gist`
   - `pg_trgm`

## Installation

### Step 1: Create Database

```bash
# Create the database
createdb krishicred

# Connect to the database
psql -d krishicred
```

### Step 2: Run Migrations

```bash
# Using psql
psql -d krishicred -f migrations/001_initial_schema.up.sql
psql -d krishicred -f migrations/002_partition_maintenance.up.sql
psql -d krishicred -f migrations/003_initial_translations.up.sql

# Or run all at once
cat migrations/*.up.sql | psql -d krishicred
```

### Step 3: Create Application Users

```sql
-- Application user (read-write)
CREATE USER krishicred_app WITH PASSWORD 'your_secure_password';
GRANT CONNECT ON DATABASE krishicred TO krishicred_app;
GRANT USAGE ON SCHEMA public TO krishicred_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO krishicred_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO krishicred_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO krishicred_app;

-- Read-only user for analytics
CREATE USER krishicred_readonly WITH PASSWORD 'your_secure_password';
GRANT CONNECT ON DATABASE krishicred TO krishicred_readonly;
GRANT USAGE ON SCHEMA public TO krishicred_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO krishicred_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO krishicred_readonly;
```

## Rollback

To rollback migrations, run the `.down.sql` files in reverse order:

```bash
psql -d krishicred -f migrations/003_initial_translations.down.sql
psql -d krishicred -f migrations/002_partition_maintenance.down.sql
psql -d krishicred -f migrations/001_initial_schema.down.sql
```

## Partition Maintenance

The database uses range partitioning for time-series data:

### Partitioned Tables
- `satellite_fire_events` (by year)
- `audit_logs` (by year)

### Maintenance Functions

```sql
-- Create new partitions for a specific year
SELECT create_year_partitions(2028);

-- Run full maintenance (create partitions, refresh views, etc.)
SELECT run_partition_maintenance();

-- Drop old partitions (keeps last 5 years by default)
SELECT drop_old_partitions(5);

-- Refresh materialized views
SELECT refresh_stats_views();
```

### Automated Maintenance

Set up a cron job or pg_cron to run maintenance periodically:

```sql
-- Using pg_cron extension (if available)
SELECT cron.schedule('partition-maintenance', '0 2 1 1 *', 'SELECT run_partition_maintenance();');
```

## Index Strategy

### Spatial Indexes (PostGIS GIST)
All geography/geometry columns have GIST indexes for spatial queries:
- Farm boundaries for finding farms near fire events
- Plant locations for finding nearest plants
- Route paths for operational queries

### B-tree Indexes
Primary keys, foreign keys, and frequently filtered columns

### Composite Indexes
For common query patterns (e.g., farmer_id + verification_status)

### JSONB Indexes
GIN indexes on metadata columns for flexible queries

## Performance Considerations

1. **Spatial Queries**: Use `ST_DWithin()` instead of `ST_Distance()` when filtering by distance
2. **Time-Series Queries**: Queries are automatically pruned to relevant partitions
3. **Materialized Views**: Refresh periodically using `refresh_stats_views()`
4. **Vacuum/Analyze**: Run weekly to maintain query performance

## Backup & Restore

```bash
# Backup
pg_dump -Fc krishicred > krishicred.dump

# Restore
pg_restore -d krishicred krishicred.dump
```

## API Integration Notes

### Blockchain Integration
The schema includes blockchain-related fields:
- `carbon_credits.blockchain_tx_hash`
- `carbon_credits.blockchain_block_number`
- `carbon_transactions.blockchain_tx_hash`

These can be populated via API calls to your blockchain service.

### Geospatial Queries
Example queries for common operations:

```sql
-- Find farms within 1km of a fire event
SELECT * FROM find_farms_near_fire(
    ST_MakePoint(75.5, 31.0)::geography,
    1.0
);

-- Find nearest biogas plants to a farm
SELECT * FROM find_nearest_plants(
    (SELECT centroid FROM farms WHERE id = '...'),
    5
);

-- Count fire events by village
SELECT v.name_en, COUNT(sfe.id)
FROM villages v
LEFT JOIN satellite_fire_events sfe
    ON ST_Within(sfe.location::geometry, v.boundary::geometry)
GROUP BY v.id, v.name_en;
```

## Monitoring

Check partition status:
```sql
SELECT * FROM v_partition_info;
```

Check table sizes:
```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Support

For issues or questions about the database schema, please contact the database architecture team.
