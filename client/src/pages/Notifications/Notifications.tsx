import React, { useState } from 'react'
import Button from '../../components/Button/Button'
import GradientDiv from '../../components/GradientDiv/GradientDiv'
import { H2 } from '../../components/Text/Heading/Heading'
import './Notifications.sass'
import { NotificationsMockData } from './NotificationsMockData'
import { Check  , X} from 'phosphor-react'

interface NotificationItemProps {
    household: string
    notificationCount: number
    onClick: () => void
}

interface HouseholdInviteProps {
    id: number
    household_name: string
    inviter_name: string
    timestamp: string
    status: string
    onAccept: (id: number) => void
    onReject: (id: number) => void
}

const NotificationItem: React.FC<NotificationItemProps> = ({ household, notificationCount, onClick }) => (
    <div onClick={onClick} style={{ cursor: 'pointer', width: '100%' }}>
        <div className="notification-item">
            <span className="household-name">{household}</span>
            <div className="notification-count">{notificationCount}</div>
            <span className="arrow">›</span>
        </div>
    </div>
)

const HouseholdInvite: React.FC<HouseholdInviteProps> = ({
    id,
    household_name,
    inviter_name,
    timestamp,
    status,
    onAccept,
    onReject,
}) => (
    <div className="invite-item">
        <div className="invite-content">
            <div className="invite-header">
                <span className="invite-household">{household_name}</span>
            </div>
        
            {status === 'pending' && (
                <div className="invite-actions">
                    <Check size={32} color="#4CAF50" onClick={() => onAccept(id)} className="invite-action-button"/>
                    <X size={32} color="#f93333" onClick={() => onReject(id)} className="invite-action-button"/>
                </div>
            )}
        </div>
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
    const [invites, setInvites] = useState(NotificationsMockData.householdInvites)

    const households = NotificationsMockData.notifications.map(household => ({
        name: household.household_name,
        count: household.alerts.length,
    }))

    const selectedHouseholdData = NotificationsMockData.notifications.find(h => h.household_name === selectedHousehold)

    const handleAcceptInvite = (id: number) => {
        setInvites(invites.filter(invite => invite.id !== id))
        // TODO: Implementácia prijatia pozvánky
    }

    const handleRejectInvite = (id: number) => {
        setInvites(invites.filter(invite => invite.id !== id))
        // TODO: Implementácia zamietnutia pozvánky
    }

    if (selectedHousehold && selectedHouseholdData) {
        return (
            <div className="main-notifications-container">
                <H2 className="main-notifications-title">Notifications {selectedHousehold}</H2>

                <div className="notifications-list">
                    {selectedHouseholdData.alerts.map(alert => (
                        <div key={alert.id} className="alert-item">
                            <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                            <div className="alert-content">
                                <div className="alert-plant-name">{alert.plant_name}</div>
                                <div className="alert-message">{alert.message}</div>
                                <div className="alert-timestamp">{formatDate(alert.timestamp)}</div>
                            </div>
                        </div>
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

            {invites.length > 0 && (
                <div className="invites-section">
                    <H2 className="invites-title">Pozvánky do domácností</H2>
                    <div className="invites-list">
                        {invites.map(invite => (
                            <HouseholdInvite
                                key={invite.id}
                                {...invite}
                                onAccept={handleAcceptInvite}
                                onReject={handleRejectInvite}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="households-list">
                <H2 className="invites-title">Domácnosti</H2>
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
