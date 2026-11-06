import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, validId, toId } from '../server/db.js';
import { clean, coursePayload, taskPayload } from '../server/validate.js';
import { seedData } from '../server/seed.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({limit:'60kb'}));
app.use(cookieParser());
app.use((req,res,next)=>{res.set('Cache-Control','no-store'); next();});
const router = express.Router();
const asyncRoute = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const secret = () => { if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET environment variable must contain at least 32 characters.'); return process.env.JWT_SECRET; };
const userDoc = (u) => ({id:String(u._id),name:u.name,email:u.email,createdAt:u.createdAt});
const issueCookie = (res,userId) => {
  const token = jwt.sign({sub:String(userId)},secret(),{expiresIn:'7d'});
  res.cookie('campusflow_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:7*24*60*60*1000});
};
const requireAuth = asyncRoute(async(req,res,next)=>{
  const token = req.cookies.campusflow_session;
  if (!token) return res.status(401).json({error:'Please sign in to continue.'});
  let payload;
  try {payload=jwt.verify(token,secret());} catch {return res.status(401).json({error:'Your session expired. Sign in again.'});}
  if (!validId(payload.sub)) return res.status(401).json({error:'Invalid session.'});
  const db=await getDb(); const user=await db.collection('users').findOne({_id:toId(payload.sub)},{projection:{passwordHash:0}});
  if (!user) return res.status(401).json({error:'Account not found.'});
  req.user=user; req.db=db; next();
});
const doc = (item) => ({...item,_id:undefined,id:String(item._id),userId:undefined});

router.get('/health', asyncRoute(async(req,res)=>{
  try {const db=await getDb(); await db.command({ping:1}); res.json({ok:true,service:'CampusFlow API',database:'connected'});}
  catch {res.status(503).json({ok:false,service:'CampusFlow API',database:'disconnected'});}
}));
router.post('/auth/register', asyncRoute(async(req,res)=>{
  const name=clean(req.body.name),email=clean(req.body.email).toLowerCase(),password=String(req.body.password||'');
  if (name.length<2 || name.length>70) return res.status(400).json({error:'Name must have 2 to 70 characters.'});
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>150) return res.status(400).json({error:'Enter a valid email address.'});
  if (password.length<8 || password.length>128) return res.status(400).json({error:'Password must have at least 8 characters.'});
  const db=await getDb(),users=db.collection('users');
  await users.createIndex({email:1},{unique:true});
  const now=new Date(),passwordHash=await bcrypt.hash(password,11);
  let result;
  try {result=await users.insertOne({name,email,passwordHash,createdAt:now});}
  catch(err){if(err.code===11000)return res.status(409).json({error:'An account with that email already exists.'});throw err;}
  issueCookie(res,result.insertedId);
  const seeds=seedData(result.insertedId);
  const courseResult=await db.collection('courses').insertMany(seeds.rawCourses.map(c=>({...c,userId:result.insertedId,createdAt:now})));
  await db.collection('tasks').insertMany(seeds.taskDefs.map(([idx,title,description,offset,priority,status,estimatedMinutes])=>({
    title,description,priority,status,estimatedMinutes,courseId:String(courseResult.insertedIds[idx]),dueDate:seeds.dateFromToday(offset),userId:result.insertedId,createdAt:new Date(Date.now()-Math.abs(offset)*86400000),updatedAt:now
  })));
  return res.status(201).json({user:{id:String(result.insertedId),name,email},message:'Welcome to CampusFlow! Your starter workspace is ready.'});
}));
router.post('/auth/login', asyncRoute(async(req,res)=>{
  const email=clean(req.body.email).toLowerCase(),password=String(req.body.password||'');
  const db=await getDb(),user=await db.collection('users').findOne({email});
  if(!user || !await bcrypt.compare(password,user.passwordHash)) return res.status(401).json({error:'Invalid email or password.'});
  issueCookie(res,user._id);res.json({user:userDoc(user)});
}));
router.post('/auth/logout',(req,res)=>{res.clearCookie('campusflow_session',{path:'/',sameSite:'lax',secure:process.env.NODE_ENV==='production'});res.json({ok:true});});
router.get('/auth/me',requireAuth,(req,res)=>res.json({user:userDoc(req.user)}));

router.get('/courses',requireAuth,asyncRoute(async(req,res)=>{
  const courses=await req.db.collection('courses').find({userId:req.user._id}).sort({createdAt:1}).toArray();res.json(courses.map(doc));
}));
router.post('/courses',requireAuth,asyncRoute(async(req,res)=>{
  let data;try{data=coursePayload(req.body);}catch(err){return res.status(400).json({error:err.message});}
  const coll=req.db.collection('courses');
  if(await coll.findOne({userId:req.user._id,code:data.code}))return res.status(409).json({error:'This course code already exists.'});
  const course={...data,userId:req.user._id,createdAt:new Date()};const result=await coll.insertOne(course);res.status(201).json(doc({...course,_id:result.insertedId}));
}));
router.patch('/courses/:id',requireAuth,asyncRoute(async(req,res)=>{
  if(!validId(req.params.id))return res.status(400).json({error:'Invalid course ID.'});
  let data;try{data=coursePayload(req.body);}catch(err){return res.status(400).json({error:err.message});}
  const coll=req.db.collection('courses');
  const duplicate=await coll.findOne({userId:req.user._id,code:data.code,_id:{$ne:toId(req.params.id)}});
  if(duplicate)return res.status(409).json({error:'Another course uses that code.'});
  const result=await coll.findOneAndUpdate({_id:toId(req.params.id),userId:req.user._id},{$set:data},{returnDocument:'after'});
  if(!result)return res.status(404).json({error:'Course not found.'});res.json(doc(result));
}));
router.delete('/courses/:id',requireAuth,asyncRoute(async(req,res)=>{
  if(!validId(req.params.id))return res.status(400).json({error:'Invalid course ID.'});
  const result=await req.db.collection('courses').deleteOne({_id:toId(req.params.id),userId:req.user._id});
  if(!result.deletedCount)return res.status(404).json({error:'Course not found.'});
  // Keep assignments rather than destroy them; they are moved to 'Unassigned'.
  await req.db.collection('tasks').updateMany({userId:req.user._id,courseId:req.params.id},{$set:{courseId:''}});
  res.json({ok:true});
}));
router.get('/tasks',requireAuth,asyncRoute(async(req,res)=>{
  const query={userId:req.user._id};
  if(['todo','in-progress','done'].includes(req.query.status))query.status=req.query.status;
  if(req.query.courseId && validId(req.query.courseId))query.courseId=req.query.courseId;
  const tasks=await req.db.collection('tasks').find(query).sort({createdAt:-1}).toArray();res.json(tasks.map(doc));
}));
router.post('/tasks',requireAuth,asyncRoute(async(req,res)=>{
  let data;try{data=taskPayload(req.body);}catch(err){return res.status(400).json({error:err.message});}
  if(data.courseId && (!validId(data.courseId) || !await req.db.collection('courses').findOne({_id:toId(data.courseId),userId:req.user._id}))) return res.status(400).json({error:'Select a valid course.'});
  const now=new Date(),task={...data,userId:req.user._id,createdAt:now,updatedAt:now};
  const result=await req.db.collection('tasks').insertOne(task);res.status(201).json(doc({...task,_id:result.insertedId}));
}));
router.patch('/tasks/:id',requireAuth,asyncRoute(async(req,res)=>{
  if(!validId(req.params.id))return res.status(400).json({error:'Invalid task ID.'});
  const coll=req.db.collection('tasks'),filter={_id:toId(req.params.id),userId:req.user._id};
  const current=await coll.findOne(filter);if(!current)return res.status(404).json({error:'Task not found.'});
  let data;try{data=taskPayload({...current,...req.body});}catch(err){return res.status(400).json({error:err.message});}
  if(data.courseId && (!validId(data.courseId) || !await req.db.collection('courses').findOne({_id:toId(data.courseId),userId:req.user._id})))return res.status(400).json({error:'Select a valid course.'});
  const result=await coll.findOneAndUpdate(filter,{$set:{...data,updatedAt:new Date()}},{returnDocument:'after'});
  res.json(doc(result));
}));
router.delete('/tasks/:id',requireAuth,asyncRoute(async(req,res)=>{
  if(!validId(req.params.id))return res.status(400).json({error:'Invalid task ID.'});
  const result=await req.db.collection('tasks').deleteOne({_id:toId(req.params.id),userId:req.user._id});
  if(!result.deletedCount)return res.status(404).json({error:'Task not found.'});res.json({ok:true});
}));
router.get('/dashboard',requireAuth,asyncRoute(async(req,res)=>{
  const [tasks,courses]=await Promise.all([
    req.db.collection('tasks').find({userId:req.user._id}).toArray(),
    req.db.collection('courses').find({userId:req.user._id}).toArray()
  ]);
  const today=new Date().toISOString().slice(0,10);const seven=new Date();seven.setDate(seven.getDate()+7);const week=seven.toISOString().slice(0,10);
  const done=tasks.filter(t=>t.status==='done').length;
  res.json({total:tasks.length,done,inProgress:tasks.filter(t=>t.status==='in-progress').length,pending:tasks.length-done,
    dueSoon:tasks.filter(t=>t.status!=='done'&&t.dueDate&&t.dueDate>=today&&t.dueDate<=week).length,
    overdue:tasks.filter(t=>t.status!=='done'&&t.dueDate&&t.dueDate<today).length,
    completion:tasks.length?Math.round(done/tasks.length*100):0,courses:courses.length});
}));
app.use('/api',router);
// Vercel's /api/index rewrite may preserve or strip the source pathname; accept both forms.
app.use('/',router);
app.use((err,req,res,next)=>{
  console.error('[CampusFlow API]',err.message);
  if(err.type==='entity.too.large')return res.status(413).json({error:'Request too large.'});
  if(err instanceof SyntaxError && 'body' in err)return res.status(400).json({error:'Invalid JSON.'});
  res.status(err.code==='DATABASE_NOT_CONFIGURED'?503:500).json({error:err.code==='DATABASE_NOT_CONFIGURED'?'Database connection is not configured.':'Server error. Check database and environment settings.'});
});
export default app;
