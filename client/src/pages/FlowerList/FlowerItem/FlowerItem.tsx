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

    
    const measurements = useSelector((state: RootState) => selectMeasurementsForFlower(state, id))
    const flower = useSelector((state: RootState) => selectFlower(state))
    const profile = useSelector((state: RootState) => selectProfileById(state, profileId || ''))

    
    const checkMeasurementLimits = (type: 'temperature' | 'humidity' | 'light' | 'battery', value: number): boolean => {
        if (type === 'battery') {
            return value < 30 || value > 100
        }

        const limits = profile?.[type] || flower?.profile?.[type]
        if (!limits) return false

        return value < limits.min || value > limits.max
    }

    
    useEffect(() => {
        if (!measurements) {
            setShowWarning(false) 
            return
        }

       
        const relevantWarningTypes: Array<keyof Omit<typeof measurements, 'lastChange'>> = [
            'temperature',
            'humidity',
            'light',
            'battery',
        ]

        const hasWarning = relevantWarningTypes.some(type => {
            const valuesArray = measurements[type]
            if (!Array.isArray(valuesArray) || valuesArray.length === 0) {
                return false
            }
            const lastValue = Number(valuesArray[0].value)

            
            if (type === 'temperature' || type === 'humidity' || type === 'light' || type === 'battery') {
                return checkMeasurementLimits(type, lastValue)
            }
            return false 
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
