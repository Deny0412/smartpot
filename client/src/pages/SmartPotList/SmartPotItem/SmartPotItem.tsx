import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H4 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import './SmartPotItem.sass'
import { WarningCircle } from 'phosphor-react'
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
    const dispatch = useDispatch()

 

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
            <WarningCircle size={32} color="#f93333" />
        </GradientDiv>
    )
}

export default SmartPotItem
