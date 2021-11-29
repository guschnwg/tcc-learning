import React from "react";
import clickSound from "../click-2.wav";

type Props = JSX.IntrinsicElements["button"]

const click = new Audio(clickSound);
click.load();

const Button: React.FC<Props> = ({ children, ...props}) => {
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        click.play();   

        if (props.onClick) {
            props.onClick(event);
        }
    }

    return (
        <button {...props} onClick={handleClick}>
            {children}
        </button>
    )
}

export default Button;