import React from 'react';
import { useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import bp_1 from './bp_1.jpg';
import './App.css';

function App() {
  const worker = createWorker({
    logger: m => console.log(m),
  });

  const video: React.RefObject<HTMLVideoElement> = React.createRef();
  const constraints = {
    video: true,
  };

  const doOCR = async () => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(bp_1);
    setOcr(text);
  };

  const [ocr, setOcr] = useState('Recognizing...');

  useEffect(() => {
      navigator.mediaDevices.getUserMedia(constraints)
          .then((stream) => {
              if (video.current)
                video.current.srcObject = stream;
          });
    // doOCR();
  });


  return (
      <div className="App">
        {/*<img src={bp_1} />*/}
        {<video id="player" controls autoPlay ref={video} />}
        <p>{ocr}</p>
      </div>
  );
}

export default App;
