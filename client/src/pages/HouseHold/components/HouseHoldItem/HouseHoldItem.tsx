import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import GradientDiv from '../../../../components/GradientDiv/GradientDiv'
import { H4 } from '../../../../components/Text/Heading/Heading'
import { Paragraph } from '../../../../components/Text/Paragraph/Paragraph'
import { TranslationFunction } from '../../../../i18n'
import { RootState } from '../../../../redux/store/store'
import './HouseHoldItem.sass'

interface HouseHoldItemProps {
    name?: string
    description?: string
    id?: string
    owner?: string
    members?: string[]
}

const HouseHoldItem: React.FC<HouseHoldItemProps> = ({
    name,
    description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    id,
    owner,
    members = [],
}) => {
    const navigate = useNavigate()
    const authState = useSelector((state: RootState) => state.auth)
    const userId = authState.user?.id
    const isOwner = owner === userId
    const isMember = members.includes(userId || '')
    const { t } = useTranslation() as { t: TranslationFunction }
    const handleCheckClick = () => {
        if (id) {
            navigate(`/households/${id}/flowers`)
        }
    }

    return (
        <GradientDiv className="household-item-container" onClick={handleCheckClick}>
            <div className="household-item-content">
                <div className="household-header">
                    <div className="header-title-wrapper">
                        <H4 variant="primary" className="household-name">
                            {name}
                        </H4>
                        {isOwner && <div className="owner-tag owner-tag-owner">{t('households.role.owner')}</div>}
                        {!isOwner && isMember && (
                            <div className="owner-tag owner-tag-member">{t('households.role.member')}</div>
                        )}
                    </div>
                </div>
                <Paragraph variant="secondary" size="md" className="household-description">
                    {description}
                </Paragraph>
            </div>
        </GradientDiv>
    )
}

export default HouseHoldItem
