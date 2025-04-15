import { api } from './api'

export interface UserData {
    id: string
    email: string
    firstname: string
    lastname: string
}

export const loginUser = async (email: string, password: string): Promise<UserData> => {
    const response = await api.get<{ users: any[] }>('/users')
    const users = response.data.users || []
    const user = users.find(u => u.email === email)

    if (!user || user.password !== password) {
        throw new Error('Neplatné prihlasovacie údaje')
    }

    const token = 'mock-token-' + Date.now()
    localStorage.setItem('token', token)
    localStorage.setItem(
        'user',
        JSON.stringify({
            id: user.id,
            email: user.email,
            firstname: user.name,
            lastname: user.surname,
        }),
    )

    return {
        id: user.id,
        email: user.email,
        firstname: user.name,
        lastname: user.surname,
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
        await api.get('/users')
        const user = JSON.parse(userStr)
        return {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
        }
    } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return null
    }
}
