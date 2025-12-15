import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Course, CourseFormData } from '../types/models';
import * as coursesApi from '../api/courses';

interface CoursesState {
  items: Course[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CoursesState = {
  items: [],
  loading: false,
  error: null,
  successMessage: null,
};

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async () => {
    const response = await coursesApi.getCourses();
    return response;
  }
);

export const addCourse = createAsyncThunk(
  'courses/addCourse',
  async (courseData: CourseFormData) => {
    const response = await coursesApi.createCourse(courseData);
    return response;
  }
);

export const editCourse = createAsyncThunk(
  'courses/editCourse',
  async ({ id, data }: { id: string; data: CourseFormData }) => {
    const response = await coursesApi.updateCourse(id, data);
    return response;
  }
);

export const removeCourse = createAsyncThunk(
  'courses/removeCourse',
  async (id: string) => {
    await coursesApi.deleteCourse(id);
    return id;
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch courses
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load courses';
      })
      // Add course
      .addCase(addCourse.pending, (state) => {
        state.error = null;
      })
      .addCase(addCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.items.push(action.payload);
        state.successMessage = 'Course created successfully';
      })
      .addCase(addCourse.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create course';
      })
      // Edit course
      .addCase(editCourse.pending, (state) => {
        state.error = null;
      })
      .addCase(editCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        const index = state.items.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.successMessage = 'Course updated successfully';
      })
      .addCase(editCourse.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update course';
      })
      // Remove course
      .addCase(removeCourse.pending, (state) => {
        state.error = null;
      })
      .addCase(removeCourse.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(c => c.id !== action.payload);
        state.successMessage = 'Course deleted successfully';
      })
      .addCase(removeCourse.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete course';
      });
  },
});

export const { clearError, clearSuccessMessage } = coursesSlice.actions;
export default coursesSlice.reducer;
