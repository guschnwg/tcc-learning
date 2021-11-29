import React from "react"
import CSS from 'csstype';


interface Props {
    color?: CSS.Property.Color
}

const Spinner: React.FC<Props> = ({ color = "white" }) => {
    return (
        <div className="spinner" style={{ borderColor: color }} >
            <div style={{ borderColor: color }} />
            <div style={{ borderColor: color }} />
        </div>
    )
}

export default Spinner