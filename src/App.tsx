import React from 'react';
import { useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';

function App() {
  const worker = createWorker({
    logger: m => console.log(m),
  });

  const video: React.RefObject<HTMLVideoElement> = React.createRef();
  const capturedFrame: React.RefObject<HTMLCanvasElement> = React.createRef();
  const overlayCanvas: React.RefObject<HTMLCanvasElement> = React.createRef();

  const constraints = {
    video: {
      facingMode: "environment"
    },
  };

  const takePicture = () => {
    if (video.current && capturedFrame.current){
      const context = capturedFrame.current.getContext('2d');

      const videoWidth = video.current.videoWidth || 0;
      const videoHeight = video.current.videoHeight || 0;

      console.log(videoWidth + "x" + videoHeight);
      
      capturedFrame.current.setAttribute('width', (Math.floor(videoWidth*0.6)).toString());
      capturedFrame.current.setAttribute('height', Math.floor(videoHeight*0.2).toString());

      if (context) {
        context.drawImage(video.current, videoWidth*0.2, videoHeight*0.4, videoWidth*0.6, videoHeight*0.2, 0, 0, videoWidth*0.6, videoHeight*0.2);
        const data = capturedFrame.current.toDataURL('image/png');
        doOCR(data);
      }
    }
  }

  const doOCR = async (imageUrl: string) => {
    setOcr("Recognizing...");
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(imageUrl);
    setOcr("Recognized text: " + text);
  };

  const [ocr, setOcr] = useState('Click video to capture');

  useEffect(() => {
   navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            if (video.current){
              video.current.srcObject = stream;
              video.current.onloadeddata = () => {
                if (video.current && overlayCanvas.current){
                  const videoWidth = video.current.videoWidth || 0;
                  const videoHeight = video.current.videoHeight || 0;
    
                  console.log(videoWidth + "x" + videoHeight);
    
                  overlayCanvas.current.setAttribute('width', videoWidth.toString());
                  overlayCanvas.current.setAttribute('height', videoHeight.toString());
                  
                  const context = overlayCanvas.current.getContext('2d');
                  if (context) {
                    context.beginPath();
                    context.lineWidth = 6;
                    context.strokeStyle = "red";
                    context.rect(videoWidth*0.2, videoHeight*0.4, videoWidth*0.6, videoHeight*0.2);
                    context.stroke();
                  }
                }
              }
            }
        });
  });


  return (
      <div style={{margin: "auto"}}>
        <div style={{width: "0"}} onClick={takePicture}>
          <video autoPlay ref={video}/>
          <canvas ref={overlayCanvas} style={{position: "absolute", top: "0", left: "0"}}/>
        </div>
        <p>{ocr}</p>
        <canvas ref={capturedFrame}/>
        <p>source code: <a href="https://github.com/GitMamut/ocr">https://github.com/GitMamut/ocr</a></p>
      </div>
  );
}

export default App;
