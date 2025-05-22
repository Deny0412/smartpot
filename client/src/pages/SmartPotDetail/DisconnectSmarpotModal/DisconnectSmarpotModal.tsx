import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { H5 } from '../../../components/Text/Heading/Heading'
import { selectSmartPots } from '../../../redux/selectors/smartPotSelectors'
import { disconnectSmartPot } from '../../../redux/slices/smartPotsSlice'
import { AppDispatch } from '../../../redux/store/store'
import './DisconnectSmarpotModal.sass'

interface DisconnectSmarpotModalProps {
    onClose: () => void
    smartPotId: string
    householdId: string
    serialNumber: string
}

const DisconnectSmarpotModal: React.FC<DisconnectSmarpotModalProps> = ({
    onClose,
    smartPotId,
    householdId,
    serialNumber,
}) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const [isLoading, setIsLoading] = useState(false)
    const smartPots = useSelector(selectSmartPots)
    const smartPot = smartPots.find(pot => pot._id === smartPotId)

    const handleDisconnect = async () => {
        if (!smartPot) {
            console.error('Smart pot not found')
            toast.error(t('smart_pot_detail.disconnect_error'))
            return
        }

        try {
            setIsLoading(true)
            console.log('Disconnecting smart pot with data:', {
                serialNumber,
                smartPotId,
                householdId,
                activeFlowerId: smartPot.active_flower_id,
            })
            await dispatch(disconnectSmartPot({ serialNumber, householdId, activeFlowerId: smartPot.active_flower_id }))
            toast.success('Smart pot bol úspešne odpojený')
            onClose()
        } catch (error) {
            console.error('Error disconnecting smart pot:', error)
            toast.error('Nepodarilo sa odpojiť smart pot')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="disconnect-smartpot-container">
            <div className="disconnect-smartpot-step-container">
                <button className="disconnect-smartpot-close-button" onClick={onClose}>
                    ×
                </button>
                <H5 variant="primary">{t('smart_pot_detail.disconnect_title')}</H5>

                <div className="disconnect-smartpot-content">
                    <p className="disconnect-smartpot-message">{t('smart_pot_detail.disconnect_message')}</p>

                    <div className="disconnect-smartpot-buttons">
                        <button
                            className="disconnect-smartpot-button disconnect-smartpot-button--cancel"
                            onClick={onClose}
                            disabled={isLoading}>
                            {t('smart_pot_detail.cancel')}
                        </button>
                        <button
                            className="disconnect-smartpot-button disconnect-smartpot-button--confirm"
                            onClick={handleDisconnect}
                            disabled={isLoading}>
                            {isLoading ? t('smart_pot_detail.disconnecting') : t('smart_pot_detail.confirm_disconnect')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DisconnectSmarpotModal
