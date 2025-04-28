import { PencilSimple } from '@phosphor-icons/react'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import { H4, H5 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { loadFlowerProfiles } from '../../redux/slices/flowerProfilesSlice'
import { loadFlowerDetails } from '../../redux/slices/flowersSlice'
import { fetchMeasurementsForFlower } from '../../redux/slices/measurementsSlice'
import { loadSchedule } from '../../redux/slices/scheduleSlice'
import { RootState } from '../../redux/store/rootReducer'
import { AppDispatch } from '../../redux/store/store'
import { MeasurementValue, Schedule, ScheduleResponse } from '../../types/flowerTypes'
import FlowerpotMeasurment from '../FlowerpotMeasurment/FlowerpotMeasurment'
import EditFlowerProfile from './EditFlowerProfile/EditFlowerProfile'
import EditFlowerSchedule from './EditFlowerSchedule/EditFlowerSchedule'
import EditNameAndAvatar from './EditNameAndAvatar/EditNameAndAvatar'
import './FlowerDetail.sass'
interface FlowerpotData {
    name: string
    status: string
    flower_avatar: string
    humidity_measurement: Array<{
        timestamp: string
        humidity: number
    }>
    temperature_measurement: Array<{
        timestamp: string
        temperature: number
    }>
    light_measurement: Array<{
        timestamp: string
        light: number
    }>
}

interface FlowerDetailProps {
    flowerId: string
    householdId: string
}

interface Measurements {
    humidity: MeasurementValue[]
    temperature: MeasurementValue[]
    light: MeasurementValue[]
}

const selectFlower = (state: RootState) => state.flowers.selectedFlower
const selectProfiles = (state: RootState) => state.flowerProfiles.profiles
const selectMeasurements = (state: RootState, flowerId: string) => {
    const measurements = state.measurements.measurements[flowerId]
    if (!measurements) {
        return {
            humidity: [],
            temperature: [],
            light: [],
        } as Measurements
    }
    return measurements as Measurements
}
const selectLoading = (state: RootState) =>
    state.measurements.loading || state.flowers.loading || state.flowerProfiles.loading || state.schedule.loading
const selectError = (state: RootState) =>
    state.measurements.error || state.flowers.error || state.flowerProfiles.error || state.schedule.error
const selectSchedule = (state: RootState) => state.schedule.schedule as unknown as ScheduleResponse

const FlowerDetail: React.FC = () => {
    const { t } = useTranslation()
    const { flowerId, householdId } = useParams<{ flowerId: string; householdId: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'custom'>('day')
    const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' })
    const [isScheduleEditModalOpen, setIsScheduleEditModalOpen] = useState(false)
    const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const navigate = useNavigate()
    // Uloženie householdId do localStorage
    useEffect(() => {
        if (householdId) {
            localStorage.setItem('householdId', householdId)
        }
    }, [householdId])

    const dayTranslations: Record<string, string> = {
        monday: t('flower_detail.days.monday'),
        tuesday: t('flower_detail.days.tuesday'),
        wednesday: t('flower_detail.days.wednesday'),
        thursday: t('flower_detail.days.thursday'),
        friday: t('flower_detail.days.friday'),
        saturday: t('flower_detail.days.saturday'),
        sunday: t('flower_detail.days.sunday'),
    }

    const handleTimeChange = (
        day: keyof Omit<Schedule, 'id' | 'flower_id' | 'active'>,
        field: 'from' | 'to',
        value: string,
    ) => {
        if (!schedule) return
        // TODO: Implementovať aktualizáciu rozvrhu
    }

    
    const flower = useSelector(selectFlower)
    const profiles = useSelector(selectProfiles)
    const measurements = useSelector((state: RootState) => selectMeasurements(state, flowerId || ''))
    const loading = useSelector(selectLoading)
    const error = useSelector(selectError)
    const schedule = useSelector(selectSchedule)

   
    const flowerProfileData = useMemo(() => {
        if (!flower || !profiles) return undefined
        const foundProfile = profiles.find(profile => profile._id === flower.profile_id)

        return foundProfile
    }, [flower, profiles])

    

    // Memoizovaný výpočet flowerpotData
    const flowerpotData = useMemo(() => {
        if (!flower) return null
        return {
            name: flower.name,
            status: 'active',

            flower_avatar: flower.avatar,
            humidity_measurement:
                measurements?.humidity?.map((m: MeasurementValue) => ({
                    timestamp: m.createdAt,
                    humidity: Number(m.value),
                })) || [],
            temperature_measurement:
                measurements?.temperature?.map((m: MeasurementValue) => ({
                    timestamp: m.createdAt,
                    temperature: Number(m.value),
                })) || [],
            light_measurement:
                measurements?.light?.map((m: MeasurementValue) => ({
                    timestamp: m.createdAt,
                    light: Number(m.value),
                })) || [],
        }
    }, [flower, measurements])

    useEffect(() => {
        if (!flowerId) return
        dispatch(loadSchedule(flowerId))
    }, [dispatch, flowerId])


 
    useEffect(() => {
        if (!flowerId || !householdId) {
          
            return
        }

        const loadData = async () => {
            try {
                
                await dispatch(loadFlowerDetails(flowerId)).unwrap()
            

                
                await dispatch(loadFlowerProfiles()).unwrap()
                

              
                const now = new Date()
                const startDate = new Date(now)
                startDate.setFullYear(now.getFullYear() - 1) // Načítame merania za posledný rok

                await dispatch(
                    fetchMeasurementsForFlower({
                        flowerId,
                        householdId,
                        dateFrom: startDate.toISOString().split('T')[0],
                        dateTo: now.toISOString().split('T')[0],
                    }),
                ).unwrap()

                setIsInitialLoad(false)
            } catch (error) {
                console.error('Chyba pri načítaní dát:', error)
            }
        }

        loadData()
    }, [dispatch, flowerId, householdId])

    const handleTimeRangeChange = (range: 'day' | 'week' | 'month' | 'custom') => {
        setTimeRange(range)
        if (range !== 'custom') {
            setCustomDateRange({ from: '', to: '' })
        }
    }

    const handleCustomDateRangeChange = (range: { from: string; to: string }) => {
        setCustomDateRange(range)
    }

    if (!flowerId || !householdId) {
        return <div>Chýbajúce parametre</div>
    }

    if (loading && isInitialLoad) {
        return <div>Načítavam...</div>
    }

    if (error) {
        return <div>Chyba pri načítaní dát: {error}</div>
    }

    if (!flower) {
        return <div>Kvetina nebola nájdená</div>
    }

    if (!flowerpotData) {
        return <div>Načítavam dáta kvetiny...</div>
    }

    return (
        <>
            <div className="flower-header">
                <div className="flower-name-container">
                    <h1 className="flowerpot-title">
                        {flowerpotData.name}
                        <PencilSimple
                            size={32}
                            color="#bfbfbf"
                            className="pencil-icon"
                            onClick={() => setIsEditModalOpen(true)}
                        />
                    </h1>
                </div>
                <img src={flowerpotData.flower_avatar} alt="Flowerpot Avatar" className="flowerpot-avatar" />
            </div>
            <div className="smartpot-container">
                <Paragraph>Currently signed into {flower?.serial_number}</Paragraph>
                <span>Warning: Smartpot is low</span>
                {/* <Button onClick={() => navigate(`/households/${householdId}/smartPots/${flower?.serial_number}`)}>
                    Check smartpot
                </Button> */}
            </div>

            <EditNameAndAvatar
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                flowerId={flowerId || ''}
                currentName={flower?.name || ''}
                currentAvatar={flower?.avatar || ''}
            />

            <FlowerpotMeasurment
                flowerId={flowerId}
                householdId={householdId}
                flowerpotData={flowerpotData}
                flowerProfile={flowerProfileData}
                timeRange={timeRange}
                customDateRange={customDateRange}
                onTimeRangeChange={handleTimeRangeChange}
                onCustomDateRangeChange={handleCustomDateRangeChange}
            />

            <div className="schedule-container">
                {schedule?.data ? (
                    <>
                        <div className="flower-detail-schedule-title-container">
                            <H4 className="flower-detail-schedule-title">{t('flower_detail.schedule')}</H4>
                            <PencilSimple
                                size={20}
                                color="#bfbfbf"
                                className="pencil-icon"
                                onClick={() => setIsScheduleEditModalOpen(true)}
                            />
                        </div>

                        <div className="schedule-grid">
                            {Object.entries(schedule.data).map(([day, times]) => {
                                if (
                                    day === '_id' ||
                                    day === 'flower_id' ||
                                    day === 'active' ||
                                    day === 'createdAt' ||
                                    day === 'updatedAt'
                                ) {
                                    return null
                                }

                                const timeSlot = times as { from: string | null; to: string | null }
                                return (
                                    <div key={day} className="schedule-day">
                                        <H5>{dayTranslations[day]}</H5>
                                        <div className="time-slots">
                                            <div className="time-slot">
                                                <span>{t('add_flower.schedule_from')}:</span>
                                                <span>{timeSlot.from || '-'}</span>
                                            </div>
                                            <div className="time-slot">
                                                <span>{t('add_flower.schedule_to')}:</span>
                                                <span>{timeSlot.to || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <div className="no-schedule">{t('flower_detail.no_schedule')}</div>
                )}
            </div>

            <EditFlowerSchedule
                isOpen={isScheduleEditModalOpen}
                onClose={() => setIsScheduleEditModalOpen(false)}
                flowerId={flowerId || ''}
                currentSchedule={
                    schedule?.data || {
                        monday: { from: null, to: null },
                        tuesday: { from: null, to: null },
                        wednesday: { from: null, to: null },
                        thursday: { from: null, to: null },
                        friday: { from: null, to: null },
                        saturday: { from: null, to: null },
                        sunday: { from: null, to: null },
                        active: true,
                    }
                }
            />

            <EditFlowerProfile
                isOpen={isProfileEditModalOpen}
                onClose={() => setIsProfileEditModalOpen(false)}
                flowerId={flowerId || ''}
                currentProfile={flowerProfileData}
            />

            <div className="profile-container">
                <H4>
                    Nastaveni profilu automatickeho zavlazovani
                    <PencilSimple
                        size={20}
                        color="#bfbfbf"
                        className="pencil-icon"
                        onClick={() => setIsProfileEditModalOpen(true)}
                    />
                </H4>
                {flowerProfileData ? (
                    <div className="profile-info">
                        <div className="profile-text">
                            Kvetina má priradený profil: <strong>{flowerProfileData.name}</strong>
                        </div>
                        <div className="profile-settings">
                            <div className="setting-group">
                                <div className="setting-title">Teplota</div>
                                <div className="setting-item">
                                    <span>Minimálna:</span>
                                    <span>{flowerProfileData.temperature.min}°C</span>
                                </div>
                                <div className="setting-item">
                                    <span>Maximálna:</span>
                                    <span>{flowerProfileData.temperature.max}°C</span>
                                </div>
                            </div>
                            <div className="setting-group">
                                <div className="setting-title">Vlhkosť</div>
                                <div className="setting-item">
                                    <span>Minimálna:</span>
                                    <span>{flowerProfileData.humidity.min}%</span>
                                </div>
                                <div className="setting-item">
                                    <span>Maximálna:</span>
                                    <span>{flowerProfileData.humidity.max}%</span>
                                </div>
                            </div>
                            <div className="setting-group">
                                <div className="setting-title">Svietenie</div>
                                <div className="setting-item">
                                    <span>Minimálne:</span>
                                    <span>{flowerProfileData.light.min} </span>
                                </div>
                                <div className="setting-item">
                                    <span>Maximálne:</span>
                                    <span>{flowerProfileData.light.max}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="no-profile">
                        <div className="profile-text">Kvetina je na vlastných nastaveniach</div>
                        {flower?.profile && (
                            <div className="profile-settings">
                                <div className="setting-group">
                                    <div className="setting-title">Teplota</div>
                                    <div className="setting-item">
                                        <span>Minimálna:</span>
                                        <span>{flower.profile.temperature.min}°C</span>
                                    </div>
                                    <div className="setting-item">
                                        <span>Maximálna:</span>
                                        <span>{flower.profile.temperature.max}°C</span>
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <div className="setting-title">Vlhkosť</div>
                                    <div className="setting-item">
                                        <span>Minimálna:</span>
                                        <span>{flower.profile.humidity.min}%</span>
                                    </div>
                                    <div className="setting-item">
                                        <span>Maximálna:</span>
                                        <span>{flower.profile.humidity.max}%</span>
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <div className="setting-title">Svietenie</div>
                                    <div className="setting-item">
                                        <span>Minimálne:</span>
                                        <span>{flower.profile.light.min} </span>
                                    </div>
                                    <div className="setting-item">
                                        <span>Maximálne:</span>
                                        <span>{flower.profile.light.max}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="transplant-container">
                <div className="flower-detail-transplant-title-container">
                    <H4>Transplant flower</H4>

                    <PencilSimple
                        size={20}
                        color="#bfbfbf"
                        className="pencil-icon"
                        onClick={() => {
                            /* TODO: Implementovať transplant modal */
                        }}
                    />
                </div>
                <Button onClick={() => navigate(`/households/${householdId}/flowers`)}>Back to list</Button>
            </div>
        </>
    )
}

export default FlowerDetail
