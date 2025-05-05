import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import GradientDiv from '../../../../components/GradientDiv/GradientDiv'
import { H4 } from '../../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../../i18n'
import { selectUserId } from '../../../../redux/selectors/authSelectors'
import './HouseHoldItem.sass'

interface HouseHoldItemProps {
    name?: string
    description?: string
    id?: string
    owner?: string
    members?: string[]
}

const HouseHoldItem: React.FC<HouseHoldItemProps> = ({ name, id, owner, members = [] }) => {
    const navigate = useNavigate()
    const userId = useSelector(selectUserId)
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
            </div>
        </GradientDiv>
    )
}

export default HouseHoldItem
