import { CheckCircle, PencilSimple, Power, WarningCircle } from '@phosphor-icons/react'
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
    selectSmartPot,
} from '../../redux/selectors/flowerDetailSelectors'
import { selectFlowerProfile, selectProfilesLoading } from '../../redux/selectors/flowerProfilesSelectors'
import { selectHouseholdById, selectIsHouseholdOwner } from '../../redux/selectors/houseHoldSelectors'
import {
    selectActiveWebSocketFlowerId,
    selectMeasurementsError,
    selectMeasurementsLoading,
    selectProcessedMeasurements,
    selectWebSocketStatus,
} from '../../redux/selectors/measurementSelectors'
import { selectSchedule, selectScheduleLoading } from '../../redux/selectors/scheduleSelectors'
import { selectInactiveSmartPots } from '../../redux/selectors/smartPotSelectors'
import { disconnectFlower } from '../../redux/services/flowersApi'
import { loadFlowerProfiles } from '../../redux/slices/flowerProfilesSlice'
import { loadFlowerDetails, removeFlower, updateFlowerData } from '../../redux/slices/flowersSlice'
import { clearMeasurements, fetchMeasurementsForFlower } from '../../redux/slices/measurementsSlice'
import { loadSchedule, updateSchedule } from '../../redux/slices/scheduleSlice'
import { fetchInactiveSmartPots, fetchSmartPots, updateSmartPotThunk } from '../../redux/slices/smartPotsSlice'
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
    const [cachedData, setCachedData] = useState<Record<string, any>>({})
    const [retryCount, setRetryCount] = useState(0)
    const MAX_RETRIES = 3

    const user = useSelector(selectUser)
    const flower = useSelector(selectFlower)
    const flowerProfileData = useSelector((state: RootState) => selectFlowerProfile(state, flowerId || ''))
    const profilesLoading = useSelector(selectProfilesLoading)
    const allMeasurementsForFlower = useSelector((state: RootState) => state.measurements.measurements[flowerId || ''])
    const processedMeasurements = useSelector((state: RootState) => selectProcessedMeasurements(state, flowerId || ''))
    const loading = useSelector(selectMeasurementsLoading)
    const error = useSelector(selectMeasurementsError)
    const schedule = useSelector(selectSchedule)
    const scheduleLoading = useSelector(selectScheduleLoading)
    const smartPot = useSelector((state: RootState) =>
        flower?.serial_number ? selectSmartPot(state, flower.serial_number) : null,
    )
    const connectedSmartPot = useSelector((state: RootState) => selectConnectedSmartPot(state, flowerId || ''))
    const inactiveSmartPots = useSelector(selectInactiveSmartPots)
    const currentHousehold = useSelector((state: RootState) => selectHouseholdById(state, householdId || ''))
    const isOwner = useSelector((state: RootState) => selectIsHouseholdOwner(state, householdId || ''))
    const flowerpotData = useSelector((state: RootState) => selectFlowerpotData(state, flowerId || ''))

    // Stavy pre WebSocket
    const webSocketStatus = useSelector(selectWebSocketStatus)
    const activeWSFlowerId = useSelector(selectActiveWebSocketFlowerId)

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

    const batteryStatus = useMemo(() => {
        if (!processedMeasurements?.battery || processedMeasurements.battery.length === 0) return null
        const lastBatteryValue = Number(processedMeasurements.battery[0].value)
        return {
            value: lastBatteryValue,
            hasWarning: lastBatteryValue < 30 || lastBatteryValue > 100,
        }
    }, [processedMeasurements])

    const handleDisconnectFlower = async () => {
        if (!flowerId || !householdId) return

        try {
            const response = await disconnectFlower(flowerId)
            if (response.success) {
                toast.success(t('flower_detail.disconnect_success_toast'))

                const currentFlower = await dispatch(loadFlowerDetails(flowerId)).unwrap()
                if (currentFlower) {
                    await Promise.all([
                        dispatch(fetchSmartPots(householdId)).unwrap(),
                        dispatch(fetchInactiveSmartPots(householdId)).unwrap(),
                        dispatch(loadFlowerProfiles()).unwrap(),
                    ])
                }
            } else {
                toast.error(response.message || t('flower_detail.disconnect_error_fallback_toast'))
            }
        } catch (error) {
            toast.error(t('flower_detail.disconnect_error_fallback_toast'))
        }
    }

    const handleDeleteFlower = async () => {
        if (!flowerId) return
        try {
            if (connectedSmartPot && flower?.serial_number) {
                await dispatch(
                    updateSmartPotThunk({
                        serialNumber: connectedSmartPot.serial_number,
                        activeFlowerId: null,
                        householdId: connectedSmartPot.household_id,
                    }),
                ).unwrap()
                await dispatch(
                    updateFlowerData({
                        id: flowerId,
                        flower: { serial_number: '' },
                    }),
                ).unwrap()
            }
            await dispatch(removeFlower(flowerId)).unwrap()
            toast.success(t('flower_detail.delete_success_toast'))
            navigate(`/households/${householdId}/flowers`)
        } catch (error) {
            toast.error(t('flower_detail.delete_error_toast'))
        }
    }

    useEffect(() => {
        if (flowerId && householdId) {
            const loadInitialOrMissingData = async () => {
                try {
                    setIsLoading(true)

                    await dispatch(loadFlowerProfiles()).unwrap()

                    const flowerDetails = await dispatch(loadFlowerDetails(flowerId)).unwrap()
                    if (!flowerDetails) {
                        throw new Error('Failed to load flower details')
                    }

                    const metadataPromises: Promise<any>[] = [
                        dispatch(fetchSmartPots(householdId)),
                        dispatch(fetchInactiveSmartPots(householdId)),
                        dispatch(loadSchedule(flowerId)),
                    ]

                    await Promise.all(metadataPromises)
                } catch (error) {
                    toast.error(t('flower_detail.error_loading_data'))
                } finally {
                    setIsLoading(false)
                    setIsInitialLoad(false)
                }
            }

            loadInitialOrMissingData()

            return () => {
                console.log(t('flower_detail.console.websocket_cleanup_info'))
                dispatch(clearMeasurements())
            }
        }
    }, [dispatch, flowerId, householdId])

    useEffect(() => {
        if (flowerId && !schedule && !scheduleLoading && retryCount < MAX_RETRIES) {
            dispatch(loadSchedule(flowerId))
                .unwrap()
                .catch(() => {
                    setRetryCount(prev => prev + 1)
                })
        }
    }, [dispatch, flowerId, schedule, scheduleLoading, retryCount])

    useEffect(() => {
        if (flowerId && householdId) {
            const now = new Date()
            const startDate = new Date(now)
            startDate.setMonth(now.getMonth() - 1) // Načítame dáta za posledný mesiac
            const dateFrom = startDate.toISOString().split('T')[0]
            const dateTo = now.toISOString().split('T')[0]

            if (cachedData['initial']) {
                console.log('Using cached data')
                return
            }

            dispatch(fetchMeasurementsForFlower({ flowerId, householdId, dateFrom, dateTo }))
                .unwrap()
                .then(data => {
                    setCachedData(prev => ({
                        ...prev,
                        initial: data,
                    }))
                })
                .catch(error => {
                    console.error('Error fetching measurements:', error)
                })
        }
    }, [dispatch, flowerId, householdId])

    // Clear cache when changing flowers
    useEffect(() => {
        setCachedData({})
    }, [flowerId])

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
        navigate(`/households/${householdId}/flowers`)
        toast.error(t('flower_detail.missing_params'))
    }

    if (error) {
        navigate(`/households/${householdId}/flowers`)
        toast.error(t('flower_detail.error_loading'))
    }

    if (!flower) {
        navigate(`/households/${householdId}/flowers`)
        toast.error(t('flower_detail.flower_not_found'))
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
                <img
                    src={flowerpotData.flower_avatar}
                    alt={t('flower_detail.avatar_alt')}
                    className="flowerpot-avatar"
                />
            </div>
            <div className="smartpot-container">
                <div className="smartpot-container-warning">
                    {connectedSmartPot && flower?.serial_number ? (
                        <>
                            <Paragraph>
                                {t('flower_detail.signed_into', { serialNumber: flower.serial_number })}
                            </Paragraph>

                            {batteryStatus?.hasWarning ? (
                                <WarningCircle size={32} color="#f93333" />
                            ) : (
                                <CheckCircle size={32} color="#4CAF50" />
                            )}
                        </>
                    ) : (
                        <Paragraph>{t('flower_detail.no_smartpot_assigned_text')}</Paragraph>
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
            {/* Indikátor stavu WebSocketu */}
            {flowerId === activeWSFlowerId &&
                webSocketStatus !== 'idle' &&
                webSocketStatus !== 'closing' && ( // Nechceme zobrazovať 'closing' ako permanentný stav
                    <div className={`websocket-status-indicator websocket-status-${webSocketStatus}`}>
                        <Paragraph variant="secondary" size="sm">
                            {t(`flower_detail.websocket_status.${webSocketStatus}`)}
                        </Paragraph>
                    </div>
                )}
            <div className="water_level_info">
                {processedMeasurements?.water && processedMeasurements.water.length > 0 && (
                    <Paragraph size="xl">
                        {t('flower_detail.water_level')}:{' '}
                        {processedMeasurements.water[0].value.toString().toUpperCase()}
                    </Paragraph>
                )}
            </div>

            <EditNameAndAvatar
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                flowerId={flowerId || ''}
                currentName={flower?.name || ''}
                currentAvatar={flower?.avatar || ''}
            />

            {flowerId && householdId && (
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
            )}

            {schedule && (
                <div className="schedule-container">
                    <div className="flower-detail-schedule-title-container">
                        <H4 className="flower-detail-schedule-title">{t('flower_detail.schedule')}</H4>
                        <div className="schedule-controls">
                            <Power
                                size={20}
                                color={schedule.active ? '#4CAF50' : '#bfbfbf'}
                                className="power-icon"
                                onClick={async () => {
                                    const updatedSchedule = {
                                        ...schedule,
                                        active: !schedule.active,
                                    }
                                    try {
                                        await dispatch(
                                            updateSchedule({
                                                schedule: {
                                                    ...updatedSchedule,
                                                    id: schedule._id,
                                                    flower_id: flowerId || '',
                                                },
                                            }),
                                        ).unwrap()

                                        // Reload schedule after update
                                        await dispatch(loadSchedule(flowerId || '')).unwrap()
                                    } catch (error) {
                                        console.error('Error updating schedule:', error)
                                        toast.error(t('flower_detail.edit_schedule.error.update_failed'))
                                    }
                                }}
                            />
                            <PencilSimple
                                size={20}
                                color="#bfbfbf"
                                className="pencil-icon"
                                onClick={() => setIsScheduleEditModalOpen(true)}
                            />
                        </div>
                    </div>
                    <div className="schedule-grid">
                        {Object.entries(schedule).map(([day, times]) => {
                            if (['_id', 'flower_id', 'active', 'createdAt', 'updatedAt'].includes(day)) {
                                return null
                            }
                            const timeSlot = times as { from: string | null; to: string | null }
                            if (!timeSlot.from && !timeSlot.to) {
                                return null
                            }
                            return (
                                <div key={day} className="schedule-day">
                                    <H5>{dayTranslations[day]}</H5>
                                    <div className="time-slots">
                                        <div className="time-slot">
                                            <span>{t('add_flower.schedule_from')}:</span>
                                            <span>
                                                {timeSlot.from || t('flower_detail.schedule_no_time_placeholder')}
                                            </span>
                                        </div>
                                        <div className="time-slot">
                                            <span>{t('add_flower.schedule_to')}:</span>
                                            <span>
                                                {timeSlot.to || t('flower_detail.schedule_no_time_placeholder')}
                                            </span>
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
                {profilesLoading ? (
                    <div className="profile-loading">
                        <Loader />
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
                                        <span>
                                            {flower.profile.temperature.min}
                                            {t('flower_detail.unit.celsius')}
                                        </span>
                                    </div>
                                    <div className="setting-item">
                                        <span>{t('flower_detail.max')}</span>
                                        <span>
                                            {flower.profile.temperature.max}
                                            {t('flower_detail.unit.celsius')}
                                        </span>
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <div className="setting-title">{t('flower_detail.humidity')}</div>
                                    <div className="setting-item">
                                        <span>{t('flower_detail.min')}</span>
                                        <span>
                                            {flower.profile.humidity.min}
                                            {t('flower_detail.unit.percent')}
                                        </span>
                                    </div>
                                    <div className="setting-item">
                                        <span>{t('flower_detail.max')}</span>
                                        <span>
                                            {flower.profile.humidity.max}
                                            {t('flower_detail.unit.percent')}
                                        </span>
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
                    <H4>{t('flower_detail.transplant')} </H4>
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
                <Button variant="warning" onClick={handleDisconnectFlower} disabled={!flower?.serial_number}>
                    {t('flower_detail.disconnect_flower')}
                </Button>

                {isOwner && (
                    <Button variant="warning" onClick={handleDeleteFlower}>
                        {t('flower_detail.delete_flower_button_text')}
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
