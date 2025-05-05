import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../components/Text/Heading/Heading'
import { selectUser } from '../../../redux/selectors/authSelectors'
import { selectFlowers } from '../../../redux/selectors/flowerDetailSelectors'
import { selectHouseholds } from '../../../redux/selectors/houseHoldSelectors'
import { selectSmartPots } from '../../../redux/selectors/smartPotSelectors'
import { loadFlowers } from '../../../redux/slices/flowersSlice'
import { loadHouseholds } from '../../../redux/slices/householdsSlice'
import {
    fetchSmartPots,
    transplantSmartPotToFlowerThunk,
    transplantSmartPotWithFlowerThunk,
} from '../../../redux/slices/smartPotsSlice'
import { AppDispatch } from '../../../redux/store/store'
import './TransplantSmartPot.sass'

interface TransplantSmartPotProps {
    isOpen: boolean
    onClose: () => void
    smartPotId: string
    currentHouseholdId: string
    serialNumber: string
    activeFlowerId?: string | null
}

const TransplantSmartPot: React.FC<TransplantSmartPotProps> = ({
    isOpen,
    onClose,
    smartPotId,
    currentHouseholdId,
    serialNumber,
    activeFlowerId,
}) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>(currentHouseholdId)
    const [selectedFlowerId, setSelectedFlowerId] = useState<string>('')
    const [transplantType, setTransplantType] = useState<'same_household' | 'different_household'>('same_household')
    const [loading, setLoading] = useState(false)
    const [isDataLoaded, setIsDataLoaded] = useState(false)

    const households = useSelector(selectHouseholds)
    const flowers = useSelector(selectFlowers)
    const smartPots = useSelector(selectSmartPots)
    const user = useSelector(selectUser)

    const currentHousehold = useMemo(
        () => households.find(h => h._id === currentHouseholdId),
        [households, currentHouseholdId],
    )

    const isOwner = useMemo(() => currentHousehold?.owner === user?.id, [currentHousehold, user])

    const availableFlowers = useMemo(
        () => flowers.filter(flower => flower.household_id === currentHouseholdId && !flower.serial_number),
        [flowers, currentHouseholdId],
    )

    // Kontrola či máme všetky potrebné dáta
    const hasAllData = useMemo(() => {
        return households.length > 0 && flowers.length > 0 && smartPots.length > 0
    }, [households, flowers, smartPots])

    useEffect(() => {
        if (isOpen && !hasAllData) {
            const loadData = async () => {
                try {
                    const promises = []

                    // Načítaj len chýbajúce dáta
                    if (households.length === 0) {
                        promises.push(dispatch(loadHouseholds()))
                    }
                    if (flowers.length === 0) {
                        promises.push(dispatch(loadFlowers(currentHouseholdId)))
                    }
                    if (smartPots.length === 0) {
                        promises.push(dispatch(fetchSmartPots(currentHouseholdId)))
                    }

                    if (promises.length > 0) {
                        await Promise.all(promises)
                    }
                    setIsDataLoaded(true)
                } catch (error) {
                    console.error('Chyba pri načítaní dát:', error)
                    toast.error(t('smart_pot_detail.load_error'))
                }
            }

            loadData()
        }
    }, [isOpen, currentHouseholdId, dispatch, hasAllData, households.length, flowers.length, smartPots.length])

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            setLoading(true)

            try {
                if (transplantType === 'same_household') {
                    if (!selectedFlowerId) {
                        throw new Error('No flower selected')
                    }

                    await dispatch(
                        transplantSmartPotToFlowerThunk({
                            smartPotId,
                            targetFlowerId: selectedFlowerId,
                        }),
                    ).unwrap()

                    await dispatch(fetchSmartPots(currentHouseholdId))
                    toast.success(t('smart_pot_detail.transplant_success'))
                    onClose()
                } else {
                    if (!selectedHouseholdId) {
                        throw new Error('No household selected')
                    }

                    await dispatch(
                        transplantSmartPotWithFlowerThunk({
                            smartPotId,
                            targetHouseholdId: selectedHouseholdId,
                        }),
                    ).unwrap()

                    await dispatch(fetchSmartPots(currentHouseholdId))
                    await dispatch(fetchSmartPots(selectedHouseholdId))
                    await dispatch(loadFlowers(currentHouseholdId))
                    await dispatch(loadFlowers(selectedHouseholdId))

                    toast.success(t('smart_pot_detail.transplant_success'))
                    onClose()
                }
            } catch (error) {
                console.error('Transplant error:', error)
                toast.error(t('smart_pot_detail.transplant_error'))
            } finally {
                setLoading(false)
            }
        },
        [transplantType, selectedFlowerId, dispatch, currentHouseholdId, smartPotId, selectedHouseholdId, t, onClose],
    )

    const handleTransplantTypeChange = useCallback((type: 'same_household' | 'different_household') => {
        setTransplantType(type)
    }, [])

    const handleFlowerChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFlowerId(e.target.value)
    }, [])

    const handleHouseholdChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedHouseholdId(e.target.value)
    }, [])

    if (!isOpen) return null

    return (
        <div className="transplant-smart-pot-container">
            <GradientDiv className="transplant-smart-pot-content">
                <button className="transplant-smart-pot-close-button" onClick={onClose}>
                    ×
                </button>
                <H5 variant="primary">{t('smart_pot_detail.transplant_title')}</H5>

                <form onSubmit={handleSubmit} className="transplant-smart-pot-form">
                    <div className="transplant-smart-pot-form-group">
                        <label className="transplant-smart-pot-label">{t('smart_pot_detail.current_household')}</label>
                        <div className="transplant-smart-pot-current">{currentHousehold?.name}</div>
                    </div>

                    <div className="transplant-smart-pot-form-group">
                        <label className="transplant-smart-pot-label">{t('smart_pot_detail.transplant_type')}</label>
                        <div className="transplant-smart-pot-radio-group">
                            <label>
                                <input
                                    type="radio"
                                    checked={transplantType === 'same_household'}
                                    onChange={() => handleTransplantTypeChange('same_household')}
                                />
                                {t('smart_pot_detail.same_household')}
                            </label>
                            {isOwner && (
                                <label>
                                    <input
                                        type="radio"
                                        checked={transplantType === 'different_household'}
                                        onChange={() => handleTransplantTypeChange('different_household')}
                                    />
                                    {t('smart_pot_detail.different_household')}
                                </label>
                            )}
                        </div>
                    </div>

                    {transplantType === 'same_household' ? (
                        <div className="transplant-smart-pot-form-group">
                            <label className="transplant-smart-pot-label">{t('smart_pot_detail.select_flower')}</label>
                            {availableFlowers.length > 0 ? (
                                <select
                                    className="transplant-smart-pot-select"
                                    value={selectedFlowerId}
                                    onChange={handleFlowerChange}>
                                    <option value="">{t('smart_pot_detail.select_flower_placeholder')}</option>
                                    {availableFlowers.map(flower => (
                                        <option key={flower._id} value={flower._id}>
                                            {flower.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="transplant-smart-pot-no-flowers">
                                    {t('smart_pot_detail.no_flowers_available')}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="transplant-smart-pot-form-group">
                            <label className="transplant-smart-pot-label">
                                {t('smart_pot_detail.select_new_household')}
                            </label>
                            <select
                                className="transplant-smart-pot-select"
                                value={selectedHouseholdId}
                                onChange={handleHouseholdChange}>
                                <option value="">{t('smart_pot_detail.select_household_placeholder')}</option>
                                {households
                                    .filter(h => h._id !== currentHouseholdId)
                                    .map(household => (
                                        <option key={household._id} value={household._id}>
                                            {household.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="transplant-smart-pot-button"
                        disabled={
                            loading ||
                            (transplantType === 'same_household' && !selectedFlowerId) ||
                            (transplantType === 'different_household' && !selectedHouseholdId)
                        }>
                        {loading ? t('smart_pot_detail.transplanting') : t('smart_pot_detail.confirm_transplant')}
                    </button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default TransplantSmartPot
