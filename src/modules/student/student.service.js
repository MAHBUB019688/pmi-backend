const prisma = require("../../db/prisma");

// Create student
const createStudent = async (data) => {
  return prisma.student.create({
    data: {
      name: data.name,
      email: data.email,
      age: data.age,
    },
  });
};

// Get all students
const getAllStudents = async () => {
  return prisma.student.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get student by ID
const getStudentById = async (id) => {
  return prisma.student.findUnique({
    where: { id },
  });
};

// Update student
const updateStudent = async (id, data) => {
  return prisma.student.update({
    where: { id },
    data,
  });
};

// Delete student
const deleteStudent = async (id) => {
  return prisma.student.delete({
    where: { id },
  });
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
