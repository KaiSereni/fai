"use client";

import { useEffect, useState } from "react";
import Spinner from "@/components/spinner";
import clsx from "clsx";
import copy from '../../../public/copyClipboard.svg'
import KeyConstants from "@/components/key_constants";
import FAIButton from "@/components/button";

interface correctionsList {
    corrections: {
        prob: number;
        token: string;
    }[];
    word: string;
}

export default function Essay() {
    
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
        const script = document.createElement("script")
        script.innerHTML = firebaseScript;
        console.log(script.innerHTML)
        script.type = "module"
        document.head.appendChild(script);
    }, [])

    const [enteredText, setEnteredText] = useState<string>("");
    const [enteredTitle, setEnteredTitle] = useState<string>("");
    const [outputList, setOutputList] = useState<boolean | string | correctionsList[]>(false);
    const [clickedToken, setClickedToken] = useState<number | undefined>(undefined);

    useEffect(() => {
        const docClicked = (e : MouseEvent) => {
            if (!(e.target as HTMLElement).classList.contains("tooltip-click")) {
                setClickedToken(undefined);
            }
        }

        document.body.addEventListener('click', docClicked)
        return () => {
            document.body.removeEventListener('click', docClicked)
        }
    }, []);

    return (
        <div className="absolute block w-full h-full bg-gray-100">
            <div className="block h-min w-full text-2xl p-4 pl-6 justify-start items-center">
                <div className="font-bold">
                    AI Writing Reviewer Online
                </div>
                <div className="text-sm w-2/3 my-2">
                    Want to write stuff yourself, but have ChatGPT look over it before you click send? Use this tool to get detailed annotation showing which word choices AI likes and doesn't like. Click to get suggestions for alternate word choices. <br/> <div className="font-bold mt-1">How does it work?</div>Large Language Models (like ChatGPT) work by taking the text it already sent, and deciding what the next word should be. This process is repeated until you have a full response. For each word in your writing, this tool asks the GPT to predict that word based on the previous text. If it predicts the word you chose with a high confidence, that means the GPT thinks you made a good word choice.<br/>
                </div>
            </div>
            {
                // show if outputList is not a boolean value
                typeof outputList !== 'string' && typeof outputList !== 'boolean' &&
                <img 
                    src={copy.src}
                    className="relative mt-8 mb-2 ml-4 w-8 h-8 p-1 bg-blue-200 rounded-lg shadow cursor-pointer hover:scale-105 duration-200"
                    onClick={() => {
                        let allTokens = []
                        for (let i = 0; i < outputList.length; i++) {
                            let token = outputList[i]['word'];
                            allTokens.push(token);
                        }
                        navigator.clipboard.writeText(allTokens.join(" "))   
                    }}
                />
            }
            <div className="block h-full">
                {
                    outputList === true || outputList === false ?
                    <>
                        <textarea
                            name="essay-title"
                            className={clsx("w-full h-[2em] bg-gray-50 pl-4 py-1 shadow", [outputList !== false && "text-gray-700"])}
                            placeholder="Title/Context"
                            style={{resize: "none", accentColor: 'transparent', pointerEvents: outputList !== false ? "none" : 'unset', overflow: "hidden"}}
                            value={enteredTitle}
                            onInput={(ev) => {
                                const el = ev.target as HTMLTextAreaElement;
                                const input = el.value;
                                setEnteredTitle(input)
                            }}
                        />
                        <textarea 
                            name="essay-input"
                            className={clsx("w-full h-[50%] bg-gray-50 p-4 shadow", [outputList !== false && "text-gray-700"])} 
                            placeholder="Paste your writing here..." 
                            style={{resize: 'vertical', accentColor: 'transparent', pointerEvents: outputList !== false ? "none" : 'unset'}}
                            value={enteredText}
                            onInput={(ev) => {
                                const el = ev.target as HTMLTextAreaElement;
                                const input = el.value;
                                setEnteredText(input)
                            }}
                            
                        />
                    </>
                    :
                    typeof outputList === 'object' &&
                    <div className="relative flex min-h-[50%] w-full bg-white">
                        <div style={{flexWrap: 'wrap'}} className="relative flex h-min w-full wrap m-2">
                            {
                                outputList.map((value, index) => {
                                    let token = value["word"];
                                    let corrections = value["corrections"];

                                    if (token === "\n") {
                                        return <div key={index} style={{width: '100%'}}></div>
                                    }

                                    // get the highest confidence correction
                                    let confidence = 0;
                                    // Iterate over each correction
                                    for (const correction of corrections) {
                                        // Destructure the 'token' and 'prob' properties from the correction
                                        const { token: thisCorrection, prob: thisConfidence } = correction;

                                        // Trim and convert the correction token to lowercase
                                        const trimmedCorrection = thisCorrection.trim().toLowerCase();

                                        // Trim and convert the original token to lowercase
                                        const trimmedToken = token.trim().toLowerCase();

                                        // Check if the correction token includes the original token or if the original token starts with the correction token
                                        // Also check if the confidence of this correction is greater than the current confidence
                                        if ((trimmedCorrection.includes(trimmedToken) || trimmedToken.startsWith(trimmedCorrection)) && thisConfidence > confidence) {
                                            // If all conditions are met, update the confidence
                                            confidence = thisConfidence;
                                        }
                                    }

                                    return(

                                        <div 
                                            key={index} 
                                            style={{
                                                backgroundColor: confidence === 0 ? 'transparent' : `hsl(${Math.min(confidence, 100)} 90 60)`,
                                                whiteSpace:'pre',
                                            }} 
                                            className="h-min w-min cursor-pointer tooltip-click hover:scale-105 duration-200 mr-1 rounded"
                                            onClick={() => {
                                                setClickedToken(index);
                                            }}
                                        >
                                            {token}

                                            {
                                                clickedToken === index &&
                                                <div className="absolute block bg-blue-200 w-fit h-fit my-1 shadow rounded">
                                                    <div className="p-1">Agreement: {confidence}</div>
                                                    {corrections.map((correctionObject, correctionIndex) => {
                                                        if (correctionObject['prob'] < 0.1) {
                                                            return;
                                                        }
                                                        return (
                                                            <div className={clsx("p-1 cursor-pointer duration-200", [correctionObject['token'] === token && "font-extrabold"])} key={correctionIndex} style={{backgroundColor: `hsl(${Math.min(correctionObject['prob'], 100)} 90 60)`}}>
                                                                {correctionObject['token']}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                }
                <div className="w-full flex pl-4 space-x-2">
                    <div className="py-2">
                        <FAIButton
                            clickHandler={
                                () => {
                                    setOutputList(true);
                                    try {
                                        fetch(
                                            "https://us-central1-forgotaifb.cloudfunctions.net/correct",
                                            {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "Access-Control-Allow-Origin": "https://forgotai.com",
                                                },
                                                body: JSON.stringify({
                                                    "data":
                                                    {
                                                        "string": enteredText,
                                                        "context_title": enteredTitle
                                                    }
                                                })
                                            }
                                        )
                                        .then((response) => response.json())
                                        .then((j) => j["data"])
                                        .then((data) => {
                                            setOutputList(normalizeProbabilities(data));
                                        })
                                    }
                                    catch (error) {
                                        console.log("error getting correctionz");
                                        console.error(error);
                                        setOutputList('e');
                                    }
                                }
                        }
                        >
                            <div className="flex items-center justify-center">
                                {outputList === true && <Spinner/>}
                                {outputList === true ? <div className="ml-2">Calculating...</div> : outputList === false ? <div>Calculate</div> : outputList === 'e' ? <div>Server error. Try shortening the input.</div> : <div>Done!</div>}
                            </div>
                        </FAIButton>
                    </div>
                    <div className="py-2">
                        <FAIButton
                            style="secondary"
                            clickHandler={() => {
                                setOutputList(false);
                                setEnteredTitle("");
                                setEnteredText("");
                            }}
                        >
                            Clear workspace
                        </FAIButton>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Softmax function
function softmax(arr: number[]): number[] {
    const max = Math.max(...arr);
    const min = Math.min(...arr);
    return arr.map((value) => ((value - min) / (max - min)) * 100);
}

// Main function
function normalizeProbabilities(lists: correctionsList[]): correctionsList[] {
    return lists.map((list) => {
        const probs = list.corrections.map((correction) => correction.prob);
        const softmaxProbs = softmax(probs);
        const normalizedCorrections = list.corrections.map((correction, index) => ({
            ...correction,
            prob: softmaxProbs[index],
        }));
        return { ...list, corrections: normalizedCorrections };
    });
}