import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Loader from '../../components/Loader/Loader'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { loadFlowerpots } from '../../redux/slices/flowerpotsSlice'
import { RootState } from '../../redux/store/rootReducer'
import { AppDispatch } from '../../redux/store/store'
import './SmartPotDetail.sass'
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
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const smartPot = useSelector((state: RootState) => state.flowerpots.flowerpots.find(pot => pot._id === smartPotId))

    useEffect(() => {
        if (!smartPotId || !householdId) return

        const loadData = async () => {
            try {
                setIsLoading(true)
                await dispatch(loadFlowerpots(householdId)).unwrap()
                setIsLoading(false)
                setIsInitialLoad(false)
            } catch (error) {
                console.error('Chyba pri načítaní dát:', error)
                setError('Chyba pri načítaní dát smart potu')
                setIsLoading(false)
            }
        }

        loadData()
    }, [dispatch, smartPotId, householdId])

    if (isLoading) {
        return <Loader />
    }

    if (!smartPotId || !householdId) {
        return <div>{t('smart_pot_detail.missing_params')}</div>
    }

    if (error) {
        return <div>{t('smart_pot_detail.error_loading', { error })}</div>
    }

    if (!smartPot) {
        return <div>{t('smart_pot_detail.smart_pot_not_found')}</div>
    }

    const smartPotData: SmartPotData = {
        serialNumber: smartPot.serial_number,
        status_description: smartPot.active_flower_id ? 'Smart pot je aktívny' : 'Smart pot nie je aktívny',
        activeFlowerId: smartPot.active_flower_id,
        lastConnection: smartPot.createdAt || new Date().toISOString(),
        batteryLevel: 85,
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
                        <div className="smart-pot-detail__info-title">{t('smart_pot_detail.battery_level')}</div>
                        <div className="smart-pot-detail__battery">
                            <div
                                className="smart-pot-detail__battery-progress"
                                style={{ '--battery-level': `${smartPotData.batteryLevel}%` } as React.CSSProperties}
                            />
                            <div className="smart-pot-detail__battery-value">{smartPotData.batteryLevel}%</div>
                        </div>
                    </div>

                    <div className="smart-pot-detail__info-section">
                        <div className="smart-pot-detail__info-title">{t('smart_pot_detail.last_connection')}</div>
                        <Paragraph>{new Date(smartPotData.lastConnection).toLocaleString()}</Paragraph>
                    </div>

                    <div className="smart-pot-detail__info-section">
                        <div className="smart-pot-detail__info-title">{t('smart_pot_detail.assigned_flower')}</div>
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
                        <Button variant="default" onClick={() => {}}>
                            {t('smart_pot_detail.disconnect')}
                        </Button>
                        <Button variant="default" onClick={() => {}}>
                            {t('smart_pot_detail.transplant')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SmartPotDetail
