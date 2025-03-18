import React, { useState } from 'react'

import notification_icon from '../../assets/notification_logo.png'
import logo_img from '../../assets/plant 2.png'
import "./Navigation.sass"

const Navigation: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <nav className="navbar">
            <div className="navbar__logo">
                <div className="navbar__logo-icon">
                    <img src={logo_img} alt="Logo" />
                </div>
                <div className="navbar__logo-text">Planto .</div>
            </div>

            <div className="navbar__actions">
                <button className="navbar__notification-btn">
                    <img src={notification_icon} alt="Notifications" />
                </button>

                <button className="navbar__menu-btn" onClick={toggleMenu}>
                    <div className={`navbar__menu-icon ${isMenuOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
            </div>
        </nav>
    )
}

export default Navigation
