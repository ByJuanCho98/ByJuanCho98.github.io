async function setupCamera() {
    video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        width: 1920,  //{ideal:1920} 
        height: 1080,  //{ideal:1080} 
      },
    });
    video.srcObject = stream;
  
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
}
  
// Calls face mesh on the video and outputs the eyes and face bounding boxes to global vars
var curFaces = [];
async function renderPrediction(model) {
    const faces = await model.estimateFaces(video);

    if (faces.length > 0) { // If we find a face, process it
      curFaces = faces;  
      //console.log(faces[0].scaledMesh[4])    
    }

  //requestAnimationFrame(renderPrediction);
  requestAnimationFrame(() => renderPrediction(model));
};

function drawVideo(){ 
  ctx.drawImage(video, 0, 0);
  for (face of curFaces){
      if (face.faceInViewConfidence > .95) {
          //drawFace(face);  
          //console.log(face.mesh)
      
          const pts = face.scaledMesh[10];
          //console.log(pts)
          const ptsx = pts[0]
          const ptsy = pts[1]
          const ptsz = pts[2]

          if (ctx) {
              ctx.textAlign="center";
              ctx.font="30pt Verdana";
              ctx.fillStyle = "red";
              ctx.fillText("Human",ptsx,ptsy);
          } 
          //ctx.beginPath();
          //ctx.ellipse(ptsx,ptsy, 5,5, 0, 0, 2*Math.PI)
          //ctx.fill(); 
      }
  } 
  requestAnimationFrame(drawVideo);
}

// Draws the current eyes onto the canvas, directly from video streams
/* async function drawFace(face){
    let i = 0;
    ctx.fillStyle = 'cyan';
    ctx.font = "10px Arial";
    for (pt of face.scaledMesh){
      ctx.beginPath();
      ctx.ellipse(pt[0], pt[1], 3,3, 0, 0, 2*Math.PI)
      ctx.fill();
      ctx.strokeText(i, pt[0], pt[1]);
      i = i+1;
      //console.log(face)
    }
} */

var canvas = document.querySelector("canvas");
var ctx;

async function main() {
    model = await facemesh.load({maxFaces:1});
    // Set up front-facing camera
    await setupCamera();
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    video.play()
    
    // HTML Canvas for the video feed
    canvas = document.getElementById('canvas');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    ctx = canvas.getContext('2d');
    
    drawVideo()
    renderPrediction(model);
}
main();



