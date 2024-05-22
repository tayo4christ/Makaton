// Import the necessary classes directly in your JavaScript file
// Ensure your script tag in HTML has type="module" to use imports

document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const output = document.getElementById('output');

    // Load a more robust model from handTrack.js
    const model = await handTrack.load({
        flipHorizontal: false,
        maxNumBoxes: 20,
        iouThreshold: 0.5,
        scoreThreshold: 0.75, // Increased for better accuracy
    });

    // Start video stream from webcam
    handTrack.startVideo(video).then(status => {
        if (status) {
            console.log("Video started, ready to detect gestures!");
            runDetection();
        } else {
            output.textContent = "Please enable your webcam for gesture detection.";
        }
    });

    function runDetection() {
        model.detect(video).then(predictions => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            model.renderPredictions(predictions, canvas, context, video);
            if (predictions.length > 0) {
                highlightDetectedArea(predictions);
                const translatedText = translateGestures(predictions);
                output.innerHTML = `<strong>Translation:</strong> ${translatedText}`;
            } else {
                output.textContent = "No gestures detected. Move your hand into the frame.";
            }
            requestAnimationFrame(runDetection);
        });
    }

    function translateGestures(predictions) {
        return predictions.map(prediction => {
            const bboxArea = prediction.bbox[2] * prediction.bbox[3];
            return gestureMapping(bboxArea);
        }).join('; ');
    }

    function gestureMapping(area) {
        if (area > 30000) return "Hello (Open Hand)";
        if (area > 20000) return "Stop (Closed Fist)";
        if (area > 15000) return "Yes (Thumbs Up)";
        if (area > 10000) return "No (Thumbs Down)";
        return "Peace (Peace Sign)";
    }

    function highlightDetectedArea(predictions) {
        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            context.strokeStyle = '#00FF00';
            context.lineWidth = 2;
            context.strokeRect(x, y, width, height);
            context.fillText(prediction.label, x, y); // Displaying the label at the top-left corner of the bounding box
        });
    }
});
