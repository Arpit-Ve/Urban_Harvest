# DeliverIt - Urban Harvest

A full-stack vehicle entry and attendance management system built for logistics operations.

## Project Structure

This project is divided into two parts:
- **`frontend/`**: Built with React, Vite, and TailwindCSS.
- **`backend/`**: Node.js, Express, MongoDB Atlas, and Excel integration.

## Key Features

- **Dynamic Local Network Accessibility**: Uses dynamic hostname resolution so multiple devices on the same local network can access the system.
- **Automated Data Export**: Supports exporting daily logs to Excel sheets.
- **WhatsApp Integration**: Instant driver entry confirmations sent directly to administrators.
- **Secure Admin Panel**: Secure, passkey-protected dashboard with real-time operational insights.

## Developer Setup

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (configured in `.env` inside `backend/`)

### Setup Instructions

1. **Clone & Install Dependencies**:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory with the following keys:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   ADMIN_PASSKEY=your_secure_admin_passkey
   ADMIN_WHATSAPP_NUMBER=your_whatsapp_number
   ```

3. **Running the Application**:
   - Backend: Run `npm start` inside `backend/`.
   - Frontend: Run `npm run dev` inside `frontend/`.
