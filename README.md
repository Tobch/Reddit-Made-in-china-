# Reddit Clone Project

## Project Overview

This is a full-stack Reddit clone application built with:
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT authentication
- **Frontend**: React 18, React Router, Axios, Vite
- **Architecture**: RESTful API with separate frontend and backend applications

## Development Setup

### Backend Setup
```bash
cd reddit-clone
npm install
npm run dev  # Runs on port 3000
```

### Frontend Setup
```bash
cd reddit-clone-frontend
npm install
npm run dev  # Runs on port 5173
```

# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Authentication Endpoints
**Responsible Student: Ahmed Tabbash**

### Register User
```http
POST /api/auth/register
```
**Description**: Register a new user account  
**Auth Required**: No  
**Request Body**:
```json
{
  "username": "string (required, unique)",
  "email": "string (required, unique, valid email)",
  "password": "string (required)"
}
```
**Response**:
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "karma": 0,
    "createdAt": "date"
  },
  "token": "jwt_token"
}
```

### Login User
```http
POST /api/auth/login
```
**Description**: Login user and receive JWT token  
**Auth Required**: No  
**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```
**Response**:
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "userId": "string"
}
```

## User Management Endpoints
**Responsible Student: Ahmed Tababsh**

### Get User Profile
```http
GET /api/users/profile/:id
```
**Description**: Get user profile by ID  
**Auth Required**: Yes  
**Parameters**: `id` (user ID)  
**Response**:
```json
{
  "message": "User profile fetched successfully",
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "karma": "number",
    "joinedSubreddits": ["subreddit_ids"],
    "savedPosts": ["post_ids"],
    "createdAt": "date"
  }
}
```

### Update User Profile
```http
PUT /api/users/profile/:id
```
**Description**: Update user profile (owner only)  
**Auth Required**: Yes  
**Parameters**: `id` (user ID)  
**Request Body**:
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)"
}
```

### Delete User Profile
```http
DELETE /api/users/profile/:id
```
**Description**: Delete user account (owner only)  
**Auth Required**: Yes  
**Parameters**: `id` (user ID)

### Search Users
```http
GET /api/users/search?q=username
```
**Description**: Search users by username  
**Auth Required**: Yes  
**Query Parameters**: `q` (search query)  
**Response**:
```json
{
  "message": "Users fetched successfully",
  "users": [
    {
      "_id": "string",
      "username": "string"
    }
  ]
}
```

### Save/Unsave Post
```http
POST /api/users/posts/:postId/save
```
**Description**: Toggle save status of a post  
**Auth Required**: Yes  
**Parameters**: `postId` (post ID)  
**Response**:
```json
{
  "message": "Post saved/unsaved",
  "saved": "boolean"
}
```

### Get Saved Posts
```http
GET /api/users/saved
```
**Description**: Get user's saved posts  
**Auth Required**: Yes  
**Response**:
```json
{
  "message": "Saved posts fetched successfully",
  "posts": ["populated_post_objects"]
}
```

### Check if Post is Saved
```http
GET /api/users/posts/:postId/saved
```
**Description**: Check if a post is saved by current user  
**Auth Required**: Yes  
**Parameters**: `postId` (post ID)  
**Response**:
```json
{
  "saved": "boolean"
}
```

## Post Management Endpoints
**Responsible Student: Ahmed Nofull**

### Get All Posts
```http
GET /api/posts
```
**Description**: Get all posts with author and subreddit info  
**Auth Required**: No  
**Response**:
```json
{
  "status": "success",
  "results": "number",
  "data": {
    "posts": [
      {
        "_id": "string",
        "title": "string",
        "content": "string",
        "author": {
          "_id": "string",
          "username": "string"
        },
        "subreddit": {
          "_id": "string",
          "name": "string"
        },
        "upvotes": "number",
        "downvotes": "number",
        "score": "number",
        "hot": "number",
        "comments": ["comment_ids"],
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
  }
}
```

