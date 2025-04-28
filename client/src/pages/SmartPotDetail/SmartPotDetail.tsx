import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { loadFlowerpots } from '../../redux/slices/flowerpotsSlice'
import { RootState } from '../../redux/store/rootReducer'
import { AppDispatch } from '../../redux/store/store'
import './SmartPotDetail.sass'
const emptySmartPot = require('../../assets/flower_profiles_avatatars/empty-smart-pot.png')

interface SmartPotData {
    serialNumber: string
    status: string
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
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const smartPot = useSelector((state: RootState) => state.flowerpots.flowerpots.find(pot => pot._id === smartPotId))

    useEffect(() => {
        if (!smartPotId || !householdId) return

        const loadData = async () => {
            try {
                setLoading(true)
                await dispatch(loadFlowerpots(householdId)).unwrap()
                setLoading(false)
                setIsInitialLoad(false)
            } catch (error) {
                console.error('Chyba pri načítaní dát:', error)
                setError('Chyba pri načítaní dát smart potu')
                setLoading(false)
            }
        }

        loadData()
    }, [dispatch, smartPotId, householdId])

    if (!smartPotId || !householdId) {
        return <div>Chýbajúce parametre</div>
    }

    if (loading && isInitialLoad) {
        return <div>Načítavam...</div>
    }

    if (error) {
        return <div>Chyba pri načítaní dát: {error}</div>
    }

    if (!smartPot) {
        return <div>Smart pot nebol nájdený</div>
    }

    const smartPotData: SmartPotData = {
        serialNumber: smartPot.serial_number,
        status: smartPot.active_flower_id ? 'active' : 'inactive',
        status_description: smartPot.active_flower_id ? 'Smart pot je aktívny' : 'Smart pot nie je aktívny',
        activeFlowerId: smartPot.active_flower_id,
        lastConnection: smartPot.createdAt || new Date().toISOString(),
        batteryLevel: 85, // TODO: Pridať skutočné dáta z API
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
                        <div className="smart-pot-detail__info-title">Stav batérie</div>
                        <div className="smart-pot-detail__battery">
                            <div
                                className="smart-pot-detail__battery-progress"
                                style={{ width: `${smartPotData.batteryLevel}%` }}></div>
                            <div className="smart-pot-detail__battery-value">{smartPotData.batteryLevel}%</div>
                        </div>
                    </div>

                    <div className="smart-pot-detail__info-section">
                        <div className="smart-pot-detail__info-title">Posledné pripojenie</div>
                        <Paragraph>{new Date(smartPotData.lastConnection).toLocaleString()}</Paragraph>
                    </div>

                    <div className="smart-pot-detail__info-section">
                        <div className="smart-pot-detail__info-title">Priradená kvetina</div>
                        {smartPotData.activeFlowerId ? (
                            <Button
                                variant="default"
                                onClick={() =>
                                    navigate(`/households/${householdId}/flowers/${smartPotData.activeFlowerId}`)
                                }>
                                Zobraziť kvetinu
                            </Button>
                        ) : (
                            <Paragraph variant="secondary">Žiadna kvetina nie je priradená</Paragraph>
                        )}
                        <Button variant="default" onClick={() => {}}>
                            Upraviť nastavenia
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SmartPotDetail
