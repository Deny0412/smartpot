import { User } from '@phosphor-icons/react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import { H3 } from '../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../i18n'
import { selectUser } from '../../redux/selectors/authSelectors'
import './UserProfile.sass'

const UserProfile: React.FC = () => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector(selectUser)

    if (!user) {
        navigate('/login')
        return null
    }

    return (
        <div className="user-profile-main-container">
            <H3 variant="secondary" className="main-title">
                {t('userProfile.title')}
            </H3>
            <User size={32} color="#bfbfbf" className="user-icon" />

            <div className="user-profile-content">
                <div className="user-info">
                    <div className="info-item">
                        <span className="label">{t('userProfile.name')}:</span>
                        <span className="value">{user.name}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">{t('userProfile.surname')}:</span>
                        <span className="value">{user.surname}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">{t('userProfile.email')}:</span>
                        <span className="value">{user.email}</span>
                    </div>
                </div>
            </div>
            <Button className="user-profile-change-password-btn">Change password</Button>
        </div>
    )
}

export default UserProfile
