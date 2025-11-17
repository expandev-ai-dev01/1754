/**
 * Database Migration
 * Generated: 2025-11-17T17:55:44.237Z
 * Timestamp: 20251117_175544
 *
 * This migration includes:
 * - Schema structures (tables, indexes, constraints)
 * - Initial data
 * - Stored procedures
 *
 * Note: This file is automatically executed by the migration runner
 * on application startup in Azure App Service.
 */

-- Set options for better SQL Server compatibility
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET ANSI_WARNINGS ON;
SET NUMERIC_ROUNDABORT OFF;
GO

PRINT 'Starting database migration...';
PRINT 'Timestamp: 20251117_175544';
GO


-- ============================================
-- STRUCTURE
-- Database schemas, tables, indexes, and constraints
-- ============================================

-- File: security/_structure.sql
/**
 * @schema security
 * Manages authentication, authorization, users, roles, and permissions.
 */
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'security')
BEGIN
    EXEC('CREATE SCHEMA security');
END
GO

/*
DROP TABLE IF EXISTS [security].[user];
*/

/**
 * @table user Stores user account information.
 * @multitenancy true
 * @softDelete true
 * @alias usr
 */
CREATE TABLE [security].[user] (
    [idUser] INTEGER IDENTITY(1, 1) NOT NULL,
    [idAccount] INTEGER NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [email] NVARCHAR(255) NOT NULL,
    [passwordHash] NVARCHAR(255) NOT NULL,
    [deleted] BIT NOT NULL
);
GO

/**
 * @primaryKey pkUser
 * @keyType Object
 */
ALTER TABLE [security].[user]
ADD CONSTRAINT [pkUser] PRIMARY KEY CLUSTERED ([idUser]);
GO

/**
 * @foreignKey fkUser_Account Links user to a tenant account.
 * @target subscription.account
 */
ALTER TABLE [security].[user]
ADD CONSTRAINT [fkUser_Account] FOREIGN KEY ([idAccount])
REFERENCES [subscription].[account]([idAccount]);
GO

ALTER TABLE [security].[user]
ADD CONSTRAINT [dfUser_Deleted] DEFAULT (0) FOR [deleted];
GO

/**
 * @index uqUser_Account_Email Enforces unique email per account.
 * @type Unique
 * @unique true
 */
CREATE UNIQUE NONCLUSTERED INDEX [uqUser_Account_Email]
ON [security].[user]([idAccount], [email])
WHERE [deleted] = 0;
GO

-- File: subscription/_structure.sql
/**
 * @schema subscription
 * Manages accounts (tenants), subscription plans, and billing information.
 */
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'subscription')
BEGIN
    EXEC('CREATE SCHEMA subscription');
END
GO

/*
DROP TABLE IF EXISTS [subscription].[account];
*/

/**
 * @table account Represents a tenant in the multi-tenant system.
 * @multitenancy false
 * @softDelete true
 * @alias acc
 */
CREATE TABLE [subscription].[account] (
    [idAccount] INTEGER IDENTITY(1, 1) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [deleted] BIT NOT NULL
);
GO

/**
 * @primaryKey pkAccount
 * @keyType Object
 */
ALTER TABLE [subscription].[account]
ADD CONSTRAINT [pkAccount] PRIMARY KEY CLUSTERED ([idAccount]);
GO

ALTER TABLE [subscription].[account]
ADD CONSTRAINT [dfAccount_Deleted] DEFAULT (0) FOR [deleted];
GO

-- File: config/_structure.sql
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


-- File: functional/_structure.sql
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

/*
DROP TRIGGER IF EXISTS [functional].[trg_stockMovement_updateProductStock];
DROP TABLE IF EXISTS [functional].[stockMovement];
DROP TABLE IF EXISTS [functional].[productStock];
DROP TABLE IF EXISTS [functional].[product];
*/

/**
 * @table product Stores product catalog information.
 * @multitenancy true
 * @softDelete true
 * @alias prd
 */
CREATE TABLE [functional].[product] (
  [idProduct] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [sku] VARCHAR(50) NOT NULL,
  [name] NVARCHAR(150) NOT NULL,
  [description] NVARCHAR(500) NULL,
  [minimumStockLevel] INTEGER NOT NULL,
  [status] TINYINT NOT NULL, -- 0: INATIVO, 1: ATIVO
  [idUserCreated] INTEGER NOT NULL,
  [dateCreated] DATETIME2 NOT NULL,
  [idUserModified] INTEGER NULL,
  [dateModified] DATETIME2 NULL,
  [deleted] BIT NOT NULL
);
GO

