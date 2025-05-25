import { CheckCircle, WarningCircle } from 'phosphor-react'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H4 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import { fetchMeasurementsForFlower } from '../../../redux/slices/measurementsSlice'
import { RootState } from '../../../redux/store/rootReducer'
import { AppDispatch } from '../../../redux/store/store'
import './SmartPotItem.sass'
const emptySmartPot = require('../../../assets/flower_profiles_avatatars/empty-smart-pot.png')

interface SmartPotItemProps {
    serialNumber: string
    id: string
    activeFlowerId: string | null
    householdId: string
}

const SmartPotItem: React.FC<SmartPotItemProps> = ({ serialNumber, id, activeFlowerId, householdId }) => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const measurements = useSelector((state: RootState) => {
        if (!activeFlowerId) return null
        return state.measurements.measurements[activeFlowerId]
    })

    const batteryLevel = measurements?.battery?.[0]?.value ? Number(measurements.battery[0].value) : null
    const hasLowBattery = batteryLevel !== null && batteryLevel < 30

    useEffect(() => {
        if (activeFlowerId) {
            const now = new Date()
            const startDate = new Date(now)
            startDate.setFullYear(now.getFullYear() - 1)

            dispatch(
                fetchMeasurementsForFlower({
                    flowerId: activeFlowerId,
                    householdId,
                    dateFrom: startDate.toISOString().split('T')[0],
                    dateTo: now.toISOString().split('T')[0],
                }),
            )
        }
    }, [dispatch, activeFlowerId, householdId])

    const handleDetailsClick = () => {
        if (householdId) {
            navigate(`/households/${householdId}/smartPots/${id}`)
        }
    }

    return (
        <GradientDiv className="smart-pot-list-item" onClick={handleDetailsClick}>
            <div className="smart-pot-list-content">
                <div className="smart-pot-list-header">
                    <div className="smart-pot-list-header-content">
                        <H4 variant="primary" className="smart-pot-list-name">
                            {serialNumber}
                        </H4>
                        {activeFlowerId ? (
                            <div className="smart-pot-list-status smart-pot-list-active">
                                {t('smart_pot_list.flower_item.assigned')}
                            </div>
                        ) : (
                            <div className="smart-pot-list-status smart-pot-list-inactive">
                                {t('smart_pot_list.flower_item.not_assigned')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="smart-pot-list-image">
                <img src={emptySmartPot} alt={`${serialNumber} smart pot`} className="smart-pot-list-image-img" />
            </div>
            {activeFlowerId &&
                (hasLowBattery ? (
                    <WarningCircle size={32} color="#f93333" />
                ) : (
                    <CheckCircle size={32} color="#4CAF50" />
                ))}
        </GradientDiv>
    )
}

export default SmartPotItem
