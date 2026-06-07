import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import dotenv from "dotenv";
import { warmupCache } from "./utils/cache.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

try {
    await warmupCache();
} catch (err) {
    console.error("[cache] error en warmup:",err);
    process.exit(1);
}

app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
app.use(helmet());
app.use(express.json({ limit: "10mb" }));

const { router: apiRouter } = await import("./routes/index.js");
app.use("/api", apiRouter);

app.get("/", (req, res) => {
    res.send("API funcionando.");
});

app.listen(PORT, (e) => {
    if (e) {
        console.error("Error iniciando servidor: ", e);
    } else {
        console.log(`Servidor en puerto: ${PORT}`);
    }
});