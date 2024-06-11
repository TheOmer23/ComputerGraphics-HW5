import {OrbitControls} from './OrbitControls.js'
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
scene.background = new THREE.Color( 'ForestGreen' );

function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Goal dimensions and materials
const goalWidth = 30;
const goalHeight = 10;
const backSupportAngle = 45; // Degrees
const goalDepth = goalHeight / Math.tan(degrees_to_radians(backSupportAngle));
const postRadius = 0.5;

// Lights
// Add a neutral white light
const light1 = new THREE.PointLight(0xffffff, 500);
light1.position.set(0,0,10);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff, 500);
light2.position.set(0, 15, -goalDepth - 10);
scene.add(light2);

// Optionally add ambient light to balance the scene
const ambientLight = new THREE.AmbientLight(0xffffff); // Soft white light
scene.add(ambientLight);




const whiteMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const blackMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

// Goalposts
const postGeometry = new THREE.CylinderGeometry(postRadius, postRadius, goalHeight , 32);
const supportGeometry = new THREE.CylinderGeometry(postRadius, postRadius, goalHeight + 4)

const cylinderTranslate1 = new THREE.Matrix4();
const cylinderTranslate2 = new THREE.Matrix4();
const cylinderTranslate3 = new THREE.Matrix4();
const cylinderTranslate4 = new THREE.Matrix4();

// Apply transformations for goalposts
cylinderTranslate1.makeTranslation(-goalWidth / 2, goalHeight / 2, 0);
cylinderTranslate2.makeTranslation(goalWidth / 2, goalHeight / 2, 0);
cylinderTranslate3.multiplyMatrices(
  new THREE.Matrix4().makeTranslation(-goalWidth / 2, goalHeight / 2, -goalDepth / 2),
  new THREE.Matrix4().makeRotationX(degrees_to_radians(backSupportAngle))
);
cylinderTranslate4.multiplyMatrices(
  new THREE.Matrix4().makeTranslation(goalWidth / 2, goalHeight / 2, -goalDepth / 2),
  new THREE.Matrix4().makeRotationX(degrees_to_radians(backSupportAngle))
);

const goalPost1 = new THREE.Mesh(postGeometry, whiteMaterial);
goalPost1.applyMatrix4(cylinderTranslate1);
scene.add(goalPost1);

const goalPost2 = new THREE.Mesh(postGeometry, whiteMaterial);
goalPost2.applyMatrix4(cylinderTranslate2);
scene.add(goalPost2);

const support1 = new THREE.Mesh(supportGeometry, whiteMaterial);
support1.applyMatrix4(cylinderTranslate3);
scene.add(support1);

const support2 = new THREE.Mesh(supportGeometry, whiteMaterial);
support2.applyMatrix4(cylinderTranslate4);
scene.add(support2);

// Crossbar
const crossbarGeometry = new THREE.CylinderGeometry(postRadius, postRadius, goalWidth + 0.67, 32);
const topCylinderTranslate = new THREE.Matrix4();
topCylinderTranslate.multiplyMatrices(
  new THREE.Matrix4().makeTranslation(0, goalHeight, 0),
  new THREE.Matrix4().makeRotationZ(degrees_to_radians(90))
);
const crossbar = new THREE.Mesh(crossbarGeometry, whiteMaterial);
crossbar.applyMatrix4(topCylinderTranslate);
scene.add(crossbar);

// Rings/Toruses
const ringGeometry = new THREE.TorusGeometry(postRadius, postRadius / 2, 16, 100);
const ringMaterial = whiteMaterial;
const ringPositions = [
  { x: -goalWidth / 2, y: 0, z: 0 },
  { x: goalWidth / 2, y: 0, z: 0 },
  { x: -goalWidth / 2, y: 0, z: -goalDepth },
  { x: goalWidth / 2, y: 0, z: -goalDepth }
];

ringPositions.forEach(pos => {
  const ringMatrix = new THREE.Matrix4();
  ringMatrix.multiplyMatrices(
    new THREE.Matrix4().makeTranslation(pos.x, pos.y, pos.z),
    new THREE.Matrix4().makeRotationX(Math.PI / 2)
  );
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.applyMatrix4(ringMatrix);
  scene.add(ring);
});

// Nets
const netMaterial = new THREE.MeshPhongMaterial({ color: 0xd3d3d3, side: THREE.DoubleSide, wireframe: false });

// Back net (rectangular)
const backNetGeometry = new THREE.PlaneGeometry(goalWidth, goalHeight + 3.5);
const backNetMatrix = new THREE.Matrix4();
backNetMatrix.multiplyMatrices(
  new THREE.Matrix4().makeTranslation(0, goalHeight - 5 , -goalDepth + 5),
  new THREE.Matrix4().makeRotationX(degrees_to_radians(backSupportAngle))
);

