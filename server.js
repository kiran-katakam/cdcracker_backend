import express, { json } from "express";
import mongoose from "./config/mongoDB.js";
import assessmentRoutes from "./routes/assessment.js"
import codingQuestionRoutes from "./routes/codingQuestion.js"
import courseRoutes from "./routes/course.js"
import mcQuestionRoutes from "./routes/mcQuestion.js"
import adminAuthRoutes from "./routes/auth.js"
import cors from "cors"

const app = express()
app.use(cors())
app.use(json())

app.use("/", assessmentRoutes);
app.use("/", codingQuestionRoutes);
app.use("/", courseRoutes);
app.use("/", mcQuestionRoutes);
app.use("/", adminAuthRoutes);

app.get("/", (req, res) => {
    res.status(200).send("Okay")
})

app.listen(3000, () => {
    console.log("CDCracker is Ready....")
})