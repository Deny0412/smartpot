import { Drop, PaintBucket, Sun, Thermometer } from 'phosphor-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../../components/Button/Button'
import ChartVizual from '../../components/ChartVizual/ChartVizual'
import { H5 } from '../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../i18n'
import { fetchMeasurementsForFlower } from '../../redux/slices/measurementsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import { Flower, FlowerProfile, Measurement } from '../../types/flowerTypes'
import './FlowerpotMeasurment.sass'


interface FlowerpotMeasurmentProps {
    flowerId: string
    flowerpotData: {
        name: string
        status: string
        status_description: string
        flower_avatar: string
    }
    flowerProfile?: FlowerProfile
}

type TimeRange = 'day' | 'week' | 'month' | 'custom'
type MeasurementType = 'humidity' | 'temperature' | 'light' | 'water_level'

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

const FlowerpotMeasurment: React.FC<FlowerpotMeasurmentProps> = ({ flowerId, flowerpotData, flowerProfile }) => {
    const dispatch = useDispatch<AppDispatch>()
    const measurements = useSelector((state: RootState) => state.measurements.measurements[flowerId] || [])
    const loading = useSelector((state: RootState) => state.measurements.loading)
    const flower = useSelector((state: RootState) => state.flowers.selectedFlower) as Flower | null
    const { t } = useTranslation() as { t: TranslationFunction }

    useEffect(() => {
        dispatch(fetchMeasurementsForFlower(flowerId))
        setMeasurementLabel(t('flower_measurments.measurments.humidity'))
    }, [dispatch, flowerId, t])

    const [timeRange, setTimeRange] = useState<TimeRange>('day')
    const [measurementType, setMeasurementType] = useState<MeasurementType>('humidity')
    const [irrigationValue, setIrrigationValue] = useState<string>('')
    const [measurementLabel, setMeasurementLabel] = useState<string>(t('flower_measurments.measurments.humidity'))
    const [selectedDate, setSelectedDate] = useState<string>('')
    const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string }>({
        from: '',
        to: '',
    })

    const handleIrrigation = () => {
        setIrrigationValue('')
    }

    const filterDataByTimeRange = (data: Array<{ timestamp: string; value: number }>) => {
        if (!data || data.length === 0) return data

        if (timeRange === 'custom' && customDateRange.from && customDateRange.to) {
            const fromDate = new Date(customDateRange.from)
            const toDate = new Date(customDateRange.to)

            fromDate.setHours(0, 0, 0, 0)
            toDate.setHours(23, 59, 59, 999)

            return data
                .filter(item => {
                    const itemDate = new Date(item.timestamp)
                    return itemDate >= fromDate && itemDate <= toDate
                })
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        }

        const latestDate = new Date(Math.max(...data.map(item => new Date(item.timestamp).getTime())))

        let startDate = new Date(latestDate)
        switch (timeRange) {
            case 'day':
                startDate.setHours(0, 0, 0, 0)
                break
            case 'week':
                startDate.setDate(startDate.getDate() - 7)
                break
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1)
                break
        }

        return data
            .filter(item => {
                const itemDate = new Date(item.timestamp)
                return itemDate >= startDate && itemDate <= latestDate
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
            case 'water_level':
                return t('flower_measurments.measurments.water_level')
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
            case 'water_level':
                return '%'
            default:
                return ''
        }
    }

    const getMeasurementValue = (measurement: Measurement) => {
        let value: number
        switch (measurementType) {
            case 'humidity':
                value = measurement.humidity
                break
            case 'temperature':
                value = measurement.temperature
                break
            case 'light':
                value = measurement.light
                break
            case 'water_level':
                value = measurement.water_level
                break
            default:
                value = 0
        }
        return Number(value.toFixed(2))
    }

    const getLimits = (type: MeasurementType): MeasurementLimits => {
        if (type === 'water_level') {
            return { min: 0, max: 100 }
        }

        if (flowerProfile?.[type]) {
            return {
                min: flowerProfile[type].min,
                max: flowerProfile[type].max,
            }
        }

        if (flower?.[type]) {
            return {
                min: flower[type]!.min,
                max: flower[type]!.max,
            }
        }

        const defaults: Record<MeasurementType, MeasurementLimits> = {
            humidity: { min: 0, max: 100 },
            temperature: { min: 0, max: 50 },
            light: { min: 0, max: 100 },
            water_level: { min: 0, max: 100 },
        }

        return defaults[type]
    }

    const chartData = useMemo(() => {
        const data = measurements.map((m: Measurement) => ({
            timestamp: m.created_at,
            value: getMeasurementValue(m),
        }))
        return filterDataByTimeRange(data)
    }, [measurements, measurementType, timeRange, customDateRange])

    const filteredMeasurements = useMemo(() => {
        if (!selectedDate || selectedDate === '') {
            if (measurements.length === 0) return []
            const sortedMeasurements = [...measurements].sort(
                (a: Measurement, b: Measurement) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            )
            return sortedMeasurements.slice(0, 15)
        }

        const selectedDateObj = new Date(selectedDate)
        selectedDateObj.setHours(0, 0, 0, 0)
        const nextDay = new Date(selectedDateObj)
        nextDay.setDate(nextDay.getDate() + 1)

        const filtered = measurements.filter((measurement: Measurement) => {
            const measurementDate = new Date(measurement.created_at)
            return measurementDate >= selectedDateObj && measurementDate < nextDay
        })

        return [...filtered].sort(
            (a: Measurement, b: Measurement) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
            case 'water_level':
                return 'green'
            default:
                return '#000'
        }
    }

    if (loading) {
        return <div>{t('common.loading')}</div>
    }

    return (
        <div className="flowerpot-detail">
            <div className="flowerpot-header">
                <h1 className="flowerpot-title">{flowerpotData.name}</h1>
                <img src={flowerpotData.flower_avatar} alt="Flowerpot Avatar" className="flowerpot-avatar" />
            </div>

            <div className="status-section">
                <h3>{t('flower_measurments.status')}</h3>
                <p>{flowerpotData.status_description}</p>
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
                                onClick={() => setTimeRange('day')}>
                                {t('flower_measurments.filter_date_range.day')}
                            </Button>
                            <Button
                                className={`time-range-button ${timeRange === 'week' ? 'active' : ''}`}
                                onClick={() => setTimeRange('week')}>
                                {t('flower_measurments.filter_date_range.week')}
                            </Button>
                            <Button
                                className={`time-range-button ${timeRange === 'month' ? 'active' : ''}`}
                                onClick={() => setTimeRange('month')}>
                                {t('flower_measurments.filter_date_range.month')}
                            </Button>
                            <Button
                                className={`time-range-button ${timeRange === 'custom' ? 'active' : ''}`}
                                onClick={() => setTimeRange('custom')}>
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
                                        onChange={e => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                                        max={customDateRange.to || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="date-input-group">
                                    <label>{t('flower_measurments.filter_date_range.to')}</label>
                                    <input
                                        type="date"
                                        value={customDateRange.to}
                                        onChange={e => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                                        min={customDateRange.from}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <H5 className="chart-header-title">{measurementLabel}</H5>

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
                    <button
                        className={`icon-button ${measurementType === 'humidity' ? 'active' : ''}`}
                        onClick={() => {
                            setMeasurementType('humidity')
                            setMeasurementLabel(t('flower_measurments.measurments.humidity'))
                        }}>
                        <Drop size={24} />
                    </button>
                    <button
                        className={`icon-button ${measurementType === 'temperature' ? 'active' : ''}`}
                        onClick={() => {
                            setMeasurementType('temperature')
                            setMeasurementLabel(t('flower_measurments.measurments.temperature'))
                        }}>
                        <Thermometer size={24} />
                    </button>
                    <button
                        className={`icon-button ${measurementType === 'light' ? 'active' : ''}`}
                        onClick={() => {
                            setMeasurementType('light')
                            setMeasurementLabel(t('flower_measurments.measurments.light'))
                        }}>
                        <Sun size={24} />
                    </button>
                    <button
                        className={`icon-button ${measurementType === 'water_level' ? 'active' : ''}`}
                        onClick={() => {
                            setMeasurementType('water_level')
                            setMeasurementLabel(t('flower_measurments.measurments.water_level'))
                        }}>
                        <PaintBucket size={32} color="#fafafa" />
                    </button>
                </div>
            </div>

            <div className="irrigation-section">
                <h3>{t('flower_measurments.irrigation.title')}</h3>
                <div className="irrigation-controls">
                    <input
                        type="text"
                        placeholder={t('flower_measurments.irrigation.placeholder')}
                        value={irrigationValue}
                        onChange={e => setIrrigationValue(e.target.value)}
                    />
                    <button className="irrigate-button" onClick={handleIrrigation}>
                        {t('flower_measurments.irrigation.button')}
                    </button>
                </div>
            </div>

            <div className="measurements-history">
                <h3>
                    {getMeasurementLabel()} {t('flower_measurments.measurements')}
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
                    {filteredMeasurements.map((measurement: Measurement, index: number) => (
                        <div key={index} className="measurement-item">
                            <span className="timestamp">{formatDate(measurement.created_at)}</span>
                            <span className="value">
                                {getMeasurementLabel()} {getMeasurementValue(measurement)}
                                {getMeasurementUnit()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FlowerpotMeasurment
