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
import { selectHouseholdById } from '../../redux/selectors/houseHoldSelectors'
import { selectSmartPots } from '../../redux/selectors/smartPotSelectors'
import { fetchLatestMeasurements } from '../../redux/slices/measurementsSlice'
import { clearSmartPots, fetchInactiveSmartPots, fetchSmartPots } from '../../redux/slices/smartPotsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import AddSmartPot from './AddSmartPot/AddSmartPot'
import SmartPotItem from './SmartPotItem/SmartPotItem'
import './SmartPotList.sass'

type FilterType = 'all' | 'active' | 'not-active'

const SmartPotList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { t } = useTranslation() as { t: TranslationFunction }
    const { householdId } = useParams<{ householdId: string }>()
    const user = useSelector(selectUser)
    const smartPots = useSelector(selectSmartPots)
    const smartPotsLoading = useSelector((state: RootState) => state.smartPots.loading)
    const smartPotsError = useSelector((state: RootState) => state.smartPots.error)
    const currentHousehold = useSelector((state: RootState) => selectHouseholdById(state, householdId || ''))

    const [filterType, setFilterType] = useState<FilterType>('all')
    const [isOwner, setIsOwner] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)

    const householdSmartPots = Array.isArray(smartPots) ? smartPots.filter(pot => pot.household_id === householdId) : []
    const emptySmartPots = householdSmartPots.length === 0

    useEffect(() => {
        if (!householdId) {
            navigate('/')
            return
        }

        dispatch(clearSmartPots())

        const loadSmartPots = async () => {
            try {
                await Promise.all([
                    dispatch(fetchSmartPots(householdId)).unwrap(),
                    dispatch(fetchInactiveSmartPots(householdId)).unwrap(),
                ])
            } catch (error: any) {
                if (error.response?.status !== 404) {
                    console.error('Error loading flowerpots:', error)
                }
            }
        }

        loadSmartPots()
    }, [dispatch, householdId, navigate])

    useEffect(() => {
        if (user && currentHousehold) {
            setIsOwner(currentHousehold.owner === user.id)
        }
    }, [currentHousehold, user])

    useEffect(() => {
        if (householdId && householdSmartPots.length > 0) {
            householdSmartPots.forEach(pot => {
                if (pot.active_flower_id) {
                    dispatch(
                        fetchLatestMeasurements({
                            flowerId: pot.active_flower_id,
                            householdId,
                        }),
                    )
                }
            })
        }
    }, [dispatch, householdId, householdSmartPots])

    if (!householdId) {
        return null
    }

    const handleAddSmartPot = () => {
        setShowAddModal(true)
    }

    const filteredSmartPots = householdSmartPots.filter(pot => {
        const hasFlower = pot.active_flower_id !== null

        switch (filterType) {
            case 'active':
                return hasFlower
            case 'not-active':
                return !hasFlower
            default:
                return true
        }
    })

    if (smartPotsLoading) {
        return <Loader />
    }

     
    if (smartPotsError && !smartPotsError.toString().includes('404')) {
        return <div>Error: {smartPotsError}</div>
    }

    return (
        <div className="smart-pot-list-container">
            <H3 variant="secondary" className="main-title">
                {t('smart_pot_list.title')} {currentHousehold?.name}
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
                {!emptySmartPots ? (
                    filteredSmartPots.map(pot => (
                        <SmartPotItem
                            key={pot._id}
                            serialNumber={pot.serial_number}
                            id={pot._id}
                            activeFlowerId={pot.active_flower_id}
                            householdId={householdId || ''}
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

            {showAddModal && <AddSmartPot onClose={() => setShowAddModal(false)} />}
        </div>
    )
}

export default SmartPotList
