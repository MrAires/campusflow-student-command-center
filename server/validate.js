export const PRIORITIES = ['low', 'medium', 'high'];
export const STATUSES = ['todo', 'in-progress', 'done'];
export const COURSE_COLORS = ['#8068f4', '#f5a057', '#32b99c', '#5f9ce7', '#f178a7', '#a88aee'];
export const clean = (value) => typeof value === 'string' ? value.trim() : '';
const isDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T12:00:00Z`).getTime()) && new Date(`${value}T12:00:00Z`).toISOString().slice(0,10) === value;
export function taskPayload(body = {}) {
  const title = clean(body.title);
  const description = clean(body.description);
  if (title.length < 3 || title.length > 110) throw new Error('Task title must have 3 to 110 characters.');
  if (description.length > 800) throw new Error('Description must be below 800 characters.');
  if (!STATUSES.includes(body.status || 'todo')) throw new Error('Invalid task status.');
  if (!PRIORITIES.includes(body.priority || 'medium')) throw new Error('Invalid priority.');
  if (body.dueDate && !isDate(body.dueDate)) throw new Error('Enter a valid due date.');
  const minutes = Number(body.estimatedMinutes ?? 60);
  if (!Number.isInteger(minutes) || minutes < 10 || minutes > 600) throw new Error('Estimate must be from 10 to 600 minutes.');
  return { title, description, status:body.status || 'todo', priority:body.priority || 'medium', dueDate: body.dueDate || '', courseId: clean(body.courseId), estimatedMinutes: minutes };
}
export function coursePayload(body = {}) {
  const name = clean(body.name);
  const code = clean(body.code).toUpperCase();
  const instructor = clean(body.instructor);
  const color = body.color || COURSE_COLORS[0];
  if (name.length < 3 || name.length > 75) throw new Error('Course name must have 3 to 75 characters.');
  if (code.length < 2 || code.length > 18) throw new Error('Course code must have 2 to 18 characters.');
  if (instructor.length > 80) throw new Error('Instructor name must be below 80 characters.');
  if (!COURSE_COLORS.includes(color)) throw new Error('Invalid course color.');
  return { name, code, instructor, color };
}
