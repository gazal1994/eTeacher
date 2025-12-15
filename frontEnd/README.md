# Mini LMS Admin Dashboard

A React-based admin dashboard for managing courses, students, and enrolments in a mini Learning Management System.

## Features

- **Course Management**: Create, edit, delete, and view courses
- **Enrolment Management**: View all student enrolments
- **Student Assignment**: Assign students to courses
- **Reports**: View enrolment summary statistics

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- Clean component architecture with separation of concerns
- CSS modules for styling

## Project Structure

```
src/
├── api/              # API client and service modules
│   ├── client.ts     # Base HTTP client
│   ├── courses.ts    # Course API calls
│   ├── students.ts   # Student API calls
│   ├── enrolments.ts # Enrolment API calls
│   └── report.ts     # Report API calls
├── components/       # Reusable UI components
│   ├── Common/       # Generic components (Loading, ErrorBanner, Modal)
│   ├── Courses/      # Course-specific components
│   └── Layout/       # Layout components (Navbar, Layout)
├── data/             # Mock data (students)
├── pages/            # Page components (routes)
│   ├── CoursesPage.tsx
│   ├── EnrolmentsPage.tsx
│   ├── AssignPage.tsx
│   └── ReportPage.tsx
├── types/            # TypeScript type definitions
│   └── models.ts
├── App.tsx           # Main app component with routing
├── main.tsx          # App entry point
└── index.css         # Global styles
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository or extract the project files

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```
   Replace `5000` with your actual .NET API port if different.

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## API Integration

The frontend expects the following API endpoints from the backend:

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get a single course
- `POST /api/courses` - Create a new course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course

### Enrolments
- `GET /api/enrolments` - Get all enrolments
- `POST /api/enrolments` - Create a new enrolment (assign student to course)

### Reports
- `GET /api/reports/enrolments-summary` - Get enrolment summary by course

### Students (Optional)
If your backend has a students endpoint:
- `GET /api/students` - Get all students

Otherwise, the app uses mock students defined in `src/data/students.ts`.

## Configuration

### Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:5000`)

### Mock Data

If your backend doesn't have a students endpoint yet, the app uses mock students. To switch to real API:

1. Implement the backend students endpoint
2. Update `src/api/students.ts` to use the actual API call (commented code is already there)

## Features Overview

### Courses Page (`/courses`)
- View all courses in a table
- Create new courses with title and description
- Edit existing courses (opens modal)
- Delete courses with confirmation
- Form validation (title min 2 chars, description min 5 chars)

### Enrolments Page (`/enrolments`)
- View all student enrolments
- Displays student name, course title, and enrolment date
- Formatted date display

### Assign Page (`/assign`)
- Select a student from dropdown
- Select a course from dropdown
- Assign button to create enrolment
- Success message and auto-redirect to enrolments page
- Form validation

### Report Page (`/report`)
- Summary cards showing total courses and enrolments
- Table showing students per course
- Total row with grand total

## Development

### Code Quality
- TypeScript for type safety
- Clean separation of concerns (API, components, pages)
- Reusable components
- Error handling and loading states
- Form validation

### Styling
- Consistent color scheme
- Responsive design
- Loading spinners
- Error and success messages
- Hover effects and transitions

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure your backend API is configured to allow requests from `http://localhost:3000`.

### API Connection
Check that:
1. Your backend API is running
2. The `VITE_API_BASE_URL` in `.env` matches your backend URL
3. All required API endpoints are implemented

## License

MIT
