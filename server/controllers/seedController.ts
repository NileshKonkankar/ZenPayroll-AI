import { Request, Response } from 'express';
import { adminDb } from '../firebaseAdmin';

const SEED_EMPLOYEES = [
  {
    name: "John Doe",
    role: "Senior Software Engineer",
    department: "Engineering",
    email: "john.doe@example.com",
    salaryStructure: {
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
    salaryStructure: {
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
    salaryStructure: {
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

    // Seed admin record for the user (bootstrap)
    // In a real app, this would be more secure, but for the demo we'll use the placeholder
    const adminsRef = adminDb.collection('admins');
    const adminDoc = adminsRef.doc('bootstrap_admin'); // Using a fixed ID for bootstrap
    batch.set(adminDoc, {
      uid: 'KonkankarNilesh@gmail.com', // Placeholder, we should probably check email if UID is unknown
      email: 'KonkankarNilesh@gmail.com',
      role: 'ADMIN',
      createdAt: new Date().toISOString()
    });

    await batch.commit();
    res.json({ message: "Seeding successful", count: SEED_EMPLOYEES.length });
  } catch (error: any) {
    console.error("Seeding Error:", error);
    res.status(500).json({ 
      message: "Seeding failed", 
      error: error.message,
      code: error.code,
      details: error.details,
      note: "Check if the Firestore database is provisioned and the service account has permissions."
    });
  }
};
