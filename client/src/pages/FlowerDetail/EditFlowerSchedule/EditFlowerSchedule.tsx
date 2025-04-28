import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import Button from '../../../components/Button/Button'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../components/Text/Heading/Heading'
import { updateSchedule } from '../../../redux/slices/scheduleSlice'
import { AppDispatch } from '../../../redux/store/store'
import { Schedule } from '../../../types/flowerTypes'
import './EditFlowerSchedule.sass'

interface ScheduleDay {
    from: string | null
    to: string | null
}

interface ScheduleData {
    monday: ScheduleDay
    tuesday: ScheduleDay
    wednesday: ScheduleDay
    thursday: ScheduleDay
    friday: ScheduleDay
    saturday: ScheduleDay
    sunday: ScheduleDay
    active: boolean
}

interface EditFlowerScheduleProps {
    isOpen: boolean
    onClose: () => void
    flowerId: string
    currentSchedule: ScheduleData
}

const EditFlowerSchedule: React.FC<EditFlowerScheduleProps> = ({ isOpen, onClose, flowerId, currentSchedule }) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const [scheduleData, setScheduleData] = useState<ScheduleData>(currentSchedule)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const dayTranslations: Record<string, string> = {
        monday: t('flower_detail.days.monday'),
        tuesday: t('flower_detail.days.tuesday'),
        wednesday: t('flower_detail.days.wednesday'),
        thursday: t('flower_detail.days.thursday'),
        friday: t('flower_detail.days.friday'),
        saturday: t('flower_detail.days.saturday'),
        sunday: t('flower_detail.days.sunday'),
    }

    const handleTimeChange = (day: keyof ScheduleData, type: 'from' | 'to', value: string) => {
        const dayData = scheduleData[day] as ScheduleDay
        setScheduleData(prev => ({
            ...prev,
            [day]: {
                ...dayData,
                [type]: value,
            },
        }))
    }

    const handleClearDay = (day: keyof ScheduleData) => {
        setScheduleData(prev => ({
            ...prev,
            [day]: {
                from: null,
                to: null,
            },
        }))
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault()
        }
        setLoading(true)
        setError(null)

        try {
            const scheduleToUpdate: Schedule = {
                ...scheduleData,
                flower_id: flowerId,
            }
            await dispatch(
                updateSchedule({
                    flowerId,
                    schedule: scheduleToUpdate,
                }),
            ).unwrap()
            onClose()
            toast.success('Schedule updated successfully')
        } catch (err) {
            setError('Chyba pri aktualizácii rozvrhu. Skúste to prosím znova.')

            toast.error('Error updating schedule')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'auto'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="edit-flower-schedule-container">
            <GradientDiv className="edit-flower-schedule-step-container">
                <H5 variant="primary">{t('flower_detail.edit_schedule')}</H5>
                <button className="edit-flower-schedule-close-button" onClick={onClose}>
                    ×
                </button>

                <form onSubmit={handleSubmit} className="edit-flower-schedule-form">
                    <div className="edit-flower-schedule-schedule-section">
                        <div className="edit-flower-schedule-schedule-days">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                                const dayTimes = scheduleData[day as keyof Omit<ScheduleData, 'active'>] as ScheduleDay
                                return (
                                    <div key={day} className="edit-flower-schedule-schedule-day">
                                        <div className="edit-flower-schedule-day-header">
                                            <span className="edit-flower-schedule-day-label">
                                                {dayTranslations[day]}
                                            </span>
                                            <button
                                                type="button"
                                                className="edit-flower-schedule-clear-button"
                                                onClick={() => handleClearDay(day as keyof ScheduleData)}>
                                                ×
                                            </button>
                                        </div>
                                        <div className="edit-flower-schedule-time-inputs">
                                            <div className="edit-flower-schedule-time-input-group">
                                                <input
                                                    type="time"
                                                    className="edit-flower-schedule-time-input"
                                                    value={dayTimes.from || ''}
                                                    onChange={e =>
                                                        handleTimeChange(
                                                            day as keyof ScheduleData,
                                                            'from',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            -
                                            <div className="edit-flower-schedule-time-input-group">
                                                <input
                                                    type="time"
                                                    className="edit-flower-schedule-time-input"
                                                    value={dayTimes.to || ''}
                                                    onChange={e =>
                                                        handleTimeChange(
                                                            day as keyof ScheduleData,
                                                            'to',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {error && <div className="edit-flower-schedule-error-message">{error}</div>}

                    <Button variant="default" onClick={handleSubmit} disabled={loading}>
                        {loading ? t('flower_detail.saving') : t('flower_detail.save')}
                    </Button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default EditFlowerSchedule