/**
 * @table productStock Stores the current aggregated stock quantity for each product.
 * @multitenancy true
 * @softDelete false
 * @alias ps
 */
CREATE TABLE [functional].[productStock] (
  [idProduct] INTEGER NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [currentQuantity] INTEGER NOT NULL,
  [dateLastMovement] DATETIME2 NOT NULL
);
GO

/**
 * @table stockMovement An immutable log of all stock transactions (in, out, adjustments).
 * @multitenancy true
 * @softDelete false
 * @alias sm
 */
CREATE TABLE [functional].[stockMovement] (
  [idStockMovement] BIGINT IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [idProduct] INTEGER NOT NULL,
  [movementType] TINYINT NOT NULL, -- 1: ENTRADA, 2: SAIDA
  [quantity] INTEGER NOT NULL,
  [reason] NVARCHAR(255) NULL,
  [idUser] INTEGER NOT NULL,
  [movementDate] DATETIME2 NOT NULL
);
GO

-- Constraints for [functional].[product]
/**
 * @primaryKey pkProduct
 * @keyType Object
 */
ALTER TABLE [functional].[product]
ADD CONSTRAINT [pkProduct] PRIMARY KEY CLUSTERED ([idProduct]);
GO

/**
 * @foreignKey fkProduct_Account Links product to a specific tenant account.
 * @target subscription.account
 */
ALTER TABLE [functional].[product]
ADD CONSTRAINT [fkProduct_Account] FOREIGN KEY ([idAccount])
REFERENCES [subscription].[account]([idAccount]);
GO

/**
 * @foreignKey fkProduct_UserCreated Tracks the user who created the product.
 * @target security.[user]
 */
ALTER TABLE [functional].[product]
ADD CONSTRAINT [fkProduct_UserCreated] FOREIGN KEY ([idUserCreated])
REFERENCES [security].[user]([idUser]);
GO

/**
 * @foreignKey fkProduct_UserModified Tracks the user who last modified the product.
 * @target security.[user]
 */
ALTER TABLE [functional].[product]
ADD CONSTRAINT [fkProduct_UserModified] FOREIGN KEY ([idUserModified])
REFERENCES [security].[user]([idUser]);
GO

/**
 * @check chkProduct_Status Ensures status is either 0 (Inactive) or 1 (Active).
 * @enum {0} INATIVO
 * @enum {1} ATIVO
 */
ALTER TABLE [functional].[product]
ADD CONSTRAINT [chkProduct_Status] CHECK ([status] IN (0, 1));
GO

/**
 * @check chkProduct_MinimumStockLevel Ensures minimum stock is not negative.
 */
ALTER TABLE [functional].[product]
ADD CONSTRAINT [chkProduct_MinimumStockLevel] CHECK ([minimumStockLevel] >= 0);
GO

ALTER TABLE [functional].[product]
ADD CONSTRAINT [dfProduct_Status] DEFAULT (1) FOR [status];
GO

ALTER TABLE [functional].[product]
ADD CONSTRAINT [dfProduct_DateCreated] DEFAULT (GETUTCDATE()) FOR [dateCreated];
GO

ALTER TABLE [functional].[product]
ADD CONSTRAINT [dfProduct_Deleted] DEFAULT (0) FOR [deleted];
GO

-- Constraints for [functional].[productStock]
/**
 * @primaryKey pkProductStock
 * @keyType Object
 */
ALTER TABLE [functional].[productStock]
ADD CONSTRAINT [pkProductStock] PRIMARY KEY CLUSTERED ([idProduct]);
GO

/**
 * @foreignKey fkProductStock_Product Links stock record to a product.
 * @target functional.product
 */
ALTER TABLE [functional].[productStock]
ADD CONSTRAINT [fkProductStock_Product] FOREIGN KEY ([idProduct])
REFERENCES [functional].[product]([idProduct]);
GO

/**
 * @foreignKey fkProductStock_Account Ensures tenant isolation.
 * @target subscription.account
 */
ALTER TABLE [functional].[productStock]
ADD CONSTRAINT [fkProductStock_Account] FOREIGN KEY ([idAccount])
REFERENCES [subscription].[account]([idAccount]);
GO