const backNet = new THREE.Mesh(backNetGeometry, netMaterial);
backNet.applyMatrix4(backNetMatrix);
scene.add(backNet);

// Side nets (triangular)
const createTriangleMesh = (vertices, material) => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
};

const sideNetVertices1 = [
  -goalWidth / 2, 0, 0,
  -goalWidth / 2, goalHeight, 0,
  -goalWidth / 2, 0, -goalDepth
];
const sideNet1 = createTriangleMesh(sideNetVertices1, netMaterial);
scene.add(sideNet1);

const sideNetVertices2 = [
  goalWidth / 2, 0, 0,
  goalWidth / 2, goalHeight, 0,
  goalWidth / 2, 0, -goalDepth
];
const sideNet2 = createTriangleMesh(sideNetVertices2, netMaterial);
scene.add(sideNet2);

// Ball
const ballGeometry = new THREE.SphereGeometry(goalHeight / 16, 32, 32);
const ballMatrix = new THREE.Matrix4().makeTranslation(0, goalHeight / 2, goalHeight / 2);
const ball = new THREE.Mesh(ballGeometry, blackMaterial);
ball.applyMatrix4(ballMatrix);
scene.add(ball);


// This defines the initial distance of the camera
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0,0,5);
camera.applyMatrix4(cameraTranslate)

renderer.render( scene, camera );

const controls = new OrbitControls( camera, renderer.domElement );
// const ballControl = new OrbitControls( ball, )

let isOrbitEnabled = true;

const toggleOrbit = (e) => {
	if (e.key == "o"){
		isOrbitEnabled = !isOrbitEnabled;
	}
}

const toggleWireframe = (e) => {
	if (e.key == "w"){
    netMaterial.wireframe = !netMaterial.wireframe
    whiteMaterial.wireframe = !whiteMaterial.wireframe
    blackMaterial.wireframe = !blackMaterial.wireframe
	}
}

document.addEventListener('keydown',toggleOrbit)
document.addEventListener('keydown',toggleWireframe)
// Animation variables
let speedFactor = 1;
let ballMatrixTranslate = new THREE.Matrix4().makeTranslation(0, 0, 0);
let ballMatrixRotate1 = new THREE.Matrix4().makeRotationY(0);
let ballMatrixRotate2 = new THREE.Matrix4().makeRotationX(0);

// Animation functions using matrix multiplication
const animateBall1 = () => {
  ballMatrixTranslate = new THREE.Matrix4().makeTranslation(0, 0, -0.05 * speedFactor);
  ballMatrixRotate1 = new THREE.Matrix4().makeRotationY(0.01 * speedFactor);
  ball.applyMatrix4(ballMatrixTranslate);
  ball.applyMatrix4(ballMatrixRotate1);
};

const animateBall2 = () => {
  ballMatrixTranslate = new THREE.Matrix4().makeTranslation(0, 0.01 * speedFactor, 0);
  ballMatrixRotate2 = new THREE.Matrix4().makeRotationX(-0.01 * speedFactor);
  ball.applyMatrix4(ballMatrixTranslate);
  ball.applyMatrix4(ballMatrixRotate2);
};

let animate1 = false;
let animate2 = false;
const toggleAnimation1 = (e) => {
  if (e.key === '1') {
    animate1 = !animate1;
  }
};
const toggleAnimation2 = (e) => {
  if (e.key === '2') {
    animate2 = !animate2;
  }
};
document.addEventListener('keydown', toggleAnimation1);
document.addEventListener('keydown', toggleAnimation2);

// Speed control
const changeSpeed = (e) => {
  if (e.key == '+') {
    speedFactor += 0.1;
  } else if (e.key == '-') {
    speedFactor -= 0.1;
  }
};
document.addEventListener('keydown', changeSpeed);

const shrinkGoal = (e) => {
  if (e.key === '3') {
    const shrinkMatrix = new THREE.Matrix4().makeScale(0.95, 0.95, 0.95);
    scene.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        if (child != ball){
          child.applyMatrix4(shrinkMatrix);
        }
      }
    });
  }
};
document.addEventListener('keydown', shrinkGoal);

//controls.update() must be called after any manual changes to the camera's transform
controls.update();

function animate() {

	requestAnimationFrame( animate );
  if (animate1) animateBall1();
  if (animate2) animateBall2();
	controls.enabled = isOrbitEnabled;
	controls.update();

	renderer.render( scene, camera );

}
animate()