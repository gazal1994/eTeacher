import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from './coursesSlice';
import studentsReducer from './studentsSlice';
import enrolmentsReducer from './enrolmentsSlice';
import reportReducer from './reportSlice';

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    students: studentsReducer,
    enrolments: enrolmentsReducer,
    report: reportReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
