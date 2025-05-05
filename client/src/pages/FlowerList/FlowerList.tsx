import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Loader from '../../components/Loader/Loader'
import { H3 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { TranslationFunction } from '../../i18n'
import { selectUser } from '../../redux/selectors/authSelectors'
import { selectFlowers } from '../../redux/selectors/flowerDetailSelectors'
import {
    selectProfiles,
    selectProfilesError,
    selectProfilesLoading,
} from '../../redux/selectors/flowerProfilesSelectors'
import { selectHouseholdById, selectIsHouseholdOwner } from '../../redux/selectors/houseHoldSelectors'
import { selectMeasurementsError, selectMeasurementsLoading } from '../../redux/selectors/measurementSelectors'
import { selectInactiveSmartPots, selectSmartPots } from '../../redux/selectors/smartPotSelectors'
import { loadFlowerProfiles } from '../../redux/slices/flowerProfilesSlice'
import { loadFlowers } from '../../redux/slices/flowersSlice'
import { loadHouseholds } from '../../redux/slices/householdsSlice'
import { fetchMeasurementsForFlower } from '../../redux/slices/measurementsSlice'
import { fetchInactiveSmartPots } from '../../redux/slices/smartPotsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import AddFlower from '../AddFlower/AddFlower'
import FlowerItem from './FlowerItem/FlowerItem'
import './FlowerList.sass'

type FilterType = 'all' | 'active' | 'not-active'
type ProfileFilter = string

const FlowerList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { t } = useTranslation() as { t: TranslationFunction }
    const { householdId } = useParams<{ householdId: string }>()

    // Selektory
    const user = useSelector(selectUser)
    const flowers = useSelector(selectFlowers)
    const profiles = useSelector(selectProfiles)
    const profilesLoading = useSelector(selectProfilesLoading)
    const profilesError = useSelector(selectProfilesError)
    const smartPots = useSelector(selectSmartPots)
    const inactiveSmartPots = useSelector(selectInactiveSmartPots)
    const measurementsLoading = useSelector(selectMeasurementsLoading)
    const measurementsError = useSelector(selectMeasurementsError)
    const currentHousehold = useSelector((state: RootState) => selectHouseholdById(state, householdId || ''))
    const isOwner = useSelector((state: RootState) => selectIsHouseholdOwner(state, householdId || ''))

    const [filterType, setFilterType] = useState<FilterType>('all')
    const [profileFilter, setProfileFilter] = useState<ProfileFilter>('all')
    const [isAddFlowerModalOpen, setIsAddFlowerModalOpen] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    const householdFlowers = Array.isArray(flowers) ? flowers : []
    const emptyFlowers = householdFlowers.length === 0

    useEffect(() => {
        if (!householdId) {
            navigate('/')
            return
        }
        const loadData = async () => {
            setIsInitialLoading(true)
            await Promise.all([
                dispatch(loadFlowers(householdId)),
                dispatch(loadFlowerProfiles()),
                dispatch(fetchInactiveSmartPots(householdId)),
                dispatch(loadHouseholds()),
            ])
            setIsInitialLoading(false)
        }
        loadData()
    }, [dispatch, householdId, navigate])

    useEffect(() => {
        if (householdId && flowers.length > 0) {
            const now = new Date()
            const startDate = new Date(now)
            startDate.setFullYear(now.getFullYear() - 1)

            flowers.forEach(flower => {
                dispatch(
                    fetchMeasurementsForFlower({
                        flowerId: flower._id,
                        householdId,
                        dateFrom: startDate.toISOString().split('T')[0],
                        dateTo: now.toISOString().split('T')[0],
                    }),
                )
            })
        }
    }, [dispatch, householdId, flowers])

    if (!householdId) {
        return null
    }

    if (isInitialLoading) {
        return <Loader />
    }

    const getProfileName = (profileId: string | null | undefined): string => {
        if (!profileId) return ''
        const profile = Array.isArray(profiles) ? profiles.find(p => p._id === profileId) : null
        return profile ? profile.name : ''
    }

    const handleAddFlower = () => {
        setIsAddFlowerModalOpen(true)
    }

    const handleCloseAddFlowerModal = () => {
        setIsAddFlowerModalOpen(false)
    }

    const handleAddFlowerPot = () => {
        navigate(`/household/${householdId}/flowerpots/add`)
    }

    const handleTransplantFlower = () => {
        navigate(`/household/${householdId}/flowers/transplant-flower`)
    }

    const filteredFlowers = householdFlowers.filter(flower => {
        const hasSmartPot = flower.serial_number !== ''
        const matchesProfile =
            profileFilter === 'all' ||
            (profileFilter === 'own_settings' ? !flower.profile_id : flower.profile_id === profileFilter)

        switch (filterType) {
            case 'active':
                return hasSmartPot && matchesProfile
            case 'not-active':
                return !hasSmartPot && matchesProfile
            default:
                return matchesProfile
        }
    })

    if (measurementsError || profilesError) {
        return (
            <div className="error-container">
                <Paragraph variant="primary" size="md">
                    {measurementsError || profilesError}
                </Paragraph>
            </div>
        )
    }

    return (
        <div className="flower-list-container">
            <H3 variant="secondary" className="main-title">
                {t('flower_list.title')} {currentHousehold?.name}
            </H3>

            <div className="flower-list-filter-buttons">
                <Button variant="default" className="flower-list-filter-button" onClick={() => setFilterType('all')}>
                    {t('flower_list.filters.all')}
                </Button>
                <Button variant="default" className="flower-list-filter-button" onClick={() => setFilterType('active')}>
                    {t('flower_list.filters.active')}
                </Button>
                <Button
                    variant="default"
                    className="flower-list-filter-button"
                    onClick={() => setFilterType('not-active')}>
                    {t('flower_list.filters.not_active')}
                </Button>
                <select
                    className="flower-list-profile-select"
                    value={profileFilter}
                    onChange={e => setProfileFilter(e.target.value)}>
                    <option value="all">{t('flower_list.filters.all_profiles')}</option>
                    <option value="own_settings">{t('flower_list.filters.own_settings')}</option>
                    {Array.isArray(profiles) &&
                        profiles.map(profile => (
                            <option key={profile._id} value={profile._id}>
                                {profile.name}
                            </option>
                        ))}
                </select>
            </div>

            <div className="flower-list-items">
                {filteredFlowers.length > 0 ? (
                    filteredFlowers.map(flower => (
                        <FlowerItem
                            key={flower._id}
                            name={flower.name}
                            flowerpot={flower.serial_number ? flower.serial_number : ''}
                            id={flower._id}
                            profileId={flower.profile_id || undefined}
                            profileName={getProfileName(flower.profile_id)}
                            avatar={flower.avatar}
                            householdId={householdId}
                        />
                    ))
                ) : (
                    <Paragraph variant="primary" size="md" className="flower-list-no-flowers-text">
                        {t('flower_list.no_flowers')}
                    </Paragraph>
                )}
            </div>

            <div className="flower-list-add-section">
                <Button variant="default" className="flower-list-add-button" onClick={handleAddFlower}>
                    {t('flower_list.actions.add')}
                </Button>
            </div>
            {isAddFlowerModalOpen ? <AddFlower onClose={handleCloseAddFlowerModal} /> : null}
        </div>
    )
}

export default FlowerList
