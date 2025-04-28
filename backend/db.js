// backend/db.js
const sql = require("mssql");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Check if .env file exists and log the path for debugging
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Checking for .env file at: ${envPath}`);
console.log(`Does .env file exist? ${fs.existsSync(envPath)}`);

// Log the environment variables for debugging
console.log('Environment Variables:');
console.log(`DB1_SERVER: ${process.env.DB1_SERVER}`);
console.log(`DB1_DATABASE: ${process.env.DB1_DATABASE}`);
console.log(`DB1_USER: ${process.env.DB1_USER}`);
console.log(`DB1_PASSWORD: ${process.env.DB1_PASSWORD ? '***' : 'Not set'}`);
console.log(`DB1_PORT: ${process.env.DB1_PORT}`);

/**
 * DATABASE 1: IOT_HUB
 * Tables: CODE_MACHINE_PRODUCTION, HISTORY_MACHINE_PRODUCTION,
 * MACHINE_STATUS_PRODUCTION, MachineData
 */
const configDB1 = {
  user: process.env.DB1_USER || "MES_IOT",
  password: process.env.DB1_PASSWORD || "Musashi123",
  server: process.env.DB1_SERVER || "10.41.51.2",
  database: process.env.DB1_DATABASE || "IOT_HUB",
  port: parseInt(process.env.DB1_PORT) || 1433,
  options: {
    encrypt: process.env.DB1_ENCRYPT === "true",
    trustServerCertificate: process.env.DB1_TRUST_CERT === "true",
    connectTimeout: 30000, // 30 seconds
    requestTimeout: 30000, // 30 seconds
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  },
};

/**
 * DATABASE 2: DEPT_MANUFACTURING
 * Tables: INVENTORY_PARTS, INVENTORY_SPAREPART, USER_JOBLIST,
 * USER_JOBLIST_HISTORY, USER_NAME
 */
const configDB2 = {
  user: process.env.DB2_USER || "MES_IOT",
  password: process.env.DB2_PASSWORD || "Musashi123",
  server: process.env.DB2_SERVER || "10.41.51.2",
  database: process.env.DB2_DATABASE || "DEPT_MANUFACTURING",
  port: parseInt(process.env.DB2_PORT) || 1433,
  options: {
    encrypt: process.env.DB2_ENCRYPT === "true",
    trustServerCertificate: process.env.DB2_TRUST_CERT === "true",
    connectTimeout: 30000, // 30 seconds
    requestTimeout: 30000, // 30 seconds
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  },
};

/**
 * DATABASE 3: MACHINE_LOG
 * No specific tables identified in the provided code
 */
const configDB3 = {
  user: process.env.DB3_USER || "MES_IOT",
  password: process.env.DB3_PASSWORD || "Musashi123",
  server: process.env.DB3_SERVER || "10.41.51.2",
  database: process.env.DB3_DATABASE || "MACHINE_LOG",
  port: parseInt(process.env.DB3_PORT) || 1433,
  options: {
    encrypt: process.env.DB3_ENCRYPT === "true",
    trustServerCertificate: process.env.DB3_TRUST_CERT === "true",
    connectTimeout: 30000, // 30 seconds
    requestTimeout: 30000, // 30 seconds
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  },
};

// Function to test database connection
const testConnection = async (config, dbName) => {
  try {
    const pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log(`✅ Connected to ${dbName} database successfully.`);
    await pool.close();
    return true;
  } catch (error) {
    console.error(`❌ Error connecting to ${dbName} database:`, error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    return false;
  }
};

// Function to connect to all databases
const connectDatabases = async () => {
  try {
    console.log("Attempting to connect to all databases...");
    
    // Test connections first
    await testConnection(configDB1, process.env.DB1_DATABASE || "IOT_HUB");
    await testConnection(configDB2, process.env.DB2_DATABASE || "DEPT_MANUFACTURING");
    await testConnection(configDB3, process.env.DB3_DATABASE || "MACHINE_LOG");
    
    // Connect to Database 1 (IOT_HUB)
    const poolDB1 = await new sql.ConnectionPool(configDB1).connect();
    console.log(`Connected to ${process.env.DB1_DATABASE || "IOT_HUB"} Database (IOT_HUB)`);

    // Connect to Database 2 (DEPT_MANUFACTURING)
    const poolDB2 = await new sql.ConnectionPool(configDB2).connect();
    console.log(`Connected to ${process.env.DB2_DATABASE || "DEPT_MANUFACTURING"} Database (DEPT_MANUFACTURING)`);

    // Connect to Database 3 (MACHINE_LOG)
    const poolDB3 = await new sql.ConnectionPool(configDB3).connect();
    console.log(`Connected to ${process.env.DB3_DATABASE || "MACHINE_LOG"} Database (MACHINE_LOG)`);

    // Return the database connection objects
    return {
      iotHub: poolDB1, // DB1: IOT_HUB
      deptMfg: poolDB2, // DB2: DEPT_MANUFACTURING
      plcData: poolDB3, // DB3: MACHINE_LOG
    };
  } catch (error) {
    console.error("Error connecting to SQL Servers:", error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    throw error;
  }
};

module.exports = {
  connectDatabases,
  configDB1,
  configDB2,
  configDB3,
  testConnection,
};