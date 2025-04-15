import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { checkAuth, loginUser, logoutUser, UserData } from '../services/authApi'

interface AuthState {
    isAuthenticated: boolean
    user: UserData | null
    loading: boolean
    error: string | null
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
}

interface LoginCredentials {
    email: string
    password?: string
}

export const login = createAsyncThunk('auth/login', async (credentials: LoginCredentials) => {
    if (credentials.password) {
        return await loginUser(credentials.email, credentials.password)
    } else {
        const user = await checkAuth()
        if (!user) {
            throw new Error('Nie ste prihlásený')
        }
        return user
    }
})

export const logout = createAsyncThunk('auth/logout', async () => {
    await logoutUser()
})

export const checkAuthStatus = createAsyncThunk('auth/check', async () => {
    return await checkAuth()
})

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(login.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<UserData>) => {
                state.isAuthenticated = true
                state.user = action.payload
                state.loading = false
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || 'Prihlásenie zlyhalo'
            })
            .addCase(logout.fulfilled, state => {
                state.isAuthenticated = false
                state.user = null
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                if (action.payload) {
                    state.isAuthenticated = true
                    state.user = action.payload
                } else {
                    state.isAuthenticated = false
                    state.user = null
                }
            })
    },
})

export default authSlice.reducer
