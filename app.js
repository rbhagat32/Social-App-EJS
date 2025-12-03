import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { cronJob } from "./config/cron.js";
import { connectDB } from "./config/mongoose-connection.js";
import { AuthRouter } from "./routes/auth.js";
import { PostRouter } from "./routes/post.js";
import { UserRouter } from "./routes/user.js";

configDotenv();
const app = express();
connectDB();
cronJob.start();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.use("/", AuthRouter);
app.use("/", UserRouter);
app.use("/", PostRouter);
app.get("/cron", (_req, res) => {
  res.status(200).send("Cron job endpoint reached");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
