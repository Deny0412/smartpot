import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { H2, H4 } from '../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../i18n'
import { createSchedule } from '../../redux/services/flowersApi'
import { loadFlowerProfiles } from '../../redux/slices/flowerProfilesSlice'
import { createFlower } from '../../redux/slices/flowersSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import { FlowerProfile } from '../../types/flowerTypes'
import './AddFlower.sass'

const avatars = [
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308837/flowerpots_avatars/librk2eqiamvp7cuzjxa.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308835/flowerpots_avatars/qohoubp5tjmajz4li5iu.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308832/flowerpots_avatars/iipwugfwpqxpahjxjalo.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308831/flowerpots_avatars/bfsivvzsqjzwig8uqzua.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308830/flowerpots_avatars/xwi1ujvpmm2d1magwid8.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308825/flowerpots_avatars/emgeoupoglpwkuknuvsi.png',
]

interface ScheduleData {
    monday: { from: string; to: string }
    tuesday: { from: string; to: string }
    wednesday: { from: string; to: string }
    thursday: { from: string; to: string }
    friday: { from: string; to: string }
    saturday: { from: string; to: string }
    sunday: { from: string; to: string }
    active: boolean
}

const AddFlower: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { householdId } = useParams<{ householdId: string }>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [profileType, setProfileType] = useState<'global' | 'custom'>('global')
    const [customProfile, setCustomProfile] = useState<Partial<FlowerProfile>>({
        temperature: { min: 18, max: 25 },
        humidity: { min: 40, max: 60 },
        light: { min: 30, max: 70 },
    })
    const [scheduleData, setScheduleData] = useState<ScheduleData>({
        monday: { from: '', to: '' },
        tuesday: { from: '', to: '' },
        wednesday: { from: '', to: '' },
        thursday: { from: '', to: '' },
        friday: { from: '', to: '' },
        saturday: { from: '', to: '' },
        sunday: { from: '', to: '' },
        active: false,
    })
    const { profiles } = useSelector((state: RootState) => state.flowerProfiles)
    const [selectedProfileId, setSelectedProfileId] = useState<string>('')
    const { t } = useTranslation() as { t: TranslationFunction }

    const dayTranslations: Record<string, string> = {
        monday: t('add_flower.schedule.monday'),
        tuesday: t('add_flower.schedule.tuesday'),
        wednesday: t('add_flower.schedule.wednesday'),
        thursday: t('add_flower.schedule.thursday'),
        friday: t('add_flower.schedule.friday'),
        saturday: t('add_flower.schedule.saturday'),
        sunday: t('add_flower.schedule.sunday'),
    }

    useEffect(() => {
        if (householdId) {
            dispatch(loadFlowerProfiles())
        }
    }, [dispatch, householdId])

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

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

    const handleTimeChange = (day: keyof Omit<ScheduleData, 'active'>, type: 'from' | 'to', value: string) => {
        setScheduleData(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value,
            },
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            let profileId = null

            if (profileType === 'global' && selectedProfileId) {
                profileId = selectedProfileId
            }

            const flowerResponse = await dispatch(
                createFlower({
                    name: name || 'Nový kvetináč',
                    household_id: householdId || '',
                    profile_id: profileId || '',
                    avatar: selectedAvatar || '',
                    serial_number: '',
                    humidity: profileId ? undefined : customProfile.humidity,
                    temperature: profileId ? undefined : customProfile.temperature,
                    light: profileId ? undefined : customProfile.light,
                }),
            ).unwrap()

            await createSchedule({
                flower_id: flowerResponse.id,
                ...scheduleData,
            })

            navigate(`/household/${householdId}/flowers`)
        } catch (err) {
            setError('Chyba pri vytváraní kvetináča. Skúste to prosím znova.')
            console.error('Error creating flower:', err)
        } finally {
            setLoading(false)
        }
    }

    const householdProfiles = profiles

    return (
        <div className="add-flower-container">
            <div className="step-container">
                <H2 variant="primary">{t('add_flower.title')}</H2>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>{t('add_flower.name')}</label>
                        <input
                            type="text"
                            placeholder={t('add_flower.name_placeholder')}
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="option-section">
                        <h3>{t('add_flower.profile_type')}</h3>
                        <div className="profile-type-selection">
                            <label>
                                <input
                                    type="radio"
                                    value="global"
                                    checked={profileType === 'global'}
                                    onChange={e => setProfileType(e.target.value as 'global' | 'custom')}
                                />
                                {t('add_flower.use_existing_profile')}
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="custom"
                                    checked={profileType === 'custom'}
                                    onChange={e => setProfileType(e.target.value as 'global' | 'custom')}
                                />
                                {t('add_flower.custom_settings')}
                            </label>
                        </div>

                        {profileType === 'global' ? (
                            <div className="form-group">
                                <label>{t('add_flower.select_profile')}</label>
                                <select
                                    className="profile-select"
                                    value={selectedProfileId}
                                    onChange={e => setSelectedProfileId(e.target.value)}>
                                    <option value="">{t('add_flower.select_profile_placeholder')}</option>
                                    {householdProfiles.map(profile => (
                                        <option key={profile.id} value={profile.id}>
                                            {profile.name || `Profil ${profile.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="profile-settings">
                                <H4 variant="secondary">{t('add_flower.custom_settings')}</H4>
                                <div className="form-group">
                                    <label>{t('add_flower.temperature')}</label>
                                    <div className="range-inputs">
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
                                        <span>až</span>
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

                                <div className="form-group">
                                    <label>{t('add_flower.humidity')}</label>
                                    <div className="range-inputs">
                                        <input
                                            type="number"
                                            value={customProfile.humidity?.min}
                                            onChange={e =>
                                                handleCustomProfileChange('humidity', 'min', parseInt(e.target.value))
                                            }
                                            placeholder="Min"
                                        />
                                        <span>až</span>
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

                                <div className="form-group">
                                    <label>{t('add_flower.light')}</label>
                                    <div className="range-inputs">
                                        <input
                                            type="number"
                                            value={customProfile.light?.min}
                                            onChange={e =>
                                                handleCustomProfileChange('light', 'min', parseInt(e.target.value))
                                            }
                                            placeholder="Min"
                                        />
                                        <span>až</span>
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

                    <div className="avatar-section">
                        <label>{t('add_flower.avatar')}</label>
                        <div className="avatar-grid">
                            {avatars.map((avatar, index) => (
                                <img
                                    src={avatar}
                                    alt={`Flower avatar ${index + 1}`}
                                    key={index}
                                    className={selectedAvatar === avatar ? 'selected' : ''}
                                    onClick={() => setSelectedAvatar(avatar)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="schedule-section">
                        <h3>{t('add_flower.schedule_title')}</h3>
                        <div className="schedule-days">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                <div key={day} className="schedule-day">
                                    <span>{dayTranslations[day]}</span>
                                    <div className="time-inputs">
                                        <label>{t('add_flower.schedule_from')}</label>
                                        <input
                                            type="time"
                                            value={scheduleData[day as keyof Omit<ScheduleData, 'active'>].from}
                                            onChange={e =>
                                                handleTimeChange(
                                                    day as keyof Omit<ScheduleData, 'active'>,
                                                    'from',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <label>{t('add_flower.schedule_to')}</label>
                                        <input
                                            type="time"
                                            value={scheduleData[day as keyof Omit<ScheduleData, 'active'>].to}
                                            onChange={e =>
                                                handleTimeChange(
                                                    day as keyof Omit<ScheduleData, 'active'>,
                                                    'to',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="button default" disabled={loading}>
                        {loading ? t('add_flower.saving') : t('add_flower.final_button')}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddFlower
