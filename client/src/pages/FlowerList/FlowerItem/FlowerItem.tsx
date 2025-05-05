import { WarningCircle } from 'phosphor-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H4 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import { selectFlower } from '../../../redux/selectors/flowerDetailSelectors'
import { selectProfileById } from '../../../redux/selectors/flowerProfilesSelectors'
import { selectMeasurementsForFlower } from '../../../redux/selectors/measurementSelectors'
import { RootState } from '../../../redux/store/store'
import './FlowerItem.sass'

interface FlowerItemProps {
    name: string
    flowerpot?: string
    id: string
    profileId?: string
    profileName?: string
    householdId: string
    avatar?: string
}

const FlowerItem: React.FC<FlowerItemProps> = ({
    name,
    flowerpot,
    id,
    profileId,
    profileName,
    householdId,
    avatar,
}) => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showWarning, setShowWarning] = useState(false)
    const [isImageLoaded, setIsImageLoaded] = useState(false)

    // Selektory
    const measurements = useSelector((state: RootState) => selectMeasurementsForFlower(state, id))
    const flower = useSelector((state: RootState) => selectFlower(state))
    const profile = useSelector((state: RootState) => selectProfileById(state, profileId || ''))

    // Funkcia na kontrolu, či hodnota prekročila limity
    const checkMeasurementLimits = (type: 'temperature' | 'humidity' | 'light' | 'battery', value: number): boolean => {
        if (type === 'battery') {
            return value < 30 || value > 100
        }

        const limits = profile?.[type] || flower?.profile?.[type]
        if (!limits) return false

        return value < limits.min || value > limits.max
    }

    // Kontrola stavu meraní
    useEffect(() => {
        if (!measurements) return

        const hasWarning = Object.entries(measurements).some(([type, values]) => {
            if (!values || values.length === 0) return false
            const lastValue = Number(values[0].value)
            return checkMeasurementLimits(type as 'temperature' | 'humidity' | 'light' | 'battery', lastValue)
        })

        setShowWarning(hasWarning)
    }, [measurements, profile, flower])

    const handleDetailsClick = () => {
        if (householdId) {
            navigate(`/households/${householdId}/flowers/${id}`)
        }
    }

    return (
        <GradientDiv className="flower-item-container" onClick={handleDetailsClick}>
            <div className="flower-item-content">
                <div className="flower-item-header">
                    <div className="flower-item-header-content">
                        <H4 variant="primary" className="flower-item-name">
                            {name}
                        </H4>
                        {profileName ? (
                            <div className="flower-item-profile-label">{profileName}</div>
                        ) : (
                            <div className="flower-item-profile-label flower-item-own-settings">Own settings</div>
                        )}
                        {flowerpot ? (
                            <div className="flower-item-flowerpot-label">{flowerpot}</div>
                        ) : (
                            <div className="flower-item-flowerpot-label flower-item-no-flowerpot">
                                No flowerpot assigned
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flower-item-image">
                <img
                    src={avatar}
                    alt={`${name} flower pot`}
                    className={`flower-item-image-img ${isImageLoaded ? 'loaded' : ''}`}
                    onLoad={() => setIsImageLoaded(true)}
                    onError={e => {
                        const target = e.target as HTMLImageElement
                        target.src = '/default-flower.png'
                        setIsImageLoaded(true)
                    }}
                />
            </div>
            {showWarning && <WarningCircle size={32} color="#f93333" className="flower-item-warning" />}
        </GradientDiv>
    )
}

export default FlowerItem
