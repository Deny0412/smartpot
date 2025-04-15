import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/Button/Button'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H2, H5 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import { flowerpotsApi, SmartPot } from '../../../redux/services/flowerpotsApi'
import { loadFlowerProfiles } from '../../../redux/slices/flowerProfilesSlice'
import { loadFlowers } from '../../../redux/slices/flowersSlice'
import { loadHouseholds } from '../../../redux/slices/householdsSlice'
import { fetchUsers } from '../../../redux/slices/usersSlice'
import { AppDispatch, RootState } from '../../../redux/store/store'
import './ManageHousehold.sass'

const ManageHousehold: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { t } = useTranslation() as { t: TranslationFunction }
    const { householdId } = useParams<{ householdId: string }>()
    const { households, loading: householdsLoading } = useSelector((state: RootState) => state.households)
    const { flowers, loading: flowersLoading } = useSelector((state: RootState) => state.flowers)
    const { profiles, loading: profilesLoading } = useSelector((state: RootState) => state.flowerProfiles)
    const { users, loading: usersLoading } = useSelector((state: RootState) => state.users)
    const { user } = useSelector((state: RootState) => state.auth)
    const [smartPots, setSmartPots] = React.useState<SmartPot[]>([])
    const [loadingSmartPots, setLoadingSmartPots] = React.useState(false)

    const household = households.find(h => h.id === householdId)
    const isOwner = household?.owner === user?.id

    useEffect(() => {
        dispatch(loadHouseholds())
    }, [dispatch])

    useEffect(() => {
        if (householdId) {
            dispatch(loadFlowers(householdId))
            dispatch(loadFlowerProfiles())
        }
    }, [dispatch, householdId])

    useEffect(() => {
        if (household?.members) {
            dispatch(fetchUsers(household.members))
        }
    }, [dispatch, household])

    useEffect(() => {
        const loadSmartPots = async () => {
            if (householdId) {
                setLoadingSmartPots(true)
                try {
                    const pots = await flowerpotsApi.getHouseholdSmartPots(householdId)
                    setSmartPots(pots)
                } catch (error) {
                    console.error(error)
                } finally {
                    setLoadingSmartPots(false)
                }
            }
        }
        loadSmartPots()
    }, [householdId])

    useEffect(() => {
        if (household && !isOwner && !householdsLoading) {
            navigate('/households-list')
        }
    }, [household, isOwner, householdsLoading, navigate])

    const handleManageMembers = () => {
        navigate(`/household/${householdId}/members`)
    }

    const handleManageFlowers = () => {
        navigate(`/household/${householdId}/flowers`)
    }

    const handleManageProfiles = () => {
        navigate(`/household/${householdId}/profiles`)
    }

    const handleManageFlowerpots = () => {
        navigate(`/household/${householdId}/flowerpots`)
    }

    const handleDeleteHousehold = () => {
        console.log('Delete household:', householdId)
    }

    const getMemberName = (memberId: string) => {
        if (householdsLoading || usersLoading) return 'Načítavam...'
        const user = users[memberId]
        return user ? `${user.name} ${user.surname}` : 'Neznámy používateľ'
    }

    if (householdsLoading || flowersLoading || profilesLoading) {
        return <div>{t('manage_household.loading')}</div>
    }

    if (!household) {
        return <div>{t('manage_household.not_found')}</div>
    }

    if (!isOwner) {
        return <div>{t('manage_household.no_permission')}</div>
    }

    const householdFlowers = flowers.filter(flower => flower.household_id === householdId)
 

    return (
        <div className="manage-household-container">
            <H2 variant="secondary" className="manage-household-title">
                {t('manage_household.title')}{household.name }
            </H2>

            <div className="manage-sections">
                <H5 className="manage-section-title">{t('manage_household.sections.members.title')}</H5>
                <GradientDiv className="manage-section members-section">
                    <div className="section-content">
                        <div className="members-list">
                            {household.members.map(memberId => (
                                <div key={memberId} className="member-item">
                                    <span className="member-name">{getMemberName(memberId)}</span>
                                    {memberId === household.owner && (
                                        <span className="owner-tag">
                                            {t('manage_household.sections.members.owner_tag')}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button variant="default" className="manage-button" onClick={handleManageMembers}>
                            {t('manage_household.sections.members.manage_button')}
                        </Button>
                    </div>
                </GradientDiv>

                <H5 className="manage-section-title">{t('manage_household.sections.flowers.title')}</H5>
                <GradientDiv className="manage-section flowers-section">
                    <div className="section-content">
                        <div className="flowers-list">
                            {householdFlowers.length > 0 ? (
                                householdFlowers.map(flower => (
                                    <div key={flower.id} className="flower-item">
                                        {flower.name}
                                        <img src={flower.avatar} alt={flower.name} className="flower-avatar" />
                                    </div>
                                ))
                            ) : (
                                <div className="no-items">{t('manage_household.sections.flowers.no_items')}</div>
                            )}
                        </div>
                        <Button variant="default" className="manage-button" onClick={handleManageFlowers}>
                            {t('manage_household.sections.flowers.manage_button')}
                        </Button>
                    </div>
                </GradientDiv>

               

                <H5 className="manage-section-title">{t('manage_household.sections.flowerpots.title')}</H5>
                <GradientDiv className="manage-section flowerpots-section">
                    <div className="section-content">
                        <div className="flowerpots-list">
                            {loadingSmartPots ? (
                                <div className="no-items">{t('manage_household.sections.flowerpots.loading')}</div>
                            ) : smartPots.length > 0 ? (
                                smartPots.map(pot => (
                                    <div key={pot.id} className="flowerpot-item">
                                        <span className="flowerpot-serial">{pot.serial_number}</span>
                                        <span className="flowerpot-status">
                                            {pot.active_flower_id
                                                ? t('manage_household.sections.flowerpots.status.signed')
                                                : t('manage_household.sections.flowerpots.status.not_signed')}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="no-items">{t('manage_household.sections.flowerpots.no_items')}</div>
                            )}
                        </div>
                        <Button variant="default" className="manage-button" onClick={handleManageFlowerpots}>
                            {t('manage_household.sections.flowerpots.manage_button')}
                        </Button>
                    </div>
                </GradientDiv>

                <H5 className="manage-section-title danger-zone-title">
                    {t('manage_household.sections.danger_zone.title')}
                </H5>
                <GradientDiv className="manage-section danger-zone-section">
                    <div className="section-content">
                        <div className="danger-zone-content">
                            <p className="danger-zone-description">
                                {t('manage_household.sections.danger_zone.description')}
                            </p>
                            <Button
                                variant="default"
                                className="delete-household-button"
                                onClick={handleDeleteHousehold}>
                                {t('manage_household.sections.danger_zone.delete_button')}
                            </Button>
                        </div>
                    </div>
                </GradientDiv>
            </div>
        </div>
    )
}

export default ManageHousehold
