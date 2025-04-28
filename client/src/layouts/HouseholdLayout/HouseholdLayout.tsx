import { Outlet, useLocation, useParams } from 'react-router-dom'

import './HouseholdLayout.sass'

import { useNavigate } from 'react-router-dom'

import { Flower, PottedPlant, Users , House } from '@phosphor-icons/react'

const HouseholdLayout = () => {
    const { householdId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const getActiveClass = (path: string) => {
        return location.pathname.includes(path) ? 'active' : ''
    }

    return (
        <div>
            <div className="household-layout__navigation">
                <House size={32} color="#bfbfbf" onClick={() => navigate(`/households/`)}/>
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
                <Users
                    size={32}
                    color="#bfbfbf"
                    onClick={() => navigate(`/households/${householdId}/members`)}
                    className={getActiveClass('members')}
                />
            </div>
            <Outlet />
        </div>
    )
}

export default HouseholdLayout
