import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import Button from '../../../components/Button/Button'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../components/Text/Heading/Heading'
import { AppDispatch } from '../../../redux/store/store'
import './InviteMember.sass'

interface InviteMemberProps {
    isOpen: boolean
    onClose: () => void
    householdId: string
}

const InviteMember: React.FC<InviteMemberProps> = ({ isOpen, onClose, householdId }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault()
        }
        setLoading(true)
        setError(null)

        try {
            // TODO: Implement invite member functionality
            console.log('Inviting member with email:', email)
            toast.success('Pozvánka bola odoslaná!')
            onClose()
        } catch (err) {
            const errorMessage = 'Chyba pri odosielaní pozvánky. Skúste to prosím znova.'
            setError(errorMessage)
            toast.error(errorMessage)
            console.error('Error inviting member:', err)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="invite-member-container">
            <GradientDiv className="invite-member-step-container">
                <H5 variant="primary">{t('manage_household.manage_members.add_member.invite_member')}</H5>
                <button className="invite-member-close-button" onClick={onClose}>
                    ×
                </button>

                <form onSubmit={handleSubmit} className="invite-member-form">
                    <div className="invite-member-form-group">
                        <input
                            type="email"
                            className="invite-member-input"
                            placeholder={t('manage_household.manage_members.add_member.email_placeholder')}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    {error && <div className="invite-member-error-message">{error}</div>}

                    <Button variant="default" onClick={handleSubmit} disabled={loading}>
                        {loading
                            ? t('manage_household.manage_members.add_member.sending')
                            : t('manage_household.manage_members.add_member.send')}
                    </Button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default InviteMember
