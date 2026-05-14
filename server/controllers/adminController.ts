import { Request, Response } from 'express';
import { adminDb } from '../firebaseAdmin';

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const snapshot = await adminDb.collection('admins').get();
    const admins = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(admins);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAdminRole = async (req: Request, res: Response) => {
  const { uid, email, role } = req.body;
  
  if (!uid || !role || !email) {
    return res.status(400).json({ message: 'UID, Email and Role are required' });
  }

  try {
    await adminDb.collection('admins').doc(uid).set({
      uid,
      email,
      role,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    res.json({ message: 'Role updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Prevent self-demotion if needed, but for now simple delete
    await adminDb.collection('admins').doc(id).delete();
    res.json({ message: 'Admin removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
