import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import Loader from '../../components/Loader/Loader'
import { fetchScheduleByFlower } from '../../redux/services/flowersApi'
import { loadFlowerProfiles } from '../../redux/slices/flowerProfilesSlice'
import { loadFlowerDetails } from '../../redux/slices/flowersSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import FlowerpotMeasurment from '../FlowerpotMeasurment/FlowerpotMeasurment'

interface Measurement {
    id: string
    flower_id: string
    type: 'humidity' | 'temperature' | 'light'
    value: number
    unit: string
    timestamp: Date
}

interface FlowerpotData {
    name: string
    status: string
    status_description: string
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

const FlowerpotDetail: React.FC = () => {
    const { flowerId } = useParams<{ flowerId: string }>()
    const dispatch = useDispatch<AppDispatch>()
    const flower = useSelector((state: RootState) => state.flowers.selectedFlower)
    const profiles = useSelector((state: RootState) => state.flowerProfiles.profiles)
    const loading = useSelector((state: RootState) => state.flowers.loading)
    const [flowerpotData, setFlowerpotData] = useState<FlowerpotData | null>(null)
    const [measurements, setMeasurements] = useState<Measurement[]>([])
    const [measurementsLoading, setMeasurementsLoading] = useState(true)
    const [flowerProfile, setFlowerProfile] = useState<any>(null)

    useEffect(() => {
        if (flowerId) {
            dispatch(loadFlowerDetails(flowerId))
        }
    }, [dispatch, flowerId])

    useEffect(() => {
        if (flower?.household_id) {
            dispatch(loadFlowerProfiles())
        }
    }, [dispatch, flower?.household_id])

    useEffect(() => {
        if (flowerId) {
            setMeasurementsLoading(true)
            Promise.all([
                fetch(`/api/measurements/flower/${flowerId}`).then(res => res.json()),
                fetchScheduleByFlower(flowerId),
            ])
                .then(([measurementsResponse, profileResponse]) => {
                    setMeasurements(measurementsResponse)
                    setFlowerProfile(profileResponse)
                    setMeasurementsLoading(false)
                })
                .catch(error => {
                    console.error('Error loading data:', error)
                    setMeasurementsLoading(false)
                })
        }
    }, [flowerId])

    useEffect(() => {
        if (flower) {
            setFlowerpotData(prevData => ({
                name: flower.name,
                status: 'active',
                status_description: 'Kvetina je v poriadku',
                flower_avatar: flower.avatar,
                humidity_measurement: prevData?.humidity_measurement || [],
                temperature_measurement: prevData?.temperature_measurement || [],
                light_measurement: prevData?.light_measurement || [],
            }))
        }
    }, [flower])

    useEffect(() => {
        if (flowerpotData && measurements.length > 0) {
            const humidityMeasurements = measurements
                .filter(m => m.type === 'humidity')
                .map(m => ({
                    timestamp: new Date(m.timestamp).toISOString(),
                    humidity: m.value,
                }))

            const temperatureMeasurements = measurements
                .filter(m => m.type === 'temperature')
                .map(m => ({
                    timestamp: new Date(m.timestamp).toISOString(),
                    temperature: m.value,
                }))

            const lightMeasurements = measurements
                .filter(m => m.type === 'light')
                .map(m => ({
                    timestamp: new Date(m.timestamp).toISOString(),
                    light: m.value,
                }))

            setFlowerpotData(prevData => ({
                ...prevData!,
                humidity_measurement: humidityMeasurements,
                temperature_measurement: temperatureMeasurements,
                light_measurement: lightMeasurements,
            }))
        }
    }, [measurements])

    if (loading || measurementsLoading) {
        return <Loader />
    }

    if (!flower || !flowerpotData) {
        return <div>No data available</div>
    }

    const flowerProfileData = profiles.find(profile => profile.id === flower.profile_id)

    return (
        <div className="flowerpot-detail-page">
            <FlowerpotMeasurment flowerId={flower.id} flowerpotData={flowerpotData} flowerProfile={flowerProfileData} />
        </div>
    )
}

export default FlowerpotDetail
