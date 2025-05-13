import { api } from './api'

export interface UserData {
    id: string
    email: string
    name: string
    surname: string
}

export const registerUser = async (email: string, password: string, name: string, surname: string): Promise<void> => {
    try {
        await api.post('/auth/register', { email, password, name, surname })
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Registrácia zlyhala')
    }
}

export const loginUser = async (email: string, password: string): Promise<UserData> => {
    try {
        const response = await api.post('/auth/login', { email, password })
        const { token, user } = response.data

        localStorage.setItem('token', token)
        localStorage.setItem(
            'user',
            JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname,
            }),
        )

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            surname: user.surname,
        }
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Neplatné prihlasovacie údaje')
    }
}

export const logoutUser = async (): Promise<void> => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    await new Promise(resolve => setTimeout(resolve, 500))
}

export const checkAuth = async (): Promise<UserData | null> => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
        return null
    }

    try {
        const response = await api.get('/auth/get')
        return {
            id: JSON.parse(userStr).id,
            email: response.data.email,
            name: response.data.name,
            surname: response.data.surname,
        }
    } catch (error) {
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
        const response = await api.post('/auth/change-password', passwords, {
          
        })

        return { message: response.data.message || 'Password changed successfully' }
    } catch (error: any) {
        throw new Error(error.response?.data?.error || 'Failed to change password')
    }
}
