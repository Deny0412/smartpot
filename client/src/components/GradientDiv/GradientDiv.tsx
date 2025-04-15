import React, { ReactNode } from 'react'
import './GradientDiv.sass'

interface GradientDivProps {
    children: ReactNode
    className?: string
}

const GradientDiv: React.FC<GradientDivProps> = ({ children, className = '' }) => {
    return <div className={`gradient-container ${className}`}>{children}</div>
}

export default GradientDiv