### Get Post by ID
```http
GET /api/posts/:id
```
**Description**: Get single post with full details  
**Auth Required**: No  
**Parameters**: `id` (post ID)

### Create Post
```http
POST /api/posts
```
**Description**: Create a new post  
**Auth Required**: Yes  
**Request Body**:
```json
{
  "title": "string (required)",
  "content": "string (required)",
  "subredditId": "string (required)"
}
```

### Update Post
```http
PUT /api/posts/:id
```
**Description**: Update post (owner only)  
**Auth Required**: Yes  
**Parameters**: `id` (post ID)  
**Request Body**:
```json
{
  "title": "string",
  "content": "string"
}
```

### Delete Post
```http
DELETE /api/posts/:id
```
**Description**: Delete post and associated comments (owner only)  
**Auth Required**: Yes  
**Parameters**: `id` (post ID)

## Comment Management Endpoints
**Responsible Student: Ahmed Nofull**

### Get Comments for Post
```http
GET /api/comments/:postId/comments
```
**Description**: Get all comments for a specific post  
**Auth Required**: No  
**Parameters**: `postId` (post ID)  
**Response**:
```json
{
  "message": "Comments fetched successfully",
  "comments": [
    {
      "_id": "string",
      "content": "string",
      "author": "user_id",
      "post": "post_id",
      "upvotes": "number",
      "downvotes": "number",
      "score": "number",
      "createdAt": "date"
    }
  ]
}
```

### Add Comment
```http
POST /api/comments/:postId/comments
```
**Description**: Add comment to a post  
**Auth Required**: Yes  
**Parameters**: `postId` (post ID)  
**Request Body**:
```json
{
  "content": "string (required)"
}
```

### Update Comment
```http
PUT /api/comments/:postId/comments/:commentId
```
**Description**: Update comment (owner only)  
**Auth Required**: Yes  
**Parameters**: `postId`, `commentId`  
**Request Body**:
```json
{
  "content": "string (required)"
}
```

### Delete Comment
```http
DELETE /api/comments/:postId/comments/:commentId
```
**Description**: Delete comment (owner only)  
**Auth Required**: Yes  
**Parameters**: `postId`, `commentId`

## Subreddit Management Endpoints
**Responsible Student: Ahmed Tabbash**

### Get All Subreddits
```http
GET /api/subreddits?searchKey=query&limit=number
```
**Description**: Get all subreddits with optional search and limit  
**Auth Required**: No  
**Query Parameters**:
- `searchKey` (optional): Search by name
- `limit` (optional): Limit results  
**Response**:
```json
{
  "status": "success",
  "results": "number",
  "data": {
    "subreddits": [
      {
        "_id": "string",
        "name": "string",
        "description": "string",
        "memberCount": "number",
        "isPublic": "boolean",
        "createdAt": "date"
      }
    ]
  }
}
```

### Get Subreddit by ID
```http
GET /api/subreddits/:id
```
**Description**: Get single subreddit details  
**Auth Required**: No  
**Parameters**: `id` (subreddit ID)

### Create Subreddit
```http
POST /api/subreddits
```
**Description**: Create new subreddit  
**Auth Required**: Yes  
**Request Body**:
```json
{
  "name": "string (required, min: 3, unique)",
  "description": "string (required, min: 20)"
}
```

