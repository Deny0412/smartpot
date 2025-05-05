import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { selectUserId } from '../../redux/selectors/authSelectors'
import { selectHouseholds, selectIsHouseholdOwner } from '../../redux/selectors/houseHoldSelectors'
import { loadHouseholds } from '../../redux/slices/householdsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'

import './HouseholdLayout.sass'

import { useNavigate } from 'react-router-dom'

import { CaretRight, Flower, Gear, House, PottedPlant, Users } from '@phosphor-icons/react'
import SettingsInHousehold from '../../components/SettingsInHousehold/SettingsInHousehold'

const HouseholdLayout = () => {
    const { householdId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const dispatch = useDispatch<AppDispatch>()

    const households = useSelector(selectHouseholds)
    const userId = useSelector(selectUserId)

    useEffect(() => {
        dispatch(loadHouseholds())
    }, [dispatch])

    const household = households.find((h: { id: string }) => h.id === householdId)
    const isOwner = useSelector((state: RootState) => selectIsHouseholdOwner(state, householdId || ''))

    const getActiveClass = (path: string) => {
        return location.pathname.includes(path) ? 'active' : ''
    }

    return (
        <>
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
        </>
    )
}

export default HouseholdLayout
