import { adminDb } from '../firebaseAdmin';

export const logAction = async (action: string, req: any, details?: string) => {
  try {
    const userEmail = req?.user?.email || req?.user?.uid || 'System';
    const logData = {
      action,
      user: userEmail,
      details: details || '',
      timestamp: new Date().toISOString()
    };
    await adminDb.collection('auditLogs').add(logData);
    console.log(`[AuditLog] Logged action: "${action}" by ${userEmail}`);
  } catch (error) {
    console.error('[AuditLog] Error writing audit log:', error);
  }
};
