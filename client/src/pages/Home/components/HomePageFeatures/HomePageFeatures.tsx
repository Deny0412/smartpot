import React from 'react'
import GradientDiv from '../../../../components/GradientDiv/GradientDiv'
import { H4, H5 } from '../../../../components/Text/Heading/Heading'
import { Paragraph } from '../../../../components/Text/Paragraph/Paragraph'
import './HomePageFeatures.sass'

const HomePageFeatures: React.FC = () => {
    const dataFeatures = [
        {
            title: 'New feature',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam at magna vitae augue feugiat aliquam.',
        },
        {
            title: 'New feature 2',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam at magna vitae augue feugiat aliquam.',
        },
        {
            title: 'New feature 3',
            description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam at magna vitae augue feugiat aliquam.',
        },
    ]

    return (
        <div className="features-main-container">
            <H4 className="features-title" variant="primary">
                Features
            </H4>
            <div className="features-container">
                {dataFeatures.map((feature, index) => (
                    <GradientDiv key={index} className="feature-item">
                        <H5 variant="primary" className="feature-title">
                            {feature.title}
                        </H5>
                        <Paragraph variant="secondary" size="sm" className="feature-description">
                            {feature.description}
                        </Paragraph>
                    </GradientDiv>
                ))}
            </div>
        </div>
    )
}

export default HomePageFeatures
