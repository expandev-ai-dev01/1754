/**
 * @schema subscription
 * Manages accounts (tenants), subscription plans, and billing information.
 */
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'subscription')
BEGIN
    EXEC('CREATE SCHEMA subscription');
END
GO

-- The 'account' table, which is central to the multi-tenancy model, will be defined here.
