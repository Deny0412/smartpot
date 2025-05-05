import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import GradientDiv from '../../components/GradientDiv/GradientDiv'
import { H5 } from '../../components/Text/Heading/Heading'
import { selectFlowers } from '../../redux/selectors/flowerDetailSelectors'
import { selectUserHouseholds } from '../../redux/selectors/houseHoldSelectors'
import {
    loadFlowers,
    transplantFlowerWithSmartPotThunk,
    transplantFlowerWithoutSmartPotThunk,
} from '../../redux/slices/flowersSlice'
import { loadHouseholds } from '../../redux/slices/householdsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import { Flower } from '../../types/flowerTypes'
import './TransplantFlower.sass'

interface TransplantFlowerProps {
    isOpen: boolean
    onClose: () => void
    flowerId: string
    currentHouseholdId: string
    hasSmartPot: boolean
}

const TransplantFlower: React.FC<TransplantFlowerProps> = ({
    isOpen,
    onClose,
    flowerId,
    currentHouseholdId,
    hasSmartPot,
}) => {
    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>('')
    const [loading, setLoading] = useState(false)

    const households = useSelector(selectUserHouseholds)
    const flowers = useSelector((state: RootState) => selectFlowers(state))
    const currentFlower = flowers.find((f: Flower) => f._id === flowerId)

    useEffect(() => {
        if (isOpen) {
            dispatch(loadHouseholds())
            dispatch(loadFlowers(currentHouseholdId))
        }
    }, [isOpen, dispatch, currentHouseholdId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!selectedHouseholdId) {
                throw new Error('No household selected')
            }

            if (hasSmartPot) {
                await dispatch(
                    transplantFlowerWithSmartPotThunk({
                        flowerId,
                        targetHouseholdId: selectedHouseholdId,
                    }),
                ).unwrap()
            } else {
                await dispatch(
                    transplantFlowerWithoutSmartPotThunk({
                        flowerId,
                        targetHouseholdId: selectedHouseholdId,
                        assignOldSmartPot: false,
                        newFlowerId: '',
                    }),
                ).unwrap()
            }

            await dispatch(loadFlowers(currentHouseholdId))
            await dispatch(loadFlowers(selectedHouseholdId))

            toast.success(t('flower_detail.transplant_success'))
            onClose()
        } catch (error) {
            console.error('Transplant error:', error)
            toast.error(t('flower_detail.transplant_error'))
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="transplant-flower-container">
            <GradientDiv className="transplant-flower-content">
                <button className="transplant-flower-close-button" onClick={onClose}>
                    ×
                </button>
                <H5 variant="primary">{t('flower_detail.transplant_title')}</H5>

                <form onSubmit={handleSubmit} className="transplant-flower-form">
                    <div className="transplant-flower-form-group">
                        <label className="transplant-flower-label">{t('flower_detail.current_household')}</label>
                        <div className="transplant-flower-current">
                            {households.find(h => h._id === currentHouseholdId)?.name}
                        </div>
                    </div>

                    <div className="transplant-flower-form-group">
                        <label className="transplant-flower-label">{t('flower_detail.select_new_household')}</label>
                        <select
                            className="transplant-flower-select"
                            value={selectedHouseholdId}
                            onChange={e => setSelectedHouseholdId(e.target.value)}>
                            <option value="">{t('flower_detail.select_household_placeholder')}</option>
                            {households
                                .filter(h => h._id !== currentHouseholdId)
                                .map(household => (
                                    <option key={household._id} value={household._id}>
                                        {household.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="transplant-flower-button"
                        disabled={loading || !selectedHouseholdId}>
                        {loading ? t('flower_detail.transplanting') : t('flower_detail.confirm_transplant')}
                    </button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default TransplantFlower
