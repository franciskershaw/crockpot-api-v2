import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./core/config/database";
import "colors";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the crockpot API" });
});

// Connect to DB and start the server
connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}\n`
          .yellow,
        "-----------------------------------------------------------".yellow
      );
    });
  })
  .catch((err) => {
    console.error(
      `Error connecting to MongoDB: ${err.message}`.red.underline.bold
    );
    process.exit(1);
  });
