import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Import routes
  const employeeRoutes = (await import("./server/routes/employeeRoutes")).default;
  const payrollRoutes = (await import("./server/routes/payrollRoutes")).default;
  const aiRoutes = (await import("./server/routes/aiRoutes")).default;
  const adminRoutes = (await import("./server/routes/adminRoutes")).default;
  const { seedData } = await import("./server/controllers/seedController");
  const { adminDb } = await import("./server/firebaseAdmin");

  // API Routes
  app.use("/api/employees", employeeRoutes);
  app.use("/api/payroll", payrollRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/admins", adminRoutes);
  app.post("/api/seed", seedData);
  
  app.get("/api/health", async (req, res) => {
    let firestoreStatus = "unknown";
    try {
      await adminDb.collection("test").limit(1).get();
      firestoreStatus = "connected";
    } catch (err: any) {
      firestoreStatus = `error: ${err.message}`;
    }
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      firestore: firestoreStatus,
      env: {
        node: process.env.NODE_ENV,
        hasProjectId: !!(process.env.VITE_FIREBASE_PROJECT_ID),
        hasDatabaseId: !!(process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID)
      }
    });
  });

  // Placeholder for modular routes
  // app.use("/api/auth", authRoutes);
  // app.use("/api/employees", employeeRoutes);
  // app.use("/api/payroll", payrollRoutes);
  // app.use("/api/ai", aiRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 ZenPayroll Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
