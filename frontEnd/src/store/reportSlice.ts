import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ReportRow } from '../types/models';
import * as reportApi from '../api/report';

interface ReportState {
  data: ReportRow[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  data: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchReport = createAsyncThunk(
  'report/fetchReport',
  async () => {
    const response = await reportApi.getEnrolmentsSummary();
    return response;
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReport.fulfilled, (state, action: PayloadAction<ReportRow[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load report';
      });
  },
});

export const { clearError } = reportSlice.actions;
export default reportSlice.reducer;
