# SpendWise - Premium Expense Manager

SpendWise is a full-stack personal finance and expense management web application built using the MERN stack (MongoDB, Express.js, React, Node.js). It features a modern dark mode, responsive layouts, real-time charts/analytics, and JWT-based authentication.

## Features

- **JWT Authentication**: User registration, login, and route protection using JSON Web Tokens. Passwords are safely hashed using `bcryptjs`.
- **Expense CRUD**: Full CRUD support for expenses (Amount, Category, Description, Date).
- **Search & Filters**: Search description fields and filter by category or customized date ranges.
- **Interactive Analytics**:
  - Pie chart representing category contribution.
  - Area trend line showing monthly spending patterns (last 6 months).
  - Highlights cards showing Total, Current Month, and Highest Spending Category metrics.
  - Interactive categories list showing percentage shares and progress bars.
- **Premium UX**: Smooth animations, dark mode theme persistence, customizable toast alerts, paginated lists, and clean mobile responsiveness.

---

## Getting Started

### Prerequisites
- Node.js (v16+) and npm installed on your machine.
- MongoDB instance (local or MongoDB Atlas connection string).

---

### Step 1: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

4. Start the development server (uses `nodemon` for auto-reload):
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

---

### Step 2: Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`.*

---

## Project Structure

```
expense-manager/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Authentication & Expense logic
│   ├── middleware/      # Auth protection middlewares
│   ├── models/          # Mongoose database models
│   ├── routes/          # Express route definitions
│   ├── .env.example
│   ├── package.json
│   └── server.js        # Main entry point
└── frontend/
    ├── src/
    │   ├── components/  # Shared & UI widgets (Dashboard, Expense, Common)
    │   ├── context/     # Auth & Toast global states
    │   ├── hooks/       # useAuth, useToast custom hooks
    │   ├── pages/       # Login, Register, Dashboard, Expenses, Analytics
    │   ├── services/    # Axios HTTP wrappers
    │   ├── App.jsx
    │   ├── index.css    # Tailwind styles
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```
