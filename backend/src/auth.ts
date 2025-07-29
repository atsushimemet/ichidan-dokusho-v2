import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

// Google OAuth2クライアントの初期化
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// JWTトークンの生成
export const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email, sub: userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// JWTトークンの検証
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Google IDトークンの検証
export const verifyGoogleToken = async (idToken: string) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Invalid Google token');
  }
};

// 認証ミドルウェア
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth Debug - Authorization header:', authHeader);
  console.log('Auth Debug - Extracted token:', token ? 'Token exists' : 'No token');

  if (!token) {
    console.log('Auth Debug - No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  console.log('Auth Debug - Decoded token:', decoded);
  
  if (!decoded) {
    console.log('Auth Debug - Invalid token');
    return res.status(403).json({ message: 'Invalid token' });
  }

  req.user = decoded;
  console.log('Auth Debug - User set to req.user:', req.user);
  next();
}; 
