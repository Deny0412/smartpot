import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import { H5 } from '../../../components/Text/Heading/Heading'
import { selectUser } from '../../../redux/selectors/authSelectors'
import { selectFlowers } from '../../../redux/selectors/flowerDetailSelectors'
import { selectHouseholds } from '../../../redux/selectors/houseHoldSelectors'
import { selectSmartPots } from '../../../redux/selectors/smartPotSelectors'
import {
    loadFlowerDetails,
    loadFlowers,
    transplantFlowerToSmartPotThunk,
    transplantFlowerWithSmartPotThunk,
    transplantFlowerWithoutSmartPotThunk,
} from '../../../redux/slices/flowersSlice'
import { loadHouseholds } from '../../../redux/slices/householdsSlice'
import { fetchSmartPots } from '../../../redux/slices/smartPotsSlice'
import { AppDispatch } from '../../../redux/store/store'
import { Flower, SmartPot } from '../../../types/flowerTypes'
import './EditFlowerHousehold.sass'

interface EditFlowerHouseholdProps {
    isOpen: boolean
    onClose: () => void
    flowerId: string
    currentHouseholdId: string
    hasSmartPot: boolean
    smartPotId?: string
}

const EditFlowerHousehold: React.FC<EditFlowerHouseholdProps> = ({
    isOpen,
    onClose,
    flowerId,
    currentHouseholdId,
    hasSmartPot,
    smartPotId,
}) => {
    console.log('=== EditFlowerHousehold - Props ===')
    console.log('Props:', { isOpen, flowerId, currentHouseholdId, hasSmartPot, smartPotId })

    const { t } = useTranslation()
    const dispatch = useDispatch<AppDispatch>()
    const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>('')
    const [keepSmartPot, setKeepSmartPot] = useState<boolean>(true)
    const [assignSmartPot, setAssignSmartPot] = useState<boolean>(false)
    const [selectedFlowerId, setSelectedFlowerId] = useState<string>('')
    const [selectedSmartPotId, setSelectedSmartPotId] = useState<string>('')
    const [transplantType, setTransplantType] = useState<'same_household' | 'different_household'>('same_household')
    const [loading, setLoading] = useState(false)

    const households = useSelector(selectHouseholds)
    const flowers = useSelector(selectFlowers) as Flower[]
    const smartPots = useSelector(selectSmartPots) as SmartPot[]
    const user = useSelector(selectUser)
    const currentHousehold = households.find(h => h._id === currentHouseholdId)
    const isOwner = currentHousehold?.owner === user?.id

    const availableFlowers = flowers.filter(
        (flower: Flower) =>
            flower.household_id === currentHouseholdId && flower._id !== flowerId && !flower.serial_number,
    )

    const availableSmartPots = smartPots.filter(
        (pot: SmartPot) => pot.household_id === currentHouseholdId && pot.active_flower_id === null,
    )

    useEffect(() => {
        if (isOpen) {
            dispatch(loadHouseholds())
            dispatch(loadFlowers(currentHouseholdId))
            dispatch(fetchSmartPots(currentHouseholdId))
        }
    }, [isOpen, dispatch, currentHouseholdId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (transplantType === 'same_household') {
                if (!selectedSmartPotId) {
                    throw new Error('No smart pot selected')
                }

                await dispatch(
                    transplantFlowerToSmartPotThunk({
                        flowerId,
                        targetSmartPotId: selectedSmartPotId,
                    }),
                ).unwrap()

                await dispatch(fetchSmartPots(currentHouseholdId))
                await dispatch(loadFlowerDetails(flowerId))
            } else {
                if (!selectedHouseholdId) {
                    throw new Error('No household selected')
                }

                if (hasSmartPot && keepSmartPot && smartPotId) {
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
                            assignOldSmartPot: assignSmartPot,
                            newFlowerId: selectedFlowerId,
                        }),
                    ).unwrap()
                }

                await dispatch(fetchSmartPots(currentHouseholdId))
                if (selectedHouseholdId !== currentHouseholdId) {
                    await dispatch(fetchSmartPots(selectedHouseholdId))
                }
                await dispatch(loadFlowerDetails(flowerId))
            }

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
        <div className="edit-flower-household-container">
            <GradientDiv className="edit-flower-household-content">
                <button className="edit-flower-household-close-button" onClick={onClose}>
                    ×
                </button>
                <H5 variant="primary">{t('flower_detail.transplant_title')}</H5>

                <form onSubmit={handleSubmit} className="edit-flower-household-form">
                    <div className="edit-flower-household-form-group">
                        <label className="edit-flower-household-label">{t('flower_detail.current_household')}</label>
                        <div className="edit-flower-household-current">{currentHousehold?.name}</div>
                    </div>

                    <div className="edit-flower-household-form-group">
                        <label className="edit-flower-household-label">{t('flower_detail.transplant_type')}</label>
                        <div className="edit-flower-household-radio-group">
                            <label>
                                <input
                                    type="radio"
                                    checked={transplantType === 'same_household'}
                                    onChange={() => setTransplantType('same_household')}
                                />
                                {t('flower_detail.same_household')}
                            </label>
                            {isOwner && (
                                <label>
                                    <input
                                        type="radio"
                                        checked={transplantType === 'different_household'}
                                        onChange={() => setTransplantType('different_household')}
                                    />
                                    {t('flower_detail.different_household')}
                                </label>
                            )}
                        </div>
                    </div>

                    {transplantType === 'same_household' ? (
                        <div className="edit-flower-household-form-group">
                            <label className="edit-flower-household-label">{t('flower_detail.select_smart_pot')}</label>
                            {availableSmartPots.length > 0 ? (
                                <select
                                    className="edit-flower-household-select"
                                    value={selectedSmartPotId}
                                    onChange={e => setSelectedSmartPotId(e.target.value)}>
                                    <option value="">{t('flower_detail.select_smart_pot_placeholder')}</option>
                                    {availableSmartPots.map(pot => (
                                        <option key={pot._id} value={pot._id}>
                                            {pot.serial_number}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="edit-flower-household-no-smartpots">
                                    {t('flower_detail.no_smartpots_available')}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {isOwner && (
                                <div className="edit-flower-household-form-group">
                                    <label className="edit-flower-household-label">
                                        {t('flower_detail.select_new_household')}
                                    </label>
                                    <select
                                        className="edit-flower-household-select"
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
                            )}

                            {hasSmartPot && (
                                <div className="edit-flower-household-form-group">
                                    <label className="edit-flower-household-label">
                                        {t('flower_detail.keep_smart_pot')}
                                    </label>
                                    <div className="edit-flower-household-radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                checked={keepSmartPot}
                                                onChange={() => setKeepSmartPot(true)}
                                            />
                                            {t('flower_detail.yes')}
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                checked={!keepSmartPot}
                                                onChange={() => setKeepSmartPot(false)}
                                            />
                                            {t('flower_detail.no')}
                                        </label>
                                    </div>
                                </div>
                            )}

                            {!keepSmartPot && (
                                <div className="edit-flower-household-form-group">
                                    <label className="edit-flower-household-label">
                                        {t('flower_detail.assign_new_smart_pot')}
                                    </label>
                                    <div className="edit-flower-household-radio-group">
                                        <label>
                                            <input
                                                type="radio"
                                                checked={assignSmartPot}
                                                onChange={() => setAssignSmartPot(true)}
                                            />
                                            {t('flower_detail.yes')}
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                checked={!assignSmartPot}
                                                onChange={() => setAssignSmartPot(false)}
                                            />
                                            {t('flower_detail.no')}
                                        </label>
                                    </div>
                                </div>
                            )}

                            {!keepSmartPot && assignSmartPot && (
                                <div className="edit-flower-household-form-group">
                                    <label className="edit-flower-household-label">
                                        {t('flower_detail.select_flower')}
                                    </label>
                                    {availableFlowers.length > 0 ? (
                                        <select
                                            className="edit-flower-household-select"
                                            value={selectedFlowerId}
                                            onChange={e => setSelectedFlowerId(e.target.value)}>
                                            <option value="">{t('flower_detail.select_flower_placeholder')}</option>
                                            {availableFlowers.map(flower => (
                                                <option key={flower._id} value={flower._id}>
                                                    {flower.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="edit-flower-household-no-flowers">
                                            {t('flower_detail.no_flowers_available')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {assignSmartPot && selectedSmartPotId && (
                                <div className="edit-flower-household-form-group">
                                    <label className="edit-flower-household-label">
                                        {t('flower_detail.select_smart_pot')}
                                    </label>
                                    {availableSmartPots.length > 0 ? (
                                        <select
                                            className="edit-flower-household-select"
                                            value={selectedSmartPotId}
                                            onChange={e => setSelectedSmartPotId(e.target.value)}>
                                            <option value="">{t('flower_detail.select_smart_pot_placeholder')}</option>
                                            {availableSmartPots.map(pot => (
                                                <option key={pot._id} value={pot._id}>
                                                    {pot.serial_number}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="edit-flower-household-no-smartpots">
                                            {t('flower_detail.no_smartpots_available')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    <button
                        type="submit"
                        className="edit-flower-household-button"
                        disabled={
                            loading ||
                            (transplantType === 'same_household' && !selectedSmartPotId) ||
                            (transplantType === 'different_household' &&
                                ((isOwner && !selectedHouseholdId) || (assignSmartPot && !selectedFlowerId)))
                        }>
                        {loading ? t('flower_detail.transplanting') : t('flower_detail.confirm_transplant')}
                    </button>
                </form>
            </GradientDiv>
        </div>
    )
}

export default EditFlowerHousehold
