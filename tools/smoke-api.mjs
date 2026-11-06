// Run when npm run dev is active and MongoDB Server is connected.
const ORIGIN = process.env.SMOKE_ORIGIN || 'http://127.0.0.1:3001';
const cookie = { value: '' };
async function call(method, path, data) {
  const res = await fetch(ORIGIN + '/api' + path, {
    method,
    headers: { ...(data ? {'Content-Type':'application/json'} : {}), ...(cookie.value ? {Cookie:cookie.value} : {}) },
    body: data ? JSON.stringify(data) : undefined
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie.value = setCookie.split(';')[0];
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} HTTP ${res.status}: ${json.error || JSON.stringify(json)}`);
  console.log('PASS',String(res.status).padEnd(4),method.padEnd(6),path);
  return json;
}
try {
  const health = await call('GET','/health');
  if (health.database !== 'connected') throw new Error('MongoDB not connected');
  const email=`cf-smoke-${Date.now()}@example.com`;
  const created = await call('POST','/auth/register',{name:'CampusFlow API Tester',email,password:'TestPassword123!' });
  if (!created.user?.id) throw new Error('User creation missing id');
  const course = await call('POST','/courses',{name:'Database Systems Test',code:`TST${Date.now().toString().slice(-8)}`,color:'#8068f4',instructor:'API test'});
  const courses = await call('GET','/courses');
  if (!courses.some(x=>x.id===course.id)) throw new Error('Course CRUD read failed');
  const newTask = await call('POST','/tasks',{title:'Test assignment',description:'Automated CRUD smoke test',status:'todo',priority:'high',dueDate:'2026-12-10',estimatedMinutes:30,courseId:course.id});
  const tasks = await call('GET','/tasks');
  if (!tasks.some(x=>x.id===newTask.id)) throw new Error('Task CRUD read failed');
  const modified = await call('PATCH',`/tasks/${newTask.id}`,{status:'done'});
  if (modified.status!=='done') throw new Error('Task CRUD update failed');
  await call('GET','/dashboard');
  await call('DELETE',`/tasks/${newTask.id}`);
  await call('DELETE',`/courses/${course.id}`);
  await call('POST','/auth/logout');
  console.log('\nCampusFlow API CRUD smoke test PASSED.');
  console.log('Note: a disposable tester account was created in the MongoDB database.');
} catch(error) {console.error('\nSmoke test failed:',error.message);process.exitCode=1;}
