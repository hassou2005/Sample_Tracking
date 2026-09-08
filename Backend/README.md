# LabTrack Pro — Backend API

This is the backend service for **LabTrack Pro**, built using **FastAPI**, **SQLAlchemy**, and **PostgreSQL**.

## Directory Structure

```text
Backend/
├── app/
│   ├── main.py              # FastAPI application entrypoint
│   ├── core/                # Configuration, JWT authentication, and security
│   ├── database/            # Database connection engine and base session
│   ├── models/              # SQLAlchemy database ORM entities
│   ├── schemas/             # Pydantic validation schemas
│   ├── routers/             # API route handlers by feature module
│   ├── services/            # Business logic and stage transition rules
│   └── utils/               # Code 128 barcode & label generation utilities
├── generated/
│   ├── barcodes/            # Directory for generated Code 128 SVG/PNG files
│   └── labels/              # Directory for formatted thermal print labels
├── .env.example             # Environment configuration template
├── README.md                # Backend documentation
└── requirements.txt         # Python dependency specifications
```

## Setup & Running locally

### 1. Create a Python Virtual Environment

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and fill in your database credentials:

```powershell
Copy-Item .env.example .env
```

### 4. Run Development Server

```powershell
uvicorn app.main:app --reload
```

The API documentation will be available at:
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`
