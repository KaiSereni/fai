"use client";

import { Roboto } from "next/font/google";
import grid from '../../public/grid.png'
import essaySplash from '../../public/essaySplash.png'
import LAMSplash from '../../public/LAMSplash.png'
import brainSplash from '../../public/leftRightSplash.png'
import clsx from "clsx";
import { useEffect, useState } from "react";

const roboto = Roboto({ weight: '300', preload: false});

export default function Home() {

    const [windowDimensions, setWindowDimensions] = useState<{width: number, height: number}>({width: 0, height: 0});

    useEffect(() => {
        function handleResize() {
            setWindowDimensions({width: window.innerWidth, height: window.innerHeight});
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [])

    return (
        <>
            <div className="absolute block bg-gradient-to-br from-blue-400 to-blue-200 w-full h-[180vh]">
                <div className="absolute h-[100vh] block top-0 left-0 flex justify-center items-center">
                    <img className="h-[98%] opacity-20" src={grid.src}/>
                </div>
                <div className="w-full mt-16 flex items-center justify-center">
                    <h1 className={`text-7xl font-semibold ${roboto.className}`}>FORGOT AI</h1>
                </div>
                <div className="w-full flex items-center justify-center">
                    <h1 className={`text-3xl font-semibold ${roboto.className}`}>By Kai</h1>
                </div>
                <div className={windowDimensions.width > 1000 ? "flex h-[80%]" : "block h-full"}>
                    <div className={clsx("w-full p-5", [windowDimensions.width > 1000 && "pl-16"])}>
                        <div className="h-[6.9%]">

                        </div>
                        <div className="font-semibold text-xl text-center mb-2">
                            ForgotAI.com - Independently Developed AI Tools
                        </div>
                        <div className={clsx("text-lg leading-7", [windowDimensions.width > 1000 ? "text-start" : 'text-center'])}>
                            A bunch of AI-related projects and tools that the big AI companies forgot about. Still trying to make the domain name work. Anyway, I have things like a GPT-powered writing reviewer (not a writing rewriter, not a ghostwriter, just a writing reviewer), and I also have a bunch of cool ideas for future projects. <br/> I'll be making all these projects open-source and allowing contributions on GitHub, and maybe at some point I'll add forms. Happy browsing!
                        </div>
                    </div>
                    <div className={clsx("block items-center justify-center text-center", [windowDimensions.width < 1000 ? "width-full" : "w-[40%] mr-16"])}>
                        <div className={clsx("w-full mt-8 space-y-3 justify-center items-center", [windowDimensions.width > 1000 ? "block" : "flex"])}>
                            <div className="flex w-full h-fit items-center justify-center">
                                <div className="p-1 w-16 h-16">
                                    <img src="https://seeklogo.com/images/G/github-logo-7880D80B8D-seeklogo.com.png" className="w-full h-full rounded-full border-2 border-black shadow-xl cursor-pointer duration-200 hover:scale-105" onClick={() => {window.open('https://github.com/KaiSereni/fai', 'blank')}}/>
                                </div>
                            </div>
                            <div className="max-w-full mx-2 rounded-lg bg-blue-400 shadow-md duration-200 cursor-pointer hover:scale-[101%] hover:shadow-lg" onClick={() => {window.open('./writing_reviewer')}}>
                                <div className="p-1">
                                    AI Essay Reviewer - Available Now! (Click Here)
                                </div>
                                <img src={essaySplash.src} className="rounded-lg"/>
                            </div>
                            <div className="max-w-full mx-2 rounded-lg bg-blue-400 shadow-md duration-200 cursor-pointer hover:scale-[101%] hover:shadow-lg">
                                <div className="p-1">
                                    WIP - Large Action Model
                                </div>
                                <img src={LAMSplash.src} className="rounded-lg"/>
                            </div>
                            <div className="max-w-full mx-2 rounded-lg bg-blue-400 shadow-md duration-200 cursor-pointer hover:scale-[101%] hover:shadow-lg">
                                <div className="p-1">
                                    Future project - left and right brain neural network
                                </div>
                                <img src={brainSplash.src} className="rounded-lg"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fixed bottom-4 left-4">
                    © Pohakoo, LLC
                </div>
            </div>
        </>
    )
}
