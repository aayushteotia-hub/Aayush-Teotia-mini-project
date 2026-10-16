import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: Partial<DecodedIdToken> & {
    role?: string;
    email?: string;
    name?: string;
  };
}

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const roleHeader = req.headers['x-user-role'] as string | undefined;
  const emailHeader = req.headers['x-user-email'] as string | undefined;
  const nameHeader = req.headers['x-user-name'] as string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } catch {
      // In demo environment, fall through to demo header if token is invalid or demo token
    }
  }

  if (roleHeader) {
    req.user = {
      uid: `user-${roleHeader}`,
      role: roleHeader,
      email: emailHeader || `${roleHeader}@univ.edu`,
      name: nameHeader || (roleHeader === 'admin' ? 'Dr. Rajesh Sharma' : roleHeader === 'teacher' ? 'Prof. Ananya Sen' : 'Aayush Sharma'),
    };
  }

  next();
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const roleHeader = req.headers['x-user-role'] as string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } catch {
      if (!roleHeader) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }
  }

  if (roleHeader) {
    const emailHeader = req.headers['x-user-email'] as string | undefined;
    const nameHeader = req.headers['x-user-name'] as string | undefined;
    req.user = {
      uid: `user-${roleHeader}`,
      role: roleHeader,
      email: emailHeader || `${roleHeader}@univ.edu`,
      name: nameHeader || (roleHeader === 'admin' ? 'Dr. Rajesh Sharma' : roleHeader === 'teacher' ? 'Prof. Ananya Sen' : 'Aayush Sharma'),
    };
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Missing authentication' });
};
