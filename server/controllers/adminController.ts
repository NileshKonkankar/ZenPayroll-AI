import { Request, Response } from 'express';
import { adminDb } from '../firebaseAdmin';
import { logAction } from '../utils/auditLogger';

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
    
    await logAction('Update Admin Role', req, `Updated role of ${email} to ${role}`);
    res.json({ message: 'Role updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removeAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const adminDoc = await adminDb.collection('admins').doc(id).get();
    let detail = `Removed admin ID: ${id}`;
    if (adminDoc.exists) {
      detail = `Removed admin access for ${adminDoc.data()?.email || id}`;
    }
    
    // Prevent self-demotion if needed, but for now simple delete
    await adminDb.collection('admins').doc(id).delete();
    await logAction('Remove Admin Access', req, detail);
    res.json({ message: 'Admin removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
