import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import Button from '../../../components/Button/Button'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import { createHousehold } from '../../../redux/slices/householdsSlice'
import { AppDispatch } from '../../../redux/store/store'
import './CreateHousehold.sass'
import { toast } from 'react-toastify'

interface CreateHouseholdProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

const CreateHousehold: React.FC<CreateHouseholdProps> = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const [householdName, setHouseholdName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch<AppDispatch>()

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault()
        }
        setError(null)
        setLoading(true)

        if (!householdName.trim()) {
            setError(t('create_household.error.empty_name'))
            setLoading(false)
            return
        }

        try {
            await dispatch(
                createHousehold({
                    name: householdName,
                    members: [],
                    invites: [],
                }),
            ).unwrap()
            onSuccess()
            onClose()
            toast.success('Household created successfully')
        } catch (err: any) {
            if (err.status === 401) {
                setError(t('create_household.error.unauthorized'))
            } else if (err.status === 500) {
                setError(t('create_household.error.server'))
            } else {
                setError(t('create_household.error.general'))
            }
            toast.error('Error creating household')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="create-household-container">
            <GradientDiv className="create-household-step-container">
                <H5 variant="primary">{t('create_household.title')}</H5>
                <button className="create-household-close-button" onClick={onClose}>
                    ×
                </button>

                <form onSubmit={handleSubmit} className="create-household-form">
                    <div className="create-household-form-group">
                        <input
                            type="text"
                            className="create-household-input"
                            placeholder={t('create_household.input')}
                            value={householdName}
                            onChange={e => setHouseholdName(e.target.value)}
                        />
                    </div>

                    {error && <div className="create-household-error-message">{error}</div>}

                    <Button variant="default" onClick={() => handleSubmit()} disabled={loading}>
                        {loading ? t('create_household.saving') : t('create_household.button')}
                    </Button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default CreateHousehold
