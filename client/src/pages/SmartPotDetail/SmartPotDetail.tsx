import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Loader from '../../components/Loader/Loader'
import { H5 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { selectFlowers } from '../../redux/selectors/flowerDetailSelectors'
import { selectMeasurementsForFlower } from '../../redux/selectors/measurementSelectors'
import { selectSmartPots } from '../../redux/selectors/smartPotSelectors'
import { loadFlowers } from '../../redux/slices/flowersSlice'
import { fetchMeasurementsForFlower } from '../../redux/slices/measurementsSlice'
import { fetchSmartPots } from '../../redux/slices/smartPotsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import DisconnectSmarpotModal from './DisconnectSmarpotModal/DisconnectSmarpotModal'
import './SmartPotDetail.sass'
import TransplantSmartPot from './TransplantSmartPot/TransplantSmartPot'
const emptySmartPot = require('../../assets/flower_profiles_avatatars/empty-smart-pot.png')

interface SmartPotData {
    serialNumber: string
    status_description: string
    activeFlowerId: string | null
    lastConnection: string
    batteryLevel: number
}

const SmartPotDetail: React.FC = () => {
    const { t } = useTranslation()
    const { smartPotId, householdId } = useParams<{ smartPotId: string; householdId: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const smartPots = useSelector(selectSmartPots)
    const smartPotsLoading = useSelector((state: RootState) => state.smartPots.loading)
    const smartPotsError = useSelector((state: RootState) => state.smartPots.error)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showDisconnectModal, setShowDisconnectModal] = useState(false)
    const [showTransplantModal, setShowTransplantModal] = useState(false)
    const smartPot = smartPots.find(pot => pot._id === smartPotId)
    const flowers = useSelector(selectFlowers)
    const flower = smartPot?.active_flower_id
        ? flowers.find(flower => flower._id === smartPot.active_flower_id)
        : undefined

    const measurements = useSelector((state: RootState) => {
        if (!smartPot?.active_flower_id) return null
        return selectMeasurementsForFlower(state, smartPot.active_flower_id)
    })

    const batteryLevel = measurements?.battery?.[0]?.value ? Number(measurements.battery[0].value) : null

    useEffect(() => {
        if (householdId) {
            dispatch(fetchSmartPots(householdId))
            dispatch(loadFlowers(householdId))
        }
    }, [dispatch, householdId])

    useEffect(() => {
        if (!smartPotId || !householdId) return

        const loadData = async () => {
            try {
                setIsLoading(true)
                // Načítaj merania len ak nie sú v store a smart pot má priradenú kvetinu
                if (smartPot?.active_flower_id) {
                    const now = new Date()
                    const startDate = new Date(now)
                    startDate.setFullYear(now.getFullYear() - 1)

                    await dispatch(
                        fetchMeasurementsForFlower({
                            flowerId: smartPot.active_flower_id,
                            householdId,
                            dateFrom: startDate.toISOString().split('T')[0],
                            dateTo: now.toISOString().split('T')[0],
                        }),
                    ).unwrap()
                }

                setIsLoading(false)
            } catch (error) {
                console.error('Chyba pri načítaní dát:', error)
                setError('Chyba pri načítaní dát smart potu')
                setIsLoading(false)
            }
        }

        loadData()
    }, [dispatch, smartPotId, householdId, smartPot?.active_flower_id])

    if (smartPotsLoading) {
        return <Loader />
    }

    if (smartPotsError || error) {
        return <div>Error: {smartPotsError?.toString() || error}</div>
    }

    if (!smartPot) {
        return <div>Smart pot not found</div>
    }

    const smartPotData: SmartPotData = {
        serialNumber: smartPot.serial_number,
        status_description: smartPot.active_flower_id ? 'Smart pot je aktívny' : 'Smart pot nie je aktívny',
        activeFlowerId: smartPot.active_flower_id,
        lastConnection: smartPot.createdAt || new Date().toISOString(),
        batteryLevel: batteryLevel || 0,
    }

    return (
        <div className="smart-pot-detail">
            <div className="smart-pot-detail__container">
                <div className="smart-pot-detail__header">
                    <h1 className="smart-pot-detail__title">{smartPotData.serialNumber}</h1>
                    <img
                        src={emptySmartPot}
                        alt={`${smartPotData.serialNumber} smart pot`}
                        className="smart-pot-detail__avatar"
                    />
                </div>

                <div className="smart-pot-detail__info">
                    <div className="smart-pot-detail__info-section">
                        <div className="smart-pot-detail-assigned-flower">
                            <div className="smart-pot-detail-flower-info">
                                {flower ? (
                                    <>
                                        <H5>Assigned into {flower.name}</H5>
                                        <img
                                            src={flower.avatar}
                                            alt="Flower avatar"
                                            className="smart-pot-detail-flower-avatar"
                                        />
                                    </>
                                ) : (
                                    <H5>No flower assigned</H5>
                                )}
                            </div>
                            {smartPotData.activeFlowerId ? (
                                <Button
                                    variant="default"
                                    onClick={() =>
                                        navigate(`/households/${householdId}/flowers/${smartPotData.activeFlowerId}`)
                                    }>
                                    {t('smart_pot_detail.view_flower')}
                                </Button>
                            ) : (
                                <Paragraph variant="secondary">{t('smart_pot_detail.no_flower_assigned')}</Paragraph>
                            )}
                        </div>

                        <div className="smart-pot-detail__info-title">{t('smart_pot_detail.battery_level')}</div>
                        <div className="smart-pot-detail__battery">
                            <div
                                className={`smart-pot-detail__battery-progress ${
                                    batteryLevel && batteryLevel < 30 ? 'low' : ''
                                }`}
                                style={{ '--battery-level': `${smartPotData.batteryLevel}%` } as React.CSSProperties}
                            />
                            <div className="smart-pot-detail__battery-value">{smartPotData.batteryLevel}%</div>
                        </div>
                    </div>

                    <div className="smart-pot-detail__info-section">
                        <div className="smart-pot-detail-info-buttons">
                            <Button variant="default" onClick={() => setShowTransplantModal(true)}>
                                {t('smart_pot_detail.transplant')}
                            </Button>
                            {smartPotData.activeFlowerId && (
                                <Button variant="warning" onClick={() => setShowDisconnectModal(true)}>
                                    {t('smart_pot_detail.disconnect')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showDisconnectModal && smartPotData.activeFlowerId && (
                <DisconnectSmarpotModal
                    onClose={() => setShowDisconnectModal(false)}
                    smartPotId={smartPotId || ''}
                    householdId={householdId || ''}
                    serialNumber={smartPotData.serialNumber}
                />
            )}

            {showTransplantModal && (
                <TransplantSmartPot
                    isOpen={showTransplantModal}
                    onClose={() => setShowTransplantModal(false)}
                    smartPotId={smartPotId || ''}
                    currentHouseholdId={householdId || ''}
                    serialNumber={smartPotData.serialNumber}
                />
            )}
        </div>
    )
}

export default SmartPotDetail
