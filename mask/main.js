import {
  WebGLRenderer,
  PCFSoftShadowMap,
  sRGBEncoding,
  Scene,
  SpotLight,
  PerspectiveCamera,
  HemisphereLight,
  AmbientLight,
  IcosahedronGeometry,
  OrthographicCamera,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  TextureLoader,
  MeshStandardMaterial,
  BoxGeometry,
} from "../third_party/three.module.js";
import { FaceMeshFaceGeometry } from "../js/face.js";
import { OrbitControls } from "../third_party/OrbitControls.js";

let modelthree; //modified----------------------------------------------------------------------------------------------------

const av = document.querySelector("gum-av");
const canvas = document.querySelector("canvas");
const status = document.querySelector("#status");

// Set a background color, or change alpha to false for a solid canvas.
const renderer = new WebGLRenderer({ antialias: true, alpha: true, canvas });
// renderer.setClearColor(0x202020);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.outputEncoding = sRGBEncoding;

const scene = new Scene();
const camera = new OrthographicCamera(1, 1, 1, 1, -1000, 1000);

// Change to renderer.render(scene, debugCamera); for interactive view.
const debugCamera = new PerspectiveCamera(75, 1, 0.1, 1000);
debugCamera.position.set(300, 300, 300);
debugCamera.lookAt(scene.position);
const controls = new OrbitControls(debugCamera, renderer.domElement);

let width = 0;
let height = 0;

function resize() {
  const videoAspectRatio = width / height;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const windowAspectRatio = windowWidth / windowHeight;
  let adjustedWidth;
  let adjustedHeight;
  if (videoAspectRatio > windowAspectRatio) {
    adjustedWidth = windowWidth;
    adjustedHeight = windowWidth / videoAspectRatio;
  } else {
    adjustedWidth = windowHeight * videoAspectRatio;
    adjustedHeight = windowHeight;
  }
  renderer.setSize(adjustedWidth, adjustedHeight);
  debugCamera.aspect = videoAspectRatio;
  debugCamera.updateProjectionMatrix();
}

window.addEventListener("resize", () => {
  resize();
});
resize();
renderer.render(scene, camera);

// Load textures for mask material.
//const colorTexture = new TextureLoader().load("../../assets/mesh_map_lipstick.jpg");
const colorTexture = new TextureLoader().load("../../assets/mesh_map.jpg");
const aoTexture = new TextureLoader().load("../../assets/ao.jpg");
const alphaTexture = new TextureLoader().load("../../assets/black.png");
//const alphaTexture = new TextureLoader().load("../../assets/black_edited.jpg"); //modified---------------------------------------------

// Create wireframe material for debugging.
const wireframeMaterial = new MeshBasicMaterial({
  color: 0xff00ff,
  wireframe: true,
});

// Create material for mask.
const material = new MeshStandardMaterial({
  color: 0xFFFFFF, //0x808080  (255,255,255)//modified---------------------------------------------------------------------------------------
  roughness: 0.8,
  metalness: 0.1,
  alphaMap: alphaTexture,
  aoMap: aoTexture,
  map: colorTexture,
  roughnessMap: colorTexture,
  transparent: true,
  side: DoubleSide,
});

// Create a new geometry helper.
const faceGeometry = new FaceMeshFaceGeometry();

// Create mask mesh.
const mask = new Mesh(faceGeometry, material);
scene.add(mask);
mask.receiveShadow = mask.castShadow = true;

// Add lights.
const spotLight = new SpotLight(0xffffbb, 1);
spotLight.position.set(0.5, 0.5, 1);
spotLight.position.multiplyScalar(400);
scene.add(spotLight);

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 200;
spotLight.shadow.camera.far = 800;

spotLight.shadow.camera.fov = 40;

spotLight.shadow.bias = -0.001125;

scene.add(spotLight);

const hemiLight = new HemisphereLight(0xffffbb, 0x080820, 0.25);
scene.add(hemiLight);

const ambientLight = new AmbientLight(0x404040, 0.25);
scene.add(ambientLight);

// Create a red material for the nose.
const noseMaterial = new MeshStandardMaterial({
  color: 0xff2010,
  roughness: 0.4,
  metalness: 0.1,
  transparent: true,
});

