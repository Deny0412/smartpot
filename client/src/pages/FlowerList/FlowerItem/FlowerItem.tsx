import { WarningCircle } from 'phosphor-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H4 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
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
                    className="flower-item-image-img"
                    onError={e => {
                        const target = e.target as HTMLImageElement
                        target.src = '/default-flower.png'
                    }}
                />
            </div>
            <WarningCircle size={32} color="#f93333" />
        </GradientDiv>
    )
}

export default FlowerItem
