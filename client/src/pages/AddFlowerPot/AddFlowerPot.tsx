import React from 'react'
import { useTranslation } from 'react-i18next'
import flower_ilustration from '../../assets/grey_flower.png'
import Button from '../../components/Button/Button'
import { H2, H3 } from '../../components/Text/Heading/Heading'
import { Paragraph } from '../../components/Text/Paragraph/Paragraph'
import { TranslationFunction } from '../../i18n'
import './AddFlowerPot.sass'

const AddFlowerPot: React.FC = () => {
    const { t } = useTranslation() as { t: TranslationFunction }
    return (
        <div className="add-flower-pot-container">
            <div className="step-container">
                <H2 variant="primary">{t('add_flowerpot.title')}</H2>
                <Paragraph variant="secondary" size="xl">
                    {t('add_flowerpot.description')}
                </Paragraph>
                <form onSubmit={() => {}} className="form">
                    <div className="form-group">
                        <label>{t('add_flowerpot.serial_number')}</label>
                        <input type="text" value={''} onChange={() => {}} placeholder="1234567" required />
                    </div>
                    <Button variant="default">{t('add_flowerpot.connect')}</Button>

                    <div className="help-section">
                        <H3 variant="primary">{t('add_flowerpot.help_title')}</H3>
                        <div className="help-content">
                            <ol className="help-steps">
                                <li>{t('add_flowerpot.help_steps.0')}</li>
                                <li>{t('add_flowerpot.help_steps.1')}</li>
                                <li>{t('add_flowerpot.help_steps.2')}</li>
                            </ol>
                            <img src={flower_ilustration} alt="flower" />
                        </div>
                    </div>

                    <Button variant="default" onClick={() => {}}>
                        Ďalší krok
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default AddFlowerPot