// const nose = new Mesh(new IcosahedronGeometry(1, 3), noseMaterial);
const nose = new Mesh(new BoxGeometry, noseMaterial);
nose.castShadow = nose.receiveShadow = true;
//scene.add(nose); //nose------------------------------------------------------------------------nose------------------------------------------------
nose.scale.setScalar(40);

// Enable wireframe to debug the mesh on top of the material.
let wireframe = false;

// Defines if the source should be flipped horizontally.
let flipCamera = true;

async function render(model) {
  // Wait for video to be ready (loadeddata).
  await av.ready();

  // Flip video element horizontally if necessary.
  av.video.style.transform = flipCamera ? "scaleX(-1)" : "scaleX(1)";

  // Resize orthographic camera to video dimensions if necessary.
  if (width !== av.video.videoWidth || height !== av.video.videoHeight) {
    const w = av.video.videoWidth;
    const h = av.video.videoHeight;
    camera.left = -0.5 * w;
    camera.right = 0.5 * w;
    camera.top = 0.5 * h;
    camera.bottom = -0.5 * h;
    camera.updateProjectionMatrix();
    width = w;
    height = h;
    resize();
    faceGeometry.setSize(w, h);
  }

  // Wait for the model to return a face.
  const faces = await model.estimateFaces(av.video, false, flipCamera);

  av.style.opacity = 1;
  status.textContent = "";



  // There's at least one face.
  if (faces.length > 0) {
    //nose.scale.set(40,40,40); //glasses 
    modelthree.scale.set(0.55,0.55,0.55); //glasses //modified------------------------------------------------------------------------------
    
    // Update face mesh geometry with new data.
    faceGeometry.update(faces[0], flipCamera);

    // Modify nose position and orientation.
    const track = faceGeometry.track(5, 45, 275);  
    //const track = faceGeometry.track(10, 108, 337); // Forehead
    //const track = faceGeometry.track(159, 145, 153); // R.E
    //const track = faceGeometry.track(53, 283, 5); // M.E
    nose.position.copy(track.position);
    nose.rotation.setFromRotationMatrix(track.rotation);

    //modelthree.rotation.set(300,0,0);
    const trackGlasses = faceGeometry.track(193, 6, 417); // R.E 122, 168, 351 //modified---------------------------------------------------------------------------------------
    modelthree.position.copy(trackGlasses.position);
    modelthree.rotation.setFromRotationMatrix(trackGlasses.rotation);

    modelthree.position.x = modelthree.position.x - 5;
    modelthree.rotation.x = modelthree.rotation.x -0.9; //x es x 300, 0, 0
    modelthree.rotation.y = modelthree.rotation.y + 0; //y es z 50.2
    modelthree.rotation.z = modelthree.rotation.z + 0.8; //z es y 2.35

    modelthree.scale.set(0.55,0.55,0.55);
  }else{ //modified-------------------------------------------------------------------------------------------------------------------------------------------------------
    modelthree.scale.set(0,0,0); //glasses 
    //nose.scale.set(0,0,0); //glasses 
  }

  if (wireframe) {
    // Render the mask.
    renderer.render(scene, camera);
    // Prevent renderer from clearing the color buffer.
    renderer.autoClear = false;
    renderer.clear(false, true, false);
    mask.material = wireframeMaterial;
    // Render again with the wireframe material.
    renderer.render(scene, camera);
    mask.material = material;
    renderer.autoClear = true;
  } else {
    // Render the scene normally.
    renderer.render(scene, camera);
  }

  requestAnimationFrame(() => render(model));
}

// Init the demo, loading dependencies.
async function init() {

  let loader = new THREE.GLTFLoader(); //modified---------------------------------------------------------------------------------------
  loader.load('./neonGlasses/scene.gltf', function(gltf){
    scene.add(gltf.scene);
    modelthree = gltf.scene.children[0];
    //modelthree.scale.set(0.55,0.55,0.55); //glasses

    animate();
}) 

function animate(){
    requestAnimationFrame(animate);
    //modelthree.rotation.z += 0.001;
    renderer.render(scene, camera)
}

  await Promise.all([tf.setBackend("webgl"), av.ready()]);
  status.textContent = "Loading model...";
  const model = await facemesh.load({ maxFaces: 1 });
  status.textContent = "Detecting face...";
  render(model);
}

init();
