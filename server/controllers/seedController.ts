import { Request, Response } from 'express';
import { adminDb } from '../firebaseAdmin';

const SEED_EMPLOYEES = [
  {
    name: "John Doe",
    role: "Senior Software Engineer",
    department: "Engineering",
    email: "john.doe@example.com",
    salary: {
      basic: 80000,
      hra: 32000,
      allowances: 15000
    },
    status: "active",
    joiningDate: "2023-01-15"
  },
  {
    name: "Jane Smith",
    role: "Product Manager",
    department: "Product",
    email: "jane.smith@example.com",
    salary: {
      basic: 90000,
      hra: 36000,
      allowances: 18000
    },
    status: "active",
    joiningDate: "2023-03-10"
  },
  {
    name: "Mike Johnson",
    role: "UX Designer",
    department: "Design",
    email: "mike.j@example.com",
    salary: {
      basic: 70000,
      hra: 28000,
      allowances: 12000
    },
    status: "active",
    joiningDate: "2023-06-20"
  }
];

export const seedData = async (req: Request, res: Response) => {
  try {
    const batch = adminDb.batch();
    const employeesRef = adminDb.collection('employees');

    // Check if employees already exist
    const currentEmployees = await employeesRef.limit(1).get();
    if (!currentEmployees.empty) {
      return res.status(400).json({ message: "Database already contains data. Seeding aborted." });
    }

    SEED_EMPLOYEES.forEach(emp => {
      const docRef = employeesRef.doc();
      batch.set(docRef, {
        ...emp,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();
    res.json({ message: "Seeding successful", count: SEED_EMPLOYEES.length });
  } catch (error) {
    console.error("Seeding Error:", error);
    res.status(500).json({ message: "Seeding failed", error });
  }
};
