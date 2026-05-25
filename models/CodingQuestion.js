import mongoose from "mongoose";

const codingQuestionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Types.ObjectId,
        ref: "Course",
        required: true
    },
    assessmentId: {
        type: mongoose.Types.ObjectId,
        ref: "Assessment",
        required: true
    },
    question: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ["java", "python", "c", "c++", "sql"],
        required: true
    }
});

const CodingQuestion = mongoose.model('CodingQuestion', codingQuestionSchema);

export default CodingQuestion;