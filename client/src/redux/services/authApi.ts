import axios from 'axios'

const authApi = axios.create({
    baseURL: process.env.REACT_APP_AUTH_API || 'http://localhost:3003/auth',
    headers: {
        'Content-Type': 'application/json',
    },
})

export interface UserData {
    id: string
    email: string
    name: string
    surname: string
}

export const registerUser = async (email: string, password: string, name: string, surname: string): Promise<void> => {
    try {
        await authApi.post('/register', { email, password, name, surname })
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Registrácia zlyhala')
    }
}

export const loginUser = async (email: string, password: string): Promise<UserData> => {
    try {
        const response = await authApi.post('/login', { email, password })
        const { token } = response.data
        console.log(token)

        // Decode the token to get user data
        const decodedToken = JSON.parse(atob(token.split('.')[1]))
        const userData = {
            id: decodedToken.user.id,
            email: decodedToken.user.email,
            name: decodedToken.user.name,
            surname: decodedToken.user.surname,
        }

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))

        return userData
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Neplatné prihlasovacie údaje')
    }
}

export const logoutUser = async (): Promise<void> => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}

export const checkAuth = async (): Promise<UserData | null> => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
        console.log('No token or userStr')
        return null
    }

    try {
        const response = await authApi.get('/check', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.data.authorized) {
            throw new Error('Not authorized')
        }

        const userData = JSON.parse(userStr)
        return {
            id: userData.id,
            email: response.data.user.email,
            name: userData.name,
            surname: userData.surname,
        }
    } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return null
    }
}

// Function to change password
export const changePassword = async (passwords: {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string // Backend already validates this, but good to send
}) => {
    const token = localStorage.getItem('token')
    if (!token) {
        throw new Error('Authentication token not found')
    }

    try {
        const response = await authApi.post('/change-password', passwords)
        return { message: response.data.message || 'Password changed successfully' }
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to change password')
    }
}
