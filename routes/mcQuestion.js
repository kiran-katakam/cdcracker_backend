import express from "express"
import mongoose from "mongoose";
import Course from "../models/Course.js";
import Assessment from "../models/Assessment.js";
import McQuestion from "../models/McQuestion.js";
import authenticateToken from "../middleware/auth.js";

const app = express();

app.get("/courses/:id/assessments/:assessmentId/mcq", async (req, res) => {
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

        const questions = await McQuestion.find({ assessmentId, courseId: id });
        return res.status(200).json(questions);

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/courses/:id/assessments/:assessmentId/mcq/:questionId", async (req, res) => {
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

        const question = await McQuestion.findOne({ _id: questionId, assessmentId, courseId: id });
        if (!question)
            return res.status(404).json({ message: "MCQ question not found" });

        return res.status(200).json(question);

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/courses/:id/assessments/:assessmentId/mcq/bulk', authenticateToken, async (req, res) => {
    try {
        const { id: courseId, assessmentId } = req.params;
        const { questions } = req.body;

        if (!mongoose.Types.ObjectId.isValid(courseId))
            return res.status(400).json({ message: "Invalid course Id" });

        if (!mongoose.Types.ObjectId.isValid(assessmentId))
            return res.status(400).json({ message: "Invalid assessment Id" });

        if (!Array.isArray(questions) || questions.length === 0)
            return res.status(400).json({ message: 'questions must be a non-empty array' });

        const invalid = questions.findIndex((q) => !q.question || !q.answer);
        if (invalid !== -1)
            return res.status(400).json({ message: `Item at index ${invalid} is missing question or answer` });

        const course = await Course.findById(courseId);
        if (!course)
            return res.status(404).json({ message: "Course not found" });

        const assessment = await Assessment.findOne({ _id: assessmentId, courseId });
        if (!assessment)
            return res.status(404).json({ message: "Assessment not found" });

        if (assessment.assessmentType === "coding")
            return res.status(400).json({ message: "Cannot add MCQ questions to a coding assessment" });

        const docs = questions.map(({ question, answer }) => ({
            courseId,
            assessmentId,
            question,
            answer,
        }));

        const inserted = await McQuestion.insertMany(docs);
        return res.status(201).json({
            message: `${inserted.length} MCQs inserted`,
            count: inserted.length,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/courses/:id/assessments/:assessmentId/mcq", authenticateToken, async (req, res) => {
    try {
        const { id, assessmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid course Id" });

        if (!mongoose.Types.ObjectId.isValid(assessmentId))
            return res.status(400).json({ message: "Invalid assessment Id" });

        if (!req.body)
            return res.status(400).json({ message: "Body required" });

        const { question = null, answer = null } = req.body;

        if (!question || !answer)
            return res.status(400).json({ message: "All fields are required" });

        const course = await Course.findById(id);
        if (!course)
            return res.status(404).json({ message: "Course not found" });

        const assessment = await Assessment.findOne({ _id: assessmentId, courseId: id });
        if (!assessment)
            return res.status(404).json({ message: "Assessment not found" });

        if (assessment.assessmentType === "coding")
            return res.status(400).json({ message: "Cannot add MCQ questions to a coding assessment" });

        const mcQuestion = new McQuestion({
            courseId: id,
            assessmentId,
            question,
            answer
        });

        await mcQuestion.save();
        return res.status(201).json({ message: "MCQ question created successfully" });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.put("/courses/:id/assessments/:assessmentId/mcq/:questionId", authenticateToken, async (req, res) => {
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

        const { question = null, answer = null } = req.body;

        if (!question && !answer)
            return res.status(400).json({ message: "At least one field is required to update" });

        const course = await Course.findById(id);
        if (!course)
            return res.status(404).json({ message: "Course not found" });

        const assessment = await Assessment.findOne({ _id: assessmentId, courseId: id });
        if (!assessment)
            return res.status(404).json({ message: "Assessment not found" });

        const existing = await McQuestion.findOne({ _id: questionId, assessmentId, courseId: id });
        if (!existing)
            return res.status(404).json({ message: "MCQ question not found" });

        const updated = {
            question: question == null ? existing.question : question,
            answer: answer == null ? existing.answer : answer
        };

        await McQuestion.findByIdAndUpdate(questionId, updated);
        return res.status(200).json({ message: "MCQ question updated successfully" });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.delete("/courses/:id/assessments/:assessmentId/mcq/:questionId", authenticateToken, async (req, res) => {
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

        const deleted = await McQuestion.findOneAndDelete({ _id: questionId, assessmentId, courseId: id });
        if (!deleted)
            return res.status(404).json({ message: "MCQ question not found" });

        return res.status(200).json({ message: "MCQ question deleted successfully" });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

export default app;