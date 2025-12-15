export type SyllabusItem = {
  title: string;
  lectures: number;
  durationMinutes: number;
};

export type CourseDetails = {
  instructor: {
    name: string;
    title: string;
    bio: string;
  };
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  category: string;
  durationHours: number;
  lastUpdated: string;
  createdAt: string;
  whatYouWillLearn: string[];
  requirements: string[];
  syllabus: SyllabusItem[];
};

const courseDetailsMap: Record<number, CourseDetails> = {
  1: {
    instructor: {
      name: 'Sarah Johnson',
      title: 'Senior Backend Engineer',
      bio: 'Full-stack developer with 8+ years of experience building scalable web applications.',
    },
    level: 'Intermediate',
    language: 'English',
    category: 'Backend Development',
    durationHours: 12.5,
    lastUpdated: '2025-12-01',
    createdAt: '2025-06-15',
    whatYouWillLearn: [
      'Build scalable backend applications with Node.js',
      'Work with Express.js framework and middleware',
      'Implement RESTful APIs and authentication',
      'Handle async operations and error handling',
      'Deploy Node.js applications to production',
    ],
    requirements: [
      'Basic JavaScript knowledge',
      'Understanding of web development concepts',
      'Familiarity with command line',
    ],
    syllabus: [
      { title: 'Introduction to Node.js', lectures: 8, durationMinutes: 120 },
      { title: 'Express.js Framework', lectures: 12, durationMinutes: 180 },
      { title: 'Working with Databases', lectures: 10, durationMinutes: 150 },
      { title: 'Authentication & Security', lectures: 8, durationMinutes: 120 },
      { title: 'Deployment & Best Practices', lectures: 6, durationMinutes: 90 },
    ],
  },
  2: {
    instructor: {
      name: 'Michael Chen',
      title: 'TypeScript Expert & Tech Lead',
      bio: 'Passionate about type-safe code and building robust enterprise applications.',
    },
    level: 'Advanced',
    language: 'English',
    category: 'Programming Languages',
    durationHours: 18,
    lastUpdated: '2025-11-28',
    createdAt: '2025-05-20',
    whatYouWillLearn: [
      'Master advanced TypeScript patterns and type system',
      'Write type-safe code with generics and conditional types',
      'Use utility types and mapped types effectively',
      'Implement design patterns in TypeScript',
      'Build enterprise-grade applications',
    ],
    requirements: [
      'Strong JavaScript fundamentals',
      'Experience with modern ES6+ features',
      'Basic TypeScript knowledge',
    ],
    syllabus: [
      { title: 'Advanced Type System', lectures: 15, durationMinutes: 225 },
      { title: 'Generics & Constraints', lectures: 12, durationMinutes: 180 },
      { title: 'Utility & Mapped Types', lectures: 10, durationMinutes: 150 },
      { title: 'Design Patterns', lectures: 14, durationMinutes: 210 },
      { title: 'Real-world Projects', lectures: 20, durationMinutes: 315 },
    ],
  },
  3: {
    instructor: {
      name: 'Emma Rodriguez',
      title: 'Senior Frontend Developer',
      bio: 'React specialist with a passion for building beautiful, performant user interfaces.',
    },
    level: 'Beginner',
    language: 'English',
    category: 'Frontend Development',
    durationHours: 10,
    lastUpdated: '2025-12-05',
    createdAt: '2025-07-10',
    whatYouWillLearn: [
      'Understand React fundamentals and component architecture',
      'Build interactive UIs with hooks and state management',
      'Work with React Router for navigation',
      'Implement forms and handle user input',
      'Deploy React applications',
    ],
    requirements: [
      'HTML, CSS, and JavaScript basics',
      'Understanding of DOM manipulation',
      'No React experience required',
    ],
    syllabus: [
      { title: 'React Basics & JSX', lectures: 10, durationMinutes: 150 },
      { title: 'Components & Props', lectures: 8, durationMinutes: 120 },
      { title: 'State & Lifecycle', lectures: 10, durationMinutes: 150 },
      { title: 'Hooks Deep Dive', lectures: 12, durationMinutes: 180 },
      { title: 'Building Real Projects', lectures: 10, durationMinutes: 150 },
    ],
  },
};

const defaultCourseDetails: CourseDetails = {
  instructor: {
    name: 'TBD',
    title: 'Instructor',
    bio: 'Course instructor information will be updated soon.',
  },
  level: 'Beginner',
  language: 'English',
  category: 'General',
  durationHours: 8,
  lastUpdated: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  whatYouWillLearn: [
    'Course content coming soon',
  ],
  requirements: [
    'Requirements to be announced',
  ],
  syllabus: [],
};

export const getCourseDetails = (courseId: number): CourseDetails => {
  return courseDetailsMap[courseId] || defaultCourseDetails;
};
