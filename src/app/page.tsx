"use client";

import { Roboto } from "next/font/google";
import grid from '@/../public/grid.svg'
import essaySplash from '../../public/essaySplash.png';
import LAMSplash from '../../public/LAMSplash.png';
import brainSplash from '../../public/leftRightSplash.png';
import analyzeSplash from '../../public/analyzeSplash.png';
import scriptSplash from '../../public/ScriptSplash.png';
import codingSelfSupervised from '../../public/codingSelfSupervisedSplash.png';
import translateSplash from '../../public/translateSplash.png';
import easyai from '../../public/easyai.png';
import KeyConstants from "@/components/key_constants";
import { useEffect, useState } from "react";

const roboto = Roboto({ weight: '300', preload: false });

export default function Home() {
    const [windowDimensions, setWindowDimensions] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
    const firebaseConfig = KeyConstants()["firebase_config"];
    const firebaseScript = `
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
    `;

    useEffect(() => {
        const handleResize = () => { setWindowDimensions({ width: window.innerWidth, height: window.innerHeight }) };
        handleResize();
        window.addEventListener('resize', handleResize);

        const script = document.createElement("script");
        script.innerHTML = firebaseScript;
        script.type = "module";
        document.head.appendChild(script);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div 
            className="min-h-fit h-fit relative flex flex-col items-center"
            style={{
                backgroundImage: `url(${grid.src})`,
                backgroundSize: "400px"
            }}
        >
            <div className="w-full h-fit py-4 bg-gray-900 z-20 text-white">
                <h1 className={`text-4xl font-semibold ${roboto.className} text-center`}>FORGOT AI</h1>
                <h2 className={`text-xl ${roboto.className} text-center`}>Independently developed AI tools that don't take peoples' jobs - by Kai</h2>
            </div>
            <div 
                className="w-[100%] h-[100%] absolute z-10"
                style={{
                    background: "linear-gradient(165deg, rgba(212, 228, 250, 0.7), rgba(212, 228, 250, 0.65), rgba(212, 228, 250, 0.2))"
                }}
            />
            <div className="w-full max-w-4xl p-4 z-20">
                <p className="text-center mb-8">
                AI is moving so fast. Lets just... slow down. AI has a lot of potential, and we're using it it to make these massive systems, but here are some of the smaller, quality-of-life AI tools that the big companies just forgot to make. I have tools like a GPT-powered writing reviewer/proofreader, a video redubber, a (theoretically) HIPAA-compliant natural-language analytics tool, and I also have a bunch of cool ideas for future projects. <br/> I'll be making all these projects open-source and allowing contributions on GitHub, and maybe at some point I'll add forms. All the site art is original, created by me. Happy browsing!                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
                    <Card title="AI Writing Reviewer" image={essaySplash.src} link="./writing_reviewer" />
                    <Card title="Large Action Model POC" image={LAMSplash.src} link="./actions" />
                    <Card title="Video Translator/Redubber" image={translateSplash.src} link="https://github.com/KaiSereni/Video-Translator" />
                    <Card title="Natural Language Analytics POC" image={analyzeSplash.src} link="./analytics" />
                    <Card title="OS Assistant POC" image={scriptSplash.src} link="https://github.com/KaiSereni/os-assistant" />
                    <Card title="Customizable Neural Network Trainer" image={easyai.src} link="https://github.com/KaiSereni/easyai" />
                    <Card title="Self-supervised coding language model fine tune - WIP" image={codingSelfSupervised.src} link="#" />
                    <Card title="Left and Right Brain Neural Network - WIP" image={brainSplash.src} link="#" />
                </div>
            </div>
        </div>
    );
}

function Card({ title, image, link }: { title: string, image: string, link: string }) {
    return (
        <div className="bg-white rounded-lg overflow-hidden cursor-pointer hover:shadow border border-gray-500 duration-200" onClick={() => window.open(link, '_blank')}>
            <img src={image} alt={title} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
        </div>
    );
}
