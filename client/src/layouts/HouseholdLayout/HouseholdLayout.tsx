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

    // State for access check
    const [accessStatus, setAccessStatus] = useState<'checking' | 'granted' | 'denied'>('checking')

    // Load households (runs once on mount)
    useEffect(() => {
        dispatch(loadHouseholds())
    }, [dispatch])

    // Check access after households load or householdId changes
    useEffect(() => {
        // Ak ešte načítavame domácnosti, počkáme.
        if (householdsLoading) {
            // Nastavíme stav na 'checking', ak ešte nie je, aby sa zobrazil Loader
            if (accessStatus !== 'checking') {
                setAccessStatus('checking')
            }
            return // Nepokračujeme, kým sa nenačíta
        }

        // Ak nemáme householdId v URL, je to neplatný stav pre tento layout
        if (!householdId) {
            // Nastavíme denied a presmerujeme len ak sme neboli už presmerovaní
            if (accessStatus !== 'denied') {
                setAccessStatus('denied')
                navigate('/households', { replace: true })
            }
            return
        }

        // Skontrolujeme, či načítaný zoznam obsahuje dané householdId
        const currentHouseholdExists = households.some((h: { id: string }) => h.id === householdId)

        if (currentHouseholdExists) {
            // Ak sme našli a stav nie je 'granted', nastavíme ho
            if (accessStatus !== 'granted') {
                setAccessStatus('granted')
            }
        } else {
            // Domácnosť sa nenašla v zozname používateľa
            console.warn(`User does not have access to household ${householdId} or it doesn't exist. Redirecting.`)
            // Nastavíme denied a presmerujeme len ak sme neboli už presmerovaní
            if (accessStatus !== 'denied') {
                toast.error(t('households.access_denied_toast'))
                setAccessStatus('denied')
                navigate('/households', { replace: true })
            }
        }

        // Závislosti: efekt sa spustí, keď sa zmení stav načítania, ID v URL,
        // zoznam domácností, alebo funkcia navigate (čo by nemalo).
    }, [householdsLoading, householdId, households, navigate, accessStatus, t]) // Pridal som accessStatus ako závislosť

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
