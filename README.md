
# Educational Platform

A web application for managing courses, enrollments and student progress.

## Prerequisites

- Node.js

## Installation

1. Clone the repository in Replit
2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Click the "Run" button in Replit, or run:
```bash
npm run dev
```

2. The application will be available at port 5000

## Features

- User authentication (students and administrators)
- Course management
- Student enrollment
- Progress tracking
- Notes system

## Project Structure

- `client/`: Frontend React application
- `server/`: Backend Express server
- `shared/`: Shared types and schemas

## API Routes

- `/api/auth`: Authentication endpoints
- `/api/courses`: Course management
- `/api/enrollments`: Enrollment management
- `/api/users`: User management

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Express.js, PostgreSQL
- Authentication: Passport.js
- API: REST