-- Constraints for [functional].[stockMovement]
/**
 * @primaryKey pkStockMovement
 * @keyType Object
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [pkStockMovement] PRIMARY KEY CLUSTERED ([idStockMovement]);
GO

/**
 * @foreignKey fkStockMovement_Product Links movement to a product.
 * @target functional.product
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [fkStockMovement_Product] FOREIGN KEY ([idProduct])
REFERENCES [functional].[product]([idProduct]);
GO

/**
 * @foreignKey fkStockMovement_Account Ensures tenant isolation.
 * @target subscription.account
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [fkStockMovement_Account] FOREIGN KEY ([idAccount])
REFERENCES [subscription].[account]([idAccount]);
GO

/**
 * @foreignKey fkStockMovement_User Tracks the user responsible for the movement.
 * @target security.[user]
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [fkStockMovement_User] FOREIGN KEY ([idUser])
REFERENCES [security].[user]([idUser]);
GO

/**
 * @check chkStockMovement_MovementType Ensures type is 1 (IN) or 2 (OUT).
 * @enum {1} ENTRADA
 * @enum {2} SAIDA
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [chkStockMovement_MovementType] CHECK ([movementType] IN (1, 2));
GO

/**
 * @check chkStockMovement_Quantity Ensures quantity is positive.
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [chkStockMovement_Quantity] CHECK ([quantity] > 0);
GO

ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [dfStockMovement_MovementDate] DEFAULT (GETUTCDATE()) FOR [movementDate];
GO

-- Indexes
/**
 * @index uqProduct_Account_SKU Enforces unique SKU per account.
 * @type Unique
 * @unique true
 * @filter To ignore deleted products.
 */
CREATE UNIQUE NONCLUSTERED INDEX [uqProduct_Account_SKU]
ON [functional].[product]([idAccount], [sku])
WHERE [deleted] = 0;
GO

/**
 * @index ixProduct_Account_Name_Status For searching products by name.
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixProduct_Account_Name_Status]
ON [functional].[product]([idAccount], [name], [status])
WHERE [deleted] = 0;
GO

/**
 * @index ixStockMovement_Account_Product_Date For filtering movement history.
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Account_Product_Date]
ON [functional].[stockMovement]([idAccount], [idProduct], [movementDate] DESC);
GO

-- Trigger to update productStock table
/**
 * @summary
 * Trigger that automatically updates the [functional].[productStock] table
 * after an INSERT on [functional].[stockMovement]. This keeps the current
 * stock quantity aggregated for performance.
 */
CREATE OR ALTER TRIGGER [functional].[trg_stockMovement_updateProductStock]
ON [functional].[stockMovement]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @idProduct INT, @idAccount INT, @quantity INT, @movementType TINYINT;

    SELECT 
        @idProduct = i.[idProduct],
        @idAccount = i.[idAccount],
        @quantity = i.[quantity],
        @movementType = i.[movementType]
    FROM inserted i;

    DECLARE @change INT = CASE @movementType
                            WHEN 1 THEN @quantity  -- ENTRADA
                            WHEN 2 THEN -@quantity -- SAIDA
                            ELSE 0
                          END;

    MERGE [functional].[productStock] AS target
    USING (SELECT @idProduct AS idProduct, @idAccount AS idAccount) AS source
    ON (target.[idProduct] = source.[idProduct])
    WHEN MATCHED THEN
        UPDATE SET 
            target.[currentQuantity] = target.[currentQuantity] + @change,
            target.[dateLastMovement] = GETUTCDATE()
    WHEN NOT MATCHED BY TARGET THEN
        INSERT ([idProduct], [idAccount], [currentQuantity], [dateLastMovement])
        VALUES (@idProduct, @idAccount, @change, GETUTCDATE());
END;
GO


-- ============================================
-- DATA
-- Initial data and configuration
-- ============================================

-- File: security/_data.sql
/**
 * @load {user}
 */
-- This ensures the script can be re-run without causing primary key violations.
IF NOT EXISTS (SELECT 1 FROM [security].[user] WHERE [idUser] = 1)
BEGIN
    -- To allow inserting into an identity column, we need to enable IDENTITY_INSERT.
    SET IDENTITY_INSERT [security].[user] ON;

    INSERT INTO [security].[user] ([idUser], [idAccount], [name], [email], [passwordHash])
    VALUES (1, 1, 'Default Admin', 'admin@stockbox.local', 'not_a_real_hash');

    SET IDENTITY_INSERT [security].[user] OFF;
END
GO

-- File: subscription/_data.sql
/**
 * @load {account}
 */
