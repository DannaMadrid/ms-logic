const express = require("express");
const database = require("./database/database");
const bodyparser = require("body-parser");
//const routes = require("./routes/routes");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// --- Health check sencillo ---
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    ts: new Date().toISOString(),
    db: app.locals.dbKind || "unknown",
  });
});

// --- Ping explícito a la DB ---
app.get("/db-ping", async (_req, res) => {
  try {
    if (app.locals.dbKind === "prisma" && app.locals.prisma) {
      await app.locals.prisma.$queryRaw`SELECT 1`;
      return res.json({ db: "ok", kind: "prisma" });
    }
    if (app.locals.dbKind === "mongoose" && app.locals.mongoose) {
      // ping en Mongo
      const ok = await app.locals.mongoose.connection.db.admin().ping();
      return res.json({ db: "ok", kind: "mongoose", result: ok });
    }
    return res.status(503).json({ db: "not_connected" });
  } catch (e) {
    console.error("DB ping error:", e);
    return res.status(500).json({ db: "error", message: e.message });
  }
});


// --- Arranque: conecta DB y luego escucha ---
(async () => {
  try {
    const conn = await database();

    // Soporta ambas variantes de database():
    //  - Prisma-solo: retorna instancia PrismaClient
    //  - Híbrida: retorna { kind: 'prisma'|'mongoose', client: instancia }
    if (conn && typeof conn === "object" && "kind" in conn) {
      app.locals.dbKind = conn.kind;
      if (conn.kind === "prisma") app.locals.prisma = conn.client;
      if (conn.kind === "mongoose") app.locals.mongoose = conn.client;
    } else if (conn) {
      app.locals.dbKind = "prisma";
      app.locals.prisma = conn;
    } else {
      app.locals.dbKind = "none";
    }

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Fatal error starting server:", err);
    process.exit(1);
  }
})();
