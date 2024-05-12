let mediaRecorder;
let chunks = [];

// Listener for popup messages to start or stop recording
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startRecording') {
    startRecording();
  } else if (message.action === 'stopRecording') {
    stopRecording();
  }
});

// Function to initiate screen recording
function startRecording() {
  chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab'], (streamId) => {
    if (!streamId) {
      console.error('No stream selected.');
      return;
    }

    const constraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: streamId
        }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
        mediaRecorder.onstop = saveRecording;
        mediaRecorder.start();
      })
      .catch((error) => console.error('Error accessing screen: ', error));
  });
}

// Function to stop recording and save it to disk
function stopRecording() {
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
}

// Save the recorded video to the user's computer
function saveRecording() {
  const blob = new Blob(chunks, { type: 'video/webm' });
  chunks = [];

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'screen-recording.webm';
  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
