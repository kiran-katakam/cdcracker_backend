import express from "express"
import mongoose from "mongoose";
import Course from "../../models/Course.js";
import Assessment from "../../models/Assessment.js";

const app = express();

const assessmentTypes = ["coding", "mcq", "mixed"]

app.get("/courses/:id/assessments", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid course Id" })
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const assessments = await Assessment.find({ courseId: id });
        return res.status(200).json(assessments);

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

app.get("/courses/:id/assessments/:assessmentId", async (req, res) => {
    try {
        const { id, assessmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid course Id" })
        }

        if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
            return res.status(400).json({ message: "Invalid assessment Id" })
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const assessment = await Assessment.findOne({ _id: assessmentId, courseId: id });
        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }

        return res.status(200).json(assessment);

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

app.post("/courses/:id/assessments", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid course Id" })
        }

        if (!req.body) {
            return res.status(400).json({ message: "Body required" })
        }

        const { name = null, startDate = null, endDate = null, assessmentType = null } = req.body;

        if (!name || !startDate || !endDate || !assessmentType) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (!assessmentTypes.includes(assessmentType)) {
            return res.status(400).json({ message: "Invalid assessment type" });
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const exists = await Assessment.findOne({ name: name, courseId: id })
        if (exists) {
            return res.status(400).json({ message: "Assessment already exists" })
        }

        const assessment = new Assessment({
            courseId: id,
            name: name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            assessmentType: assessmentType
        });

        await assessment.save();
        return res.status(201).json({ message: "Assessment created successfully" })

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

app.put("/courses/:id/assessments/:assessmentId", async (req, res) => {
    try {
        const { id, assessmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid course Id" })
        }

        if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
            return res.status(400).json({ message: "Invalid assessment Id" })
        }

        if (!req.body) {
            return res.status(400).json({ message: "Body required" })
        }

        const { name = null, startDate = null, endDate = null, assessmentType = null } = req.body;

        if (assessmentType != null && !assessmentTypes.includes(assessmentType)) {
            return res.status(400).json({ message: "Invalid assessment type" })
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const assessment = await Assessment.findOne({ _id: assessmentId, courseId: id });
        if (!assessment) {
            return res.status(404).json({ message: "Assessment not found" });
        }

        const updated = {
            name: name == null ? assessment.name : name,
            startDate: startDate == null ? assessment.startDate : new Date(startDate),
            endDate: endDate == null ? assessment.endDate : new Date(endDate),
            assessmentType: assessmentType == null ? assessment.assessmentType : assessmentType
        }

        await Assessment.findByIdAndUpdate(assessmentId, updated);
        return res.status(200).json({ message: "Assessment updated successfully" })

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

app.delete("/courses/:id/assessments/:assessmentId", async (req, res) => {
    try {
        const { id, assessmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid course Id" })
        }

        if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
            return res.status(400).json({ message: "Invalid assessment Id" })
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const deleted = await Assessment.findOneAndDelete({ _id: assessmentId, courseId: id });
        if (!deleted) {
            return res.status(404).json({ message: "Assessment not found" });
        }

        return res.status(200).json({ message: "Assessment deleted successfully" });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

export default app;