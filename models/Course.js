import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
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
    courseType: {
        type: String,
        enum: ["mcq", "coding", "mixed"],
        required: true
    }
})

const Course = mongoose.model('Course', courseSchema);

export default Course;