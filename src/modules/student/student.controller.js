const studentService = require("./student.service");

// POST /api/students
const createStudent = async (req, res, next) => {
  try {
    const { name, email, age } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const student = await studentService.createStudent({
      name,
      email,
      age: age == null ? undefined : Number(age),
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students
const getAllStudents = async (req, res, next) => {
  try {
    const students = await studentService.getAllStudents();

    return res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/students/:id
const getStudentById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const student = await studentService.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const { name, email, age } = req.body;
    const data = {};

    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;

    if (age !== undefined) {
      data.age = age === null ? null : Number(age);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    if (
      data.age !== undefined &&
      data.age !== null &&
      !Number.isInteger(data.age)
    ) {
      return res.status(400).json({
        success: false,
        message: "Age must be an integer",
      });
    }

    const student = await studentService.updateStudent(id, data);

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/students/:id
const deleteStudent = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    await studentService.deleteStudent(id);

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
