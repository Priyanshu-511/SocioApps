# SocioApps

**SocioApps** is a practice project that explores how social networking apps work internally. The backend is built using **Express.js** with **JWT-based authentication**. This project is intended for learning and experimentation purposes.

---

## 🧠 Features

- ✅ User registration and login

- 🔐 JWT-based authentication and route protection

- 🧰 Modular and clean project structure

- 🚀 Easy to extend with likes, comments, posts, and more

- 🖥️ Simple EJS-based views (no frontend framework required)

---

## 🛠️ Tech Stack

- **Node.js** – JavaScript runtime
- **Express.js** – Web framework for Node.js
- **jsonwebtoken** – JWT implementation for token-based authentication
- **bcryptjs** – For password hashing
- **dotenv** – For managing environment variables
- **EJS** - View templating engine
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

### 1. How to run it.

```bash
git clone https://github.com/yourusername/SocioApps.git
cd SocioApps
npm install
node server.js
```

must have to setup your enviroment file configuration by

```env
PORT=5000
JWT_SECRET=your_jwt_secret
```

- Visit http://localhost:5000 in your browser

### 2. 🔗 Live Demo

Deployed at 

- visit https://socioapps.onrender.com/ on your browser


### note: It may be take more time to start due to inactivity timeout on render