import React, { useState } from 'react'
import GradientDiv from '../../components/GradientDiv/GradientDiv'
import './Register.sass'
import { H2 } from '../../components/Text/Heading/Heading'
import Button from '../../components/Button/Button'
import { useTranslation } from 'react-i18next'
import { TranslationFunction } from '../../i18n/index'


const Register: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const { t } = useTranslation() as { t: TranslationFunction }
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        console.log('Form submitted:', { email, password, confirmPassword })
    }

    return (
        <div className="register-page">
            <H2 variant="secondary" className='register-title'>{t('register_page.title')}</H2>

            <GradientDiv className="register-form__wrapper">
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="register-form-group">
                        <label htmlFor="email">{t('register_page.input')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="password">{t('register_page.password')}</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="register-form-group">
                        <label htmlFor="confirmPassword">{t('register_page.confirm_password')}</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

        
                    <Button variant="default" className='register-form__button'>{t('register_page.button')}</Button>
                </form>
            </GradientDiv>
        </div>
    )
}
export default Register
