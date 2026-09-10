import jwt from 'jsonwebtoken';
export function auth(req,res,next){
  try { const token=req.cookies?.token || (req.headers.authorization||'').replace('Bearer ',''); if(!token) return res.status(401).json({error:'AUTH_REQUIRED'}); req.user=jwt.verify(token,process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({error:'INVALID_SESSION'}); }
}
