import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUsers, addUser, deleteUser } from '../services/usersApi';
import { User } from '../../types/userTypes';

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

export const loadUsers = createAsyncThunk('users/load', async () => {
  return await fetchUsers();
});

export const createUser = createAsyncThunk('users/create', async (user: Omit<User, 'id'>) => {
  return await addUser(user);
});

export const removeUser = createAsyncThunk('users/delete', async (id: string) => {
  await deleteUser(id);
  return id;
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Chyba pri načítaní používateľov';
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.users.push(action.payload);
      })
      .addCase(removeUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;