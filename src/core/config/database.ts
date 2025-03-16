import mongoose from "mongoose";

// Function to connect to MongoDB
const connectDb = (): Promise<typeof mongoose> => {
  const mongoUri = process.env.MONGO_URI;

  // Ensure mongoUri is defined
  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in the environment variables.");
  }

  return new Promise((resolve, reject) => {
    mongoose
      .connect(mongoUri)
      .then((db) => {
        console.log(
          "-------------------------------------------------------------".cyan
        );
        console.log(`MongoDB Connected: ${db.connection.host}`.cyan);
        resolve(db);
      })
      .catch((err) => {
        console.error(
          `Error connecting to MongoDB: ${err.message}`.red.underline.bold
        );
        reject(err);
      });
  });
};

export default connectDb;
