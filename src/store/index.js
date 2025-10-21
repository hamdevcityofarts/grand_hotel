import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import clientsReducer from './slices/clientsSlice'; // ← AJOUT 
import roomsReducer from './slices/roomsSlice'; // ← AJOUT

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer, 
    clients: clientsReducer, // ← AJOUT
    rooms: roomsReducer, // ← AJOUT
  },
});

export default store;
