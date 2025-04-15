import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../../../../components/Button/Button'
import GradientDiv from '../../../../components/GradientDiv/GradientDiv'
import { H4 } from '../../../../components/Text/Heading/Heading'
import { Paragraph } from '../../../../components/Text/Paragraph/Paragraph'
import { RootState } from '../../../../redux/store/store'
import './HouseHoldItem.sass'
import { TranslationFunction } from '../../../../i18n'
import { useTranslation } from 'react-i18next'

interface HouseHoldItemProps {
    name?: string
    description?: string
    id?: string
    owner?: string
    members?: string[]
}

const HouseHoldItem: React.FC<HouseHoldItemProps> = ({
    name,
    description = 'V tychto props budeme posielat nejake data z backendu v ramci kazdeho household itemu. Napriklad : Vas household obsahuje kvetiny ktore treba zaliat',
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
            navigate(`/household/${id}/flowers`)
        }
    }

    const handleManageClick = () => {
        if (id && isOwner) {
            navigate(`/household/${id}/manage`)
        }
    }

    return (
        <GradientDiv className="household-item-container">
            <div className="household-item-content">
                <div className="household-header">
                    <div className="header-title-wrapper">
                        <H4 variant="primary" className="household-name">
                            {name}
                        </H4>
                        {isOwner && <div className="owner-tag owner-tag-owner">{t('households.role.owner')}</div>}
                        {!isOwner && isMember && <div className="owner-tag owner-tag-member">{t('households.role.member')}</div>}
                    </div>
                </div>
                <Paragraph variant="secondary" size="md" className="household-description">
                    {description}
                </Paragraph>

                <div className="household-actions">
                    <Button variant="default" className="small-button" onClick={handleCheckClick}>
                        {t('households.households_list.actions.check')}
                    </Button>
                    {isOwner && (
                        <Button variant="default" className="small-button" onClick={handleManageClick}>
                           {t('households.households_list.actions.manage')}
                        </Button>
                    )}
                </div>
            </div>
        </GradientDiv>
    )
}

export default HouseHoldItem
