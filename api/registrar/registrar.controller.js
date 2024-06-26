import prisma from "../../config/prisma.js";
// import { hashPassword } from '../utils/security'; // Utility function for hashing passwords
import registrarSchema from "./registrar.schema.js";
import bcrypt from "bcrypt";
import { auth, isAdmin } from "../../middleware/auth.js";
const clientController = {
  registerParent: async (req, res) => {
    try {
      console.log(req.body);
      const validatedData = registrarSchema.registerParent.parse(req.body);

      // Check if the email already exists
      const existingUser = await prisma.user.findUnique({
        where: {
          email: validatedData.email,
        },
      });

      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email already exists", success: false });
      }
      const isphoneExist = await prisma.profile.findFirst({
        where: {
          phone: validatedData.phone,
        },
      });
      if (isphoneExist) {
        return res
          .status(400)
          .json({ message: "Phone number already exists", success: false });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      // Create a new user
      const newUser = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          role: validatedData.role, // Add role field
          profile: {
            create: {
              firstName: validatedData.firstName,
              middleName: validatedData.middleName,
              lastName: validatedData.lastName,
              address: validatedData.address,
              phone: validatedData.phone,
              dateOfBirth: new Date(validatedData.dateOfBirth),
            },
          },
          parent: {
            create: {
              relationship: validatedData.relationship,
            },
          },
        },
        include: {
          profile: true,
          parent: true,
        },
      });

      res.status(201).json({
        message: "Parent registered successfully",
        success: true,
        user: newUser,
      });
    } catch (error) {
      console.error("Parent registration error:", error);
      res.status(500).send({
        message: "Parent registration failed",
        error: error.message,
        status: 500,
      });
    }
  },
  registerStudent: async (req, res, next) => {
    try {
      const validatedData = registrarSchema.registerStudent.parse(req.body);
      console.log(req.body);
      const newStudent = await prisma.student.create({
        data: {
          roleId: +req.body.roleId,
          parentId: +req.body.parentId,
          classroomID: req.body.classroomID,

          studentprofile: {
            create: {
              firstName: validatedData.firstName,
              middleName: validatedData.middleName,
              lastName: validatedData.lastName,
              address: validatedData.address,
              dateOfBirth: new Date(validatedData.dateOfBirth),
              gender: validatedData.gender,
            },
          },
        },
      });
     return  res.status(200).json({
        message: "Student registered successfully",
        success: true,
        data: newStudent
      });
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  },
  findStudentById: async (req, res, next) => {
    try {
      const studentId = parseInt(req.params.id.substring(1));
      const foundStudent = await prisma.student.findUnique({
        where: {
          id: parseInt(studentId),
        },
        include: {
          studentprofile: true,
          parent: true,
          classroom: true,
        },
      });

      if (!foundStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.status(200).json(foundStudent);
    } catch (error) {
      console.error("Error finding student:", error);
      res.status(500).send(error);
    }
  },
  findAllStudents: async (req, res, next) => {
    try {
      const allStudents = await prisma.student.findMany({
        include: {
          assignments:true,
          attendance: true,
          // classroom: true,
          finalExams: true,
          midExams: true,
          studentprofile: true,
          tests: true,
          totalResults: true,
          parent: true
        }
      });

     return  res.status(200).json(allStudents);
    } catch (error) {
      console.error("Error finding all students:", error);
      res.status(500).send({
        success: false,
        message: error.message
      });
    }
  },

  findParentById: async (req, res) => {
    try {
      const parentId = parseInt(req.params.id.substring(1));
      const parent = await prisma.parent.findUnique({
        where: {
          id: parentId,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }

      res.status(200).json(parent);
    } catch (error) {
      console.error("Error finding parent:", error);
      res.status(500).send(error);
    }
  },
  getAllParents: async (req, res, next) => {
    try {
      const allParents = await prisma.parent.findMany({
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      res.status(200).json(allParents);
    } catch (error) {
      console.error("Error finding all parents:", error);
      res.status(500).send(error);
    }
  },
};

export default clientController;
