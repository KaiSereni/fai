"use client";

import { Roboto } from "next/font/google";
import grid from '../../public/grid.png'
import essaySplash from '../../public/essaySplash.png'
import LAMSplash from '../../public/LAMSplash.png'
import brainSplash from '../../public/leftRightSplash.png'
import analyzeSplash from '../../public/analyzeSplash.png'
import scriptSplash from '../../public/ScriptSplash.png'
import translateSplash from '../../public/translateSplash.png'
import KeyConstants from "@/components/key_constants";
import { useEffect, useState } from "react";

const roboto = Roboto({ weight: '300', preload: false});

export default function Home() {

    const [windowDimensions, setWindowDimensions] = useState<{width: number, height: number}>({width: 0, height: 0});
    const firebaseConfig = KeyConstants()["firebase_config"];
    const firebaseScript =  `
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";

        const firebaseConfig = {
            apiKey: "${firebaseConfig.apiKey}",
            authDomain: "${firebaseConfig.authDomain}",
            projectId: "${firebaseConfig.projectId}",
            storageBucket: "${firebaseConfig.storageBucket}",
            messagingSenderId: "${firebaseConfig.messagingSenderId}",
            appId: "${firebaseConfig.appId}",
            measurementId: "${firebaseConfig.measurementId}"
        };

        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
    `

    useEffect(() => {
        const handleResize = () => {setWindowDimensions({width: window.innerWidth, height: window.innerHeight})}
        handleResize();
        window.addEventListener('resize', handleResize);
        
        const script = document.createElement("script")
        script.innerHTML = firebaseScript;
        console.log(script.innerHTML)
        script.type = "module"
        document.head.appendChild(script);
        return () => window.removeEventListener('resize', handleResize);
    }, [])

    return (
        <>
            <div className="absolute block bg-gradient-to-br from-blue-100 to-blue-300 w-full h-fit min-h-full pb-16 min-w-[320px]">
                <div className="absolute h-[100vh] block top-0 left-0 flex justify-center items-center pointer-events-none">
                    <img className="h-[98%] opacity-20" src={grid.src} alt="Background grid"/>
                </div>
                <div className="w-full mt-8 sm:mt-16 flex items-center justify-center">
                    <h1 className={`text-4xl sm:text-7xl font-semibold ${roboto.className} text-center`}>FORGOT AI</h1>
                </div>
                <div className="w-full flex items-center justify-center">
                    <h1 className={`text-xl sm:text-3xl font-semibold ${roboto.className}`}>By Kai</h1>
                </div>
                <div className={"block h-full"}>
                    <div className={"w-full p-3 sm:p-5"}>
                        <div className="h-[3%] sm:h-[6.9%]">

                        </div>
                        <div className="font-semibold text-lg sm:text-xl text-center mb-2">
                            ForgotAI.com - Independently Developed AI Tools<br/>that don't take peoples' jobs
                        </div>
                        <div className={"text-base sm:text-lg leading-6 sm:leading-7 text-center"}>
                            A bunch of AI-related projects and tools that the big AI companies forgot about. I have tools like a GPT-powered writing reviewer (not a rewriter, not a ghostwriter, just a reviewer), and I also have a bunch of cool ideas for future projects. <br/> I'll be making all these projects open-source and allowing contributions on GitHub, and maybe at some point I'll add forms. Happy browsing!
                        </div>
                    </div>
                    <div className={"block items-center justify-center text-center width-full"}>
                        <div className={"w-full mt-4 sm:mt-8 space-y-3 justify-center items-center flex flex-wrap"}>
                            <div className="w-full sm:w-auto max-w-64 min-w-32 mx-2 my-2 sm:my-0 rounded-lg bg-blue-400 shadow duration-200 cursor-pointer hover:scale-[101%] hover:shadow-lg" onClick={() => {window.open('./writing_reviewer')}}>
                                <div className="p-1 text-sm sm:text-base">
                                    AI Writing Reviewer - Available Now! (Click Here)
                                </div>
                                <img src={essaySplash.src} className="rounded-lg w-full" alt="Writing Reviewer"/>
                            </div>
                            <div className="w-full sm:w-auto max-w-64 min-w-32 mx-2 my-2 sm:my-0 rounded-lg bg-blue-400 shadow duration-200 cursor-pointer hover:scale-[101%] hover:shadow-lg" onClick={() => {window.open('./actions')}}>
                                <div className="p-1 text-sm sm:text-base">
                                    Large Action Model POC - Available Now! (Click Here)
                                </div>
                                <img src={LAMSplash.src} className="rounded-lg w-full" alt="Large Action Model"/>
                            </div>
                            <div className="w-full sm:w-auto max-w-64 min-w-32 mx-2 my-2 sm:my-0 rounded-lg bg-blue-400 shadow duration-200 cursor-pointer hover:scale-[101%] hover:shadow-lg" onClick={() => {window.open('https://github.com/KaiSereni/Video-Translator', 'blank')}}>
                                <div className="p-1 text-sm sm:text-base">
                                    Video Translator/Redubber - Available Now! (Click Here)
                                </div>
                                <img src={translateSplash.src} className="rounded-lg w-full" alt="Video Translator"/>
                            </div>
                            <div className="w-full sm:w-auto max-w-64 min-w-32 mx-2 my-2 sm:my-0 rounded-lg bg-blue-400 shadow duration-200 cursor-pointer hover:scale-[101%] hover:shadow-lg" onClick={() => {window.open('./analytics')}}>
                                <div className="p-1 text-sm sm:text-base">
                                    Natural Language Analytics POC - Available Now! (Click Here)
                                </div>
                                <img src={analyzeSplash.src} className="rounded-lg w-full" alt="Natural Language Analytics"/>
                            </div>
                            <div className="w-full sm:w-auto max-w-64 min-w-32 mx-2 my-2 sm:my-0 rounded-lg bg-blue-400 shadow duration-200 cursor-pointer hover:scale-[101%] hover:shadow-lg" onClick={() => {window.open('https://github.com/KaiSereni/os-assistant')}}>
                                <div className="p-1 text-sm sm:text-base">
                                    Natural Language OS Assistant POC - Available Now! (Click Here)
                                </div>
                                <img src={scriptSplash.src} className="rounded-lg w-full" alt="OS Assistant"/>
                            </div>
                            <div className="w-full sm:w-auto max-w-64 min-w-32 min-h-48 mx-2 my-2 sm:my-0 rounded-lg bg-blue-400 shadow duration-200 cursor-pointer hover:scale-[101%] hover:shadow-lg">
                                <div className="p-1 text-sm sm:text-base">
                                    Self-checking code writer - WIP
                                </div>
                            </div>
                            <div className="w-full sm:w-auto max-w-64 min-h-48 min-w-32 mx-2 my-2 sm:my-0 rounded-lg bg-blue-400 shadow duration-200 cursor-pointer hover:scale-[101%] hover:shadow-lg">
                                <div className="p-1 text-sm sm:text-base">
                                    Customizable neural network trainer - WIP
                                </div>
                            </div>
                            <div className="w-full sm:w-auto max-w-64 min-w-32 mx-2 my-2 sm:my-0 rounded-lg bg-blue-400 shadow duration-200 cursor-pointer hover:scale-[101%] hover:shadow-lg">
                                <div className="p-1 text-sm sm:text-base">
                                    Left and right brain neural network - WIP
                                </div>
                                <img src={brainSplash.src} className="rounded-lg w-full" alt="Brain Neural Network"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
