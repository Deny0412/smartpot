import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import GradientDiv from '../../components/GradientDiv/GradientDiv'
import { H2 } from '../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../i18n/index'
import { checkAuthStatus, login } from '../../redux/slices/authSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import './Login.sass'

const Login: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [localError, setLocalError] = useState<string | null>(null)
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { loading, error } = useSelector((state: RootState) => state.auth)
    const { t } = useTranslation() as { t: TranslationFunction }

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const result = await dispatch(checkAuthStatus()).unwrap()
                if (result) {
                    navigate('/')
                }
            } catch (err) {
                // Ignorujeme chybu pri kontrole autentifikácie
            }
        }
        checkAuth()
    }, [dispatch, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLocalError(null)

        if (!email.trim() || !password.trim()) {
            setLocalError(t('login_page.error.empty_fields'))
            return
        }

        try {
            await dispatch(login({ email, password })).unwrap()
            navigate('/')
        } catch (err: any) {
            setLocalError(err.response?.data?.error || err.message || t('login_page.error.invalid_credentials'))
        }
    }

    return (
        <div className="login-page">
            <H2 variant="secondary" className="login-title">
                {t('login_page.title')}
            </H2>

            <GradientDiv className="login-form__wrapper">
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label htmlFor="email">{t('login_page.input')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password">{t('login_page.password')}</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {(error || localError) && <div className="login-form__error">{localError || error}</div>}

                    <Button variant="default" className="login-form__button" disabled={loading}>
                        {loading ? t('login_page.loading') : t('login_page.button')}
                    </Button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default Login
