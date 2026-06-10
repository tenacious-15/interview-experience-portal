# InterviewHub - Interview Experience Portal

A centralized full-stack web application designed for students and candidates to share and discover company-wise interview experiences, log coding/DSA questions (with external solution links), exchange preparation advice, and participate in discussion threads.

---

## 🚀 Newly Added Features (Auth Redesign & AI Integration)

We have implemented key upgrades to make user authentication seamless, completely bypass SMTP requirements, and add a data-driven AI assistant:

### 1. Direct Registration & Login (No Email Verification)
- **Direct Login:** The email verification step upon registration has been removed. All new registered student accounts are marked as `isVerified: true` automatically, allowing them to log in immediately.
- **Legacy Account Bypass:** Unverified legacy student accounts are automatically verified and allowed to log in upon entering correct credentials.

### 2. Google OAuth2 Sign-in ("Continue with Google")
- **One-Click Sign-in:** Users can now click the standard Google login button, select their Gmail account, and instantly log in or register.
- **Auto-Registration:** First-time sign-ins via Google automatically create a new student account using the user's Google name, email, and profile avatar (pre-marked as verified).
- **Backend Verification:** Validates tokens securely via Google's tokeninfo API using native Node `fetch` (no external dependency needed).

### 3. SMTP-less Forgot Password (Console Mail Fallback)
- **Bypassed SMTP:** The system runs permanently in Console Fallback mode, meaning you do not need to configure complex SMTP credentials or email passwords (e.g. Gmail App Passwords).
- **Console Logs:** When a user requests a password reset link, the recovery URL is logged directly in the backend terminal console for easy developer testing.

### 4. AI Experience Chatbot (`/ai-coach`)
- **Data-Driven Context:** A premium, generic dark-theme chatbot interface accessible at `/ai-coach` (labeled **"AI Experience Bot"** in the sidebar).
- **Smart Prompts:** Features clickable suggestions to ask about hiring trends for companies (e.g., *"Amazon me DSA round me kya puchte hain?"*).
- **Dynamic Analysis:** When asked about a company, the backend searches the database for all related interview experiences and asked questions, compiles the statistics (top topics, selection rate, typical questions), and feeds it to Google Gemini to formulate an accurate Hinglish/English response.
- **Resilient Fallback:** If the Gemini API key is missing, the backend runs a local statistical aggregation engine to return structured counts and preparation advice.

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
Navigate to the `backend` folder and start the dev server:
```bash
cd backend
npm install
npm run dev
```
The backend server runs at `http://localhost:5000`.

### 2. Frontend Setup
Navigate to the `frontend` folder and launch the Vite client:
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
