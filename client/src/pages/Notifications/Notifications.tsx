import React, { useState } from 'react'
import Button from '../../components/Button/Button'
import GradientDiv from '../../components/GradientDiv/GradientDiv'
import { H2 } from '../../components/Text/Heading/Heading'
import './Notifications.sass'
import { NotificationsMockData } from './NotificationsMockData'

interface NotificationItemProps {
    household: string
    notificationCount: number
    onClick: () => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ household, notificationCount, onClick }) => (
    <div onClick={onClick} style={{ cursor: 'pointer', width: '100%' }}>
        <GradientDiv className="notification-item">
            <span className="household-name">{household}</span>
            <div className="notification-count">{notificationCount}</div>
            <span className="arrow">›</span>
        </GradientDiv>
    </div>
)

const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const timeFormat = new Intl.DateTimeFormat('sk', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)

    if (date.toDateString() === today.toDateString()) {
        return `Dnes ${timeFormat}`
    }

    if (date.toDateString() === yesterday.toDateString()) {
        return `Včera ${timeFormat}`
    }

    if (date.getFullYear() === today.getFullYear()) {
        return new Intl.DateTimeFormat('sk', {
            day: '2-digit',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
    }

    return new Intl.DateTimeFormat('sk', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

const Notifications: React.FC = () => {
    const [selectedHousehold, setSelectedHousehold] = useState<string | null>(null)

    const households = NotificationsMockData.notifications.map(household => ({
        name: household.household_name,
        count: household.alerts.length,
    }))

    const selectedHouseholdData = NotificationsMockData.notifications.find(h => h.household_name === selectedHousehold)

    if (selectedHousehold && selectedHouseholdData) {
        return (
            <div className="main-notifications-container">
                <H2 className="main-notifications-title">Notifications {selectedHousehold}</H2>

                <div className="notifications-list">
                    {selectedHouseholdData.alerts.map(alert => (
                        <GradientDiv key={alert.id} className="alert-item">
                            <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                            <div className="alert-content">
                                <div className="alert-plant-name">{alert.plant_name}</div>
                                <div className="alert-message">{alert.message}</div>
                                <div className="alert-timestamp">{formatDate(alert.timestamp)}</div>
                            </div>
                        </GradientDiv>
                    ))}
                    <Button variant="default" onClick={() => setSelectedHousehold(null)} className="back-button">
                        ‹ Back to all notifications
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="main-notifications-container">
            <H2 className="main-notifications-title">Notifications</H2>
            <div className="households-list">
                {households.map(household => (
                    <NotificationItem
                        key={household.name}
                        household={household.name}
                        notificationCount={household.count}
                        onClick={() => setSelectedHousehold(household.name)}
                    />
                ))}
            </div>
        </div>
    )
}

const getAlertIcon = (type: string) => {
    switch (type) {
        case 'high_soil':
            return '💧'
        case 'low_soil':
            return '🌱'
        case 'low_temperature':
            return '❄️'
        case 'high_temperature':
            return '🔥'
        case 'low_battery':
            return '🔋'
        case 'wifi_outage':
            return '📡'
        case 'wifi_restored':
            return '✅'
        default:
            return '❓'
    }
}

export default Notifications
