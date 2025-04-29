import { Drop, Sun, Thermometer } from '@phosphor-icons/react'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../../../components/Button/Button'
import ChartVizual from '../../../components/ChartVizual/ChartVizual'
import { H5 } from '../../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../../i18n'
import { AppDispatch, RootState } from '../../../redux/store/store'
import { Flower, FlowerProfile, MeasurementValue } from '../../../types/flowerTypes'
import './FlowerpotMeasurment.sass'

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
    }
    flowerProfile?: FlowerProfile
    timeRange: 'day' | 'week' | 'month' | 'custom'
    customDateRange: { from: string; to: string }
    onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'custom') => void
    onCustomDateRangeChange: (range: { from: string; to: string }) => void
}

type TimeRange = 'day' | 'week' | 'month' | 'custom'
type MeasurementType = 'humidity' | 'temperature' | 'light'

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
    const measurements = useSelector(
        (state: RootState) =>
            state.measurements.measurements[flowerId] || {
                humidity: [],
                light: [],
                temperature: [],
            },
    )
    const loading = useSelector((state: RootState) => state.measurements.loading)
    const error = useSelector((state: RootState) => state.measurements.error)
    const flower = useSelector((state: RootState) => state.flowers.selectedFlower) as Flower | null
    const { t } = useTranslation() as { t: TranslationFunction }

    const [measurementType, setMeasurementType] = useState<MeasurementType>('humidity')
    const [selectedDate, setSelectedDate] = useState<string>('')

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const processedMeasurements = useMemo(() => {
        if (!measurements || Object.keys(measurements).length === 0) {
            return {
                humidity: [],
                temperature: [],
                light: [],
            }
        }

        return {
            humidity: measurements.humidity.map(m => ({
                timestamp: m.createdAt,
                humidity: Number(m.value),
            })),
            temperature: measurements.temperature.map(m => ({
                timestamp: m.createdAt,
                temperature: Number(m.value),
            })),
            light: measurements.light.map(m => ({
                timestamp: m.createdAt,
                light: Number(m.value),
            })),
        }
    }, [measurements])

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
                startDate.setDate(now.getDate() - 1)
                break
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
                return '%'
            default:
                return ''
        }
    }

    const getMeasurementValue = (measurement: MeasurementValue) => {
        return Number(measurement.value).toFixed(2)
    }

    const getLimits = (type: MeasurementType): MeasurementLimits => {
        if (flower?.profile_id && flowerProfile?.[type]) {
            return {
                min: flowerProfile[type].min,
                max: flowerProfile[type].max,
            }
        }

        if (flower?.profile?.[type]) {
            return {
                min: flower.profile[type].min,
                max: flower.profile[type].max,
            }
        }

        const defaults: Record<MeasurementType, MeasurementLimits> = {
            humidity: { min: 0, max: 100 },
            temperature: { min: -20, max: 50 },
            light: { min: 0, max: 100 },
        }

        return defaults[type]
    }

    const chartData = useMemo(() => {
        if (!measurements || !measurements[measurementType]) {
            return []
        }

        const data = measurements[measurementType]
            .map((m: MeasurementValue) => ({
                timestamp: m.createdAt,
                value: Number(m.value),
            }))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        return filterDataByTimeRange(data)
    }, [measurements, measurementType, timeRange, customDateRange])

    const filteredMeasurements = useMemo(() => {
        if (!selectedDate || selectedDate === '') {
            if (measurements[measurementType].length === 0) return []
            const sortedMeasurements = [...measurements[measurementType]].sort(
                (a: MeasurementValue, b: MeasurementValue) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
            return sortedMeasurements.slice(0, 15)
        }

        const selectedDateObj = new Date(selectedDate)
        selectedDateObj.setHours(0, 0, 0, 0)
        const nextDay = new Date(selectedDateObj)
        nextDay.setDate(nextDay.getDate() + 1)

        const filtered = measurements[measurementType].filter((measurement: MeasurementValue) => {
            const measurementDate = new Date(measurement.createdAt)
            return measurementDate >= selectedDateObj && measurementDate < nextDay
        })

        return [...filtered].sort(
            (a: MeasurementValue, b: MeasurementValue) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
    }, [selectedDate, measurementType, measurements])

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toLocaleString('sk-SK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getChartColor = () => {
        switch (measurementType) {
            case 'humidity':
                return '#3498db'
            case 'temperature':
                return '#e74c3c'
            case 'light':
                return '#f1c40f'
            default:
                return '#000'
        }
    }

    // Funkcia na získanie poslednej hodnoty
    const getLastValue = (arr: any[], key: string) => {
        if (!arr || arr.length === 0) return null
        return arr[arr.length - 1][key]
    }

    // Funkcia na generovanie statusu pre daný typ merania
    const getStatusText = (type: MeasurementType, value: number | null) => {
        const limits = getLimits(type)
        if (value === null || value === undefined)
            return { text: t('flower_measurments.status_unknown'), className: '' }
        if (value < limits.min) return { text: t(`flower_measurments.status_low_${type}`), className: 'low' }
        if (value > limits.max) return { text: t(`flower_measurments.status_high_${type}`), className: 'high' }
        return { text: t('flower_measurments.status_ok'), className: 'good' }
    }

    const lastHumidity = getLastValue(processedMeasurements.humidity, 'humidity')
    const lastTemperature = getLastValue(processedMeasurements.temperature, 'temperature')
    const lastLight = getLastValue(processedMeasurements.light, 'light')

    if (loading) {
        return <div>{t('common.loading')}</div>
    }

    if (error) {
        return <div>Chyba pri načítaní meraní: {error}</div>
    }

    if (!flowerpotData) {
        return <div>Načítavam dáta kvetiny...</div>
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
    ]

    return (
        <>
            <div className="flowerpot-detail">
                <div className="status-section">
                    <h3>{t('flower_measurments.status')}</h3>

                    <div className="status-measurements">
                        <div className="status-item temperature">
                            <span>{t('flower_measurments.measurments.temperature')}: </span>
                            <b>{lastTemperature !== null ? `${lastTemperature} °C` : '-'}</b>
                            <span className={`status-text ${getStatusText('temperature', lastTemperature).className}`}>
                                {getStatusText('temperature', lastTemperature).text}
                            </span>
                        </div>
                        <div className="status-item humidity">
                            <span>{t('flower_measurments.measurments.humidity')}: </span>
                            <b>{lastHumidity !== null ? `${lastHumidity} %` : '-'}</b>
                            <span className={`status-text ${getStatusText('humidity', lastHumidity).className}`}>
                                {getStatusText('humidity', lastHumidity).text}
                            </span>
                        </div>
                        <div className="status-item light">
                            <span>{t('flower_measurments.measurments.light')}: </span>
                            <b>{lastLight !== null ? `${lastLight} %` : '-'}</b>
                            <span className={`status-text ${getStatusText('light', lastLight).className}`}>
                                {getStatusText('light', lastLight).text}
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
                            minValue={getLimits(measurementType).min}
                            maxValue={getLimits(measurementType).max}
                        />
                    </div>

                    <div className="measurement-icons">
                        {measurementIcons.map(({ type, icon }) => (
                            <button
                                key={type}
                                className={`icon-button ${measurementType === type ? 'active' : ''}`}
                                onClick={() => {
                                    setMeasurementType(type as MeasurementType)
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
                        {filteredMeasurements.map((measurement: MeasurementValue, index: number) => (
                            <div key={index} className="measurement-item">
                                <span className="timestamp">{formatDate(measurement.createdAt)}</span>
                                <span className="value">
                                    {getMeasurementLabel()} {getMeasurementValue(measurement)}
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