-- This ensures the script can be re-run without causing primary key violations.
IF NOT EXISTS (SELECT 1 FROM [subscription].[account] WHERE [idAccount] = 1)
BEGIN
    -- To allow inserting into an identity column, we need to enable IDENTITY_INSERT.
    SET IDENTITY_INSERT [subscription].[account] ON;

    INSERT INTO [subscription].[account] ([idAccount], [name])
    VALUES (1, 'Default Account');

    SET IDENTITY_INSERT [subscription].[account] OFF;
END
GO


-- ============================================
-- STORED PROCEDURES
-- Database stored procedures and functions
-- ============================================

-- File: functional/product/spProductCreate.sql
/**
 * @summary
 * Creates a new product and, if initial quantity is provided, creates the first stock movement.
 * The entire operation is performed within a single transaction.
 *
 * @procedure spProductCreate
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/product
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: The tenant account ID.
 * @param {INT} idUser
 *   - Required: Yes
 *   - Description: The ID of the user performing the action.
 * @param {VARCHAR(50)} sku
 *   - Required: Yes
 *   - Description: The product's Stock Keeping Unit.
 * @param {NVARCHAR(150)} name
 *   - Required: Yes
 *   - Description: The name of the product.
 * @param {NVARCHAR(500)} description
 *   - Required: No
 *   - Description: A detailed description of the product.
 * @param {INT} initialQuantity
 *   - Required: Yes
 *   - Description: The starting quantity of the product in stock.
 * @param {INT} minimumStockLevel
 *   - Required: Yes
 *   - Description: The minimum stock level before a restock warning is triggered.
 *
 * @returns {INT} The ID of the newly created product.
 *
 * @testScenarios
 * - Create a product with zero initial quantity.
 * - Create a product with a positive initial quantity, verifying the stock movement.
 * - Attempt to create a product with a duplicate SKU for the same account.
 * - Attempt to create a product with a negative initial quantity.
 */
CREATE OR ALTER PROCEDURE [functional].[spProductCreate]
    @idAccount INT,
    @idUser INT,
    @sku VARCHAR(50),
    @name NVARCHAR(150),
    @description NVARCHAR(500),
    @initialQuantity INT,
    @minimumStockLevel INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Parameter Validation
    IF @idAccount IS NULL OR @idUser IS NULL OR @sku IS NULL OR @name IS NULL OR @initialQuantity IS NULL OR @minimumStockLevel IS NULL
    BEGIN
        ;THROW 51000, 'MissingRequiredParameters', 1;
    END

    IF @initialQuantity < 0 OR @minimumStockLevel < 0
    BEGIN
        ;THROW 51000, 'QuantityCannotBeNegative', 1;
    END

    IF EXISTS (SELECT 1 FROM [functional].[product] prd WHERE prd.[idAccount] = @idAccount AND prd.[sku] = @sku AND prd.[deleted] = 0)
    BEGIN
        ;THROW 51000, 'DuplicateSku', 1;
    END

    DECLARE @newProductId INT;

    BEGIN TRY
        BEGIN TRAN;

        INSERT INTO [functional].[product] (
            [idAccount],
            [sku],
            [name],
            [description],
            [minimumStockLevel],
            [idUserCreated]
        )
        VALUES (
            @idAccount,
            @sku,
            @name,
            @description,
            @minimumStockLevel,
            @idUser
        );

        SET @newProductId = SCOPE_IDENTITY();

        IF @initialQuantity > 0
        BEGIN
            INSERT INTO [functional].[stockMovement] (
                [idAccount],
                [idProduct],
                [movementType], -- 1: ENTRADA
                [quantity],
                [reason],
                [idUser]
            )
            VALUES (
                @idAccount,
                @newProductId,
                1,
                @initialQuantity,
                'Cadastro Inicial',
                @idUser
            );
        END

        COMMIT TRAN;

        SELECT @newProductId AS idProduct;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;
        ;THROW;
    END CATCH;
END;
GO

-- File: functional/product/spProductDelete.sql
/**
 * @summary
 * Performs a soft delete on a product by setting its status to inactive.
 * If the product has a positive stock quantity, a final 'SAIDA' movement is created to zero it out.
 * The operation is transactional.
 *
 * @procedure spProductDelete
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - DELETE /api/v1/internal/product/{id}
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: The tenant account ID.
 * @param {INT} idUser
 *   - Required: Yes
 *   - Description: The ID of the user performing the action.
 * @param {INT} idProduct
 *   - Required: Yes
 *   - Description: The ID of the product to be deleted.
 *
 * @testScenarios
 * - Delete a product with zero stock.
 * - Delete a product with positive stock, verifying the final stock movement.
 * - Attempt to delete a product that does not exist or belongs to another account.
 * - Attempt to delete an already deleted product.
 */
