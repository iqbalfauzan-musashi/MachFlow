// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { connectDatabases, testConnection, configDB1, configDB2, configDB3 } = require("./db");

// Log environment details for debugging
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Current directory: ${process.cwd()}`);

const app = express();

// Extract environment variables with fallbacks
const PORT = process.env.BACKEND_PORT || 3001;
const HOST = process.env.BACKEND_HOST || '0.0.0.0';
const API_PREFIX = process.env.API_PREFIX || '/api';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const CORS_METHODS = process.env.CORS_METHODS || 'GET,POST,PUT,DELETE';
const CORS_HEADERS = process.env.CORS_HEADERS || 'Content-Type,Authorization';

// Middleware
app.use(express.json());

// Dynamic CORS configuration from environment variables
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: CORS_METHODS.split(","),
    allowedHeaders: CORS_HEADERS.split(","),
    credentials: true,
  })
);

// Check if .env file exists
const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.warn("Warning: .env file not found at:", envPath);
  console.log("Using default environment variables.");
}

// Async function to initialize server
const startServer = async () => {
  try {
    console.log("Testing database connections before server start...");
    
    // Test connections before fully connecting
    const db1Status = await testConnection(configDB1, "IOT_HUB");
    const db2Status = await testConnection(configDB2, "DEPT_MANUFACTURING");
    const db3Status = await testConnection(configDB3, "MACHINE_LOG");
    
    if (!db1Status || !db2Status || !db3Status) {
      console.warn("Warning: Some database connections failed. Server will still attempt to start.");
    }

    // Connect to all databases
    const databases = await connectDatabases();

    // Add database connections to global scope for access throughout the application
    global.databases = databases;

    // Import routes
    // Routes using DEPT_MANUFACTURING (DB2)
    const inventoryRouter = require("./routes/inventory");
    const authRouter = require("./routes/auth");
    const jobListRouter = require("./routes/joblist");
    const historyJobListRouter = require("./routes/history_joblist");
    const machineDetailRouter = require("./routes/machine_detail");

    // Routes using IOT_HUB (DB1)
    const machineNameRouter = require("./routes/machine_name");
    const machineStatusRouter = require("./routes/machine_status");
    const machineHistoryRouter = require("./routes/machine_history");

    // Register routes for DEPT_MANUFACTURING (DB2)
    app.use(`${API_PREFIX}/inventory`, inventoryRouter);
    app.use(`${API_PREFIX}/auth`, authRouter);
    app.use(`${API_PREFIX}/job-list`, jobListRouter);
    app.use(`${API_PREFIX}/job-history`, historyJobListRouter);

    // Register routes for IOT_HUB (DB1)
    app.use(`${API_PREFIX}/machine-names`, machineNameRouter);
    app.use(`${API_PREFIX}/machine-status`, machineStatusRouter);
    app.use(`${API_PREFIX}/machine-history`, machineHistoryRouter);
    app.use(`${API_PREFIX}/machine-detail`, machineDetailRouter);

    // Health check endpoint
    app.get(`${API_PREFIX}/health`, (req, res) => {
      res.status(200).json({
        status: "ok",
        message: "Server is running",
        databases: {
          db1: {
            name: process.env.DB1_DATABASE || "IOT_HUB",
            connected: !!databases.iotHub
          },
          db2: {
            name: process.env.DB2_DATABASE || "DEPT_MANUFACTURING",
            connected: !!databases.deptMfg
          },
          db3: {
            name: process.env.DB3_DATABASE || "MACHINE_LOG",
            connected: !!databases.plcData
          }
        },
        serverTime: new Date().toISOString()
      });
    });

    // Create HTTP server
    const server = http.createServer(app);

    // Setup WebSocket server
    const setupWebSocketServer = require("./websockets");
    const wsServer = setupWebSocketServer(server);

    // Start HTTP server (which also handles WebSockets)
    server.listen(PORT, HOST, () => {
      console.log(`⚡️ Server running on http://${HOST}:${PORT}`);
      console.log(`API available at http://${HOST}:${PORT}${API_PREFIX}`);
      console.log(`Health check at http://${HOST}:${PORT}${API_PREFIX}/health`);
      console.log(`WebSocket server enabled`);
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      wsServer.close();
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT signal received: closing HTTP server");
      wsServer.close();
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    console.error("Server will exit. Please check your database connection and configuration.");
    process.exit(1);
  }
};

// Start the server
startServer();