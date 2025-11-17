/**
 * @schema functional
 * Contains the core business logic, entities, and operational tables for the application.
 * All tables in this schema must be multi-tenant.
 */
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'functional')
BEGIN
    EXEC('CREATE SCHEMA functional');
END
GO

-- Business entity tables (e.g., products, stock movements) will be defined here.