CREATE OR ALTER PROCEDURE [functional].[spProductDelete]
    @idAccount INT,
    @idUser INT,
    @idProduct INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Parameter Validation
    IF @idAccount IS NULL OR @idUser IS NULL OR @idProduct IS NULL
    BEGIN
        ;THROW 51000, 'MissingRequiredParameters', 1;
    END

    DECLARE @currentQuantity INT;
    DECLARE @productStatus TINYINT;

    SELECT 
        @productStatus = prd.[status]
    FROM [functional].[product] prd
    WHERE prd.[idAccount] = @idAccount AND prd.[idProduct] = @idProduct AND prd.[deleted] = 0;

    IF @productStatus IS NULL
    BEGIN
        ;THROW 51000, 'ProductNotFound', 1;
    END

    IF @productStatus = 0 -- Inactive
    BEGIN
        ;THROW 51000, 'ProductAlreadyInactive', 1;
    END

    SELECT @currentQuantity = ps.[currentQuantity]
    FROM [functional].[productStock] ps
    WHERE ps.[idAccount] = @idAccount AND ps.[idProduct] = @idProduct;

    SET @currentQuantity = ISNULL(@currentQuantity, 0);

    BEGIN TRY
        BEGIN TRAN;

        -- If there's stock, create a final movement to zero it out.
        IF @currentQuantity > 0
        BEGIN
            INSERT INTO [functional].[stockMovement] (
                [idAccount],
                [idProduct],
                [movementType], -- 2: SAIDA
                [quantity],
                [reason],
                [idUser]
            )
            VALUES (
                @idAccount,
                @idProduct,
                2,
                @currentQuantity,
                'Exclusão de item do catálogo',
                @idUser
            );
        END

        -- Soft delete the product
        UPDATE [functional].[product]
        SET [status] = 0, -- Inactive
            [deleted] = 1,
            [idUserModified] = @idUser,
            [dateModified] = GETUTCDATE()
        WHERE [idAccount] = @idAccount AND [idProduct] = @idProduct;

        COMMIT TRAN;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRAN;
        ;THROW;
    END CATCH;
END;
GO

-- File: functional/product/spProductGet.sql
/**
 * @summary
 * Retrieves a single product's details, including its current stock quantity.
 *
 * @procedure spProductGet
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/product/{id}
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: The tenant account ID.
 * @param {INT} idProduct
 *   - Required: Yes
 *   - Description: The ID of the product to retrieve.
 *
 * @output {ProductDetails, 1, 1}
 * @column {INT} idProduct
 * @column {VARCHAR(50)} sku
 * @column {NVARCHAR(150)} name
 * @column {NVARCHAR(500)} description
 * @column {INT} minimumStockLevel
 * @column {TINYINT} status
 * @column {INT} currentQuantity
 *
 * @testScenarios
 * - Retrieve an existing product.
 * - Attempt to retrieve a product that does not exist or belongs to another account.
 */
CREATE OR ALTER PROCEDURE [functional].[spProductGet]
    @idAccount INT,
    @idProduct INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        prd.[idProduct],
        prd.[sku],
        prd.[name],
        prd.[description],
        prd.[minimumStockLevel],
        prd.[status],
        ISNULL(ps.[currentQuantity], 0) AS [currentQuantity]
    FROM [functional].[product] prd
    LEFT JOIN [functional].[productStock] ps ON ps.[idProduct] = prd.[idProduct]
    WHERE prd.[idAccount] = @idAccount
      AND prd.[idProduct] = @idProduct
      AND prd.[deleted] = 0;
END;
GO