### Update Subreddit
```http
PUT /api/subreddits/:id
```
**Description**: Update subreddit (moderator only)  
**Auth Required**: Yes  
**Parameters**: `id` (subreddit ID)  
**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "about": "string",
  "icon": "string",
  "banner": "string",
  "isPublic": "boolean",
  "rules": [
    {
      "title": "string",
      "description": "string"
    }
  ]
}
```

### Delete Subreddit
```http
DELETE /api/subreddits/:id
```
**Description**: Delete subreddit (moderator only)  
**Auth Required**: Yes  
**Parameters**: `id` (subreddit ID)

### Join Subreddit
```http
POST /api/subreddits/:id/join
```
**Description**: Join a subreddit  
**Auth Required**: Yes  
**Parameters**: `id` (subreddit ID)

### Leave Subreddit
```http
POST /api/subreddits/:id/leave
```
**Description**: Leave a subreddit  
**Auth Required**: Yes  
**Parameters**: `id` (subreddit ID)

### Add Moderator
```http
POST /api/subreddits/:id/moderators
```
**Description**: Add moderator to subreddit (moderator only)  
**Auth Required**: Yes  
**Parameters**: `id` (subreddit ID)  
**Request Body**:
```json
{
  "userId": "string (required)"
}
```

### Remove Moderator
```http
DELETE /api/subreddits/:id/moderators
```
**Description**: Remove moderator from subreddit (moderator only)  
**Auth Required**: Yes  
**Parameters**: `id` (subreddit ID)  
**Request Body**:
```json
{
  "userId": "string (required)"
}
```

## Voting System Endpoints
**Responsible Student: Ahmed Nofull**

### Upvote Post
```http
POST /api/posts/:id/upvote
```
**Description**: Upvote a post (toggle - click again to remove)  
**Auth Required**: Yes  
**Parameters**: `id` (post ID)  
**Response**:
```json
{
  "message": "Post upvoted/Upvote removed/Vote changed to upvote",
  "postId": "string",
  "userId": "string",
  "action": "created/removed/changed",
  "voteType": "1/-1/null"
}
```

### Downvote Post
```http
POST /api/posts/:id/downvote
```
**Description**: Downvote a post (toggle - click again to remove)  
**Auth Required**: Yes  
**Parameters**: `id` (post ID)

### Upvote Comment
```http
POST /api/comments/:id/upvote
```
**Description**: Upvote a comment (toggle - click again to remove)  
**Auth Required**: Yes  
**Parameters**: `id` (comment ID)

### Downvote Comment
```http
POST /api/comments/:id/downvote
```
**Description**: Downvote a comment (toggle - click again to remove)  
**Auth Required**: Yes  
**Parameters**: `id` (comment ID)

## Chat & Messaging Endpoints
**Responsible Student: Ahmed Nofull**

### Get User's Chats
```http
GET /api/chats
```
**Description**: Get all chats for current user  
**Auth Required**: Yes  
**Response**:
```json
{
  "chats": [
    {
      "_id": "string",
      "participants": [
        {
          "_id": "string",
          "username": "string"
        }
      ],
      "lastMessage": "string",
      "lastMessageAt": "date",
      "createdAt": "date"
    }
  ]
}
```

### Create or Get Chat
```http
POST /api/chats
```
**Description**: Create new chat or get existing chat with another user  
**Auth Required**: Yes  
**Request Body**:
```json
{
  "recipientId": "string (required)"
}
```
**Response**:
```json
{
  "chat": {
    "_id": "string",
    "participants": ["populated_user_objects"],
    "messages": [],
    "createdAt": "date"
  }
}
```

### Get Chat Messages
```http
GET /api/chats/:chatId/messages
```
**Description**: Get all messages for a specific chat  
**Auth Required**: Yes  
**Parameters**: `chatId` (chat ID)  
**Response**:
```json
{
  "messages": [
    {
      "_id": "string",
      "sender": {
        "_id": "string",
        "username": "string"
      },
      "content": "string",
      "createdAt": "date"
    }
  ]
}
```

### Send Message
```http
POST /api/chats/:chatId/messages
```
**Description**: Send a message in a chat  
**Auth Required**: Yes  
**Parameters**: `chatId` (chat ID)  
**Request Body**:
```json
{
  "content": "string (required)"
}
```
**Response**:
```json
{
  "message": {
    "_id": "string",
    "sender": {
      "_id": "string",
      "username": "string"
    },
    "content": "string",
    "createdAt": "date"
  }
}
```

### Search Users for Chat
```http
GET /api/chats/users/search?query=username
```
**Description**: Search users to start a chat with  
**Auth Required**: Yes  
**Query Parameters**: `query` (search term)  
**Response**:
```json
{
  "users": [
    {
      "_id": "string",
      "username": "string"
    }
  ]
}
```
