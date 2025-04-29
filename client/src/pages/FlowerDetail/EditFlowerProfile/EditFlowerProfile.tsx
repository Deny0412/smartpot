import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H4, H5 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import { loadFlowerDetails, updateFlowerData } from '../../../redux/slices/flowersSlice'
import { AppDispatch, RootState } from '../../../redux/store/store'
import { FlowerProfile } from '../../../types/flowerTypes'
import './EditFlowerProfile.sass'
import { toast } from 'react-toastify'

interface EditFlowerProfileProps {
    isOpen: boolean
    onClose: () => void
    flowerId: string
    currentProfile?: FlowerProfile
}

const EditFlowerProfile: React.FC<EditFlowerProfileProps> = ({ isOpen, onClose, flowerId, currentProfile }) => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const [profileType, setProfileType] = useState<'global' | 'custom'>('global')
    const [customProfile, setCustomProfile] = useState<Partial<FlowerProfile>>({
        temperature: { min: 18, max: 25 },
        humidity: { min: 40, max: 60 },
        light: { min: 30, max: 70 },
    })
    const [selectedProfileId, setSelectedProfileId] = useState<string>('')
    const { profiles } = useSelector((state: RootState) => state.flowerProfiles)
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        if (currentProfile) {
            setProfileType('global')
            setSelectedProfileId(currentProfile._id)
        } else {
            setProfileType('custom')
        }
    }, [currentProfile])

    const handleCustomProfileChange = (
        type: 'temperature' | 'humidity' | 'light',
        field: 'min' | 'max',
        value: number,
    ) => {
        setCustomProfile(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value,
            },
        }))
    }

    const handleSubmit = async () => {
        try {
            if (profileType === 'global') {
                const selectedProfile = profiles.find(p => p._id === selectedProfileId)
                if (!selectedProfile) {
                    throw new Error('Vyberte prosím existujúci profil')
                }

              

                await dispatch(
                    updateFlowerData({
                        id: flowerId,
                        flower: {
                            profile_id: selectedProfile._id,
                            profile: undefined,
                        },
                    }),
                ).unwrap()
            } else {
                if (!customProfile.temperature || !customProfile.humidity || !customProfile.light) {
                    throw new Error('Vyplňte prosím všetky hodnoty')
                    toast.error('Vyplňte prosím všetky hodnoty')
                }

                const customProfileData = {
                    name: 'Custom Profile',
                    temperature: customProfile.temperature,
                    humidity: customProfile.humidity,
                    light: customProfile.light,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }


                await dispatch(
                    updateFlowerData({
                        id: flowerId,
                        flower: {
                            profile_id: undefined,
                            profile: customProfileData,
                        },
                    }),
                ).unwrap()
            }

            await dispatch(loadFlowerDetails(flowerId)).unwrap()
            onClose()
            toast.success('Profile updated successfully')
        } catch (err) {
       
            toast.error('Error updating profile')
            toast.error('Error updating profile')
        }
    }

    if (!isOpen) return null

    return (
        <div className="edit-flower-profile-container">
            <GradientDiv className="edit-flower-profile-step-container">
                <H5 variant="primary">{t('edit_flower_profile.title')}</H5>
                <button className="edit-flower-profile-close-button" onClick={onClose}>
                    ×
                </button>

                <form
                    className="edit-flower-profile-form"
                    onSubmit={e => {
                        e.preventDefault()
                        handleSubmit()
                    }}>
                    <div className="edit-flower-profile-option-section">
                        <h3>{t('edit_flower_profile.profile_type')}</h3>
                        <div className="edit-flower-profile-profile-type-selection">
                            <label>
                                <input
                                    type="radio"
                                    value="global"
                                    checked={profileType === 'global'}
                                    onChange={e => setProfileType(e.target.value as 'global' | 'custom')}
                                />
                                {t('edit_flower_profile.use_existing_profile')}
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="custom"
                                    checked={profileType === 'custom'}
                                    onChange={e => setProfileType(e.target.value as 'global' | 'custom')}
                                />
                                {t('edit_flower_profile.custom_settings')}
                            </label>
                        </div>

                        {profileType === 'global' ? (
                            <>
                                <div className="edit-flower-profile-form-group">
                                    <label>{t('edit_flower_profile.select_profile')}</label>
                                    <select
                                        className="edit-flower-profile-profile-select"
                                        value={selectedProfileId}
                                        onChange={e => setSelectedProfileId(e.target.value)}>
                                        <option value="">{t('edit_flower_profile.select_profile_placeholder')}</option>
                                        {profiles.map(profile => (
                                            <option key={profile._id} value={profile._id}>
                                                {profile.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedProfileId && (
                                    <div className="edit-flower-profile-profile-settings">
                                        <div className="edit-flower-profile-form-group">
                                            <label>{t('edit_flower_profile.temperature')}</label>
                                            <div className="edit-flower-profile-range-inputs">
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.temperature.min}
                                                </span>
                                                <span> - </span>
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.temperature.max}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="edit-flower-profile-form-group">
                                            <label>{t('edit_flower_profile.humidity')}</label>
                                            <div className="edit-flower-profile-range-inputs">
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.humidity.min}
                                                </span>
                                                <span> - </span>
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.humidity.max}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="edit-flower-profile-form-group">
                                            <label>{t('edit_flower_profile.light')}</label>
                                            <div className="edit-flower-profile-range-inputs">
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.light.min}
                                                </span>
                                                <span> - </span>
                                                <span className="edit-flower-profile-readonly-value">
                                                    {profiles.find(p => p._id === selectedProfileId)?.light.max}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="edit-flower-profile-profile-settings">
                                <H4 variant="secondary">{t('edit_flower_profile.custom_settings')}</H4>
                                <div className="edit-flower-profile-form-group">
                                    <label>{t('edit_flower_profile.temperature')}</label>
                                    <div className="edit-flower-profile-range-inputs">
                                        <input
                                            type="number"
                                            value={customProfile.temperature?.min}
                                            onChange={e =>
                                                handleCustomProfileChange(
                                                    'temperature',
                                                    'min',
                                                    parseInt(e.target.value),
                                                )
                                            }
                                            placeholder="Min"
                                        />
                                        <span> - </span>
                                        <input
                                            type="number"
                                            value={customProfile.temperature?.max}
                                            onChange={e =>
                                                handleCustomProfileChange(
                                                    'temperature',
                                                    'max',
                                                    parseInt(e.target.value),
                                                )
                                            }
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>

                                <div className="edit-flower-profile-form-group">
                                    <label>{t('edit_flower_profile.humidity')}</label>
                                    <div className="edit-flower-profile-range-inputs">
                                        <input
                                            type="number"
                                            value={customProfile.humidity?.min}
                                            onChange={e =>
                                                handleCustomProfileChange('humidity', 'min', parseInt(e.target.value))
                                            }
                                            placeholder="Min"
                                        />
                                        <span> - </span>
                                        <input
                                            type="number"
                                            value={customProfile.humidity?.max}
                                            onChange={e =>
                                                handleCustomProfileChange('humidity', 'max', parseInt(e.target.value))
                                            }
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>

                                <div className="edit-flower-profile-form-group">
                                    <label>{t('edit_flower_profile.light')}</label>
                                    <div className="edit-flower-profile-range-inputs">
                                        <input
                                            type="number"
                                            value={customProfile.light?.min}
                                            onChange={e =>
                                                handleCustomProfileChange('light', 'min', parseInt(e.target.value))
                                            }
                                            placeholder="Min"
                                        />
                                        <span> - </span>
                                        <input
                                            type="number"
                                            value={customProfile.light?.max}
                                            onChange={e =>
                                                handleCustomProfileChange('light', 'max', parseInt(e.target.value))
                                            }
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="edit-flower-profile-button button-default">
                        {t('edit_flower_profile.save')}
                    </button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default EditFlowerProfile
