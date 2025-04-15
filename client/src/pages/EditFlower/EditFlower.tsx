import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import { H2, H4 } from '../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../i18n'
import { fetchEmptySmartPotsByHousehold, fetchScheduleByFlower, updateSchedule } from '../../redux/services/flowersApi'
import { loadFlowerProfiles } from '../../redux/slices/flowerProfilesSlice'
import { detachFlowerFromPot, updateFlowerData, updateFlowerSmartPot } from '../../redux/slices/flowersSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import { Flower, FlowerProfile, SmartPot } from '../../types/flowerTypes'
import './EditFlower.sass'

const avatars = [
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308837/flowerpots_avatars/librk2eqiamvp7cuzjxa.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308835/flowerpots_avatars/qohoubp5tjmajz4li5iu.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308832/flowerpots_avatars/iipwugfwpqxpahjxjalo.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308831/flowerpots_avatars/bfsivvzsqjzwig8uqzua.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308830/flowerpots_avatars/xwi1ujvpmm2d1magwid8.png',
    'https://res.cloudinary.com/dse3l4lly/image/upload/v1742308825/flowerpots_avatars/emgeoupoglpwkuknuvsi.png',
]

const dayTranslations: Record<string, string> = {
    monday: 'Pondelok',
    tuesday: 'Utorok',
    wednesday: 'Streda',
    thursday: 'Štvrtok',
    friday: 'Piatok',
    saturday: 'Sobota',
    sunday: 'Nedeľa',
}

interface Schedule {
    monday: { from: string | null; to: string | null }
    tuesday: { from: string | null; to: string | null }
    wednesday: { from: string | null; to: string | null }
    thursday: { from: string | null; to: string | null }
    friday: { from: string | null; to: string | null }
    saturday: { from: string | null; to: string | null }
    sunday: { from: string | null; to: string | null }
}

