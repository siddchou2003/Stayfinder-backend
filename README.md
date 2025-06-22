Project Structure

backend/
├── controllers/
├── cron/
├── middleware/
├── models/
├── routes/
├── seed/
├── uploads/
├── .env
├── package.json
├── package-lock.json
└── server.js

Prerequisites

1. Node.js and npm installed
2. MongoDB installed and running

Steps to run

1. Navigate to the backend folder:
   cd backend

2. Initialize the project (if not already done):
   npm init -y

3. Install dependencies:
   npm install express mongoose dotenv cors jsonwebtoken bcryptjs

4. (Optional) Install dev dependencies:
   npm install --save-dev nodemon

5. Create environment variables:
   In backend/, create a .env file:
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/stayfinder
   JWT_SECRET=your_jwt_secret_key

6. Add dev script to package.json:
   Inside package.json, add:
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }

7. Start the server:
   npm run dev