-- File: functional/product/spProductList.sql
/**
 * @summary
 * Lists all active products for a given account, with optional search and pagination.
 * Includes the current stock quantity for each product.
 *
 * @procedure spProductList
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/product
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: The tenant account ID.
 * @param {NVARCHAR(150)} searchTerm
 *   - Required: No
 *   - Description: A search term to filter products by name or SKU.
 * @param {INT} pageNumber
 *   - Required: No
 *   - Description: The page number for pagination (1-based).
 * @param {INT} pageSize
 *   - Required: No
 *   - Description: The number of items per page.
 *
 * @output {ProductList, n, n}
 * @column {INT} idProduct
 * @column {VARCHAR(50)} sku
 * @column {NVARCHAR(150)} name
 * @column {INT} currentQuantity
 * @column {INT} minimumStockLevel
 * @column {TINYINT} status
 * @column {BIT} lowStockWarning
 *
 * @output {Pagination, 1, 1}
 * @column {INT} totalRecords
 *
 * @testScenarios
 * - List all products without filters.
 * - Search for products by name.
 * - Search for products by SKU.
 * - Test pagination logic.
 */
CREATE OR ALTER PROCEDURE [functional].[spProductList]
    @idAccount INT,
    @searchTerm NVARCHAR(150) = NULL,
    @pageNumber INT = 1,
    @pageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @offset INT = (@pageNumber - 1) * @pageSize;

    -- Result Set 1: Product List
    SELECT
        prd.[idProduct],
        prd.[sku],
        prd.[name],
        ISNULL(ps.[currentQuantity], 0) AS [currentQuantity],
        prd.[minimumStockLevel],
        prd.[status],
        CASE 
            WHEN ISNULL(ps.[currentQuantity], 0) <= prd.[minimumStockLevel] THEN 1
            ELSE 0
        END AS [lowStockWarning]
    FROM [functional].[product] prd
    LEFT JOIN [functional].[productStock] ps ON ps.[idProduct] = prd.[idProduct]
    WHERE prd.[idAccount] = @idAccount
      AND prd.[deleted] = 0
      AND prd.[status] = 1 -- Only active products
      AND (
          @searchTerm IS NULL OR 
          prd.[name] LIKE '%' + @searchTerm + '%' OR 
          prd.[sku] LIKE '%' + @searchTerm + '%'
      )
    ORDER BY prd.[name]
    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;

    -- Result Set 2: Total Count for Pagination
    SELECT COUNT(prd.[idProduct]) AS totalRecords
    FROM [functional].[product] prd
    WHERE prd.[idAccount] = @idAccount
      AND prd.[deleted] = 0
      AND prd.[status] = 1
      AND (
          @searchTerm IS NULL OR 
          prd.[name] LIKE '%' + @searchTerm + '%' OR 
          prd.[sku] LIKE '%' + @searchTerm + '%'
      );
END;
GO

-- File: functional/product/spProductUpdate.sql
/**
 * @summary
 * Updates the details of an existing product.
 *
 * @procedure spProductUpdate
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - PUT /api/v1/internal/product/{id}
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: The tenant account ID.
 * @param {INT} idUser
 *   - Required: Yes
 *   - Description: The ID of the user performing the action.
 * @param {INT} idProduct
 *   - Required: Yes
 *   - Description: The ID of the product to update.
 * @param {NVARCHAR(150)} name
 *   - Required: Yes
 *   - Description: The new name of the product.
 * @param {NVARCHAR(500)} description
 *   - Required: No
 *   - Description: The new description of the product.
 * @param {INT} minimumStockLevel
 *   - Required: Yes
 *   - Description: The new minimum stock level.
 * @param {TINYINT} status
 *   - Required: Yes
 *   - Description: The new status of the product (0 for Inactive, 1 for Active).
 *
 * @testScenarios
 * - Update a product's name and description.
 * - Change a product's status from active to inactive.
 * - Attempt to update a product that does not exist or belongs to another account.
 */
CREATE OR ALTER PROCEDURE [functional].[spProductUpdate]
    @idAccount INT,
    @idUser INT,
    @idProduct INT,
    @name NVARCHAR(150),
    @description NVARCHAR(500),
    @minimumStockLevel INT,
    @status TINYINT
AS
BEGIN
    SET NOCOUNT ON;

    -- Parameter Validation
    IF @idAccount IS NULL OR @idUser IS NULL OR @idProduct IS NULL OR @name IS NULL OR @minimumStockLevel IS NULL OR @status IS NULL
    BEGIN
        ;THROW 51000, 'MissingRequiredParameters', 1;
    END

    IF @minimumStockLevel < 0
    BEGIN
        ;THROW 51000, 'QuantityCannotBeNegative', 1;
    END

    IF NOT EXISTS (SELECT 1 FROM [functional].[product] prd WHERE prd.[idAccount] = @idAccount AND prd.[idProduct] = @idProduct AND prd.[deleted] = 0)
    BEGIN
        ;THROW 51000, 'ProductNotFound', 1;
    END

    UPDATE [functional].[product]
    SET
        [name] = @name,
        [description] = @description,
        [minimumStockLevel] = @minimumStockLevel,
        [status] = @status,
        [idUserModified] = @idUser,
        [dateModified] = GETUTCDATE()
    WHERE [idAccount] = @idAccount AND [idProduct] = @idProduct;
