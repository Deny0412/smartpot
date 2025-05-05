import { CheckCircle, PencilSimple, WarningCircle } from '@phosphor-icons/react'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../../components/Button/Button'
import Loader from '../../components/Loader/Loader'
import { H4, H5 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { selectUser } from '../../redux/selectors/authSelectors'
import {
    selectConnectedSmartPot,
    selectFlower,
    selectFlowerpotData,
    selectInactiveSmartPot,
    selectSmartPot,
} from '../../redux/selectors/flowerDetailSelectors'
import { selectFlowerProfile } from '../../redux/selectors/flowerProfilesSelectors'
import { selectHouseholdById, selectIsHouseholdOwner } from '../../redux/selectors/houseHoldSelectors'
import {
    selectMeasurementsError,
    selectMeasurementsLoading,
    selectProcessedMeasurements,
} from '../../redux/selectors/measurementSelectors'
import { selectSchedule } from '../../redux/selectors/scheduleSelectors'
import { disconnectFlower } from '../../redux/services/flowersApi'
import { loadFlowerProfiles } from '../../redux/slices/flowerProfilesSlice'
import { loadFlowerDetails, removeFlower } from '../../redux/slices/flowersSlice'
import {
    clearMeasurements,
    startWebSocketConnection,
    stopWebSocketConnection,
} from '../../redux/slices/measurementsSlice'
import { loadSchedule } from '../../redux/slices/scheduleSlice'
import { fetchInactiveSmartPots, fetchSmartPots } from '../../redux/slices/smartPotsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import { MeasurementValue, Schedule } from '../../types/flowerTypes'
import EditFlowerHousehold from './EditFlowerHousehold/EditFlowerHousehold'
import EditFlowerProfile from './EditFlowerProfile/EditFlowerProfile'
import EditFlowerSchedule from './EditFlowerSchedule/EditFlowerSchedule'
import EditNameAndAvatar from './EditNameAndAvatar/EditNameAndAvatar'
import './FlowerDetail.sass'
import FlowerpotMeasurment from './FlowerpotMeasurment/FlowerpotMeasurment'

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
    battery_measurement: Array<{
        timestamp: string
        battery: number
    }>
    water_measurement: Array<{
        timestamp: string
        water: string
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
    battery: MeasurementValue[]
    water: MeasurementValue[]
}

const FlowerDetail: React.FC = () => {
    const { t } = useTranslation()
    const { flowerId, householdId } = useParams<{ flowerId: string; householdId: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'custom'>('day')
    const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' })
    const [isScheduleEditModalOpen, setIsScheduleEditModalOpen] = useState(false)
    const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isTransplantModalOpen, setIsTransplantModalOpen] = useState(false)
    const navigate = useNavigate()

    const user = useSelector(selectUser)
    const flower = useSelector(selectFlower)
    const flowerProfileData = useSelector((state: RootState) => selectFlowerProfile(state, flowerId || ''))
    const measurements = useSelector((state: RootState) => selectProcessedMeasurements(state, flowerId || ''))
    const loading = useSelector(selectMeasurementsLoading)
    const error = useSelector(selectMeasurementsError)
    const schedule = useSelector(selectSchedule)
    const smartPot = useSelector((state: RootState) =>
        flower?.serial_number ? selectSmartPot(state, flower.serial_number) : null,
    )
    const connectedSmartPot = useSelector((state: RootState) => selectConnectedSmartPot(state, flowerId || ''))
    const inactiveSmartPot = useSelector((state: RootState) => selectInactiveSmartPot(state, flowerId || ''))
    const currentHousehold = useSelector((state: RootState) => selectHouseholdById(state, householdId || ''))
    const isOwner = useSelector((state: RootState) => selectIsHouseholdOwner(state, householdId || ''))
    const flowerpotData = useSelector((state: RootState) => selectFlowerpotData(state, flowerId || ''))

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
    }

    // Pridáme kontrolu stavu batérie
    const batteryStatus = useMemo(() => {
        if (!measurements?.battery || measurements.battery.length === 0) return null
        const lastBatteryValue = measurements.battery[0].battery
        return {
            value: lastBatteryValue,
            hasWarning: lastBatteryValue < 30 || lastBatteryValue > 100,
        }
    }, [measurements])

    const handleDisconnectFlower = async () => {
        if (!flowerId || !householdId) return

        try {
            const response = await disconnectFlower(flowerId)
            if (response.success) {
                toast.success('Kvetina bola úspešne odpojená od smartpotu')

                // Aktualizácia dát - zachováme profil
                const currentFlower = await dispatch(loadFlowerDetails(flowerId)).unwrap()
                if (currentFlower) {
                    await Promise.all([
                        dispatch(fetchSmartPots(householdId)).unwrap(),
                        dispatch(fetchInactiveSmartPots(householdId)).unwrap(),
                        dispatch(loadFlowerProfiles()).unwrap(),
                    ])
                }
            } else {
                toast.error(response.message || 'Nepodarilo sa odpojiť kvetinu od smartpotu')
            }
        } catch (error) {
            console.error('Chyba pri odpojení kvetiny:', error)
            toast.error('Nepodarilo sa odpojiť kvetinu od smartpotu')
        }
    }

    const handleDeleteFlower = async () => {
        if (!flowerId) return
        try {
            await dispatch(removeFlower(flowerId)).unwrap()
            toast.success('Kvetina bola úspešne vymazaná')
            navigate(`/households/${householdId}/flowers`)
        } catch (error) {
            toast.error('Nepodarilo sa vymazať kvetinu')
        }
    }

    useEffect(() => {
        if (!flowerId) return
        console.log('Načítavam rozvrh pre kvetinu:', flowerId)
        dispatch(loadSchedule(flowerId))
            .unwrap()
            .then(response => {
                console.log('Rozvrh načítaný:', response)
            })
            .catch(error => {
                console.error('Chyba pri načítaní rozvrhu:', error)
            })
    }, [dispatch, flowerId])

    useEffect(() => {
        if (!flowerId || !householdId) {
            return
        }
        const loadData = async () => {
            try {
                setIsLoading(true)
                await Promise.all([
                    dispatch(loadFlowerDetails(flowerId)).unwrap(),
                    dispatch(loadFlowerProfiles()).unwrap(),
                    dispatch(fetchSmartPots(householdId)).unwrap(),
                    dispatch(fetchInactiveSmartPots(householdId)).unwrap(),
                ])

                setIsInitialLoad(false)
                setIsLoading(false)
            } catch (error) {
                console.error('Chyba pri načítaní dát:', error)
                setIsLoading(false)
            }
        }

        loadData()

        // Cleanup funkcia
        return () => {
            dispatch(clearMeasurements())
        }
    }, [dispatch, flowerId, householdId])

    // Pridaný nový useEffect pre WebSocket pripojenie
    useEffect(() => {
        if (flowerId) {
            // Spustíme WebSocket pripojenie pre túto kvetinu
            dispatch(startWebSocketConnection(flowerId))

            // Cleanup funkcia - zatvoríme WebSocket pripojenie keď komponent unmount
            return () => {
                dispatch(stopWebSocketConnection())
            }
        }
    }, [dispatch, flowerId])

    const handleTimeRangeChange = (range: 'day' | 'week' | 'month' | 'custom') => {
        setTimeRange(range)
        if (range !== 'custom') {
            setCustomDateRange({ from: '', to: '' })
        }
    }

    const handleCustomDateRangeChange = (range: { from: string; to: string }) => {
        setCustomDateRange(range)
    }

    if (isLoading) {
        return <Loader />
    }

    if (!flowerId || !householdId) {
        return <div>{t('flower_detail.missing_params')}</div>
    }

    if (error) {
        return <div>{t('flower_detail.error_loading', { error })}</div>
    }

    if (!flower) {
        return <div>{t('flower_detail.flower_not_found')}</div>
    }

    if (!flowerpotData) {
        return <Loader />
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
                <div className="smartpot-container-warning">
                    {connectedSmartPot ? (
                        <>
                            <Paragraph>
                                {t('flower_detail.signed_into', { serialNumber: flower?.serial_number })}
                            </Paragraph>
                            {measurements?.humidity && measurements.humidity.length > 0 && (
                                <Paragraph>
                                    {t('flower_detail.water_level')}: {measurements.humidity[0].humidity}%
                                </Paragraph>
                            )}
                            {batteryStatus?.hasWarning ? (
                                <WarningCircle size={32} color="#f93333" />
                            ) : (
                                <CheckCircle size={32} color="#4CAF50" />
                            )}
                        </>
                    ) : (
                        <Paragraph>No smartpot assigned</Paragraph>
                    )}
                </div>

                {connectedSmartPot && (
                    <Button
                        onClick={() => {
                            navigate(`/households/${householdId}/smartPots/${connectedSmartPot._id}`)
                        }}>
                        {t('flower_detail.view_smartpot')}
                    </Button>
                )}
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

            {schedule && (
                <div className="schedule-container">
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
                        {Object.entries(schedule).map(([day, times]) => {
                            if (['_id', 'flower_id', 'active', 'createdAt', 'updatedAt'].includes(day)) {
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
                </div>
            )}

            <EditFlowerSchedule
                isOpen={isScheduleEditModalOpen}
                onClose={() => setIsScheduleEditModalOpen(false)}
                flowerId={flowerId || ''}
                currentSchedule={
                    schedule || {
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
                    {t('flower_detail.auto_watering_settings')}
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
                            {t('flower_detail.assigned_profile')} <strong>{flowerProfileData.name}</strong>
                        </div>
                        <div className="profile-settings">
                            <div className="setting-group">
                                <div className="setting-title">{t('flower_detail.temperature')}</div>
                                <div className="setting-item">
                                    <span>{t('flower_detail.min')}</span>
                                    <span>{flowerProfileData.temperature.min}°C</span>
                                </div>
                                <div className="setting-item">
                                    <span>{t('flower_detail.max')}</span>
                                    <span>{flowerProfileData.temperature.max}°C</span>
                                </div>
                            </div>
                            <div className="setting-group">
                                <div className="setting-title">{t('flower_detail.humidity')}</div>
                                <div className="setting-item">
                                    <span>{t('flower_detail.min')}</span>
                                    <span>{flowerProfileData.humidity.min}%</span>
                                </div>
                                <div className="setting-item">
                                    <span>{t('flower_detail.max')}</span>
                                    <span>{flowerProfileData.humidity.max}%</span>
                                </div>
                            </div>
                            <div className="setting-group">
                                <div className="setting-title">{t('flower_detail.light')}</div>
                                <div className="setting-item">
                                    <span>{t('flower_detail.min_light')}</span>
                                    <span>{flowerProfileData.light.min} </span>
                                </div>
                                <div className="setting-item">
                                    <span>{t('flower_detail.max_light')}</span>
                                    <span>{flowerProfileData.light.max}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="no-profile">
                        <div className="profile-text">{t('flower_detail.custom_settings')}</div>
                        {flower?.profile && (
                            <div className="profile-settings">
                                <div className="setting-group">
                                    <div className="setting-title">{t('flower_detail.temperature')}</div>
                                    <div className="setting-item">
                                        <span>{t('flower_detail.min')}</span>
                                        <span>{flower.profile.temperature.min}°C</span>
                                    </div>
                                    <div className="setting-item">
                                        <span>{t('flower_detail.max')}</span>
                                        <span>{flower.profile.temperature.max}°C</span>
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <div className="setting-title">{t('flower_detail.humidity')}</div>
                                    <div className="setting-item">
                                        <span>{t('flower_detail.min')}</span>
                                        <span>{flower.profile.humidity.min}%</span>
                                    </div>
                                    <div className="setting-item">
                                        <span>{t('flower_detail.max')}</span>
                                        <span>{flower.profile.humidity.max}%</span>
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <div className="setting-title">{t('flower_detail.light')}</div>
                                    <div className="setting-item">
                                        <span>{t('flower_detail.min_light')}</span>
                                        <span>{flower.profile.light.min} </span>
                                    </div>
                                    <div className="setting-item">
                                        <span>{t('flower_detail.max_light')}</span>
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
                    <H4>{t('flower_detail.transplant')}</H4>
                    <div className="flower-detail-transplant-info">
                        {t('flower_detail.current_household')}: {currentHousehold?.name}
                    </div>
                    <PencilSimple
                        size={20}
                        color="#bfbfbf"
                        className="pencil-icon"
                        onClick={() => setIsTransplantModalOpen(true)}
                    />
                </div>
            </div>

            <div className="flower-detail-buttons-container">
                <Button onClick={() => navigate(`/households/${householdId}/flowers`)}>
                    {t('flower_detail.back_to_list')}
                </Button>
                <Button variant="warning" onClick={handleDisconnectFlower} disabled={!connectedSmartPot}>
                    {t('flower_detail.disconnect_flower')}
                </Button>

                {isOwner && (
                    <Button variant="warning" onClick={handleDeleteFlower}>
                        Delete Flower
                    </Button>
                )}
            </div>

            <EditFlowerHousehold
                isOpen={isTransplantModalOpen}
                onClose={() => setIsTransplantModalOpen(false)}
                flowerId={flowerId || ''}
                currentHouseholdId={householdId || ''}
                hasSmartPot={!!connectedSmartPot}
                smartPotId={connectedSmartPot?._id}
            />
        </>
    )
}

export default FlowerDetail
