# LabTrack Pro — Frontend Application

This is the web client interface for **LabTrack Pro**, built with **React**, **Vite**, **Tailwind CSS**, **Axios**, **Lucide React**, and **React Router**.

## Directory Structure

```text
Frontend/
├── src/
│   ├── components/       # Reusable UI components (tables, badges, scanners, modals)
│   ├── pages/            # View pages (Dashboard, Sample Creation, Scanner, History)
│   ├── services/         # Axios API clients for backend integration
│   ├── context/          # React contexts (Auth context, Notification context)
│   ├── routes/           # Protected routes and navigation router setup
│   ├── hooks/            # Custom hooks (e.g., scanner event listener)
│   ├── utils/            # Helper functions and formatting utilities
│   ├── App.jsx           # Application shell & root router
│   └── main.jsx          # React app DOM entrypoint
├── package.json          # Node dependencies and scripts
├── .env.example          # Environment variable template
└── README.md             # Frontend documentation
```

## Setup & Running locally

### 1. Install Node Dependencies

```powershell
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

### 3. Run Development Server

```powershell
npm run dev
```

The application will launch on `http://localhost:5173`.

## Barcode Scanner Integration

The application is configured to capture physical 1D USB barcode scanner inputs that simulate keyboard events. The scanner sends the scanned Code 128 payload followed by a `Carriage Return` (`Enter` key) to rapidly auto-process sample stage movements.

