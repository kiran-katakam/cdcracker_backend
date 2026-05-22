import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ quiet: true })

await mongoose.connect(process.env.MONGO_URI, { dbName: "test" }).then(() => {
    console.log("Connected to DB")
}).catch((e) => {
    console.log(`Failed to connect to DB ${e}`)
})

export default mongoose;