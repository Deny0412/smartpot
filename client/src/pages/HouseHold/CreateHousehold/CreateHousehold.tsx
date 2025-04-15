import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TranslationFunction } from '../../../i18n'
import './CreateHousehold.sass'
import { H2 } from '../../../components/Text/Heading/Heading'
import { Paragraph } from '../../../components/Text/Paragraph/Paragraph'
import GradientDiv from '../../../components/GradientDiv/GradientDiv'
import Button from '../../../components/Button/Button'


const CreateHousehold: React.FC = () => {
    const { t } = useTranslation() as { t: TranslationFunction }
    return (
        <div className="manage-household-container">
            <H2 variant="secondary" className="create-household-title">
                {t('create_household.title')}
            </H2>
            <Paragraph variant="primary" size="md" className="create-household-description">{t('create_household.description')}</Paragraph>

            <GradientDiv className="create-household-form">
                
                    <input type="text" placeholder={t('create_household.input')} />
                    <Button variant="default" className="create-household-button">{t('create_household.button')}</Button>
                
            </GradientDiv>

        </div>
    )
}

export default CreateHousehold
