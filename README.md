# InterviewHub - Interview Experience Portal

A centralized full-stack web application designed for students and candidates to share and discover company-wise interview experiences, log coding/DSA questions (with external solution links), exchange preparation advice, and participate in discussion threads.

---

## Key Features

1. **User Profiles & Roles:** Students can register, log in, manage profiles, and post experiences, while Admins moderate content and manage user records.
2. **Step-by-Step Experience Sharing:** A multi-step form detailing rounds (Online Assessment, Technical, HR), asked questions, and rating reviews.
3. **Interactive Discussion Threads:** Hierarchical comments support nested replies on each experience feed post.
4. **Global Question Bank:** Searchable and filterable grid of all technical questions logged across interviews, complete with links to solve them on LeetCode/GFG/Codeforces.
5. **Interactive Analytics Dashboard:** Visualize hiring trends and DSA topics with responsive custom SVG charts.
6. **Advanced Company Insights:** View outcome statistics (select/reject rates), question difficulty distributions, and hot topics for specific employers.

---

## 🛠️ Zero-Config Resilient Mode

The project features a built-in auto-fallback architecture to run instantly in development environments without external services:
- **No Database Setup Required:** If no `MONGO_URI` is supplied, the server spins up a local **persistent JSON database file** (`backend/data/db.json`).
- **No Image CDN Required:** If no Cloudinary keys are supplied, user profile pictures are stored as Base64 strings.
- **No SMTP Server Required:** If Nodemailer configurations are omitted, email verification links and password recovery tokens are printed directly to the server logs and API responses.

---

## 🔑 Pre-seeded Sandbox Accounts

The database comes pre-seeded with two accounts (pre-verified and populated with mock experiences and questions):

* **Student Account:**
  * **Email:** `student@interview.com`
  * **Password:** `Password123`
* **Admin Account:**
  * **Email:** `admin@interview.com`
  * **Password:** `Password123`

---

## 🚀 Running the Portal Locally

### Prerequisites
Make sure you have **Node.js** (v18+) and **NPM** installed.

### 1. Backend Setup
Navigate to the `backend` folder, install dependencies, and start the development server:

```bash
cd backend
npm install
npm run dev
```
The backend server runs at `http://localhost:5000`.

### 2. Frontend Setup
Navigate to the `frontend` folder, install dependencies, and launch the Vite client:

```bash
cd ../frontend
npm install --legacy-peer-deps
npm run dev
```
The client website runs at `http://localhost:5173`. Open this URL in your web browser.

---

## 📂 Project Structure

- `/backend` - Node.js + Express API. Includes routes, controllers, custom middlewares, schemas, and local fallback databases.
- `/frontend` - React + TypeScript + Tailwind CSS application structured with reusable layout components, global state providers, and responsive dashboards.
