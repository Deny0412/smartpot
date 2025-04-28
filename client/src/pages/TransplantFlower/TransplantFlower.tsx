import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Loader from '../../components/Loader/Loader'
import { H2 } from '../../components/Text/Heading/Heading'
import { TranslationFunction } from '../../i18n'
import { loadFlowers, transplantFlowersToHousehold } from '../../redux/slices/flowersSlice'
import { loadHouseholds } from '../../redux/slices/householdsSlice'
import { AppDispatch, RootState } from '../../redux/store/store'
import { Flower } from '../../types/flowerTypes'
import { Household } from '../../types/householdTypes'
import './TransplantFlower.sass'

const TransplantFlower: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { t } = useTranslation() as { t: TranslationFunction }
    const { householdId } = useParams<{ householdId: string }>()

    const { user } = useSelector((state: RootState) => state.auth)
    const { flowers, loading: flowersLoading, error: flowersError } = useSelector((state: RootState) => state.flowers)
    const {
        households,
        loading: householdsLoading,
        error: householdsError,
    } = useSelector((state: RootState) => state.households)

    const [selectedFlowerIds, setSelectedFlowerIds] = useState<string[]>([])
    const [targetHouseholdId, setTargetHouseholdId] = useState<string>('')
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [successMessage, setSuccessMessage] = useState<string>('')

    const householdFlowers = Array.isArray(flowers)
        ? flowers.filter(flower => flower && flower.household_id === householdId)
        : []

    const eligibleHouseholds = Array.isArray(households)
        ? households.filter(
              household =>
                  household.id !== householdId &&
                  (household.owner === user?.id || household.members.includes(user?.id || '')),
          )
        : []

    useEffect(() => {
        if (householdId) {
            dispatch(loadFlowers(householdId))
            dispatch(loadHouseholds())
        }
    }, [dispatch, householdId])

    const handleFlowerSelect = (flowerId: string) => {
        setSelectedFlowerIds(prev => {
            if (prev.includes(flowerId)) {
                return prev.filter(id => id !== flowerId)
            } else {
                return [...prev, flowerId]
            }
        })
        setErrorMessage('')
        setSuccessMessage('')
    }

    const handleSelectAll = () => {
        if (selectedFlowerIds.length === householdFlowers.length) {
            setSelectedFlowerIds([])
        } else {
            setSelectedFlowerIds(householdFlowers.map(flower => flower._id || ''))
        }
        setErrorMessage('')
        setSuccessMessage('')
    }

    const handleHouseholdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTargetHouseholdId(e.target.value)
        setErrorMessage('')
        setSuccessMessage('')
    }

    const handleTransplant = async () => {
        if (selectedFlowerIds.length === 0) {
            setErrorMessage('Vyberte aspoň jednu kvetinu na presun')
            return
        }

        if (!targetHouseholdId) {
            setErrorMessage('Vyberte cieľovú domácnosť')
            return
        }

        setIsProcessing(true)
        setErrorMessage('')

        try {
            await dispatch(transplantFlowersToHousehold({ flowerIds: selectedFlowerIds, targetHouseholdId })).unwrap()

            setSuccessMessage(
                selectedFlowerIds.length === 1
                    ? 'Kvetina bola úspešne presunutá do vybranej domácnosti'
                    : `${selectedFlowerIds.length} kvetín bolo úspešne presunutých do vybranej domácnosti`,
            )

            setSelectedFlowerIds([])
            setTargetHouseholdId('')
        } catch (error) {
            setErrorMessage('Nastala chyba pri presune kvetín')
            console.error('Transplant error:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCancel = () => {
        navigate(`/household/${householdId}/flowers`)
    }

    if (flowersLoading || householdsLoading) {
        return <Loader />
    }

    return (
        <div className="transplant-flower-container">
            <H2 variant="secondary" className="main-title">
                Presunúť kvetiny do inej domácnosti
            </H2>

            {(flowersError || householdsError) && <p className="error-message">{flowersError || householdsError}</p>}

            <div className="transplant-form">
                <div className="form-group">
                    <label>Vyberte kvetiny na presun</label>
                    <div className="select-all-container">
                        <label className="select-all-label">
                            <input
                                type="checkbox"
                                checked={selectedFlowerIds.length === householdFlowers.length}
                                onChange={handleSelectAll}
                                disabled={isProcessing || householdFlowers.length === 0}
                            />
                            Vybrať všetky
                        </label>
                    </div>
                    <div className="flowers-list">
                        {householdFlowers.map((flower: Flower) => (
                            <label key={flower._id} className="flower-item">
                                <input
                                    type="checkbox"
                                    checked={selectedFlowerIds.includes(flower._id || '')}
                                    onChange={() => handleFlowerSelect(flower._id || '')}
                                    disabled={isProcessing}
                                />
                                <span>{flower.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Vyberte cieľovú domácnosť</label>
                    <select
                        value={targetHouseholdId}
                        onChange={handleHouseholdChange}
                        disabled={isProcessing || eligibleHouseholds.length === 0}>
                        <option value="">-- Vyberte domácnosť --</option>
                        {eligibleHouseholds.map((household: Household) => (
                            <option key={household.id} value={household.id}>
                                {household.name}
                            </option>
                        ))}
                    </select>
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}

                <div className="button-group">
                    <Button
                        variant="default"
                        onClick={handleTransplant}
                        disabled={isProcessing || selectedFlowerIds.length === 0 || !targetHouseholdId}>
                        {isProcessing ? 'Presúva sa...' : `Presunúť ${selectedFlowerIds.length} kvetín`}
                    </Button>
                    <Button variant="warning" onClick={handleCancel} disabled={isProcessing}>
                        Zrušiť
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default TransplantFlower
