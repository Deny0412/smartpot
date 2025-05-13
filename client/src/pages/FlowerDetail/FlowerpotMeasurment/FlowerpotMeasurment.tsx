import { BatteryChargingVertical, Drop, Sun, Thermometer } from '@phosphor-icons/react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../../../components/Button/Button'
import ChartVizual from '../../../components/ChartVizual/ChartVizual'
import { H5 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import { selectFlower } from '../../../redux/selectors/flowerDetailSelectors'
import {
    selectChartData,
    selectFilteredMeasurements,
    selectLastChange,
    selectMeasurementLimits,
    selectMeasurementsError,
    selectMeasurementsLoading,
    selectProcessedMeasurements,
} from '../../../redux/selectors/measurementSelectors'
import { AppDispatch, RootState } from '../../../redux/store/store'
import { Flower, FlowerProfile, MeasurementValue } from '../../../types/flowerTypes'
import './FlowerpotMeasurment.sass'

type TimeRange = 'day' | 'week' | 'month' | 'custom'
type FlowerpotMeasurementType = 'humidity' | 'temperature' | 'light' | 'battery'

interface FlowerpotMeasurmentProps {
    flowerId: string
    householdId: string
    flowerpotData: {
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
    }
    flowerProfile?: FlowerProfile
    timeRange: 'day' | 'week' | 'month' | 'custom'
    customDateRange: { from: string; to: string }
    onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'custom') => void
    onCustomDateRangeChange: (range: { from: string; to: string }) => void
}

interface MeasurementLimits {
    min: number
    max: number
}

interface FlowerMeasurementSettings {
    min: number
    max: number
}

interface FlowerWithSettings {
    [key: string]: FlowerMeasurementSettings | any
    humidity?: FlowerMeasurementSettings
    temperature?: FlowerMeasurementSettings
    light?: FlowerMeasurementSettings
}

interface FlowerProfileWithSettings {
    [key: string]: FlowerMeasurementSettings | any
    humidity?: FlowerMeasurementSettings
    temperature?: FlowerMeasurementSettings
    light?: FlowerMeasurementSettings
}

type MeasurementData = {
    timestamp: string
    humidity?: number
    temperature?: number
    light?: number
    battery?: number
}

