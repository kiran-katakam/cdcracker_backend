import express from "express"
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Assessment from "../models/Assessment.js";
import CodingQuestion from "../models/CodingQuestion.js";
import authenticateToken from "../middleware/auth.js";

const app = express();

const supportedLanguages = ["java", "python", "c", "c++", "sql"];

app.get("/courses/:id/assessments/:assessmentId/coding", async (req, res) => {
    try {
        const { id, assessmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid course Id" });

        if (!mongoose.Types.ObjectId.isValid(assessmentId))
            return res.status(400).json({ message: "Invalid assessment Id" });

        const course = await Course.findById(id);
        if (!course)
            return res.status(404).json({ message: "Course not found" });

        const assessment = await Assessment.findOne({ _id: assessmentId, courseId: id });
        if (!assessment)
            return res.status(404).json({ message: "Assessment not found" });

        const questions = await CodingQuestion.find({ assessmentId, courseId: id });
        return res.status(200).json(questions);

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/courses/:id/assessments/:assessmentId/coding/:questionId", async (req, res) => {
    try {
        const { id, assessmentId, questionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid course Id" });

        if (!mongoose.Types.ObjectId.isValid(assessmentId))
            return res.status(400).json({ message: "Invalid assessment Id" });

        if (!mongoose.Types.ObjectId.isValid(questionId))
            return res.status(400).json({ message: "Invalid question Id" });

        const course = await Course.findById(id);

        if (!course)
            return res.status(404).json({ message: "Course not found" });

        const assessment = await Assessment.findOne({ _id: assessmentId, courseId: id });

        if (!assessment)
            return res.status(404).json({ message: "Assessment not found" });

        const question = await CodingQuestion.findOne({ _id: questionId, assessmentId, courseId: id });

        if (!question)
            return res.status(404).json({ message: "Coding question not found" });

        return res.status(200).json(question);

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/courses/:id/assessments/:assessmentId/coding", authenticateToken, async (req, res) => {
    try {
        const { id, assessmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid course Id" });

        if (!mongoose.Types.ObjectId.isValid(assessmentId))
            return res.status(400).json({ message: "Invalid assessment Id" });

        if (!req.body)
            return res.status(400).json({ message: "Body required" });

        const { code = null, language = null, question = null } = req.body;

        if (!code || !language || !question)
            return res.status(400).json({ message: "All fields are required" });

        if (!supportedLanguages.includes(language))
            return res.status(400).json({ message: "Invalid language" });

        const course = await Course.findById(id);
        if (!course)
            return res.status(404).json({ message: "Course not found" });

        const assessment = await Assessment.findOne({ _id: assessmentId, courseId: id });
        if (!assessment)
            return res.status(404).json({ message: "Assessment not found" });

        // Optional: only allow coding questions on compatible assessment types
        if (assessment.assessmentType === "mcq")
            return res.status(400).json({ message: "Cannot add coding questions to an MCQ assessment" });

        const codingQuestion = new CodingQuestion({
            courseId: id,
            assessmentId: assessmentId,
            code: code,
            question: question,
            language: language
        });

        await codingQuestion.save();
        return res.status(201).json({ message: "Coding question created successfully" });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.put("/courses/:id/assessments/:assessmentId/coding/:questionId", authenticateToken, async (req, res) => {
    try {
        const { id, assessmentId, questionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid course Id" });

        if (!mongoose.Types.ObjectId.isValid(assessmentId))
            return res.status(400).json({ message: "Invalid assessment Id" });

        if (!mongoose.Types.ObjectId.isValid(questionId))
            return res.status(400).json({ message: "Invalid question Id" });

        if (!req.body)
            return res.status(400).json({ message: "Body required" });

        const { code = null, language = null, question = null } = req.body;

        if (language != null && !supportedLanguages.includes(language))
            return res.status(400).json({ message: "Invalid language" });

        const course = await Course.findById(id);
        if (!course)
            return res.status(404).json({ message: "Course not found" });

        const assessment = await Assessment.findOne({ _id: assessmentId, courseId: id });
        if (!assessment)
            return res.status(404).json({ message: "Assessment not found" });

        const codingQuestion = await CodingQuestion.findOne({ _id: questionId, assessmentId, courseId: id });
        if (!codingQuestion)
            return res.status(404).json({ message: "Coding question not found" });

        const updated = {
            code: code == null ? question.code : code,
            question: question == null ? codingQuestion.question:  question,
            language: language == null ? question.language : language
        };

        await CodingQuestion.findByIdAndUpdate(questionId, updated);
        return res.status(200).json({ message: "Coding question updated successfully" });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.delete("/courses/:id/assessments/:assessmentId/coding/:questionId", authenticateToken, async (req, res) => {
    try {
        const { id, assessmentId, questionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid course Id" });

        if (!mongoose.Types.ObjectId.isValid(assessmentId))
            return res.status(400).json({ message: "Invalid assessment Id" });

        if (!mongoose.Types.ObjectId.isValid(questionId))
            return res.status(400).json({ message: "Invalid question Id" });

        const course = await Course.findById(id);
        if (!course)
            return res.status(404).json({ message: "Course not found" });

        const assessment = await Assessment.findOne({ _id: assessmentId, courseId: id });
        if (!assessment)
            return res.status(404).json({ message: "Assessment not found" });

        const deleted = await CodingQuestion.findOneAndDelete({ _id: questionId, assessmentId, courseId: id });
        if (!deleted)
            return res.status(404).json({ message: "Coding question not found" });

        return res.status(200).json({ message: "Coding question deleted successfully" });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

export default app;