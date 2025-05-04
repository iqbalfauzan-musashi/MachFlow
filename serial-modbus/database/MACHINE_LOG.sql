CREATE DATABASE MACHINE_LOG;
GO


CREATE TABLE [dbo].[Machine_48042] (
   [ID]              INT            IDENTITY (1, 1) NOT NULL,
   [MachineCode]     NVARCHAR (50)  NOT NULL,
   [MachineName]     NVARCHAR (100) NOT NULL,
   [OPERATION_NAME]  NVARCHAR (100) NOT NULL,
   [MACHINE_COUNTER] INT            NOT NULL,
   [SEND_PLC]        INT            NOT NULL,
   [CreatedAt]       DATETIME2 (7)  NOT NULL,
   PRIMARY KEY CLUSTERED ([ID] ASC)
);

GO
CREATE NONCLUSTERED INDEX [IX_Machine_48042_CreatedAt]
   ON [dbo].[Machine_48042]([CreatedAt] ASC);


   USE MACHINE_LOG; -- Change to your database name
GO

DECLARE @StartDateTime DATETIME2(7) = '2025-05-04 00:00:00.000';
DECLARE @MachineCode NVARCHAR(50) = '48042';
DECLARE @MachineName NVARCHAR(100) = 'ALGT:12116-48042:E3-K56 SPRCKT CAM';
DECLARE @MACHINE_COUNTER INT = 36963; -- Starting counter
DECLARE @SEND_PLC INT = 17; -- Assuming SEND_PLC is constant
DECLARE @i INT = 0;
DECLARE @TotalRecords INT = 96; -- 24 hours * 4 (15min intervals)

WHILE @i < @TotalRecords
BEGIN
    DECLARE @OperationName NVARCHAR(100);

    -- Alternate between 'NORMAL OPERATION' and 'CHOKOTEI'
    IF (@i % 2) = 0
        SET @OperationName = 'NORMAL OPERATION';
    ELSE
        SET @OperationName = 'CHOKOTEI';

    INSERT INTO [dbo].[Machine_48042] (
        [MachineCode],
        [MachineName],
        [OPERATION_NAME],
        [MACHINE_COUNTER],
        [SEND_PLC],
        [CreatedAt]
    )
    VALUES (
        @MachineCode,
        @MachineName,
        @OperationName,
        @MACHINE_COUNTER,
        @SEND_PLC,
        DATEADD(MINUTE, 15 * @i, @StartDateTime)
    );

    SET @MACHINE_COUNTER = @MACHINE_COUNTER + 1;
    SET @i = @i + 1;
END

