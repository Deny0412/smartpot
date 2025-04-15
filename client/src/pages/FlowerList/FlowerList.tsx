import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Loader from '../../components/Loader/Loader'
import { H2 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { TranslationFunction } from '../../i18n'
import { loadFlowerProfiles } from '../../redux/slices/flowerProfilesSlice'
import { loadInactiveFlowerpots } from '../../redux/slices/flowerpotsSlice'
import { loadFlowers } from '../../redux/slices/flowersSlice'
import { loadHouseholds } from '../../redux/slices/householdsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import { Household } from '../../types/householdTypes'
import FlowerItem from './FlowerItem/FlowerItem'
import './FlowerList.sass'

type FilterType = 'all' | 'active' | 'not-active'
type ProfileFilter = string

const FlowerList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { t } = useTranslation() as { t: TranslationFunction }
    const { householdId } = useParams<{ householdId: string }>()
    const { user } = useSelector((state: RootState) => state.auth)
    const { flowers, loading: flowersLoading, error: flowersError } = useSelector((state: RootState) => state.flowers)
    const {
        profiles,
        loading: profilesLoading,
        error: profilesError,
    } = useSelector((state: RootState) => state.flowerProfiles)
    const {
        inactiveFlowerpots,
        loading: flowerpotsLoading,
        error: flowerpotsError,
    } = useSelector((state: RootState) => state.flowerpots)
    const { households } = useSelector((state: RootState) => state.households)

    const [filterType, setFilterType] = useState<FilterType>('all')
    const [profileFilter, setProfileFilter] = useState<ProfileFilter>('all')
    const [isOwner, setIsOwner] = useState(false)

    const householdFlowers = Array.isArray(flowers)
        ? flowers.filter(flower => flower && flower.household_id === householdId)
        : []
    const emptyFlowers = householdFlowers.length === 0

    useEffect(() => {
        if (householdId) {
            dispatch(loadFlowers(householdId))
            dispatch(loadFlowerProfiles())
            dispatch(loadInactiveFlowerpots(householdId))
            dispatch(loadHouseholds())
        }
    }, [dispatch, householdId])

    useEffect(() => {
        if (user && householdId && households.length > 0) {
            const currentHousehold = households.find((h: Household) => h.id === householdId)
            setIsOwner(currentHousehold?.owner === user.id)
        }
    }, [households, householdId, user])

    const getProfileName = (profileId: string | null | undefined): string => {
        if (!profileId) return ''
        const profile = profiles.find(p => p.id === profileId)
        return profile ? profile.name : ''
    }

    const handleAddFlower = () => {
        navigate(`/household/${householdId}/flowers/add`)
    }

    const handleAddFlowerPot = () => {
        navigate(`/household/${householdId}/flowerpots/add`)
    }

    const handleTransplantFlower = () => {
        navigate(`/household/${householdId}/flowers/transplant-flower`)
    }

    const filteredFlowers = householdFlowers.filter(flower => {
        const hasSmartPot = flower.serial_number !== ''
        const matchesProfile = profileFilter === 'all' || flower.profile_id === profileFilter

        switch (filterType) {
            case 'active':
                return hasSmartPot && matchesProfile
            case 'not-active':
                return !hasSmartPot && matchesProfile
            default:
                return matchesProfile
        }
    })

    return (
        <div className="flower-list-container">
            <H2 variant="secondary" className="main-title">
                {t('flower_list.title')} {householdId}
            </H2>

            {(flowersLoading || profilesLoading || flowerpotsLoading) && <Loader />}
            {(flowersError || profilesError || flowerpotsError) && (
                <p className="error-message">{flowersError || profilesError || flowerpotsError}</p>
            )}

            <div className="filter-buttons">
                <Button variant="default" onClick={() => {}}>
                    {t('flower_list.filters.free_flowerpot_counter')} {inactiveFlowerpots.length}
                </Button>
                <Button variant="default" onClick={() => setFilterType('all')}>
                    {t('flower_list.filters.all')}
                </Button>
                <Button variant="default" onClick={() => setFilterType('active')}>
                    {t('flower_list.filters.active')}
                </Button>
                <Button variant="default" onClick={() => setFilterType('not-active')}>
                    {t('flower_list.filters.not_active')}
                </Button>
                <select
                    className="profile-select"
                    value={profileFilter}
                    onChange={e => setProfileFilter(e.target.value)}>
                    <option value="all">{t('flower_list.filters.all_profiles')}</option>
                    {profiles.map(profile => (
                        <option key={profile.id} value={profile.id}>
                            {profile.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flowers-list">
                {!emptyFlowers
                    ? filteredFlowers.map(flower => (
                          <FlowerItem
                              key={flower.id}
                              name={flower.name}
                              flowerpot={flower.serial_number ? flower.serial_number : ''}
                              id={flower.id}
                              profileId={flower.profile_id || undefined}
                              profileName={getProfileName(flower.profile_id)}
                              avatar={flower.avatar}
                          />
                      ))
                    : !flowersLoading && (
                          <Paragraph variant="primary" size="md" className="no-flowers-text">
                              No flowers registered in this household.
                          </Paragraph>
                      )}
            </div>

            <div className="add-flower-section">
                <Button variant="default" className="add-flower-button" onClick={handleAddFlower}>
                    {t('flower_list.actions.add')}
                </Button>
                <Button variant="default" onClick={handleAddFlowerPot}>
                    {t('flower_list.actions.add_flowerpot')}
                </Button>
                {isOwner && (
                    <Button variant="default" onClick={handleTransplantFlower}>
                        Presunut kvetinu z domacnosti
                    </Button>
                )}
            </div>
        </div>
    )
}

export default FlowerList
