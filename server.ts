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

  // API Routes
  app.use("/api/employees", employeeRoutes);
  app.use("/api/payroll", payrollRoutes);
  app.use("/api/ai", aiRoutes);
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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
