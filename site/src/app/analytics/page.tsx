"use client";

import { useState } from "react";

export default function AutoAnalytics() {
    const [userPrompt, setUserPrompt] = useState("");
    const [selectedAPI, setSelectedAPI] = useState<undefined | "Temperature" | "Stock prices" | "Humidity" | "Sea Level">(undefined);
    const [promptOptions, setPromptOptions] = useState<{"lat": string, "lon": string} | {"symbol": string} | {}>({});
    const [analyticsOutput, setAnalyticsOutput] = useState<undefined | any>();

    const sendPrompt = async () => {
        try {
            // If user didn't select an API, return
            if (selectedAPI === undefined) {
                return;
            }
            // If user didn't enter a prompt, return
            if (userPrompt.trim() === "") {
                return;
            }
            // If user entered coordinates, check if they are valid
            if (selectedAPI === "Temperature" || selectedAPI === "Humidity" || selectedAPI === "Sea Level") {
                if (promptOptions !== undefined && "lat" in promptOptions && "lon" in promptOptions) {
                    if (isNaN(parseFloat(promptOptions["lat"])) || isNaN(parseFloat(promptOptions["lon"]))) {
                        return;
                    }
                }
            }
            fetch(
                "https://us-central1-forgotaifb.cloudfunctions.net/analytics",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "api_name": selectedAPI,
                        "prompt": userPrompt,
                        "options": promptOptions
                    })
                }
            )
            .then((response) => response.json())
            .then((j) => j["result"])
            .then((data) => {
                setAnalyticsOutput(data);
            })
        }
        catch (error) {
            console.log("error getting corrections");
            console.error(error);
        }
    }

    return (
        <div className='absolute w-full h-full bg-blue-100'>
          <div className='w-full h-fit block my-4'>
            <h1 className='text-2xl font-bold w-full justify-center items-center text-center'>Natural Language Database Analysis</h1>
            <p className='w-full justify-center items-center text-center'>Get stats and analytics for a database of any size, without the content of the data base ever being sent to an LLM, all with natural language</p>
          </div>
          <div className='bg-white p-4 flex space-x-8 min-h-[50vh]'>
            <div className="block max-w-[25vw]">
                <div className="font-bold">
                    1. Select demo API
                </div>
                <div>
                    I have a list of demo APIs that you can use to test the analytics. The model will run analytics on real-time data for your selected topic. Select one of them to get started.
                </div>
                <div>
                    <select
                        value={selectedAPI}
                        onChange={(e) => setSelectedAPI(e.target.value as ("Temperature" | "Stock prices" | "Humidity" | "Sea Level"))}
                        className="mt-2 block w-full border-gray-300 rounded-md shadow-sm mb-8 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">Select an API</option>
                        <option value="Temperature">Temperature</option>
                        <option value="Stock prices">Stock prices</option>
                        <option value="Humidity">Humidity</option>
                        <option value="Sea Level">Sea Level</option>
                    </select>
                    {(selectedAPI === "Temperature" || selectedAPI === "Humidity" || selectedAPI === "Sea Level") && (
                        <div className="mt-4">
                            <div className="font-bold">
                                Optional: Enter coordinates
                            </div>
                            <div>
                                Enter the coordinates of the location for the weather data. If you leave this blank, the model will default to NYC.
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={""}
                                    onChange={(e) => {
                                        setPromptOptions({ ...promptOptions, lat: e.target.value })
                                    }}
                                    placeholder="Latitude"
                                    className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <input
                                    type="text"
                                    value={""}
                                    onChange={(e) => setPromptOptions({ ...promptOptions, lon: e.target.value })}
                                    placeholder="Longitude"
                                    className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {selectedAPI === "Stock prices" && (
                        <div className="mt-4">
                            <div className="font-bold">
                                Optional: Enter stock symbol
                            </div>
                            <div>
                                Please enter the stock symbol for the company you want to get the stock prices for. If you don't enter anything, it will default to IBM.
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={""}
                                    onChange={(e) => {
                                        if (e.target.value.trim() !== "") {
                                            setPromptOptions({ ...promptOptions, symbol: e.target.value });
                                        }
                                    }}
                                    placeholder="Stock Symbol"
                                    className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="block max-w-[25vw]">
                <div className="font-bold">
                    2. Enter prompt
                </div>
                <div>
                    Enter a question about the data returned by the API. The API will return metric units, but can convert if you ask it to. The data is real-time, but it will only go back a few days. The frequency of the data also varies.
                    <br/>Ex: "What is the average temperature?"
                </div>
                <div>
                    <textarea
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="Enter prompt here"
                        className="mt-2 p-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>
            <div className="block max-w-[25vw]">
                <div className="font-bold">
                    3. Get analytics
                </div>
                <div>
                    Click the button below to get the analytics for the prompt you entered. The model will return the answer to your question in a few seconds. It will also send back the data that was analyzed in the request, which you can view in the network inspector.
                </div>
                <div>
                    <button
                        onClick={sendPrompt}
                        className="mt-2 p-2 bg-blue-500 text-white rounded-md shadow-sm (AI generated this button and I love it)"
                    >
                        Get analytics
                    </button>
                </div>
                {
                    analyticsOutput !== undefined && (
                        <div className="mt-4">
                            <div className="font-bold">
                                Output
                            </div>
                            <div>
                                {JSON.stringify(analyticsOutput)}
                            </div>
                        </div>
                    )
                }
            </div>
          </div>
        </div>
      );
}