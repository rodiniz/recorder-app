

let mediaRecorder: MediaRecorder | null = null;
let mixedStream: MediaStream | null = null;
let chunks: Blob[] = [];


async function startRecording() {
  // Initialize the MediaRecorder
    
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Request screen share with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      // Mic track
      const micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);

      // Screen audio track
      const displayAudioTracks = displayStream.getAudioTracks();
      //alert(`Number of audio tracks from screen share: ${displayAudioTracks.length}`);
      if (displayAudioTracks.length > 0) {
        const displayAudioStream = new MediaStream(displayAudioTracks);
        const displaySource = audioContext.createMediaStreamSource(displayAudioStream);
        displaySource.connect(destination);
      }

      mixedStream = destination.stream;    

      const mediaRecorder = new MediaRecorder(mixedStream, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = async (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.start(5000);
}

async function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    mixedStream?.getTracks().forEach((track) => track.stop())   
  }
}

async function downloadRecording() {
   const fileName = `complete_recording_${Date.now()}.webm`;
  if (chunks.length > 0) {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    chunks = []; // Clear chunks after download
  }
}

window.addEventListener("DOMContentLoaded",()=> {
 
      const btnStartrecording= document.getElementById("btnStartrecording") as HTMLButtonElement;
      const btnStoprecording = document.getElementById("btnStoprecording") as HTMLButtonElement;  
      const btnDownloadRecording = document.getElementById("btnDownloadRecording") as HTMLButtonElement;
      btnStoprecording.disabled = true;
      btnDownloadRecording.disabled = true;
      
      btnStartrecording.addEventListener("click", async () => {
        await startRecording();
        btnStartrecording.disabled = true;
        btnStoprecording.disabled = false;
        btnDownloadRecording.disabled = false;
      });
      btnStoprecording.addEventListener("click", async () => {
        await stopRecording();
        btnStartrecording.disabled = false;
        btnStoprecording.disabled = true;
        btnDownloadRecording.disabled = false;
      });
      btnDownloadRecording.addEventListener("click", async () => {
        await downloadRecording();
        btnStartrecording.disabled = false;
        btnStoprecording.disabled = true; 
        btnDownloadRecording.disabled = true;
      });     

});

