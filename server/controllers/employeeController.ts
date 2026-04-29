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
    const newEmp = { 
      ...req.body,
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
