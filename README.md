# 📚 Full-Stack Learning Management System (LMS)

A modern, scalable **Learning Management System** built with **Next.js**, **Express**, **AWS Serverless Infrastructure**, **Clerk Authentication**, and **Stripe Payments**.  

This project is split into two main parts:

- `client/` → Next.js frontend (Vercel hosted, Clerk auth, Stripe integration).
- `server/` → Express backend (AWS Lambda + DynamoDB).

---

## 🚀 Features

- 🔐 **Authentication & Authorization** via [Clerk](https://clerk.com/)  
- 💳 **Payments & Subscriptions** via [Stripe](https://stripe.com/)  
- 📹 **Video Uploads & Streaming** via AWS S3 + CloudFront  
- 📦 **Serverless API** via AWS Lambda + API Gateway  
- 🗄 **Scalable Database** via DynamoDB (Dynamoose ORM)  
- ⚡ **Optimistic UI Updates** via Redux Toolkit Query  
- 🎨 **Modern UI/UX** with:
  - [shadcn/ui](https://ui.shadcn.com/) components  
  - Tailwind CSS global styling  
  - Radix UI primitives  
  - Skeleton loaders for smooth UX  
  - Framer Motion animations  
- 🧑‍🏫 **Course Management** with video lessons, drag-and-drop ordering, and S3 uploads  
- 🖱 **Drag & Drop (DND)** via `@hello-pangea/dnd` for lessons & modules  
- 📈 **User Progress Tracking** with chapters/sections progress saved in DB  

---

## 🖼️ Screenshots

### 🏠 Main Page
<img width="1900" alt="Main Page" src="https://github.com/user-attachments/assets/4a393266-42c6-4310-80ae-75909c2fa002" />

<img width="1899" alt="Main Page Continued" src="https://github.com/user-attachments/assets/94f02205-154c-45f5-a74e-22de9a234dd1" />

### 📚 Courses & Details
<img width="1902" alt="Courses" src="https://github.com/user-attachments/assets/4f6a5510-4215-4775-bbb2-5bbb50aacd90" />

### 💳 Checkout
<img width="1900" alt="Checkout Page" src="https://github.com/user-attachments/assets/53a87db9-e2b7-4f9b-92a1-6c4dcbd3a8b8" />

### 👤 Profile
<img width="1900" alt="Profile Page" src="https://github.com/user-attachments/assets/d720e596-8b8c-4aaa-9f98-58268b6d21d9" />

### 🔔 Notifications
<img width="1920" alt="Notifications" src="https://github.com/user-attachments/assets/bd8c043b-7dc8-4af6-b698-88f36d143ec3" />

### 📝 Course Creation (Drag & Drop + Upload to S3)
<img width="1920" alt="Create Course" src="https://github.com/user-attachments/assets/74883006-ce77-4482-b403-e68e09e1cdab" />

### 🔑 Authentication
**Signup**
<img width="1912" alt="Signup" src="https://github.com/user-attachments/assets/25139158-3e1b-46d3-aa5c-c3d49aa2963f" />

**Login**
<img width="1920" alt="Login" src="https://github.com/user-attachments/assets/115f826f-2f90-4ab0-a4c1-2ecc03a9b191" />

### 🎥 Watching a Course
<img width="1899" alt="Watch Video" src="https://github.com/user-attachments/assets/e39307c1-af00-4176-b2b7-b96753085b4e" />

---

## 🏗️ Tech Stack

### Frontend (`client/`)
- **Framework**: Next.js 15 (App Router) + React 19
- **Router**: Next.js built-in router
- **Auth**: Clerk (`@clerk/nextjs`)
- **State Management**: Redux Toolkit + RTK Query
- **UI**: Tailwind CSS, shadcn/ui, Radix UI, Framer Motion
- **Forms & Validation**: React Hook Form + Zod
- **Uploads**: FilePond + Signed S3 URLs
- **Payments**: Stripe.js + React Stripe
- **Notifications**: Sonner
- **Drag & Drop**: `@hello-pangea/dnd`
- **Type Safety**: TypeScript everywhere
- **Deployment**: Vercel

### Backend (`server/`)
- **Framework**: Express 5 (TypeScript)
- **Serverless**: `serverless-http` → AWS Lambda
- **Auth**: Clerk (`@clerk/express`)
- **Database**: DynamoDB + Dynamoose ORM
- **Payments**: Stripe (server-side)
- **File Uploads**: Multer + Signed URLs for S3
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Deployment**: Docker + AWS ECR + Lambda

---

## 📡 API Reference

All APIs are **RESTful**, prefixed with:  
/api/v1


### 🔑 Auth & Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/users/clerk/:userId` | Update user profile synced with Clerk |
| `GET` | `/users/:userId` | Get user profile |
| `DELETE` | `/users/:userId` | Delete a user |

---

### 📚 Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/courses` | Fetch all courses (optional `category` query param) |
| `GET` | `/courses/:courseId` | Fetch single course by ID |
| `POST` | `/courses` | Create a new course (teacherId, teacherName) |
| `PUT` | `/courses/:courseId` | Update a course (form data) |
| `DELETE` | `/courses/:courseId` | Delete a course |
| `POST` | `/courses/:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url` | Generate signed S3 upload URL for video |

---

### 💳 Transactions & Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/transactions?userId=xxx` | Get all transactions for a user |
| `POST` | `/transactions` | Create a new transaction (after payment) |
| `POST` | `/transactions/stripe/payment-intent` | Create Stripe PaymentIntent (returns clientSecret) |
| `POST` | `/transactions/stripe/webhook` | Stripe webhook for payment confirmation |

---

### 📈 User Course Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users/course-progress/:userId/enrolled-courses` | Get all enrolled courses for a user |
| `GET` | `/users/course-progress/:userId/courses/:courseId` | Get progress for a specific course |
| `PUT` | `/users/course-progress/:userId/courses/:courseId` | Update course progress (sections/chapters) |

---

### 📤 Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/uploads` | Upload files (via Multer, e.g., thumbnails, PDFs) |
| `POST` | `/courses/:id/sections/:sid/chapters/:cid/get-upload-url` | (Primary) Signed URL for video upload to S3 |

---

## 🔐 Authentication Flow

1. User signs in via Clerk → JWT issued.
2. JWT included in every API request as `Authorization: Bearer <token>`.
3. Backend validates token with `@clerk/express`.

---

## 💳 Payment Flow (Stripe)

1. Frontend requests `createStripePaymentIntent`.
2. Backend creates PaymentIntent via Stripe API.
3. Stripe returns `clientSecret`.
4. Frontend confirms with Stripe.js.
5. Stripe webhook notifies backend → DynamoDB updated.


---

## 🖥️ Local Development

### Prerequisites
- Node.js 20+
- Docker
- AWS CLI
- Stripe API keys
- Clerk API keys

### Setup
```bash
# Install deps
cd client && npm install
cd ../server && npm install
Environment Variables
Client (client/.env.local)

NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
Server (server/.env)

PORT=4000
CLERK_SECRET_KEY=your-clerk-secret
STRIPE_SECRET_KEY=your-stripe-secret
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=LMS_TABLE
S3_BUCKET_NAME=lms-uploads
Run Locally

# Client
cd client
npm run dev

# Server
cd server
npm run dev
☁️ Deployment
Frontend
Hosted on Vercel

Backend
Docker image → AWS ECR

API Gateway → AWS Lambda (serverless)

DynamoDB, S3, CloudFront configured in AWS

🖼️ Architecture Diagram

Client → Clerk → Vercel → AWS API Gateway → Lambda (Express) → DynamoDB
                          ↘ S3 (videos/files) → CloudFront (CDN)
