# One Night Werewolf Assistant 🐺

A web application built with **FastAPI** (backend) and **HTML + JavaScript** (frontend) to assist with playing One Night Werewolf. The application can be launched with **uvicorn**.

## 📁 Project Structure

```
one-night-werewolf-assistant/
├── backend/                    # Backend Python package
│   ├── __init__.py            # Package initialization
│   └── routes.py              # API routes and endpoints
├── frontend/                   # Frontend files
│   ├── index.html             # Main HTML page
│   └── static/                # Static assets
│       ├── app.js             # JavaScript application logic
│       └── style.css          # CSS styles
├── main.py                     # Application entry point
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lanchiang/one-night-werewolf-assistant.git
cd one-night-werewolf-assistant
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Application

You can launch the application using uvicorn in two ways:

**Option 1: Using the main.py file directly**
```bash
python main.py
```

**Option 2: Using uvicorn command**
```bash
uvicorn main:app --reload
```

The application will start on `http://localhost:8000`

- `--reload` flag enables auto-reload on code changes (useful for development)
- Use `--host 0.0.0.0` to make the server accessible from other machines
- Use `--port 8080` to change the port (default is 8000)

### Accessing the Application

Once running, you can access:
- **Web Interface**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative API Docs**: http://localhost:8000/redoc (ReDoc)

## 🎮 Features

- **Health Check API**: Monitor application status
- **Application Info API**: Get application details
- **Interactive Web Interface**: User-friendly HTML/JS frontend
- **Responsive Design**: Works on desktop and mobile devices
- **RESTful API**: Clean API structure with FastAPI

## 🛠️ Development

### Project Architecture

- **Backend (FastAPI)**:
  - `main.py`: Application initialization and configuration
  - `backend/routes.py`: API endpoint definitions
  - FastAPI automatically generates OpenAPI documentation

- **Frontend (HTML + JS)**:
  - `index.html`: Main HTML structure
  - `app.js`: Client-side JavaScript logic
  - `style.css`: Styling and responsive design

### Adding New API Endpoints

1. Open `backend/routes.py`
2. Add new route functions:
```python
@router.get("/api/your-endpoint")
async def your_function():
    return {"message": "Your response"}
```

### Modifying the Frontend

- Edit `frontend/index.html` for structure changes
- Edit `frontend/static/app.js` for JavaScript functionality
- Edit `frontend/static/style.css` for styling updates

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serve main HTML page |
| GET | `/api/health` | Health check endpoint |
| GET | `/api/info` | Get application information |
| GET | `/docs` | Swagger UI documentation |
| GET | `/redoc` | ReDoc documentation |

## 🧪 Testing

You can test the API endpoints using:

1. **Web Browser**: Visit http://localhost:8000 and use the built-in buttons
2. **Swagger UI**: Visit http://localhost:8000/docs for interactive API testing
3. **curl**: Command line testing
```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/info
```

## 📦 Dependencies

- **fastapi**: Modern web framework for building APIs
- **uvicorn**: ASGI server for running FastAPI applications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Uvicorn Documentation](https://www.uvicorn.org/)
- [One Night Ultimate Werewolf Game](https://beziergames.com/products/one-night-ultimate-werewolf)