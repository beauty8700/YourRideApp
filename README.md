# YourRides App

A full-stack ride-sharing application with React frontend and Node.js backend.

## Project Structure

```
yourride/
├── Frontend/          # React + TypeScript + Vite
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── Backend/           # Node.js + Express + Socket.io
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── package.json
│   ├── server.ts
│   └── .env.example
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
cd Frontend
npm install

# Install backend dependencies
cd ../Backend
npm install
```

### 2. Environment Configuration

#### Frontend (.env)
Copy `Frontend/.env.example` to `Frontend/.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:3000/api
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_PLATFORM_KEY=your_google_maps_api_key_here
```

#### Backend (.env)
Copy `Backend/.env.example` to `Backend/.env` and configure:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/yourrides
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Start MongoDB

Make sure MongoDB is running on your system or update `MONGODB_URI` to point to your cloud database.

### 4. Run the Application

#### Development Mode

```bash
# Terminal 1: Start Backend
cd Backend
npm run dev

# Terminal 2: Start Frontend
cd Frontend
npm run dev
```

Frontend will run on `http://localhost:5173`
Backend will run on `http://localhost:3000`

#### Production Build

```bash
# Build Frontend
cd Frontend
npm run build

# Build Backend
cd Backend
npm run build
npm start
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL` = Your production backend URL + `/api`
   - `GEMINI_API_KEY`
   - `GOOGLE_MAPS_PLATFORM_KEY`
4. Deploy

### Backend (Render)

1. Push your code to GitHub
2. Connect your repo to Render
3. Set environment variables:
   - `PORT` = 10000 (or Render's default)
   - `MONGODB_URI` = Your MongoDB connection string
   - `JWT_SECRET`
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Deploy

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Socket.io Client
- React Router
- Leaflet Maps

### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

## Features

- User and Driver registration/login
- Real-time ride requests via Socket.io
- Interactive maps with Leaflet
- JWT-based authentication
- Responsive design with Tailwind CSS

## API Endpoints

### Users
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user

### Drivers
- `POST /api/drivers/register` - Register driver
- `POST /api/drivers/login` - Login driver

### Rides
- `POST /api/rides` - Create ride request
- `GET /api/rides/:id` - Get ride details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
