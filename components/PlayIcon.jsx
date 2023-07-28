import { BsPlayFill } from "react-icons/bs";

export const PlayIcon = ({ size = 20, width, height, ...props }) => (
    
    <svg stroke="currentColor" strokeWidth="0" viewBox="0 0 16 16"xmlns="http://www.w3.org/2000/svg"
     width={size || width}
     aria-hidden="true"
    fill="none"
    focusable="false"
    height={size || height}
    role="presentation"
    {...props}
    
    >
        <BsPlayFill />
    </svg>

);