END;
GO

-- File: functional/stockMovement/spStockMovementCreate.sql
/**
 * @summary
 * Creates a new stock movement (ENTRADA, SAIDA, or AJUSTE).
 * For 'SAIDA', it validates if there is enough stock.
 * For 'AJUSTE', it calculates the difference and creates an appropriate ENTRADA or SAIDA movement.
 *
 * @procedure spStockMovementCreate
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - POST /api/v1/internal/stock-movement
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: The tenant account ID.
 * @param {INT} idUser
 *   - Required: Yes
 *   - Description: The ID of the user performing the action.
 * @param {INT} idProduct
 *   - Required: Yes
 *   - Description: The ID of the product being moved.
 * @param {NVARCHAR(10)} movementType
 *   - Required: Yes
 *   - Description: The type of movement ('ENTRADA', 'SAIDA', 'AJUSTE').
 * @param {INT} quantity
 *   - Required: Yes
 *   - Description: For ENTRADA/SAIDA, the amount to move. For AJUSTE, the new total quantity.
 * @param {NVARCHAR(255)} reason
 *   - Required: No (but mandatory for SAIDA and AJUSTE).
 *   - Description: The reason for the movement.
 *
 * @testScenarios
 * - Create a valid ENTRADA movement.
 * - Create a valid SAIDA movement with sufficient stock.
 * - Attempt a SAIDA movement with insufficient stock.
 * - Create an AJUSTE movement that results in an ENTRADA.
 * - Create an AJUSTE movement that results in a SAIDA.
 */
CREATE OR ALTER PROCEDURE [functional].[spStockMovementCreate]
    @idAccount INT,
    @idUser INT,
    @idProduct INT,
    @movementType NVARCHAR(10),
    @quantity INT,
    @reason NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Parameter Validation
    IF @idAccount IS NULL OR @idUser IS NULL OR @idProduct IS NULL OR @movementType IS NULL OR @quantity IS NULL
    BEGIN
        ;THROW 51000, 'MissingRequiredParameters', 1;
    END

    IF @movementType IN ('SAIDA', 'AJUSTE') AND (@reason IS NULL OR LTRIM(RTRIM(@reason)) = '')
    BEGIN
        ;THROW 51000, 'ReasonIsRequired', 1;
    END

    IF NOT EXISTS (SELECT 1 FROM [functional].[product] prd WHERE prd.[idAccount] = @idAccount AND prd.[idProduct] = @idProduct AND prd.[status] = 1 AND prd.[deleted] = 0)
    BEGIN
        ;THROW 51000, 'ProductNotFoundOrInactive', 1;
    END

    DECLARE @currentQuantity INT;
    SELECT @currentQuantity = ISNULL(ps.[currentQuantity], 0)
    FROM [functional].[productStock] ps
    WHERE ps.[idAccount] = @idAccount AND ps.[idProduct] = @idProduct;

    DECLARE @dbMovementType TINYINT;
    DECLARE @dbQuantity INT;

    IF @movementType = 'ENTRADA'
    BEGIN
        IF @quantity <= 0
        BEGIN
            ;THROW 51000, 'QuantityMustBePositive', 1;
        END
        SET @dbMovementType = 1; -- ENTRADA
        SET @dbQuantity = @quantity;
    END
    ELSE IF @movementType = 'SAIDA'
    BEGIN
        IF @quantity <= 0
        BEGIN
            ;THROW 51000, 'QuantityMustBePositive', 1;
        END
        IF @quantity > @currentQuantity
        BEGIN
            ;THROW 51000, 'InsufficientStock', 1;
        END
        SET @dbMovementType = 2; -- SAIDA
        SET @dbQuantity = @quantity;
    END
    ELSE IF @movementType = 'AJUSTE'
    BEGIN
        IF @quantity < 0
        BEGIN
            ;THROW 51000, 'AdjustedQuantityCannotBeNegative', 1;
        END
        
        DECLARE @diff INT = @quantity - @currentQuantity;

        IF @diff > 0
        BEGIN
            SET @dbMovementType = 1; -- ENTRADA
            SET @dbQuantity = @diff;
        END
        ELSE IF @diff < 0
        BEGIN
            SET @dbMovementType = 2; -- SAIDA
            SET @dbQuantity = -@diff;
        END
        ELSE
        BEGIN
            -- No change, so no movement needed.
            RETURN;
        END
    END
    ELSE
    BEGIN
        ;THROW 51000, 'InvalidMovementType', 1;
    END

    INSERT INTO [functional].[stockMovement] (
        [idAccount],
        [idProduct],
        [movementType],
        [quantity],
        [reason],
        [idUser]
    )
    VALUES (
        @idAccount,
        @idProduct,
        @dbMovementType,
        @dbQuantity,
        @reason,
        @idUser
    );
