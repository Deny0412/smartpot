import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { selectUserId } from '../../redux/selectors/authSelectors'
import { selectHouseholds, selectIsHouseholdOwner } from '../../redux/selectors/houseHoldSelectors'
import { loadHouseholds } from '../../redux/slices/householdsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'

import './HouseholdLayout.sass'

import { useNavigate } from 'react-router-dom'

import { CaretRight, Flower, Gear, House, PottedPlant, Users } from '@phosphor-icons/react'
import Loader from '../../components/Loader/Loader'
import SettingsInHousehold from '../../components/SettingsInHousehold/SettingsInHousehold'

const HouseholdLayout = () => {
    const { householdId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const { t } = useTranslation()

    const households = useSelector(selectHouseholds)
    const userId = useSelector(selectUserId)
    const householdsLoading = useSelector((state: RootState) => state.households.loading)
    const isOwner = useSelector((state: RootState) => selectIsHouseholdOwner(state, householdId || ''))
    const household = households.find((h: { id: string }) => h.id === householdId)

    // State for access check
    const [accessStatus, setAccessStatus] = useState<'checking' | 'granted' | 'denied'>('checking')
    const [initialLoadAttempted, setInitialLoadAttempted] = useState(false)

    // Load households on mount
    useEffect(() => {
        if (!initialLoadAttempted) {
            dispatch(loadHouseholds())
            setInitialLoadAttempted(true)
        }
    }, [dispatch, initialLoadAttempted])

    // Check access after households load or householdId changes
    useEffect(() => {
        // If we're still loading households, just wait
        if (householdsLoading) {
            return
        }

        // If we don't have a householdId in URL, it's an invalid state for this layout
        if (!householdId) {
            setAccessStatus('denied')
            navigate('/households', { replace: true })
            return
        }

        // Check if the loaded list contains the current householdId
        const currentHouseholdExists = households.some((h: { id: string }) => h.id === householdId)

        if (currentHouseholdExists) {
            setAccessStatus('granted')
        } else if (initialLoadAttempted) {
            // Only redirect if we've attempted to load the data
            console.warn(`User does not have access to household ${householdId} or it doesn't exist. Redirecting.`)
            toast.error(t('households.access_denied_toast'))
            setAccessStatus('denied')
            navigate('/households', { replace: true })
        }
    }, [householdsLoading, householdId, households, navigate, t, initialLoadAttempted])

    // Show loader while checking access or loading households
    if (householdsLoading || accessStatus === 'checking') {
        return <Loader />
    }

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
