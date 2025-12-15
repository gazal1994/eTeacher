# Mini LMS API

A **.NET 8 Web API** for a Mini Learning Management System (LMS) Admin Dashboard. This API provides endpoints for managing courses, students, enrolments, and generating reports.

## Features

- **Courses CRUD**: Create, read, update, and delete courses
- **Students**: List seeded students (in-memory)
- **Enrolments**: Assign students to courses with validation
- **Reports**: Generate enrolment summaries by course
- **In-Memory Storage**: All data persists during runtime only
- **Dependency Injection**: Clean layered architecture (Controllers → Services → Repositories)
- **Swagger Documentation**: Interactive API documentation
- **CORS Support**: Configured for React frontend
- **Unit Tests**: xUnit tests for business logic

## Tech Stack

- .NET 8 Web API
- ASP.NET Core
- Swagger/OpenAPI
- xUnit for testing
- In-memory data storage (no database)

## Project Structure

```
MiniLmsApi/
├── Controllers/          # API endpoints
├── Models/              # Domain models
├── DTOs/                # Data transfer objects
├── Services/            # Business logic layer
├── Repositories/        # Data access layer
├── Exceptions/          # Custom exceptions
└── Program.cs           # App configuration

MiniLmsApi.Tests/
└── EnrolmentServiceTests.cs    # Unit tests
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)

## Getting Started

### 1. Clone and Navigate

```bash
cd C:\Users\windows11\Desktop\eTeacher\backEnd
```

### 2. Restore Dependencies

```bash
dotnet restore
```

### 3. Build the Project

```bash
dotnet build
```

### 4. Run the API

```bash
cd MiniLmsApi
dotnet run
```

The API will start at:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:5001`

### 5. Access Swagger UI

Open your browser and navigate to:
```
http://localhost:5000
```

Swagger UI will be displayed at the root, showing all available endpoints.

## API Endpoints

### Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/{id}` | Get course by ID |
| POST | `/api/courses` | Create new course |
| PUT | `/api/courses/{id}` | Update course |
| DELETE | `/api/courses/{id}` | Delete course |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students |

### Enrolments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enrolments` | Get all enrolments (supports `?courseId=...` and `?studentId=...` filters) |
| POST | `/api/enrolments` | Enrol student in course |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/enrolments-summary` | Get student count per course |

## Example Requests

### Create a Course

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Basics",
    "description": "Introduction to React framework"
  }'
```

### Get All Students

```bash
curl http://localhost:5000/api/students
```

### Enrol Student in Course

```bash
curl -X POST http://localhost:5000/api/enrolments \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "courseId": "11111111-1111-1111-1111-111111111111"
  }'
```

### Get Enrolments for a Specific Course

```bash
curl "http://localhost:5000/api/enrolments?courseId=11111111-1111-1111-1111-111111111111"
```

### Get Enrolment Summary Report

```bash
curl http://localhost:5000/api/reports/enrolments-summary
```

## Seeded Data

### Students (5 seeded)

| ID | Name | Email |
|----|------|-------|
| `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` | Alice Johnson | alice.johnson@example.com |
| `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` | Bob Smith | bob.smith@example.com |
| `cccccccc-cccc-cccc-cccc-cccccccccccc` | Charlie Davis | charlie.davis@example.com |
| `dddddddd-dddd-dddd-dddd-dddddddddddd` | Diana Wilson | diana.wilson@example.com |
| `eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee` | Eve Martinez | eve.martinez@example.com |

### Courses (3 seeded)

| ID | Title | Description |
|----|-------|-------------|
| `11111111-1111-1111-1111-111111111111` | Introduction to React | Learn the basics of React and component-based architecture |
| `22222222-2222-2222-2222-222222222222` | Advanced TypeScript | Master advanced TypeScript patterns and type system |
| `33333333-3333-3333-3333-333333333333` | Node.js Fundamentals | Build scalable backend applications with Node.js |

## Validation Rules

### Course Validation
- **Title**: Required, minimum 2 characters
- **Description**: Required, minimum 5 characters

### Enrolment Validation
- Student must exist (404 if not found)
- Course must exist (404 if not found)
- Student cannot be enrolled in the same course twice (409 Conflict)

## Error Responses

The API returns consistent error responses:

```json
{
  "error": "Error message here"
}
```

### HTTP Status Codes
- **200 OK**: Successful GET/PUT requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Validation errors
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate enrolment attempt

## CORS Configuration

The API is configured to allow requests from:
- `http://localhost:5173` (Vite default port for React frontend)

To allow all origins in development, change the CORS policy in [Program.cs](MiniLmsApi/Program.cs):

```csharp
app.UseCors("AllowAll"); // Instead of "AllowFrontend"
```

## Running Tests

### Run All Tests

```bash
dotnet test
```

### Run Tests with Verbose Output

```bash
dotnet test --logger "console;verbosity=detailed"
```

### Test Coverage

The test project includes comprehensive tests for:
- ✅ Duplicate enrolment prevention (409 Conflict)
- ✅ Student not found validation (404)
- ✅ Course not found validation (404)
- ✅ Successful enrolment creation
- ✅ Filtering enrolments by course ID
- ✅ Filtering enrolments by student ID

## Development Notes

### In-Memory Storage

- All repositories are registered as **Singletons** to persist data during runtime
- Data is lost when the application stops
- Initial data is seeded on application startup

### Architecture

```
Client Request
    ↓
Controller (HTTP handling, validation)
    ↓
Service (Business logic)
    ↓
Repository (Data access)
    ↓
In-Memory Storage
```

## Connecting to React Frontend

The React frontend should be configured to make requests to:

```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

Update the frontend's API client configuration to use this base URL.

## Troubleshooting

### Port Already in Use

If port 5000 or 5001 is already in use, modify [Properties/launchSettings.json](MiniLmsApi/Properties/launchSettings.json):

```json
"applicationUrl": "https://localhost:7000;http://localhost:6000"
```

### CORS Errors

If you encounter CORS errors from the frontend:
1. Verify the frontend is running on `http://localhost:5173`
2. Or update the CORS policy in [Program.cs](MiniLmsApi/Program.cs) to match your frontend URL

### .NET SDK Not Found

Install .NET 8 SDK from: https://dotnet.microsoft.com/download/dotnet/8.0

## License

This project is for educational purposes.

## Author

Mini LMS API - Built with .NET 8
