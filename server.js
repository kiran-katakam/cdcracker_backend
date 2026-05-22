import express, { json } from "express";
import mongoose from "./config/mongoDB.js";
import adminCourse from "./routes/admin/course.js"

const app = express()
app.use(json())

app.use("/admin", adminCourse);

app.get("/", (req, res) => {
    res.status(200).send("Okay")
})

app.listen(3000, () => {
    console.log("CDCracker is Ready....")
})