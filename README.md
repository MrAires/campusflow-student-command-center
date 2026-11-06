# CampusFlow - Your Student Command Center

> **WAF Full-Stack Application Project** | Registration No. **2024006675**
> Developed by **Ksheeraj Ram Reddy** | GitHub: **[@MrAires](https://github.com/MrAires)**

CampusFlow is a responsive student productivity platform for managing courses, assignments, deadlines and study time. It combines a **ReactJS + HTML/CSS/JavaScript frontend**, a **NodeJS + ExpressJS REST API**, and a **MongoDB database**, with a single GitHub repository and a Vercel-ready deployment structure.

**Repository URL:** _Add after creating the GitHub repository._

**Live Vercel URL:** _Add after deploying to Vercel._

> Do not claim a live deployment until `/api/health`, sign-up, and task CRUD work on the deployed URL.

## What makes this project different?

- **Beautiful responsive dashboard** with task stats, upcoming deadlines, course progress and priorities.
- **Kanban + list task views**, drag-and-drop status changes on desktop, search and multiple filters.
- **Full CRUD** for tasks and courses with validation and clear feedback.
- **Student login/registration** using bcrypt password hashing and an HTTP-only session cookie.
- **Personal data separation**: every database query is scoped to the signed-in user.
- **Focus timer**, 7-day completion activity chart, priority analytics, course completion rings, dark/light mode.
- **Interactive preview mode** to explore interface without connecting a database (clearly labeled browser-local sample data).
- **MongoDB Atlas + Vercel deployment** in one project, with Express handled by Vercel's Node.js Function runtime.

## Technology stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES modules), React 18 | Accessible, component-based responsive UI |
| UI build | Vite + lucide-react | Fast development and production build, icons |
| Backend | Node.js 20+, Express 4 | RESTful JSON API |
| Database | MongoDB native Node.js driver | Persistent users, courses, tasks |
| Authentication | bcryptjs, JWT, HTTP-only SameSite cookie | Password hashing and 7-day user sessions |
| Deployment | Vercel + MongoDB Atlas | React static build + API serverless function |
| Version control | Git & GitHub | Source code and commit history |

## Running locally (Windows)

### 1. Prerequisites

- Node.js **20 or later** and npm (you already have Node.js 24 from your earlier lab).
- MongoDB Community Server running locally at `mongodb://127.0.0.1:27017`, **or** your MongoDB Atlas URI.
- Internet access for the first `npm install`.

### 2. One click

1. Extract the ZIP completely (do not execute inside WinRAR/ZIP view).
2. Open the extracted folder and double-click **`RUN_WINDOWS.cmd`**.
3. The script checks Node, creates `.env` with a fresh local JWT secret, installs npm packages if needed, and starts Vite + Express.
4. Open **http://127.0.0.1:5173/** in Chrome. The launcher will also attempt to open it automatically.
5. Press **Create an account**, use your email and a password with at least 8 characters. Sample courses and tasks are added to your own new account.
6. If you just want to see the design, click **Try interactive demo**. That mode saves sample edits only in your browser; it is **not MongoDB CRUD**.

The one-click launcher expects MongoDB Server already running. Check Windows **Services > MongoDB > Start** or run `net start MongoDB` in an Administrator CMD. If `mongosh` cannot connect, start the server before registering.

### 3. Manual method

```bash
npm install
node tools/setup.mjs
npm run dev
```

Local URLs:

- React UI: http://127.0.0.1:5173/
- Express API: http://127.0.0.1:3001/api/health
- Vite automatically proxies `/api` requests to the Express server.

### 4. Verify MongoDB

Open `mongosh` in another window:

```javascript
use campusflow
db.users.find({}, {name:1,email:1}).limit(5)
db.courses.find().limit(5)
db.tasks.find().limit(5)
```

These collections are created by the backend after user registration and other CRUD activity. **Never share user password hashes or `.env` secrets in screenshots.**

## Full feature tour for evaluation

1. **Create account** (recommended for demonstrating real MongoDB), then log in.
2. Dashboard: inspect summary cards, upcoming deadlines and course progress.
3. Tasks: click **Add task**, enter title, course, deadline, priority and save.
4. Tasks: edit a task, drag its Kanban card from To do to In progress, mark it complete, and delete another task.
5. Courses: add a course, edit its title/color, verify task progress and delete a test course.
6. Insights: see completion activity, course breakdown and workload by priority.
7. Focus: start/pause/reset the 25-minute study timer.
8. Switch dark/light theme, resize window to mobile width and check responsiveness.
9. Logout, log in again, confirm persisted records still exist.
10. In MongoDB Atlas or `mongosh`, verify that records exist in `campusflow`.

## REST API endpoints

All authenticated endpoints require a valid `campusflow_session` cookie. `POST/PATCH` payloads are JSON; all responses are JSON.

| Method | Endpoint | Action |
|---|---|---|
| GET | `/api/health` | Verify API + MongoDB connection |
| POST | `/api/auth/register` | Create user and starter workspace |
| POST | `/api/auth/login` | Sign in; set HTTP-only cookie |
| POST | `/api/auth/logout` | Clear session cookie |
| GET | `/api/auth/me` | Current authenticated user |
| GET | `/api/dashboard` | Aggregated dashboard metrics |
| GET | `/api/courses` | Read all courses for user |
| POST | `/api/courses` | Create course |
| PATCH | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course, unassign its tasks |
| GET | `/api/tasks` | Read tasks (optional status/course filters) |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task or change status |
| DELETE | `/api/tasks/:id` | Delete task |

**Sample task JSON:**

```json
{
  "title": "Submit Web Frameworks assignment",
  "description": "Complete and document full-stack project",
  "courseId": "<a-course-id-from-GET-courses>",
  "priority": "high",
  "status": "todo",
  "dueDate": "2026-11-12",
  "estimatedMinutes": 90
}
```

**MongoDB collections**: `users`, `courses`, `tasks`. `users.email` has a unique index; the server hashes passwords with bcrypt, never returns password hashes, and scopes all data queries by the authenticated user `_id`.

## Deployment to GitHub and Vercel

### A. GitHub

1. Open **https://github.com/new** as `MrAires`.
2. Create a **public, empty repository** named `campusflow-student-command-center` (**do not** create a README or `.gitignore` in the GitHub interface; these files are already in this folder).
3. In the project folder, double-click **`PUSH_TO_GITHUB.cmd`** and paste the GitHub repo HTTPS URL when asked.
4. Authenticate via Git Credential Manager/browser if Git asks.
5. Refresh the repository. Check that `src/`, `api/`, `server/`, `public/`, `README.md`, `package.json` and `vercel.json` are present; **`.env` must NOT be uploaded**.

Manual equivalent:

```bash
git init -b main
git config user.name "MrAires"
git config user.email "rksheeraj@gmail.com"
git add .
git commit -m "Build CampusFlow React Express MongoDB application"
git remote add origin https://github.com/MrAires/campusflow-student-command-center.git
git push -u origin main
```

### B. MongoDB Atlas

1. Open **https://cloud.mongodb.com/** and create a cluster (a free-tier option may be available).
2. Under **Database Access**, add a dedicated database user with a strong generated password and permission for the project database.
3. Under **Network Access**, allow Vercel's outbound access to reach MongoDB Atlas. For a short class demo, Atlas's `0.0.0.0/0` setting is an easier but **less secure** option; use strong least-privilege credentials, and restrict or remove that broad access afterwards. For production use private networking or controlled egress.
4. Copy the SRV URI, e.g. `mongodb+srv://DB_USER:ENCODED_PASSWORD@cluster.example.mongodb.net/?retryWrites=true&w=majority`.
5. **Do not commit this connection string**. Passwords with special characters must be URL-encoded.

### C. Vercel

1. Open **https://vercel.com/new**, select **Import Git Repository** and choose `MrAires/campusflow-student-command-center`.
2. Root directory: repository root. Framework: **Vite**. Build command: `npm run build`; output: `dist` (also specified in `vercel.json`).
3. In **Environment Variables**, add:
   - `MONGODB_URI`: your **Atlas SRV URI** (not `mongodb://127.0.0.1`, which would point at Vercel itself).
   - `MONGODB_DB`: `campusflow`.
   - `JWT_SECRET`: a random string with **at least 32 characters**.
4. Create a production secret locally with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Copy the output into Vercel's `JWT_SECRET` variable (never paste it in GitHub or README).
5. Click **Deploy**.
6. Open `https://YOUR-PROJECT.vercel.app/api/health`. The expected result is `{"ok":true,"database":"connected",...}`.
7. Open the website, register a new account and verify full task CRUD, persistence after logout/login, and mobile layout.
8. If API endpoints return 404, inspect Vercel Functions and the project's `vercel.json`; if they return 503, check Atlas network access and the environment variables. Re-deploy after modifying environment settings.
9. Copy your actual live URL into the README and assignment submission form.

**Note:** The ZIP is source code. Creating the GitHub repository and publishing to Vercel require access to *your* logged-in accounts; this project does not contain a fabricated repository or live URL.

### Verified platform guidance

- [Vercel's Vite framework guide](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel Node.js Functions](https://vercel.com/docs/functions/runtimes/node-js)
- [Vercel rewrite configuration](https://vercel.com/docs/routing/rewrites)
- [MongoDB Atlas connection requirements](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/)

## Project architecture

```text
CampusFlow_Fullstack_2024006675/
├── api/index.js           # Express REST API, exported as a Vercel Function
├── server/db.js           # Cached MongoDB connection
├── server/local.js        # Local Express dev server (port 3001)
├── server/seed.js         # Initial demo-style course/task records per new user
├── server/validate.js     # Backend request validation
├── src/App.jsx            # React single-page application + feature components
├── src/styles.css         # Responsive light/dark theme
├── src/main.jsx           # React entry point
├── public/favicon.svg     # Branding icon
├── tests/validate.test.js # Native Node.js validation tests
├── tools/setup.mjs        # Generate a safe local environment file
├── index.html
├── vite.config.js         # Frontend dev + API proxy
├── vercel.json            # Vite output and API route rewrites
├── .env.example
├── .gitignore
├── RUN_WINDOWS.cmd        # One-click Windows starter
├── PUSH_TO_GITHUB.cmd     # GitHub publishing helper
├── package.json
└── README.md
```

## Automated checks

```bash
npm run check
npm test
npm run build
```

The Node.js validation tests cover a valid task, invalid status, invalid date, and course-code normalization. Further real-database API tests can be performed with MongoDB running locally.

## Limitations / next steps

- Demo mode uses browser localStorage intentionally. A lecturer assessing **MongoDB CRUD** should use a registered account with the API connected to MongoDB.
- The sample data and focus timer are for a student demonstration; focus sessions are not stored in MongoDB.
- Do not use unrestricted public Atlas network access or this starter's login endpoint as a high-security production service without rate limiting, account verification, CSRF considerations and operational monitoring.
- When a course is deleted, its existing tasks are not destroyed; their `courseId` becomes blank.

---

**Submitted for:** Web Application Frameworks - Full-Stack Development Assignment | **Registration No.: 2024006675**

## Design preview

Open `PREVIEW_INTERFACE.html` directly in Chrome to inspect the approximate dashboard visual layout without installing packages. It is static and only for viewing the design; it is **not** a working React/MongoDB application. Run `RUN_WINDOWS.cmd` for the real app.
