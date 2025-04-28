import { Bell, X } from '@phosphor-icons/react'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { TranslationFunction } from '../../i18n'
import { logout } from '../../redux/slices/authSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import './Navigation.sass'

import logo_img from '../../assets/plant 2.png'

const Navigation: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navigate = useNavigate()
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const menuRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch<AppDispatch>()
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
    const { t, i18n } = useTranslation() as { t: TranslationFunction; i18n: any }

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
    }

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
            if (window.innerWidth > 768) {
                setIsMenuOpen(false)
            }
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            window.removeEventListener('resize', handleResize)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isMenuOpen])

    const handleNavigation = (path: string) => {
        navigate(path)
        setIsMenuOpen(false)
    }

    const handleLogout = async () => {
        await dispatch(logout()).unwrap()
        navigate('/login')
    }

    const menuItems = isAuthenticated
        ? [
              { path: '/', label: t('navigation.home') },
              { path: '/households', label: t('navigation.households') },
              { path: '/notifications', label: t('navigation.notifications') },
              { path: '/userProfile', label: t('navigation.user_profile') },
              { path: '#', label: t('navigation.logout'), onClick: handleLogout },
          ]
        : [
              { path: '/register', label: t('navigation.register') },
              { path: '/login', label: t('navigation.login') },
              { path: '/', label: t('navigation.home') },
          ]

    return (
        <nav className="navbar">
            <div className="navbar__logo" onClick={() => handleNavigation('/')}>
                <div className="navbar__logo-icon">
                    <img src={logo_img} alt="Logo" />
                </div>
                <div className="navbar__logo-text">Planto .</div>
            </div>

            <div className="navbar__actions">
                {isAuthenticated && user && (
                    <div className="navbar__user-info">
                        {user.name} {user.surname}
                    </div>
                )}
                <button
                    className="navbar__menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu">
                    <div className={`navbar__menu-icon ${isMenuOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
                {isAuthenticated && (
                    <Bell
                        size={25}
                        className="navbar__bell-icon"
                        onClick={() => handleNavigation('/notifications')}
                        style={{ cursor: 'pointer' }}
                    />
                )}
            </div>

            {isMenuOpen && <div className="navbar__overlay" onClick={() => setIsMenuOpen(false)} />}

            <div className={`navbar__mobile-menu ${isMenuOpen ? 'open' : ''}`} ref={menuRef}>
                <div className="navbar__mobile-header">
                    <div className="navbar__logo" onClick={() => handleNavigation('/')}>
                        <div className="navbar__logo-icon">
                            <img src={logo_img} alt="Logo" />
                        </div>
                        <div className="navbar__logo-text">Planto .</div>
                    </div>
                    <button className="navbar__close-btn" onClick={() => setIsMenuOpen(false)}>
                        <X size={32} color="#ffffff" />
                    </button>
                </div>
                <ul className="navbar__menu-links">
                    {menuItems.map(item => (
                        <li
                            key={item.path}
                            className="navbar__menu-item"
                            onClick={() => (item.onClick ? item.onClick() : handleNavigation(item.path))}>
                            {item.label}
                        </li>
                    ))}
                    <li className="navbar__languages">
                        <button
                            className={`language-btn ${i18n.language === 'cz' ? 'active' : ''}`}
                            onClick={() => changeLanguage('cz')}>
                            CZ
                        </button>
                        <button
                            className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`}
                            onClick={() => changeLanguage('en')}>
                            EN
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default Navigation
