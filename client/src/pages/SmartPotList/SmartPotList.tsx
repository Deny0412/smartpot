import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Loader from '../../components/Loader/Loader'
import { H3 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { TranslationFunction } from '../../i18n'
import { clearFlowerpots, loadFlowerpots, loadInactiveFlowerpots } from '../../redux/slices/flowerpotsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import { Household } from '../../types/householdTypes'
import SmartPotItem from './SmartPotItem/SmartPotItem'
import './SmartPotList.sass'

type FilterType = 'all' | 'active' | 'not-active'

const SmartPotList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { t } = useTranslation() as { t: TranslationFunction }
    const { householdId } = useParams<{ householdId: string }>()
    const { user } = useSelector((state: RootState) => state.auth)
    const {
        flowerpots,
        inactiveFlowerpots,
        loading: flowerpotsLoading,
        error: flowerpotsError,
    } = useSelector((state: RootState) => state.flowerpots)
    const { households } = useSelector((state: RootState) => state.households)
    const householdName = households.find((h: Household) => h.id === householdId)?.name

    const [filterType, setFilterType] = useState<FilterType>('all')
    const [isOwner, setIsOwner] = useState(false)

    const householdFlowerpots = Array.isArray(flowerpots)
        ? flowerpots.filter(pot => pot.household_id === householdId)
        : []
    const emptyFlowerpots = householdFlowerpots.length === 0

    useEffect(() => {
        if (!householdId) {
            navigate('/')
            return
        }

        dispatch(clearFlowerpots())

        try {
            dispatch(loadFlowerpots(householdId))
            dispatch(loadInactiveFlowerpots(householdId))
        } catch (error: any) {
            if (error.response?.status === 404) {
                // 404 znamená že nie sú žiadne flowerpoty, čo je v poriadku
                return
            }
            console.error('Error loading flowerpots:', error)
        }
    }, [dispatch, householdId, navigate])

    useEffect(() => {
        if (user && householdId && households.length > 0) {
            const currentHousehold = households.find((h: Household) => h.id === householdId)
            setIsOwner(currentHousehold?.owner === user.id)
        }
    }, [households, householdId, user])

    if (!householdId) {
        return null
    }

    const handleAddSmartPot = () => {
        navigate(`/household/${householdId}/flowerpots/add`)
    }

    const filteredFlowerpots = householdFlowerpots.filter(flowerpot => {
        const hasFlower = flowerpot.active_flower_id !== null

        switch (filterType) {
            case 'active':
                return hasFlower
            case 'not-active':
                return !hasFlower
            default:
                return true
        }
    })

    if (flowerpotsLoading) {
        return <Loader />
    }

    return (
        <div className="smart-pot-list-container">
            <H3 variant="secondary" className="main-title">
                {t('smart_pot_list.title')} {householdName}
            </H3>

            <div className="filter-buttons">
                <Button variant="default" onClick={() => setFilterType('all')}>
                    {t('smart_pot_list.filters.all')}
                </Button>
                <Button variant="default" onClick={() => setFilterType('active')}>
                    {t('smart_pot_list.filters.active')}
                </Button>
                <Button variant="default" onClick={() => setFilterType('not-active')}>
                    {t('smart_pot_list.filters.not_active')}
                </Button>
            </div>

            <div className="smart-pots-list">
                {!emptyFlowerpots ? (
                    filteredFlowerpots.map(flowerpot => (
                        <SmartPotItem
                            key={flowerpot._id}
                            serialNumber={flowerpot.serial_number}
                            id={flowerpot._id}
                            activeFlowerId={flowerpot.active_flower_id}
                            householdId={householdId}
                        />
                    ))
                ) : (
                    <Paragraph variant="primary" size="md" className="no-smart-pots-text">
                        {t('smart_pot_list.no_smart_pots')}
                    </Paragraph>
                )}
            </div>

            <div className="add-smart-pot-section">
                <Button variant="default" className="add-smart-pot-button" onClick={handleAddSmartPot}>
                    {t('smart_pot_list.actions.add')}
                </Button>
            </div>
        </div>
    )
}

export default SmartPotList
