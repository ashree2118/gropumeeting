# Group Meeting Scheduler

A full-stack web application that simplifies scheduling group meetings by allowing hosts to propose meeting times and guests to vote on their availability.

## 🎯 Features

- **Google OAuth Authentication** - Secure login via Google accounts
- **Meeting Creation** - Hosts can create meetings with multiple proposed time slots
- **Guest Voting** - Guests submit their availability for proposed times
- **Smart Scheduling** - View heatmaps and analytics of guest availability
- **Email Notifications** - Guests receive email invitations and confirmations
- **Meeting Confirmation** - Hosts finalize the best time based on guest votes
- **Responsive Design** - Works seamlessly on desktop and mobile

## 📋 Project Structure

```
gropumeeting/
├── backend/        # Express.js API server
├── frontend/       # React app for hosts and guests
├── landing/        # Marketing landing page
└── README.md       # This file
```

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - API server
- **PostgreSQL** + **Drizzle ORM** - Database
- **Google OAuth** - Authentication
- **Nodemailer** - Email sending
- **JWT** - Session management
- **Zod** - Data validation

### Frontend
- **React** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Zustand** - State management
- **React Query** - Server state management

### Landing Page
- **React** + **TypeScript** - Marketing site
- **Vite** - Build tool
- **Tailwind CSS** - Styling

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ or Bun
- PostgreSQL database
- Google OAuth credentials (Client ID)
- SMTP credentials for email sending

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/gropumeeting
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

4. Run migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Landing Page Setup

1. Navigate to the landing directory:
```bash
cd landing
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 📚 API Endpoints

### Authentication
- `POST /auth/google` - Login with Google

### Meetings (Protected Routes)
- `POST /meetings` - Create a new meeting
- `GET /meetings/mine` - Get all meetings created by the host
- `GET /meetings/admin/:meetingId` - Get meeting dashboard data
- `POST /meetings/:meetingId/confirm` - Confirm final meeting time

### Guest Routes (Public)
- `GET /meetings/guest/:guestSlug` - Get meeting details for guest
- `POST /meetings/guest/:guestSlug/vote` - Submit guest availability vote

## 🗄️ Database Schema

### Users
- `id` - UUID primary key
- `googleId` - Google OAuth ID
- `email` - User email
- `name` - User name
- `picture` - Profile picture URL
- `googleRefreshToken` - OAuth refresh token

### Meetings
- `id` - UUID primary key
- `hostId` - Reference to host user
- `title` - Meeting title
- `description` - Meeting description
- `durationMinutes` - Meeting duration
- `guestSlug` - Unique slug for guest access
- `proposedDates` - JSON array of proposed time slots
- `status` - Meeting status (PENDING, CONFIRMED)
- `finalStartTime` - Confirmed start time
- `finalEndTime` - Confirmed end time

### Guests
- `id` - UUID primary key
- `meetingId` - Reference to meeting
- `name` - Guest name
- `email` - Guest email

### Availabilities
- `id` - UUID primary key
- `guestId` - Reference to guest
- `meetingId` - Reference to meeting
- `startTime` - Available time slot start
- `endTime` - Available time slot end

## 📦 Available Scripts

### Backend
```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm run db:push  # Run database migrations
```

### Frontend & Landing
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run build:dev  # Build in development mode
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm test           # Run tests
npm run test:watch # Run tests in watch mode
```

## 🔐 Security

- Google OAuth for secure authentication
- JWT tokens for API authorization
- Protected routes with middleware authentication
- Email validation with Zod schemas
- CORS configuration for cross-origin requests

## 📧 Email Features

Guests receive email notifications for:
- Meeting invitations with voting link
- Confirmation when the meeting time is finalized

## 🎨 UI Components

The frontend uses shadcn/ui components including:
- Forms and inputs
- Dialogs and alerts
- Cards and layouts
- Badges and avatars
- Calendars and date pickers
- Toast notifications

## 🧪 Testing

Run tests with:
```bash
npm test
npm run test:watch
```

## 🚢 Deployment

For production deployment:

1. Build the frontend and landing:
```bash
cd frontend && npm run build
cd landing && npm run build
```

2. Set production environment variables
3. Deploy backend to Node.js hosting (Vercel, Railway, Render, etc.)
4. Deploy frontend/landing static builds to CDN or hosting

## 📝 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💡 Support

For issues and questions, please create an issue in the repository.
