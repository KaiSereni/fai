"use client";

import wheel from "./loadingSpinner.png"

type Props = {
    size?: number
    isBlack?: boolean
}

export default function Spinner({size, isBlack = false}: Props) {
    const s = size || 25

    return (
        <img src={wheel.src} className={"relative spinner"} style={{
            width: s, 
            height: s,
            filter: isBlack ? "unset" : "invert(1)",
            animation: "spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite"
        }}/>
    )
}