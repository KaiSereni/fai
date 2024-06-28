"use client";

import { useEffect, useState } from 'react';
import arrow from '../../public/arrow.png'

export default function Nav() {
    const [path, setPath] = useState('');
    useEffect(() => {
        setPath(window.location.href);
    }, [])

    return (
        !(path.endsWith('.com') || path.endsWith(':3000') || path.endsWith('.com/') || path.endsWith(':3000/')) &&
        <div className="flex w-full h-12 bg-black text-white items-center pl-2">
            <div className='flex items-center space-x-2 cursor-pointer hover:scale-105 duration-200' onClick={()=>{window.location.href = '../'}}>
                <img src={arrow.src} style={{filter: 'invert(1)'}} className='h-4'/>
                <div className="font-semibold">
                    Home
                </div>
            </div>
        </div>
    )
}