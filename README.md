# eTeacher - Mini LMS Admin Dashboard

A full-stack Learning Management System (LMS) admin dashboard for managing courses, students, and enrolments.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: .NET 8 Web API (C#)
- **Storage**: In-memory (development)
- **API Documentation**: Swagger/OpenAPI

## 📁 Project Structure

```
eTeacher/
├── frontEnd/           # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/       # API client functions
│   │   └── types/     # TypeScript types
│   └── package.json
│
├── backEnd/           # .NET 8 Web API backend
│   ├── MiniLmsApi/
│   │   ├── Controllers/
│   │   ├── Services/
│   │   ├── Repositories/
│   │   ├── Models/
│   │   └── DTOs/
│   └── MiniLmsApi.Tests/
│
├── SETUP.md          # Complete setup instructions
└── SEEDED_DATA.md    # Reference for test data
```

## 🚀 Quick Start

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+)

### Backend Setup

```bash
cd backEnd
dotnet restore
dotnet build
cd MiniLmsApi
dotnet run
```

**Or use the start script:**
```bash
cd backEnd
.\start-backend.ps1   # Windows
# or
./start-backend.sh    # Linux/Mac
```

Backend runs at: **http://localhost:5000**

### Frontend Setup

```bash
cd frontEnd
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

## 📖 Documentation

- **[Complete Setup Guide](SETUP.md)** - Step-by-step setup instructions
- **[Seeded Data Reference](SEEDED_DATA.md)** - Test data for development
- **[Backend README](backEnd/README.md)** - Backend API documentation

## ✨ Features

### Backend API
- ✅ RESTful API with Swagger documentation
- ✅ CRUD operations for courses
- ✅ Student management
- ✅ Enrolment system with duplicate prevention
- ✅ Enrolment summary reports
- ✅ Comprehensive error handling (400, 404, 409)
- ✅ Unit tests with xUnit
- ✅ CORS configured for frontend

### Frontend Dashboard
- ✅ Modern React UI with TypeScript
- ✅ Course management (create, edit, delete)
- ✅ Student listing
- ✅ Enrolment assignment
- ✅ Enrolment tracking
- ✅ Report generation
- ✅ Error handling and loading states
- ✅ Responsive design

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses` | GET | List all courses |
| `/api/courses/{id}` | GET | Get course by ID |
| `/api/courses` | POST | Create course |
| `/api/courses/{id}` | PUT | Update course |
| `/api/courses/{id}` | DELETE | Delete course |
| `/api/students` | GET | List all students |
| `/api/enrolments` | GET | List enrolments |
| `/api/enrolments` | POST | Create enrolment |
| `/api/reports/enrolments-summary` | GET | Get summary report |

## 🧪 Testing

### Backend Tests
```bash
cd backEnd
dotnet test
```

### Frontend Tests
```bash
cd frontEnd
npm test
```

## 📊 Seeded Test Data

### Students (5)
- Alice Johnson
- Bob Smith
- Charlie Davis
- Diana Wilson
- Eve Martinez

### Courses (3)
- Introduction to React
- Advanced TypeScript
- Node.js Fundamentals

See [SEEDED_DATA.md](SEEDED_DATA.md) for complete reference with IDs.

## 🛠️ Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- CSS3

### Backend
- .NET 8
- ASP.NET Core Web API
- Swagger/OpenAPI
- xUnit

## 📝 Development Workflow

1. Start backend: `cd backEnd && dotnet run`
2. Start frontend: `cd frontEnd && npm run dev`
3. Open browser: `http://localhost:5173`
4. Access API docs: `http://localhost:5000`

## 🔒 Data Persistence

**Current**: In-memory storage (data resets on restart)

**Future**: Can be extended to use:
- SQL Server
- PostgreSQL
- MongoDB
- Entity Framework Core

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is for educational purposes.

## 🎯 Next Steps

- [ ] Add authentication/authorization
- [ ] Implement real database (Entity Framework)
- [ ] Add pagination for large datasets
- [ ] Implement search and filtering
- [ ] Add bulk operations
- [ ] Deploy to Azure/AWS
- [ ] Add email notifications
- [ ] Implement audit logging

## 💡 Tips

- Use Swagger UI (`http://localhost:5000`) to test API endpoints
- Frontend automatically falls back to mock data if backend is unavailable
- Check browser console for API connection issues
- All IDs use GUIDs for consistency

## 🆘 Support

For setup help, see [SETUP.md](SETUP.md)

For API documentation, visit `http://localhost:5000` when backend is running

---

**Built with ❤️ using .NET 8 and React**
