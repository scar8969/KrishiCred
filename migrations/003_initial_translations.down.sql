-- ============================================================================
-- KrishiCred - Rollback Initial Translations
-- ============================================================================

-- Drop helper functions
DROP FUNCTION IF EXISTS upsert_translation CASCADE;
DROP FUNCTION IF EXISTS get_translations CASCADE;
DROP FUNCTION IF EXISTS get_translation CASCADE;

-- Drop translation indexes
DROP INDEX IF EXISTS idx_translations_locale_key;
DROP INDEX IF EXISTS idx_translations_locale;
DROP INDEX IF EXISTS idx_translations_key;

-- Clear translation data (optional - remove if you want to keep data)
-- DELETE FROM translations WHERE locale IN ('en', 'pa', 'hi');
