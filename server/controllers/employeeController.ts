import { Request, Response } from 'express';
import { adminDb } from '../firebaseAdmin';

const COLLECTION = 'employees';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection(COLLECTION).get();
    const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employees", error });
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch employee", error });
  }
};

export const addEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, role, salaryStructure, status } = req.body;

    // Validation
    if (!name || !email || !role || !salaryStructure || !status) {
      return res.status(400).json({ message: "Missing required fields: name, email, role, salaryStructure, status" });
    }

    const validStatuses = ['active', 'inactive', 'on_leave'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    if (typeof salaryStructure !== 'object' || 
        typeof salaryStructure.basic !== 'number' || 
        typeof salaryStructure.hra !== 'number' || 
        typeof salaryStructure.allowances !== 'number') {
      return res.status(400).json({ message: "Invalid salaryStructure format. Must include basic, hra, and allowances as numbers." });
    }

    const newEmp = { 
      name,
      email,
      role,
      salaryStructure,
      status,
      department: req.body.department || 'General',
      bankDetails: req.body.bankDetails || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await adminDb.collection(COLLECTION).add(newEmp);
    res.status(201).json({ id: docRef.id, ...newEmp });
  } catch (error) {
    res.status(500).json({ message: "Failed to add employee", error });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    await adminDb.collection(COLLECTION).doc(req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete employee", error });
  }
};
