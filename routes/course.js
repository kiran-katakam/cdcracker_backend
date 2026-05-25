import mongoose from "mongoose";
import express from "express";
import Course from "../models/Course.js";
import authenticateToken from "../middleware/auth.js";
import Assessment from "../models/Assessment.js";
import McQuestion from "../models/McQuestion.js";
import CodingQuestion from "../models/CodingQuestion.js";

const app = express();

const courseTypes = ["mcq", "coding", "mixed"]

app.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find();
        return res.status(200).json(courses);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

app.get("/courses/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid course Id" })
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        return res.status(200).json(course)

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

app.post("/courses", authenticateToken, async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Body required" })
        }

        const { name = null, startDate = null, endDate = null, courseType = null } = req.body;

        if (!name || !startDate || !endDate || !courseType) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!courseTypes.includes(courseType)) {
            return res.status(400).json({ message: "Invalid course type" })
        }

        const exists = await Course.findOne({ name: name });
        if (exists) {
            return res.status(400).json({ message: "Course already exists" })
        }

        const course = new Course({
            name: name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            courseType: courseType
        })

        await course.save();
        return res.status(201).json({ message: "Course created successfully" })

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

app.put("/courses/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid course Id" })
        }

        if (!req.body) {
            return res.status(400).json({ message: "Body required" })
        }

        const { name = null, startDate = null, endDate = null, courseType = null } = req.body;

        if (courseType != null && !courseTypes.includes(courseType)) {
            return res.status(400).json({ message: "Invalid course type" })
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        const updated = {
            name: name == null ? course.name : name,
            startDate: startDate == null ? course.startDate : new Date(startDate),
            endDate: endDate == null ? course.endDate : new Date(endDate),
            courseType: courseType == null ? course.courseType : courseType
        }

        await Course.findByIdAndUpdate(id, updated);
        return res.status(200).json({ message: "Course updated successfully" })

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

app.delete("/courses/:id", authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Id" })
        }

        const deleted = await Course.findByIdAndDelete(id);

        await CodingQuestion.deleteMany({ courseId: id })

        await McQuestion.deleteMany({ courseId: id })

        await Assessment.deleteMany({ courseId: id });

        if (!deleted) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.status(200).json({ message: "Course deleted successfully" });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

export default app;