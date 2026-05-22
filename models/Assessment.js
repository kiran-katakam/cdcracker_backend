import mongoose from "mongoose"

const assessmentSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Types.ObjectId,
        ref: "Course",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    assessmentType: {
        type: String,
        enum: ["mcq", "coding", "mixed"],
        required: true
    }
})

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;