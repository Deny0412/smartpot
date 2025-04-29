import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { RootState } from '../../redux/store/store'

import './HouseholdLayout.sass'

import { useNavigate } from 'react-router-dom'

import { CaretRight, Flower, Gear, House, PottedPlant, Users } from '@phosphor-icons/react'
import SettingsInHousehold from '../../components/SettingsInHousehold/SettingsInHousehold'

const HouseholdLayout = () => {
    const { householdId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    const householdsState = useSelector((state: RootState) => state.households)
    const userId = useSelector((state: RootState) => state.auth.user?.id)

    const household = householdsState.households.find((h: { id: string }) => h.id === householdId)
    const isOwner = household?.owner === userId

    const getActiveClass = (path: string) => {
        return location.pathname.includes(path) ? 'active' : ''
    }

    return (
        <div>
            <div className="navigation-indicator">
                <CaretRight size={32} weight="bold" />
            </div>
            <div className="household-layout__navigation">
                <House size={32} color="#bfbfbf" onClick={() => navigate(`/households/`)} />
                <Flower
                    size={32}
                    color="#bfbfbf"
                    onClick={() => navigate(`/households/${householdId}/flowers`)}
                    className={getActiveClass('flowers')}
                />
                <PottedPlant
                    size={32}
                    color="#bfbfbf"
                    onClick={() => navigate(`/households/${householdId}/smartPots`)}
                    className={getActiveClass('smartPots')}
                />
                {isOwner && (
                    <Users
                        size={32}
                        color="#bfbfbf"
                        onClick={() => navigate(`/households/${householdId}/members`)}
                        className={getActiveClass('members')}
                    />
                )}
                <Gear
                    size={32}
                    color="#bfbfbf"
                    onClick={() => setIsSettingsOpen(true)}
                    className={getActiveClass('settings')}
                />
            </div>
            <Outlet />
            <SettingsInHousehold
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                householdId={householdId || ''}
            />
        </div>
    )
}

export default HouseholdLayout
