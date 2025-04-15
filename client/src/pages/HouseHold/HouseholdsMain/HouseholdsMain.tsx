import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/Button/Button'
import Loader from '../../../components/Loader/Loader'
import { H2 } from '../../../components/Text/Heading/Heading'
import { Paragraph } from '../../../components/Text/Paragraph/Paragraph'
import { TranslationFunction } from '../../../i18n'
import { clearError, loadHouseholds } from '../../../redux/slices/householdsSlice'
import { AppDispatch, RootState } from '../../../redux/store/store'
import HouseHoldItem from '../components/HouseHoldItem/HouseHoldItem'
import './HouseholdsMain.sass'

const HouseholdsMain: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { households, loading, error } = useSelector((state: RootState) => state.households)
    const token = localStorage.getItem('token')
    const emptyHousehold = !Array.isArray(households) || households.length === 0
    const navigate = useNavigate()
    const { t } = useTranslation() as { t: TranslationFunction }
    const [newHouseholdName, setNewHouseholdName] = useState('')

    useEffect(() => {
        if (emptyHousehold && token) {
            dispatch(loadHouseholds())
        }
    }, [dispatch, emptyHousehold, token])

    const handleCloseError = () => {
        dispatch(clearError())
    }

    return (
        <div className="house-holds-main-container">
            <H2 variant="secondary" className="main-title">
                {t('households.households_list.title')}
            </H2>

            {loading && <Loader />}

            <div className="households-list">
                {Array.isArray(households) && !emptyHousehold
                    ? households.map(
                          household =>
                              household && (
                                  <>
                                      <HouseHoldItem
                                          key={household.id}
                                          name={household.name}
                                          id={household.id}
                                          owner={household.owner}
                                          members={household.members}
                                      />
                                  </>
                              ),
                      )
                    : !loading && (
                          <>
                              <Paragraph variant="primary" size="md" className="no-households-text">
                                  {t('households.households_list.no_households')}
                              </Paragraph>
                          </>
                      )}
                <Button
                    variant="default"
                    className="create-household-button"
                    onClick={() => navigate('/create-household')}>
                    {t('households.households_list.actions.create_new')}
                </Button>
            </div>
        </div>
    )
}

export default HouseholdsMain
