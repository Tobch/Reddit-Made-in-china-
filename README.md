# 🛡️ Reddit Made in China (Project: Cyber-Midnight)

An end-to-end, real-time social platform clone built with a **MERN stack**, featuring a custom cybersecurity-themed UI, real-time messaging, and an AI-powered news engine.

## 🚀 Overview

"Reddit Made in China" is a full-stack social media application designed with a "Cyber-Midnight" aesthetic. It moves beyond simple CRUD operations by incorporating **WebSockets** for live interaction and the **Google Gemini API** to generate context-aware news and content.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS (Cyber-Midnight Theme), Axios.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas (NoSQL).
* **Real-Time:** Socket.io (WebSockets).
* **AI Integration:** Google Gemini 1.5 Flash.
* **Media Storage:** Cloudinary (Image uploads).
* **Tunneling/Deployment:** Cloudflare Tunnels (Local Dev), Vercel (Production Frontend).

---

## ✨ Key Features & Functions

### 1. User Authentication & Profile Management

* **Secure JWT Auth:** Custom middleware for protecting routes and managing user sessions.
* **Avatar Uploads:** Integrated with **Cloudinary** for cloud-based profile image storage.
* **User Profiles:** Dynamic profile pages showing post history and user statistics.

### 2. Community & Post System

* **Custom Communities:** Users can create and join sub-reddits (communities) with unique themes.
* **Rich Content Posts:** Support for text-based posts and image uploads.
* **Voting System:** Real-time upvoting/downvoting logic.
* **Nested Comments:** Recursive comment structure for deep discussions.

### 3. Real-Time Chat & Notifications

* **Live Messaging:** Built with **Socket.io** to allow instant, private messaging between users.
* **Global Notifications:** Users receive a notification ping in the Navbar the moment they get a new message, regardless of which page they are on.
* **Private Rooms:** Secure socket joining for specific user-to-user chat IDs.

### 4. AI News Engine (Gemini AI)

* **Automated News:** Uses the **Google Gemini API** to fetch or generate cybersecurity and tech-related news snippets.
* **Sidebar Feed:** A dedicated AI-generated sidebar that keeps the community updated on the latest tech trends.

### 5. Search & Discovery

* **Full-Text Search:** Integrated backend search routes that scan through Users, Posts, and Communities simultaneously.
* **Interactive Sidebar:** Dynamic navigation for trending topics and communities.

---

## 🔒 Security & Performance Features

* **CORS Protection:** Configured to whitelist specific frontend origins (Vercel/Local).
* **Environment Security:** All sensitive keys (Mongo, Gemini, JWT) are managed via `.env` files.
* **Optimized Connections:** Mongoose configured with `serverSelectionTimeoutMS` and `socketTimeoutMS` to handle high-latency tunnel connections.
* **Error Handling:** Implemented "Guard Clauses" (e.g., `Array.isArray` checks) to prevent React crashes during slow API fetches.

---

## 📂 Project Structure

```text
├── reddit-clone-frontend/   # React/Vite source code
├── reddit-clone-backend/    # Node/Express API
│   ├── models/              # Mongoose Schemas (User, Post, Message, etc.)
│   ├── routes/              # Express Endpoints
│   ├── middleware/          # JWT and Auth logic
│   └── server.js            # Main entry point with Socket.io
└── uploads/                 # Local storage for temporary files

```

---

## 🚦 Getting Started (Local Development)

1. **Clone the Repo:**
```bash
git clone https://github.com/your-username/reddit-clone.git

```


2. **Setup Backend:**
* Navigate to `reddit-clone-backend`.
* Create a `.env` file with `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.
* Run `npm install` and `npm start`.


3. **Setup Frontend:**
* Navigate to `reddit-clone-frontend`.
* Create a `.env` file with `VITE_API_URL`.
* Run `npm install` and `npm run dev`.


4. **Expose the API (Optional):**
* Use `cloudflared tunnel --url http://localhost:5000` to make it accessible to Vercel.



---
