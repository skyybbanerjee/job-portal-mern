import mongoose from "mongoose";

//f(x) to connect to the MongoDb DB
async function connectDB() {
  mongoose.connection.on("connected", () =>
    console.log("Database connected ✅")
  );
  await mongoose.connect(`${process.env.MONGODB_URI}/job-portal`);
}

export default connectDB;
