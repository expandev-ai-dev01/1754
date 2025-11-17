/**
 * @schema config
 * Contains system-wide configuration, settings, and parameters that are not tenant-specific.
 */
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'config')
BEGIN
    EXEC('CREATE SCHEMA config');
END
GO

-- Configuration tables will be defined here as features are added.
