import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/Button/Button'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H4 } from '../../../components/Text/Heading/Heading'
import { Paragraph } from '../../../components/Text/Paragraph/Paragraph'
import { TranslationFunction } from '../../../i18n'
import './FlowerItem.sass'

interface FlowerItemProps {
    name: string
    flowerpot?: string
    id: string
    profileId?: string
    profileName?: string

    avatar?: string
}

const FlowerItem: React.FC<FlowerItemProps> = ({ name, flowerpot, id, profileId, profileName, avatar }) => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleDetailsClick = () => {
        navigate(`/flowerpot-detail/${id}`)
    }

    const handleEditClick = () => {
        navigate(`/edit-flower/${id}`)
    }

    return (
        <GradientDiv className="flower-item-container">
            <div className="flower-item-content">
                <div className="flower-header">
                    <div className="header-content">
                        <H4 variant="primary" className="flower-name">
                            {name}
                        </H4>
                        {profileName ? (
                            <div className="profile-label">{profileName}</div>
                        ) : (
                            <div className="profile-label own-settings">Own settings</div>
                        )}
                    </div>
                </div>
                {flowerpot ? (
                    <Paragraph variant="secondary" size="md" className="flower-description signed-flowerpot">
                        {flowerpot}
                    </Paragraph>
                ) : (
                    <Paragraph variant="secondary" size="md" className="flower-description no-flowerpot">
                        No flowerpot assigned
                    </Paragraph>
                )}

                <div className="flower-actions">
                    <Button variant="default" className="check-button" onClick={handleDetailsClick}>
                        {t('flower_list.flower_item.details')}
                    </Button>

                    {flowerpot ? (
                        <Button variant="default" className="edit-button" onClick={handleEditClick}>
                            {t('flower_list.flower_item.edit')}
                        </Button>
                    ) : (
                        <Button variant="default" className="assign-button" onClick={() => {}}>
                            {t('flower_list.flower_item.assign')}
                        </Button>
                    )}
                </div>
            </div>
            <div className="flower-image">
                <img src={avatar} alt="Flower pot" />
            </div>
        </GradientDiv>
    )
}

export default FlowerItem
