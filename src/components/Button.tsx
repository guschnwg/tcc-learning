import React, { useContext } from "react";
import clickSound from "../click-2.wav";
import { ConfigContext } from "./Config";

type Props = JSX.IntrinsicElements["button"]

const click = new Audio(clickSound);
click.load();

const Button: React.FC<Props> = ({ children, className, ...props }) => {
    const { mute } = useContext(ConfigContext);

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        if (!mute) click.play();
        if (props.onClick) props.onClick(event)
    }

    return (
        <button {...props} className={`button ${className}`} onClick={handleClick}>
            {children}
        </button>
    )
}

export default Button;