import mongoose from "mongoose";

const mcQuestionSchema = new mongoose.Schema({
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
    answer: {
        type: String,
        required: true
    }
});

const McQuestion = mongoose.model('McQuestion', mcQuestionSchema);

export default McQuestion;