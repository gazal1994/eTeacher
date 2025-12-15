import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Student } from '../types/models';
import * as studentsApi from '../api/students';

interface StudentsState {
  items: Student[];
  loading: boolean;
  error: string | null;
}

const initialState: StudentsState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async () => {
    const response = await studentsApi.getStudents();
    return response;
  }
);

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action: PayloadAction<Student[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load students';
      });
  },
});

export const { clearError } = studentsSlice.actions;
export default studentsSlice.reducer;
