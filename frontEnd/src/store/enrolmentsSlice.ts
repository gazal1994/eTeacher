import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Enrolment, EnrolmentFormData } from '../types/models';
import * as enrolmentsApi from '../api/enrolments';

interface EnrolmentsState {
  items: Enrolment[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  isSubmitting: boolean;
}

const initialState: EnrolmentsState = {
  items: [],
  loading: false,
  error: null,
  successMessage: null,
  isSubmitting: false,
};

// Async thunks
export const fetchEnrolments = createAsyncThunk(
  'enrolments/fetchEnrolments',
  async () => {
    const response = await enrolmentsApi.getEnrolments();
    return response;
  }
);

export const addEnrolment = createAsyncThunk(
  'enrolments/addEnrolment',
  async (enrolmentData: EnrolmentFormData) => {
    const response = await enrolmentsApi.createEnrolment(enrolmentData);
    return response;
  }
);

export const createEnrolment = createAsyncThunk(
  'enrolments/createEnrolment',
  async (enrolmentData: EnrolmentFormData) => {
    const response = await enrolmentsApi.createEnrolment(enrolmentData);
    return response;
  }
);

export const deleteEnrolment = createAsyncThunk(
  'enrolments/deleteEnrolment',
  async ({ studentId, courseId }: { studentId: number; courseId: number }) => {
    await enrolmentsApi.deleteEnrolment(studentId, courseId);
    return { studentId, courseId };
  }
);

const enrolmentsSlice = createSlice({
  name: 'enrolments',
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
    // Fetch enrolments
    builder
      .addCase(fetchEnrolments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrolments.fulfilled, (state, action: PayloadAction<Enrolment[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEnrolments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load enrolments';
      })
      // Add enrolment
      .addCase(addEnrolment.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(addEnrolment.fulfilled, (state, action: PayloadAction<Enrolment>) => {
        state.isSubmitting = false;
        state.items.push(action.payload);
        state.successMessage = 'Student assigned to course successfully!';
      })
      .addCase(addEnrolment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.error.message || 'Failed to assign student';
      })
      // Create enrolment
      .addCase(createEnrolment.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createEnrolment.fulfilled, (state, action: PayloadAction<Enrolment>) => {
        state.isSubmitting = false;
        state.items.push(action.payload);
        state.successMessage = 'Enrolment created successfully!';
      })
      .addCase(createEnrolment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.error.message || 'Failed to create enrolment';
      })
      // Delete enrolment
      .addCase(deleteEnrolment.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteEnrolment.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const { studentId, courseId } = action.payload;
        state.items = state.items.filter(
          (item) => !(item.studentId === studentId && item.courseId === courseId)
        );
        state.successMessage = 'Enrolment deleted successfully!';
      })
      .addCase(deleteEnrolment.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.error.message || 'Failed to delete enrolment';
      });
  },
});

export const { clearError, clearSuccessMessage } = enrolmentsSlice.actions;
export default enrolmentsSlice.reducer;
