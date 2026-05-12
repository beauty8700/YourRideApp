# YourRide Backend

This is the Node.js + Express backend for the YourRide application.

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

## Setup
1. `npm install`
2. Create a `.env` file based on `.env.example`
3. Run `npm run dev` to start the server

## Features
- JWT Authentication (User/Driver)
- Socket.io for real-time ride tracking
- Ride lifecycle management (Pending -> Accepted -> Ongoing -> Completed)
- OTP verification
- Wallet and Rewards system (Simulated)