END;
GO

-- File: functional/stockMovement/spStockMovementList.sql
/**
 * @summary
 * Retrieves the history of stock movements with filtering and pagination.
 *
 * @procedure spStockMovementList
 * @schema functional
 * @type stored-procedure
 *
 * @endpoints
 * - GET /api/v1/internal/stock-movement/history
 *
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: The tenant account ID.
 * @param {INT} idProduct
 *   - Required: No
 *   - Description: Filter history for a specific product.
 * @param {TINYINT} movementType
 *   - Required: No
 *   - Description: Filter by movement type (1 for ENTRADA, 2 for SAIDA).
 * @param {DATETIME2} dateStart
 *   - Required: No
 *   - Description: The start of the date range filter.
 * @param {DATETIME2} dateEnd
 *   - Required: No
 *   - Description: The end of the date range filter.
 * @param {INT} pageNumber
 *   - Required: No
 *   - Description: The page number for pagination (1-based).
 * @param {INT} pageSize
 *   - Required: No
 *   - Description: The number of items per page.
 *
 * @output {MovementHistory, n, n}
 * @column {BIGINT} idStockMovement
 * @column {NVARCHAR(150)} productName
 * @column {VARCHAR(50)} productSku
 * @column {TINYINT} movementType
 * @column {INT} quantity
 * @column {NVARCHAR(255)} reason
 * @column {NVARCHAR(100)} userName
 * @column {DATETIME2} movementDate
 *
 * @output {Pagination, 1, 1}
 * @column {INT} totalRecords
 *
 * @testScenarios
 * - List all movements.
 * - Filter by product.
 * - Filter by date range.
 * - Test pagination.
 */
CREATE OR ALTER PROCEDURE [functional].[spStockMovementList]
    @idAccount INT,
    @idProduct INT = NULL,
    @movementType TINYINT = NULL,
    @dateStart DATETIME2 = NULL,
    @dateEnd DATETIME2 = NULL,
    @pageNumber INT = 1,
    @pageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @offset INT = (@pageNumber - 1) * @pageSize;

    -- Result Set 1: Movement History
    SELECT
        sm.[idStockMovement],
        prd.[name] AS [productName],
        prd.[sku] AS [productSku],
        sm.[movementType],
        sm.[quantity],
        sm.[reason],
        usr.[name] AS [userName],
        sm.[movementDate]
    FROM [functional].[stockMovement] sm
    JOIN [functional].[product] prd ON prd.[idProduct] = sm.[idProduct]
    JOIN [security].[user] usr ON usr.[idUser] = sm.[idUser]
    WHERE sm.[idAccount] = @idAccount
      AND (@idProduct IS NULL OR sm.[idProduct] = @idProduct)
      AND (@movementType IS NULL OR sm.[movementType] = @movementType)
      AND (@dateStart IS NULL OR sm.[movementDate] >= @dateStart)
      AND (@dateEnd IS NULL OR sm.[movementDate] <= @dateEnd)
    ORDER BY sm.[movementDate] DESC
    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;

    -- Result Set 2: Total Count for Pagination
    SELECT COUNT(sm.[idStockMovement]) AS totalRecords
    FROM [functional].[stockMovement] sm
    WHERE sm.[idAccount] = @idAccount
      AND (@idProduct IS NULL OR sm.[idProduct] = @idProduct)
      AND (@movementType IS NULL OR sm.[movementType] = @movementType)
      AND (@dateStart IS NULL OR sm.[movementDate] >= @dateStart)
      AND (@dateEnd IS NULL OR sm.[movementDate] <= @dateEnd);
END;
GO


-- ============================================
-- Migration completed successfully
-- ============================================

PRINT 'Migration completed successfully!';
GO
