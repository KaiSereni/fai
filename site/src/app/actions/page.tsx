"use client";

import { set } from 'firebase/database';
import React, { useState, useRef } from 'react';

export default function Actions() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [possibleCommands, setPossibleCommands] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const sendAudio = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('commands', JSON.stringify(possibleCommands));

    try {
      const response = await fetch('https://us-central1-forgotaifb.cloudfunctions.net/voiceCommand', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      response.json().then(j => {setResponseData(j.data)});
      console.log('Success:', responseData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='absolute w-full h-full bg-blue-100'>
      <div className='w-full h-fit block my-4'>
        <h1 className='text-2xl font-bold w-full justify-center items-center text-center'>Voice Commands</h1>
        <p className='w-full justify-center items-center text-center'>If Apple won't make Siri good, I'll do it myself</p>
      </div>
      <div className='bg-white p-4 flex space-x-4 min-h-[50vh]'>
        <div className='relative w-1/4'>
            <div className='mb-2'>
              1. Define a list of the possible functions that the user can request. Type a command and press enter to add it to the list. Ex: turn on the kitchen light, play music, etc.
            </div>
            <div>
              <input type='text' className='w-full mb-1' placeholder='Enter a command' onKeyUp={(e) => {
                if (e.key.toLowerCase() === 'enter') {
                  setPossibleCommands([...possibleCommands, e.currentTarget.value]);
                  e.currentTarget.value = '';
                }
              }} />
            </div>
            <div>
              <ul className='list-disc list-inside'>
                {possibleCommands.map((command, index) => (
                  <li key={index}>{command}</li>
                ))}
              </ul>
            </div>
            <button className='absolute py-1 px-2 rounded-lg shadow-lg duration-100 bg-gray-100 hover:bg-gray-200 bottom-0' onClick={() => {
              setPossibleCommands([]);
            }}>
              Clear command list
            </button>
        </div>
        <div className='block space-y-4'>
          <div>
            <button onClick={recording ? stopRecording : startRecording} disabled={possibleCommands.length < 2} className='p-4 rounded-lg shadow-lg duration-100 bg-gray-100 enabled:hover:bg-gray-200 disabled:text-gray-400'>
              {recording ? 'Stop Recording' : audioBlob ? 'Re-record voice command' : '2. Record a voice command'}
            </button>
          </div>
          <div>
            <button onClick={sendAudio} disabled={!audioBlob || possibleCommands.length < 2} className='p-4 rounded-lg shadow-lg duration-100 bg-gray-100 enabled:hover:bg-gray-200 disabled:text-gray-400'>
              3. Analyze Audio
            </button>
          </div>
          {audioBlob && (
            <div>
              <audio controls src={URL.createObjectURL(audioBlob)}></audio>
            </div>
          )}
          {
            responseData &&
            <div style={{whiteSpace: "pre-wrap"}}>
              {responseData}
            </div>
          }
        </div>
      </div>
    </div>
  );
};
