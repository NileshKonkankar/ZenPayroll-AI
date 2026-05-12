import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import { adminDb } from "../firebaseAdmin";

export const authenticate = async (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Fetch role from Firestore
    const adminDoc = await adminDb.collection('admins').doc(decodedToken.uid).get();
    let role = 'EMPLOYEE'; // Default role

    if (adminDoc.exists) {
      role = adminDoc.data()?.role || 'EMPLOYEE';
    } else if (decodedToken.email === 'KonkankarNilesh@gmail.com') {
      role = 'ADMIN'; // Bootstrap fallback
    }

    req.user = {
      ...decodedToken,
      role
    };
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    next();
  };
};
