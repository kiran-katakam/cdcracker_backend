import express from "express";
import dotenv from "dotenv";

const app = express()

app.get("/", (req, res) => {
    res.send("Okay")
})

app.listen(3000, () => {
    console.log("Ready To Crack...")
})