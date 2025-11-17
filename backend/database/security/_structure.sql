/**
 * @schema security
 * Manages authentication, authorization, users, roles, and permissions.
 */
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'security')
BEGIN
    EXEC('CREATE SCHEMA security');
END
GO

-- User, role, and permission tables will be defined here.
