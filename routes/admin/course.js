import mongoose from "../../config/mongoDB.js";
import e from "express";
import Course from "../../models/Course.js";
import { mongo } from "mongoose";

const app = e();

const courseTypes = ["mcq", "coding", "mixed"]

app.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find();
        return res.status(200).json(courses);
    } catch (e) {
        console.log(e);
        return res.status(500).send("Internal Server Error")
    }
});

app.post("/courses", async (req, res) => {
    try {

        if (!req.body) {
            return res.status(400).json({ message: "Body required" })
        }

        const { name = null, startDate = null, endDate = null, courseType = null } = req.body;

        if (!name || !startDate || !endDate || !courseType) {
            return res.status(400).send("All fields are necessary");
        }

        if (!courseTypes.includes(courseType)) {
            return res.status(400).json({ message: "invalid course type" })
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
        return res.status(200).json({ message: "Course inserted successfully" })
    }
    catch (e) {
        console.log(e);
        return res.status(500).send("Internal Server Error")
    }
});

app.delete("/courses/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Id" })
        }

        const deletedCourse = await Course.findByIdAndDelete(id);

        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.status(200).json({ message: "Course deleted successfully" });
    } catch (e) {
        console.log(e);
        return res.status(500).send("Internal Server Error")
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
            return res.status(400).json({ message: "course not found" })
        }
        return res.status(200).json(course)

    } catch (e) {
        console.log(e);
        return res.status(500).send("Internal Server Error")
    }
});

app.put("/courses/:id", async (req, res) => {
    try {

        const { id } = req.params;

        if (!req.body) {
            return res.status(400).json({ message: "Body required" })
        }

        const { name = null, startDate = null, endDate = null, courseType = null } = req.body;

        if (courseType != null && !courseTypes.includes(courseType)) {
            return res.status(400).json({ message: "invalid course type" })
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid course Id" })
        }

        const course = await Course.findById(id)

        if (!course) {
            return res.status(400).json({ message: "course not found" })
        }

        const updated = {
            name: name == null ? course.name : name,
            startDate: startDate == null ? course.startDate : startDate,
            endDate: endDate == null ? course.endDate : endDate,
            courseType: courseType == null ? course.courseType : courseType
        }

        await Course.findByIdAndUpdate(id, updated);

        return res.status(200).json({ message: "Course Updated" })
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal Server Error" })
    }
})

export default app;