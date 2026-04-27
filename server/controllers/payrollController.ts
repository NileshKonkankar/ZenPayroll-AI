import { Request, Response } from 'express';
import { calculateNetSalary } from '../utils/payrollCalculator';
import { adminDb } from '../firebaseAdmin';

const COLLECTION = 'payrollRecords';

export const processPayroll = async (req: Request, res: Response) => {
  const { employeeId, month, deductions } = req.body;
  
  try {
    // Fetch employee for structure
    const empDoc = await adminDb.collection('employees').doc(employeeId).get();
    if (!empDoc.exists) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    const empData = empDoc.data() as any;
    const salary = empData.salaryStructure;

    if (!salary) {
      return res.status(400).json({ message: "Salary structure not defined for employee" });
    }

    const calculation = calculateNetSalary(salary, deductions || { pfRate: 0.12, unpaidLeaves: 0 });
    const payrollRecord = {
      employeeId,
      month,
      ...calculation,
      processedAt: new Date().toISOString()
    };
    
    const docRef = await adminDb.collection(COLLECTION).add(payrollRecord);
    res.status(201).json({ id: docRef.id, ...payrollRecord });
  } catch (error) {
    console.error("Payroll Error:", error);
    res.status(500).json({ message: "Failed to process payroll" });
  }
};

export const processFullBatch = async (req: Request, res: Response) => {
  const { month, globalDeductions } = req.body; // globalDeductions like standard leaves/pf

  try {
    const employeesSnapshot = await adminDb.collection('employees').get();
    const batch = adminDb.batch();
    const processedRecords: any[] = [];

    const defaultDeductions = {
      pfRate: 0.12,
      unpaidLeaves: 0,
      ...globalDeductions
    };

    employeesSnapshot.forEach(doc => {
      const empData = doc.data() as any;
      const salary = empData.salaryStructure;
      
      if (salary) {
        const calculation = calculateNetSalary(salary, defaultDeductions);
        const recordRef = adminDb.collection(COLLECTION).doc();
        const payrollRecord = {
          employeeId: doc.id,
          employeeName: empData.name,
          month,
          ...calculation,
          processedAt: new Date().toISOString()
        };
        batch.set(recordRef, payrollRecord);
        processedRecords.push({ id: recordRef.id, ...payrollRecord });
      }
    });

    await batch.commit();
    res.status(200).json({ 
      message: `Processed ${processedRecords.length} records successfully`, 
      records: processedRecords 
    });
  } catch (error) {
    console.error("Batch Payroll Error:", error);
    res.status(500).json({ message: "Failed to process batch payroll", error });
  }
};

export const getPayrollHistory = async (req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection(COLLECTION).orderBy('processedAt', 'desc').get();
    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payroll history", error });
  }
};
