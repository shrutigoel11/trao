import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import kitsRoutes from './routes/kits.js';

// npm --prefix server runs this file with `server/` as the working directory,
// while deployment and local setup keep the shared environment file at the
// repository root. Resolve it from this module, never from process.cwd().
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(repoRoot, '.env') });
const app=express();
app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:3000',credentials:true}));
app.use(express.json({limit:'2mb'}));app.use(cookieParser());
app.use('/api/auth',rateLimit({windowMs:60000,max:30}),authRoutes);
function auth(req,res,next){try{const t=req.cookies.token;if(!t)return res.status(401).json({error:'AUTH_REQUIRED'});req.user=jwt.verify(t,process.env.JWT_SECRET);next();}catch{return res.status(401).json({error:'INVALID_SESSION'});}}
app.use('/api/kits',auth,kitsRoutes);
app.get('/api/health',(req,res)=>res.json({ok:true}));
const port=process.env.PORT||4000;
if(process.env.MONGODB_URI){mongoose.connect(process.env.MONGODB_URI).then(()=>app.listen(port,()=>console.log(`API on ${port}`))).catch(e=>{console.error(e);process.exit(1);});}else{console.warn('MONGODB_URI missing; API will not start until configured.');}
export default app;
