import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/Button/Button'
import Loader from '../../../components/Loader/Loader'
import { H2 } from '../../../components/Text/Heading/Heading'
import { Paragraph } from '../../../components/Text/Paragraph/Paragraph'
import { TranslationFunction } from '../../../i18n'
import {
    selectHouseholds,
    selectHouseholdsError,
    selectHouseholdsLoading,
} from '../../../redux/selectors/houseHoldSelectors'
import { clearError, loadHouseholds } from '../../../redux/slices/householdsSlice'
import { AppDispatch } from '../../../redux/store/store'
import CreateHousehold from '../CreateHousehold/CreateHousehold'
import HouseHoldItem from '../components/HouseHoldItem/HouseHoldItem'
import './HouseholdsMain.sass'

const HouseholdsMain: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const households = useSelector(selectHouseholds)
    const loading = useSelector(selectHouseholdsLoading)
    const error = useSelector(selectHouseholdsError)
    const token = localStorage.getItem('token')
    const emptyHousehold = !Array.isArray(households) || households.length === 0
    const navigate = useNavigate()
    const { t } = useTranslation() as { t: TranslationFunction }
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    useEffect(() => {
        if (token) {
            console.log('Loading households...')
            dispatch(loadHouseholds())
        }
    }, [dispatch, token])

    const handleCloseError = () => {
        dispatch(clearError())
    }

    const handleCreateHousehold = () => {
        setIsCreateModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsCreateModalOpen(false)
    }

    const handleCreateSuccess = () => {
        setIsCreateModalOpen(false)
        dispatch(loadHouseholds())
    }

    return (
        <div className="house-holds-main-container">
            <H2 variant="secondary" className="main-title">
                {t('households.households_list.title')}
            </H2>

            {loading && <Loader />}

            <div className="households-list">
                {Array.isArray(households) && !emptyHousehold
                    ? households.map(household => (
                          <HouseHoldItem
                              key={household.id}
                              name={household.name}
                              id={household.id}
                              owner={household.owner}
                              members={household.members}
                          />
                      ))
                    : !loading && (
                          <Paragraph variant="primary" size="md" className="no-households-text">
                              {t('households.households_list.no_households')}
                          </Paragraph>
                      )}
                <Button variant="default" className="create-household-button" onClick={handleCreateHousehold}>
                    {t('households.households_list.actions.create_new')}
                </Button>
            </div>

            <CreateHousehold isOpen={isCreateModalOpen} onClose={handleCloseModal} onSuccess={handleCreateSuccess} />
        </div>
    )
}

export default HouseholdsMain
