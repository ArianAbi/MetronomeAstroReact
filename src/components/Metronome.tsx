import { useState, useEffect, type ChangeEvent } from 'react';
import rideSample from '/samples/ride/ride-sample.mp3';
import rideSampleAccent from '/samples/ride/ride-sample-accent.wav';

export default function Metronome() {
  const minTempo = 20;
  const maxTempo = 320;

  const [metronome, setMetronome] = useState<null | number>(null);
  const [pendulumWeightPosition, setPendulumWeightPosition] = useState(0);
  const [tickCount, setTickCount] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [bars, setBars] = useState(0);
  const [timeSigniture, setTimeSignuture] = useState(4);
  const [accelerando, setAccelerando] = useState(0);

  const [metronomeSound, setMetronomeSound] = useState<HTMLAudioElement>();
  const [metronomeAccentSound, setMetronomeAccentSound] =
    useState<HTMLAudioElement>();

  const secondInMs = 60000;
  const tickDuration = secondInMs / tempo;

  //set the audios
  useEffect(() => {
    setMetronomeSound(new Audio(rideSample));
    setMetronomeAccentSound(new Audio(rideSampleAccent));
  }, []);

  //on tempo or time signuture change update the interval and swing-animation duration
  useEffect(() => {
    // calculate pendulum position
    const ratio = 0.7;
    setPendulumWeightPosition(((tempo * 100) / maxTempo) * ratio);

    // update the swing animation
    document.documentElement.style.setProperty(
      '--swing-duration',
      `${tickDuration}ms`,
    );

    // reset the metronome
    if (metronome) {
      clearInterval(metronome);
      setMetronome(setInterval(tickMetronome, tickDuration));
    }
  }, [tempo, timeSigniture]);

  function toggleMetronome() {
    //start if we dont have a metronome
    if (!metronome) {
      setBars(0);
      setMetronome(setInterval(tickMetronome, tickDuration));

      return;
    }

    //else stop the metronome
    setTickCount(0);
    clearInterval(metronome);
    setMetronome(null);
  }

  function tickMetronome() {
    setTickCount((prevCount) => {
      if (prevCount >= timeSigniture) {
        if (accelerando !== 0) {
          setTempo((prevTempo) => prevTempo + accelerando / 10);
        }
        setBars((prevBar) => prevBar + 1);
        return 1;
      } else {
        return prevCount + 1;
      }
    });
  }

  //on tick count change play a sound
  useEffect(() => {
    //dont do anything if metronome is not toggled
    if (!metronome || !metronomeSound || !metronomeAccentSound) {
      return;
    }

    if (tickCount === 1) {
      metronomeSound.pause();
      metronomeSound.currentTime = 0;
      metronomeSound.play();
    } else {
      metronomeAccentSound.pause();
      metronomeAccentSound.currentTime = 0;
      metronomeAccentSound.play();
    }
  }, [tickCount]);

  function adjustTempo(value: number) {
    if (tempo >= maxTempo || tempo <= minTempo) {
      return;
    }
    setTempo((prevTempo) => prevTempo + value);
  }

  return (
    <>
      <div className="flex flex-col items-center h-screen">
        {/* title */}
        <h1 className="font-bold text-xl border-b-2 border-black pt-2 pb-3 px-4">
          Metronome
        </h1>

        {/* Notes */}
        <div className="bg-gray-200 w-full px-12 h-16 flex gap-4 justify-center relative">
          {/* time signuture */}
          <div className="bg-slate-900 text-white flex flex-col justify-between items-center px-2 absolute h-full left-0 text-lg">
            <select
              className="bg-slate-900"
              value={timeSigniture}
              onChange={(e: any) => setTimeSignuture(e.target.value)}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>
            <hr className="w-6" />
            <span>4</span>
          </div>

          {Array.from({ length: timeSigniture }, (el, index) => (
            <div
              className={`text-center px-2 text-white ${
                tickCount === index + 1 ? 'bg-red-500 ' : ''
              }`}
              key={index}
            >
              <img className="h-full" src="/quarter-note.svg" />
            </div>
          ))}
        </div>

        {/* options */}
        <div className="w-full h-8 bg-slate-600 text-bold text-white text-center">
          Options
        </div>

        {/* bar counter */}
        <div>
          <p
            className={`text-4xl text-center ${
              tickCount === 1 ? 'text-red-500' : ''
            }`}
          >
            {tickCount}
          </p>
          <p>{bars} bars</p>
        </div>

        <button
          className={`bg-green-700 py-2 px-4 rounded-lg text-white font-bold`}
          onClick={() => toggleMetronome()}
        >
          {!metronome ? 'Start Metronome' : 'Stop Metronome'}
        </button>

        {/* pendulum */}
        <div
          className={`h-[300px] w-6 bg-gray-500 mt-auto origin-bottom relative translate-y-4
          ${metronome ? 'pendulum-swing' : ''}`}
        >
          {/* pendulum weight */}
          <div
            className="w-10 h-10 absolute left-[50%] translate-x-[-50%] bg-black"
            style={{ top: `${pendulumWeightPosition}%` }}
          ></div>
        </div>

        {/* controls */}
        <div className="w-full bg-slate-400 flex flex-col justify-center items-center z-10">
          {/* tempo */}
          <div className="w-full flex items-center justify-between py-2 px-12">
            <div>
              <button
                className="w-[35px] h-[35px] bg-slate-500 mb-2 border-2 text-white rounded-full"
                onClick={() => adjustTempo(-5)}
              >
                -5
              </button>
              <button
                className="w-[35px] h-[35px] bg-slate-500 mb-2 border-2 text-white rounded-full"
                onClick={() => adjustTempo(-1)}
              >
                -1
              </button>
            </div>

            <div className="w-full mx-6 text-center">
              <input
                className="w-full"
                type="range"
                min={minTempo}
                max={maxTempo}
                value={tempo}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTempo(parseInt(e.target.value))
                }
              />
              <p>tempo : {tempo}</p>
            </div>

            <div>
              <button
                className="w-[35px] h-[35px] bg-slate-500 mb-2 border-2 text-white rounded-full"
                onClick={() => adjustTempo(5)}
              >
                +5
              </button>
              <button
                className="w-[35px] h-[35px] bg-slate-500 mb-2 border-2 text-white rounded-full"
                onClick={() => adjustTempo(1)}
              >
                +1
              </button>
            </div>
          </div>

          <input
            className="w-[70%]"
            type="range"
            step={2}
            min={-10}
            max={10}
            value={accelerando}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setAccelerando(parseInt(e.target.value));
            }}
          />
          <p>Accelerando : {accelerando / 10}</p>
        </div>
      </div>
    </>
  );
}