const FlowerpotMeasurment: React.FC<FlowerpotMeasurmentProps> = ({
    flowerId,
    householdId,
    flowerpotData,
    flowerProfile,
    timeRange,
    customDateRange,
    onTimeRangeChange,
    onCustomDateRangeChange,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const loading = useSelector(selectMeasurementsLoading)
    const error = useSelector(selectMeasurementsError)
    const flower = useSelector(selectFlower) as Flower | null
    const { t } = useTranslation() as { t: TranslationFunction }
    const measurements = useSelector((state: RootState) => selectProcessedMeasurements(state, flowerId))
    const lastChange = useSelector(selectLastChange)

    const [measurementType, setMeasurementType] = useState<FlowerpotMeasurementType>('humidity')
    const [selectedDate, setSelectedDate] = useState<string>('')

    const filteredMeasurements = useSelector(
        (state: RootState) => selectFilteredMeasurements(state, flowerId, measurementType, selectedDate),
        (prev, next) => {
            if (!prev || !next) return false
            if (prev.length !== next.length) return false
            return prev.every((m, i) => m._id === next[i]._id)
        },
    )

    const chartData = useSelector(
        (state: RootState) => selectChartData(state, flowerId, measurementType, timeRange, customDateRange),
        (prev, next) => {
            if (!prev || !next) return false
            if (prev.length !== next.length) return false
            return prev.every((d, i) => d.timestamp === next[i].timestamp && d.value === next[i].value)
        },
    )

    const limits = useSelector(
        (state: RootState) => selectMeasurementLimits(state, flowerId, measurementType),
        (prev, next) => prev.min === next.min && prev.max === next.max,
    )

    const humidityLimits = useSelector(
        (state: RootState) => selectMeasurementLimits(state, flowerId, 'humidity'),
        (prev, next) => prev.min === next.min && prev.max === next.max,
    )

    const temperatureLimits = useSelector(
        (state: RootState) => selectMeasurementLimits(state, flowerId, 'temperature'),
        (prev, next) => prev.min === next.min && prev.max === next.max,
    )

    const lightLimits = useSelector(
        (state: RootState) => selectMeasurementLimits(state, flowerId, 'light'),
        (prev, next) => prev.min === next.min && prev.max === next.max,
    )

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const handleIrrigation = () => {
        setSelectedDate('')
    }

    const filterDataByTimeRange = (data: Array<{ timestamp: string; value: number }>) => {
        if (!data || data.length === 0) return data

        const now = new Date()
        let startDate = new Date(now)

        if (timeRange === 'custom' && customDateRange.from && customDateRange.to) {
            const fromDate = new Date(customDateRange.from)
            const toDate = new Date(customDateRange.to)
            toDate.setHours(23, 59, 59, 999)

            return data
                .filter(item => {
                    const itemDate = new Date(item.timestamp)
                    return itemDate >= fromDate && itemDate <= toDate
                })
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        }

        switch (timeRange) {
            case 'day':
                startDate.setHours(0, 0, 0, 0)
                return data
                    .filter(item => {
                        const itemDate = new Date(item.timestamp)
                        return itemDate >= startDate && itemDate <= now
                    })
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            case 'week':
                startDate.setDate(now.getDate() - 7)
                break
            case 'month':
                startDate.setMonth(now.getMonth() - 1)
                break
        }
        startDate.setHours(0, 0, 0, 0)

        return data
            .filter(item => {
                const itemDate = new Date(item.timestamp)
                return itemDate >= startDate && itemDate <= now
            })
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    }

    const getTimeRangeLabel = () => {
        switch (timeRange) {
            case 'day':
                return t('flower_measurments.filter_date_range.day')
            case 'week':
                return t('flower_measurments.filter_date_range.week')
            case 'month':
                return t('flower_measurments.filter_date_range.month')
            case 'custom':
                return t('flower_measurments.filter_date_range.custom')
            default:
                return ''
        }
    }

    const getMeasurementLabel = () => {
        switch (measurementType) {
            case 'humidity':
                return t('flower_measurments.measurments.humidity')
            case 'temperature':
                return t('flower_measurments.measurments.temperature')
            case 'light':
                return t('flower_measurments.measurments.light')
            case 'battery':
                return t('flower_measurments.measurments.battery')
            default:
                return ''
        }
    }

    const getMeasurementUnit = () => {
        switch (measurementType) {
            case 'humidity':
                return '%'
            case 'temperature':
                return '°C'
            case 'light':
                return t('flower_measurments.unit.lux')
            case 'battery':
                return '%'
            default:
                return ''
        }
    }

    const getMeasurementValue = (data: MeasurementData, type: FlowerpotMeasurementType): number => {
        switch (type) {
            case 'humidity':
                return data.humidity || 0
            case 'temperature':
                return data.temperature || 0
            case 'light':
                return data.light || 0
            case 'battery':
                return data.battery || 0
            default:
                return 0
        }
    }

    const formatDate = (timestamp: string) => {
        
        const date = new Date(timestamp)

        if (isNaN(date.getTime())) {
            console.error('Neplatný dátum:', timestamp)
            return t('flower_measurments.error.invalid_date_format')
        }

        return new Intl.DateTimeFormat('sk-SK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Europe/Bratislava',
        }).format(date)
    }

    const getChartColor = () => {
        switch (measurementType) {
            case 'humidity':
                return '#3498db'
            case 'temperature':
                return '#e74c3c'
            case 'light':
                return '#f1c40f'
            case 'battery':
                return '#2ecc71'
            default:
                return '#000'
        }
    }

    const getLastValue = (
        measurements: MeasurementValue[] | undefined,
        type: FlowerpotMeasurementType,
    ): number | null => {
        if (!measurements || measurements.length === 0) return null
        const value = measurements[0].value
        return typeof value === 'string' ? parseFloat(value) : value
    }

    const getStatusText = (type: FlowerpotMeasurementType, value: number | null) => {
        if (value === null || value === undefined)
            return { text: t('flower_measurments.status_unknown'), className: '' }

        if (type === 'battery') {
            if (value < 20) return { text: t('flower_measurments.status_low_battery'), className: 'low' }
            if (value < 50) return { text: t('flower_measurments.status_medium_battery'), className: 'medium' }
            return { text: t('flower_measurments.status_ok'), className: 'good' }
        }

        const currentLimits =
            type === 'humidity'
                ? humidityLimits
                : type === 'temperature'
                ? temperatureLimits
                : type === 'light'
                ? lightLimits
                : { min: 0, max: 100 }

        if (value < currentLimits.min) return { text: t(`flower_measurments.status_low_${type}`), className: 'low' }
        if (value > currentLimits.max) return { text: t(`flower_measurments.status_high_${type}`), className: 'high' }
        return { text: t('flower_measurments.status_ok'), className: 'good' }
    }

    if (!measurements) {
        return <div>{t('common.loading')}</div>
    }

    const lastHumidity = getLastValue(measurements.humidity, 'humidity')
    const lastTemperature = getLastValue(measurements.temperature, 'temperature')
    const lastLight = getLastValue(measurements.light, 'light')
    const lastBattery = getLastValue(measurements.battery, 'battery')

    if (loading) {
        return <div>{t('common.loading')}</div>
    }

    if (error) {
        return (
            <div>
                {t('common.error')}: {error}
            </div>
        )
    }

    if (!flowerpotData) {
        return <div>{t('flower_measurments.loading_flowerpot_data')}</div>
    }

    const measurementIcons = [
        {
            type: 'humidity',
            icon: <Drop size={24} />,
        },
        {
            type: 'temperature',
            icon: <Thermometer size={24} />,
        },
        {
            type: 'light',
            icon: <Sun size={24} />,
        },
        {
            type: 'battery',
            icon: <BatteryChargingVertical size={24} />,
        },
    ]

    return (
        <>
            <div className="flowerpot-detail">
                <div className="status-section">
                    <h3>{t('flower_measurments.status')}</h3>

                    <div className="status-measurements">
                        <div className="status-item temperature">
                            <span>{t('flower_measurments.measurments.temperature')}: </span>
                            <b>
                                {lastTemperature !== null
                                    ? `${lastTemperature.toFixed(1)} °C`
                                    : t('flower_measurments.no_value_placeholder')}
                            </b>
                            <span className={`status-text ${getStatusText('temperature', lastTemperature).className}`}>
                                {getStatusText('temperature', lastTemperature).text}
                            </span>
                        </div>
                        <div className="status-item humidity">
                            <span>{t('flower_measurments.measurments.humidity')}: </span>
                            <b>
                                {lastHumidity !== null
                                    ? `${lastHumidity.toFixed(1)} %`
                                    : t('flower_measurments.no_value_placeholder')}
                            </b>
                            <span className={`status-text ${getStatusText('humidity', lastHumidity).className}`}>
                                {getStatusText('humidity', lastHumidity).text}
                            </span>
                        </div>
                        <div className="status-item light">
                            <span>{t('flower_measurments.measurments.light')}: </span>
                            <b>
                                {lastLight !== null
                                    ? `${lastLight.toFixed(1)} ${t('flower_measurments.unit.lux')}`
                                    : t('flower_measurments.no_value_placeholder')}
                            </b>
                            <span className={`status-text ${getStatusText('light', lastLight).className}`}>
                                {getStatusText('light', lastLight).text}
                            </span>
                        </div>
                        <div className="status-item battery">
                            <span>{t('flower_measurments.measurments.battery')}: </span>
                            <b>
                                {lastBattery !== null
                                    ? `${lastBattery.toFixed(1)} %`
                                    : t('flower_measurments.no_value_placeholder')}
                            </b>
                            <span className={`status-text ${getStatusText('battery', lastBattery).className}`}>
                                {getStatusText('battery', lastBattery).text}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="chart-section">
                    <div className="chart-header">
                        <H5 variant="secondary" className="chart-header-title">
                            {getTimeRangeLabel()}
                        </H5>
                        <div className="time-range-controls">
                            <div className="time-range-buttons">
                                <Button
                                    className={`time-range-button ${timeRange === 'day' ? 'active' : ''}`}
                                    onClick={() => onTimeRangeChange('day')}>
                                    {t('flower_measurments.filter_date_range.day')}
                                </Button>
                                <Button
                                    className={`time-range-button ${timeRange === 'week' ? 'active' : ''}`}
                                    onClick={() => onTimeRangeChange('week')}>
                                    {t('flower_measurments.filter_date_range.week')}
                                </Button>
                                <Button
                                    className={`time-range-button ${timeRange === 'month' ? 'active' : ''}`}
                                    onClick={() => onTimeRangeChange('month')}>
                                    {t('flower_measurments.filter_date_range.month')}
                                </Button>
                                <Button
                                    className={`time-range-button ${timeRange === 'custom' ? 'active' : ''}`}
                                    onClick={() => onTimeRangeChange('custom')}>
                                    {t('flower_measurments.filter_date_range.custom')}
                                </Button>
                            </div>

                            {timeRange === 'custom' && (
                                <div className="custom-date-range">
                                    <div className="date-input-group">
                                        <label>{t('flower_measurments.filter_date_range.from')}</label>
                                        <input
                                            type="date"
                                            value={customDateRange.from}
                                            onChange={e =>
                                                onCustomDateRangeChange({ ...customDateRange, from: e.target.value })
                                            }
                                            max={customDateRange.to || new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="date-input-group">
                                        <label>{t('flower_measurments.filter_date_range.to')}</label>
                                        <input
                                            type="date"
                                            value={customDateRange.to}
                                            onChange={e =>
                                                onCustomDateRangeChange({ ...customDateRange, to: e.target.value })
                                            }
                                            min={customDateRange.from}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <H5 className="chart-header-title">{t(`flower_measurments.measurments.${measurementType}`)}</H5>

                    <div className="chart-container">
                        <ChartVizual
                            data={chartData}
                            dataKey={measurementType}
                            color={getChartColor()}
                            minValue={limits.min}
                            maxValue={limits.max}
                        />
                    </div>

                    <div className="measurement-icons">
                        {measurementIcons.map(({ type, icon }) => (
                            <button
                                key={type}
                                className={`icon-button ${measurementType === type ? 'active' : ''}`}
                                onClick={() => {
                                    setMeasurementType(type as FlowerpotMeasurementType)
                                }}>
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="measurements-history">
                    <h3>
                        {t(`flower_measurments.measurments.${measurementType}`)} {t('flower_measurments.measurements')}
                    </h3>
                    <div className="date-picker">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="measurement-list">
                        {filteredMeasurements.map((measurement, index) => (
                            <div key={index} className="measurement-item">
                                <span className="timestamp">{formatDate(measurement.createdAt)}</span>
                                <span className="value">
                                    {getMeasurementLabel()} {measurement.value}
                                    {getMeasurementUnit()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default FlowerpotMeasurment
