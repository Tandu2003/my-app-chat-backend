# My Chat App Backend

This is the backend service for **My Chat App**, a real-time chat application that supports user registration, authentication, friend requests, private messaging, blocking users, and more.

## Features

- User registration with email verification
- Secure authentication (JWT, HTTP-only cookies)
- Friend request system (send, accept, reject, delete requests)
- 1-1 chat and messaging
- Block/unblock users
- User profile management
- Password change and security features

## Technology Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for authentication
- Nodemailer for email verification
- Helmet, CORS, Morgan for security and logging

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB database (local or Atlas)
- Gmail account for sending verification emails (or update to your SMTP provider)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Tandu2003/my-app-chat-backend
   cd my-chat-app-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Copy `.env` and update the following values:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000` by default.

## Notes

- Email verification is required before login.
- Passwords are securely hashed.
- JWT tokens are stored in HTTP-only cookies for security.
- You can use tools like Postman to test the API.

## License

This project is for educational purposes. Feel free to use and modify it for your own learning or projects.
