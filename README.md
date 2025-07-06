# SocioApps

**SocioApps** is a practice project that explores how social networking apps work internally. The backend is built using **Express.js** with **JWT-based authentication**. This project is intended for learning and experimentation purposes.

---

## 🧠 Features

- User registration and login
- JWT authentication for route protection
- Express server setup
- Clean project structure
- Easy to extend with more social features

---

## 🛠️ Tech Stack

- **Node.js** – JavaScript runtime
- **Express.js** – Web framework for Node.js
- **jsonwebtoken** – JWT implementation for token-based authentication
- **bcryptjs** – For password hashing
- **dotenv** – For managing environment variables

---

## 📁 Project Structure

```bash
SocioApps/
├── server.js # Entry point
├── routes/
│ └── auth.js # Authentication routes
├── controllers/
│ └── authController.js # Auth logic
├── middleware/
│ └── authMiddleware.js # JWT verification
├── models/
│ └── userModel.js # In-memory user model or schema
├── views
│ └── index.ejs
│ └── HOME.ejs
├── .env # Environment variables
├── .gitignore
└── README.md

```


---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/SocioApps.git
cd SocioApps
npm install
node server.js
```
must have to setup your enviroment file configuration

### 2. Demo:
Deployed at 
```bash
https://socioapps.onrender.com/
```