const EditFlower: React.FC = () => {
    const { t } = useTranslation() as { t: TranslationFunction }
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { flowerId } = useParams<{ flowerId: string }>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedAvatar, setSelectedAvatar] = useState(avatars[0])
    const [name, setName] = useState('')
    const [profileType, setProfileType] = useState<'global' | 'custom'>('global')
    const [customProfile, setCustomProfile] = useState<Partial<FlowerProfile>>({
        temperature: { min: 18, max: 25 },
        humidity: { min: 40, max: 60 },
        light: { min: 30, max: 70 },
    })
    const [schedule, setSchedule] = useState<Schedule>({
        monday: { from: '', to: '' },
        tuesday: { from: '', to: '' },
        wednesday: { from: '', to: '' },
        thursday: { from: '', to: '' },
        friday: { from: '', to: '' },
        saturday: { from: '', to: '' },
        sunday: { from: '', to: '' },
    })
    const [availableSmartPots, setAvailableSmartPots] = useState<SmartPot[]>([])
    const [selectedSmartPotId, setSelectedSmartPotId] = useState<string>('')

    const flower = useSelector((state: RootState) => state.flowers.flowers.find(f => f.id === flowerId))
    const { profiles } = useSelector((state: RootState) => state.flowerProfiles)
    const [selectedProfileId, setSelectedProfileId] = useState<string>('')

    const householdProfiles = profiles

    useEffect(() => {
        if (flower?.household_id) {
            dispatch(loadFlowerProfiles())
            fetchEmptySmartPotsByHousehold(flower.household_id)
                .then(response => setAvailableSmartPots(response))
                .catch(error => console.error('Error loading smart pots:', error))
        }
    }, [dispatch, flower?.household_id])

    useEffect(() => {
        if (flower) {
            setName(flower.name)
            setSelectedAvatar(flower.avatar || avatars[0])

            if (flower.profile_id && flower.profile_id.length > 0) {
                setProfileType('global')
                setSelectedProfileId(flower.profile_id)
            } else if (flower.humidity || flower.temperature || flower.light) {
                setProfileType('custom')
                setSelectedProfileId('')
                setCustomProfile({
                    temperature: flower.temperature || { min: 18, max: 25 },
                    humidity: flower.humidity || { min: 40, max: 60 },
                    light: flower.light || { min: 30, max: 70 },
                })
            } else {
                setProfileType('custom')
                setSelectedProfileId('')
                setCustomProfile({
                    temperature: { min: 18, max: 25 },
                    humidity: { min: 40, max: 60 },
                    light: { min: 30, max: 70 },
                })
            }
        }
    }, [flower])

    useEffect(() => {
        if (flowerId) {
            fetchScheduleByFlower(flowerId)
                .then(response => {
                    if (response && Object.keys(response).length > 0) {
                        setSchedule(response)
                    } else {
                        setSchedule({
                            monday: { from: '', to: '' },
                            tuesday: { from: '', to: '' },
                            wednesday: { from: '', to: '' },
                            thursday: { from: '', to: '' },
                            friday: { from: '', to: '' },
                            saturday: { from: '', to: '' },
                            sunday: { from: '', to: '' },
                        })
                    }
                })
                .catch(error => {
                    console.error('Error loading schedule:', error)
                    setSchedule({
                        monday: { from: '', to: '' },
                        tuesday: { from: '', to: '' },
                        wednesday: { from: '', to: '' },
                        thursday: { from: '', to: '' },
                        friday: { from: '', to: '' },
                        saturday: { from: '', to: '' },
                        sunday: { from: '', to: '' },
                    })
                })
        }
    }, [flowerId])

    const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const profileId = e.target.value
        setSelectedProfileId(profileId)
    }

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

    const handleScheduleChange = (day: keyof typeof schedule, type: 'from' | 'to', value: string) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [type]: value,
            },
        }))
    }

    const handleDetachFlower = async () => {
        if (!flowerId || !flower?.serial_number) return

        try {
            setLoading(true)
            await dispatch(detachFlowerFromPot({ flowerId, serialNumber: flower.serial_number })).unwrap()
            navigate(`/flowerpot-detail/${flowerId}`)
        } catch (err) {
            setError('Chyba pri odpájaní kvetiny. Skúste to prosím znova.')
            console.error('Error detaching flower:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (flowerId) {
                const flowerData: Partial<Flower> = {
                    name,
                    avatar: selectedAvatar,
                }

                if (profileType === 'global') {
                    flowerData.profile_id = selectedProfileId
                    flowerData.temperature = undefined
                    flowerData.humidity = undefined
                    flowerData.light = undefined
                } else {
                    flowerData.profile_id = undefined
                    flowerData.temperature = customProfile.temperature
                    flowerData.humidity = customProfile.humidity
                    flowerData.light = customProfile.light
                }

                await dispatch(updateFlowerData({ id: flowerId, flower: flowerData })).unwrap()

                await updateSchedule(flowerId, schedule)

                if (selectedSmartPotId) {
                    await dispatch(updateFlowerSmartPot({ flowerId, smartPotId: selectedSmartPotId })).unwrap()
                }

                navigate(`/flowerpot-detail/${flowerId}`)
            }
        } catch (err) {
            setError('Chyba pri aktualizácii kvetináča. Skúste to prosím znova.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="edit-flower-container">
            <div className="step-container">
                <H2 variant="primary">Upraviť kvetinu</H2>

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>Názov kvetiny</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Názov kvetiny"
                            required
                        />
                    </div>

                    <div className="option-section">
                        <h3>Profil kvetiny</h3>
                        <div className="profile-type-selection">
                            <label>
                                <input
                                    type="radio"
                                    value="global"
                                    checked={profileType === 'global'}
                                    onChange={e => setProfileType(e.target.value as 'global' | 'custom')}
                                />
                                Použiť existujúci profil
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="custom"
                                    checked={profileType === 'custom'}
                                    onChange={e => setProfileType(e.target.value as 'global' | 'custom')}
                                />
                                Vlastné nastavenia
                            </label>
                        </div>

                        {profileType === 'global' ? (
                            <div className="form-group">
                                <label>Vyberte existujúci profil</label>
                                <select
                                    className="profile-select"
                                    value={selectedProfileId}
                                    onChange={handleProfileChange}>
                                    <option value="">Vyberte existujúci profil</option>
                                    {householdProfiles.map(profile => (
                                        <option key={profile.id} value={profile.id}>
                                            {profile.name || `Profil ${profile.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="profile-settings">
                                <H4 variant="secondary">Vlastné nastavenia</H4>
                                <div className="form-group">
                                    <label>Teplota (°C)</label>
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
                                    <label>Vlhkosť (%)</label>
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
                                    <label>Svetelnosť (%)</label>
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

                    <div className="schedule-section">
                        <h3>Harmonogram zalievania</h3>
                        <div className="schedule-days">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                <div key={day} className="schedule-day">
                                    <span>{dayTranslations[day]}</span>
                                    <div className="time-inputs">
                                        <label>Od</label>
                                        <input
                                            type="time"
                                            value={schedule[day as keyof typeof schedule]?.from || ''}
                                            onChange={e =>
                                                handleScheduleChange(
                                                    day as keyof typeof schedule,
                                                    'from',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <span>Do</span>
                                        <input
                                            type="time"
                                            value={schedule[day as keyof typeof schedule]?.to || ''}
                                            onChange={e =>
                                                handleScheduleChange(day as keyof typeof schedule, 'to', e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {availableSmartPots.length > 0 && (
                        <div className="smart-pot-section">
                            <h3>Dostupné kvetináče</h3>
                            <select
                                className="smart-pot-select"
                                value={selectedSmartPotId}
                                onChange={e => setSelectedSmartPotId(e.target.value)}>
                                <option value="">Vyberte kvetináč</option>
                                {availableSmartPots.map(pot => (
                                    <option key={pot.id} value={pot.id}>
                                        {pot.serial_number}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="avatar-section">
                        <label>Avatar kvetináča</label>
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

                    {error && <div className="error-message">{error}</div>}

                    <div className="button-group">
                        <Button variant="default" onClick={() => navigate(`/households-list`)}>
                            Zrušiť
                        </Button>
                        {flower?.serial_number && (
                            <Button variant="warning" onClick={handleDetachFlower} disabled={loading}>
                                Odpojiť kvetinu
                            </Button>
                        )}
                        <Button variant="default" disabled={loading}>
                            {loading ? 'Ukladanie...' : 'Uložiť zmeny'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditFlower
