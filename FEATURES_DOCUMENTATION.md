# Reddit Clone Project Features Documentation

## Overview
This document outlines the features implemented in our Reddit clone project, including the basic requirements and additional features like chatting and AI integration. For each feature, we describe the backend and frontend implementations, including the key functions and how they are used.

## Basic Requirements

### 1. Account Creation and Login
**Description**: Users can create accounts and log in to access the platform.

**Backend Implementation**:
- **Routes** (`routes/auth.js`):
  - `POST /api/auth/register`: Creates a new user account. Validates unique username/email, hashes password with bcrypt, saves to MongoDB.
  - `POST /api/auth/login`: Authenticates user credentials, generates JWT token for session management.
- **Model** (`models/User.js`): Stores username, email, password (hashed), avatar, bio, timestamps.
- **Middleware** (`middleware/auth.js`): Verifies JWT tokens for protected routes.

**Frontend Implementation**:
- **Context** (`context/AuthContext.jsx`): Manages user authentication state, provides login/logout functions, persists data in localStorage.
- **Pages**:
  - `pages/Register.jsx`: Form for account creation, calls register API.
  - `pages/Login.jsx`: Form for login, calls login API, stores token and user data.

**Key Functions**:
- Backend: `register` and `login` route handlers handle user creation and authentication.
- Frontend: `AuthContext.login()` saves user data and token; `AuthContext.logout()` clears session.

### 2. Viewing/Editing User's Profile
**Description**: Users can view their own profile and edit details, or view other users' profiles.

**Backend Implementation**:
- **Routes** (`routes/user.js`):
  - `GET /api/users/profile`: Returns current user's profile data (protected).
  - `GET /api/users/:username`: Returns public profile data for any user.
  - `PUT /api/users/profile`: Updates user profile, handles avatar upload to Cloudinary.
- **Cloudinary Integration**: For avatar uploads, configured in `routes/user.js` with Multer and Cloudinary Storage.

**Frontend Implementation**:
- **Pages**:
  - `pages/Profile.jsx`: Displays and allows editing of current user's profile (username, email, bio, avatar).
  - `pages/UserProfile.jsx`: Displays public profile of another user, shows their posts.
- **Components**: Avatar images displayed throughout the app using Cloudinary URLs.

**Key Functions**:
- Backend: `profile` route fetches user data; `update` route modifies profile with file upload.
- Frontend: Profile forms submit updates via PUT request; avatars displayed with fallback to default.

### 3. Creating a Community
**Description**: Users can create new communities (subreddits).

**Backend Implementation**:
- **Routes** (`routes/community.js`):
  - `POST /api/communities/`: Creates new community, sets creator as first member.
- **Model** (`models/Community.js`): Stores name, description, creator, members array.

**Frontend Implementation**:
- **Page** (`pages/CreateCommunity.jsx`): Form to input community name and description, submits to create API.

**Key Functions**:
- Backend: `create` route validates name uniqueness, saves community.
- Frontend: Form submission calls POST to create community, redirects on success.

### 4. Joining/Leaving a Community
**Description**: Users can join or leave communities.

**Backend Implementation**:
- **Routes** (`routes/community.js`):
  - `POST /api/communities/:id/join`: Toggles membership (adds/removes user from members array).

**Frontend Implementation**:
- **Page** (`pages/PostDetail.jsx`): Join/Leave button in community header, updates membership status.
- **Page** (`pages/Community.jsx`): Likely has join/leave functionality (assuming based on structure).

**Key Functions**:
- Backend: `join` route checks current membership, adds or removes user ID from members array.
- Frontend: Button click calls join API, updates UI state and refetches data.

### 5. Creating a Post on a Community
**Description**: Users can create posts in communities they are members of.

**Backend Implementation**:
- **Routes** (`routes/post.js`):
  - `POST /api/posts/`: Creates post with title, content, media uploads. Checks membership, uploads to Cloudinary.
- **Model** (`models/Post.js`): Stores title, content, community, author, media array (images/videos), upvotes/downvotes.
- **Cloudinary Integration**: Handles multiple file uploads for posts.

**Frontend Implementation**:
- **Page** (`pages/CreatePost.jsx`): Form to select community, enter title/content, upload media.
- **Components**: File input for media uploads.

**Key Functions**:
- Backend: `create` route validates membership, processes uploads, saves post.
- Frontend: Form handles file selection, submits multipart form data.

### 6. Viewing Posts of a Community
**Description**: Users can view all posts in a specific community.

**Backend Implementation**:
- **Routes** (`routes/post.js`):
  - `GET /api/posts/community/:communityId`: Fetches posts for a community, sorted by newest first.

**Frontend Implementation**:
- **Page** (`pages/Community.jsx`): Displays community posts, allows joining/leaving.
- **Components** (`components/PostCard.jsx`): Renders individual posts with voting, etc.

**Key Functions**:
- Backend: Query posts by community ID, populate author/community data.
- Frontend: Fetches and maps posts to PostCard components.

### 7. Viewing Feed Page
**Description**: Homepage feed showing all posts across communities.

**Backend Implementation**:
- **Routes** (`routes/post.js`):
  - `GET /api/posts/`: Fetches all posts, sorted by newest first.

**Frontend Implementation**:
- **Page** (`pages/Home.jsx`): Main feed page, displays posts and news sidebar.
- **Components**: `PostCard` for posts, `NewsSidebar` for trending news.

**Key Functions**:
- Backend: Aggregate all posts with population.
- Frontend: Fetches posts on load, renders feed.

### 8. Upvoting/Downvoting Posts
**Description**: Users can vote on posts to show approval/disapproval.

**Backend Implementation**:
- **Routes** (`routes/post.js`):
  - `POST /api/posts/:id/vote`: Handles voting (1=up, -1=down, 0=unvote), uses $addToSet/$pull for atomic updates.
- **Model**: Upvotes/downvotes arrays store user IDs.

**Frontend Implementation**:
- **Component** (`components/PostCard.jsx`): Vote buttons (▲/▼), displays vote count.
- **Function**: `handleVote()` sends vote value to API, updates local state.

**Key Functions**:
- Backend: Atomic MongoDB operations to prevent duplicate votes.
- Frontend: Optimistic UI updates, prevents multiple votes.

### 9. Commenting on Posts
**Description**: Users can comment on posts and reply to comments.

**Backend Implementation**:
- **Routes** (`routes/comment.js`):
  - `POST /api/comments/post/:postId`: Adds comment or reply.
  - `GET /api/comments/post/:postId`: Fetches all comments for a post.
- **Model** (`models/Comment.js`): Stores text, author, post, parentComment (for nesting), upvotes/downvotes.

**Frontend Implementation**:
- **Page** (`pages/PostDetail.jsx`): Comment form and display.
- **Component** (`components/CommentItem.jsx`): Recursive component for nested comments, reply functionality.

**Key Functions**:
- Backend: Saves comments with parent references for threading.
- Frontend: `handleCommentSubmit()` posts comments, `buildCommentTree()` organizes nested structure.

### 10. Searching for Communities and Users
**Description**: Search bar to find communities and users.

**Backend Implementation**:
- **Routes** (`routes/search.js`):
  - `GET /api/search`: Regex search on usernames and community names, limits results.

**Frontend Implementation**:
- **Component** (`components/Navbar.jsx`): Search input with debounced API calls, dropdown results.
- **Links**: Results link to community/user pages.

**Key Functions**:
- Backend: Case-insensitive regex queries.
- Frontend: Debounced search (300ms), dropdown display.

## Additional Features

### Chatting Feature
**Description**: Real-time private messaging between users.

**Backend Implementation**:
- **Routes** (`routes/chat.js`):
  - `GET /api/chat/:otherUserId`: Fetches message history between two users.
- **Model** (`models/Message.js`): Stores sender, receiver, text, timestamp.
- **Socket.IO** (`server.js`): Handles real-time messaging, user registration for notifications, room-based chats.

**Frontend Implementation**:
- **Page** (`pages/Chat.jsx`): Chat interface with message history and input.
- **Socket Integration**: Connects to Socket.IO, joins chat rooms, listens for messages.
- **Notifications** (`components/Navbar.jsx`): Bell icon shows unread messages, dropdown with sender info.

**Key Functions**:
- Backend: Socket events `send_message`, `receive_message`, `new_message_notification`.
- Frontend: `handleSendMessage()` emits to socket, auto-scrolls messages.

### AI Integration Feature
**Description**: AI-powered post summarization using Google's Gemini.

**Backend Implementation**:
- **Routes** (`routes/post.js`):
  - `GET /api/posts/:id/summarize`: Uses GoogleGenerativeAI to generate post summaries.
- **Gemini API**: Configured with API key, prompts for concise summaries.

**Frontend Implementation**:
- **Component** (`components/PostCard.jsx`): "Summarize" button, displays AI-generated summary.
- **Function**: `handleSummarize()` calls API, shows loading state.

**Key Functions**:
- Backend: Creates prompt with post title/content, returns summary text.
- Frontend: Async call with loading indicator, displays result.

### News Sidebar
**Description**: Displays trending news articles.

**Backend Implementation**:
- **Routes** (`routes/news.js`):
  - `GET /api/news/trending`: Returns mock news data (fallback without NewsAPI key).

**Frontend Implementation**:
- **Component** (`components/NewsSidebar.jsx`): Fetches and displays news articles with images.

**Key Functions**:
- Backend: Static mock data for demonstration.
- Frontend: Renders news in sidebar on Home page.

## Technologies Used
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, bcrypt, Multer, Cloudinary, Google Generative AI.
- **Frontend**: React, React Router, Axios, Socket.IO client.
- **Deployment**: Configured for local development with environment variables.