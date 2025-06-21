# 💊 Medication Management System

A full-stack web application that allows patients to track their daily medications and caretakers to manage and monitor them effectively.

Built with:
- **Frontend:** React, Tailwind CSS, React Router, React Query, Shadcn UI
- **Backend:** Node.js, Express, SQLite
- **Authentication:** JWT-based login/signup for both Patients and Caretakers

---

## 🚀 Features

### ✅ Patients
- Sign up, login securely
- View daily medications
- Mark medication as taken with optional photo proof
- Visual **calendar view** with streaks and missed days
- Real-time **adherence stats**
- Streak tracker and medication completion feedback

### 🧑‍⚕️ Caretakers
- Secure login
- View and manage assigned patients
- Add new medications for a patient
- View each patient’s medication adherence and activity

---

## 📸 UI Highlights

- Modern responsive design using **Tailwind CSS** & **Shadcn UI**
- Dashboard with **calendar-based medication view**
- Interactive form dialogs to add medications
- Feedback indicators (green/red dots, streak highlights)

---

## 🧠 Tech Stack

| Area       | Tech Used |
|------------|-----------|
| Frontend   | React, TypeScript, Tailwind CSS, React Router, React Query |
| Backend    | Node.js, Express, SQLite |
| Auth       | JWT Tokens (separate for patients and caretakers) |
| State Mgmt | React Context + React Query |
| Testing    | Vitest (Unit testing for utils/middleware) |

---

## 🚀 Getting Started

### 1. Clone the Repository

Using HTTPS:
```bash
git clone https://github.com/Nithish-14/Medication-Management-System.git
```

or Using SSH
```
git clone git@github.com:Nithish-14/Medication-Management-System.git
```

### 2. Then navigate into the project directory:

```bash
cd Medication-Management-System
```

---

## 📂 Folder Structure (Important Parts)

```
project/
│
├── backend/
│ ├── src/
│ │ ├── routes/
│ │ ├── controllers/
│ │ ├── middleware/
│ │ ├── models/
│ │ ├── tests/
│ │ ├── utils/
│ │ └── app.ts/
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── hooks/
│ │ ├── context/
│ │ └── App.tsx

```

## ⚙️ Setup Instructions

### 🔧 Backend Setup

#### 1. Prerequisites
- Node.js (v16+)
- npm

#### 2. Installation
```bash
cd backend
npm install
```

#### 3. Environment Variables
Create a .env file in the backend directory:
```bash
PORT=5000
JWT_SECRET='jwt-secret-key'
```

#### 4. Run the Backend
```bash
npm run dev
```

#### 5. API Base URL
```bash
http://localhost:5000
```

### 🌐 Frontend Setup

#### 1. Prerequisites
- Node.js (v16+)
-  npm

#### 2. Installation
```bash
cd frontend
npm install
```

#### 3. Environment Variables
Create a .env.local file in the frontend directory:
```bash
VITE_API_URL=http://localhost:5000
```

#### 4. Run the Frontend
```bash
npm run dev
```

#### 5. Frontend URL
```bash
http://localhost:8080
```

---

## 📚 API Endpoints

- POST /api/auth/signup

- POST /api/auth/login

- GET /api/auth/login

- GET /api/auth/login

- GET /api/medications/stats

- GET /api/medications/

- POST /api/medications/add

- POST /api/medications/mark

- GET /api/medications/calendar/monthly

- GET /api/medications/daily-status

- DELETE /api/medications/delete

- GET /api/medications/caretaker/patients

- GET /api/medications/recent

---

## 🧪 Environment Files

### 📁 backend/.env.example
```bash
PORT=5000
JWT_SECRET='jwt-secret-key'
```

### 📁 frontend/.env.example
```bash
VITE_API_URL=http://localhost:5000
```

---

## 🧪 Testing

```bash
# Run all tests
npx vitest

# Watch mode
npx vitest --watch
```

---

## 📌 Future Enhancements

- Notifications/reminders for missed meds

- Admin role for analytics

- PDF/CSV exports for patient logs

- Image preview + zoom modal

---

## 👨‍💻 Author

- Built by Nithish M  
- GitHub: [@Nithish-14](https://github.com/Nithish-14)