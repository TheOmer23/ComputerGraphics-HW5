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
const goalDepth = 15;
const postRadius = 0.5;
const backSupportAngle = 45; // Degrees
const supportPollAngle = 90;

const whiteMaterial = new THREE.MeshPhongMaterial({color: 0xffffff});
const grayMaterial = new THREE.MeshPhongMaterial({color: 0xd3d3d3});
const blackMaterial = new THREE.MeshPhongMaterial({color: 0x000000});

// Lights
const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 0, 50, 0 );
scene.add( hemiLight );


const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( - 1, 1.75, 1 );
dirLight.position.multiplyScalar( 30 );
scene.add( dirLight );

dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

const d = 50;

dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;

dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = - 0.0001;
// Goalposts
const postGeometry = new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 32);
const goalPost1 = new THREE.Mesh(postGeometry, whiteMaterial);
goalPost1.position.set(-goalWidth / 2, goalHeight / 2, 0);
scene.add(goalPost1);

const goalPost2 = new THREE.Mesh(postGeometry, whiteMaterial);
goalPost2.position.set(goalWidth / 2, goalHeight / 2, 0);
scene.add(goalPost2);

// Crossbar
const crossbarGeometry = new THREE.CylinderGeometry(postRadius, postRadius, goalWidth, 32);
const crossbar = new THREE.Mesh(crossbarGeometry, whiteMaterial);
crossbar.rotation.z = degrees_to_radians(90);
crossbar.position.set(0, goalHeight, 0);
scene.add(crossbar);

// Back Supports
const supportGeometry = new THREE.CylinderGeometry(postRadius, postRadius, goalHeight / Math.cos(degrees_to_radians(backSupportAngle)), 32);
const support1 = new THREE.Mesh(supportGeometry, whiteMaterial);
support1.rotation.z = degrees_to_radians(backSupportAngle);
support1.rotation.y = degrees_to_radians(supportPollAngle);
support1.position.set(-goalWidth / 2, goalHeight / 2, -goalHeight / 2 );
scene.add(support1);

const support2 = new THREE.Mesh(supportGeometry, whiteMaterial);
support2.rotation.z = -degrees_to_radians(backSupportAngle);
support2.rotation.y = -degrees_to_radians(supportPollAngle);
support2.position.set(goalWidth / 2, goalHeight / 2, -goalHeight / 2);
scene.add(support2);

// Rings/Toruses
const ringGeometry = new THREE.TorusGeometry(postRadius, postRadius / 4, 16, 100);
const ringMaterial = whiteMaterial;
const ringPositions = [
    {x: -goalWidth / 2, y: goalHeight, z: 0},
    {x: goalWidth / 2, y: goalHeight, z: 0},
    {x: -goalWidth / 2, y: 0, z: 0},
    {x: goalWidth / 2, y: 0, z: 0},
    {x: -goalWidth / 2, y: 0, z: -goalHeight / Math.tan(degrees_to_radians(backSupportAngle)) },
    {x: goalWidth / 2, y: 0, z: -goalHeight / Math.tan(degrees_to_radians(backSupportAngle))}
];

ringPositions.forEach(pos => {
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(pos.x, pos.y, pos.z);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
});

// Nets
const netMaterial = new THREE.MeshPhongMaterial({color: 0xd3d3d3, side: THREE.DoubleSide, wireframe: false});
const netGeometry1 = new THREE.PlaneGeometry(goalWidth, -goalHeight / Math.tan(degrees_to_radians(backSupportAngle)));
const backNet = new THREE.Mesh(netGeometry1, netMaterial);
backNet.position.set(0, goalHeight / 2, -goalHeight / 1.5);
backNet.rotation.x = degrees_to_radians(backSupportAngle);
scene.add(backNet);
Math.sqrt(Math.pow(goalDepth) + Math.pow(goalHeight))

const netGeometry2 = new THREE.PlaneGeometry(goalHeight / Math.tan(degrees_to_radians(backSupportAngle)), goalHeight);
const sideNet1 = new THREE.Mesh(netGeometry2, netMaterial);
sideNet1.position.set(-goalWidth / 2, goalHeight / 2, -goalHeight / (2 * Math.tan(degrees_to_radians(backSupportAngle))));
sideNet1.rotation.y = degrees_to_radians(90);
scene.add(sideNet1);

const sideNet2 = new THREE.Mesh(netGeometry2, netMaterial);
sideNet2.position.set(goalWidth / 2, goalHeight / 2, -goalHeight / (2 * Math.tan(degrees_to_radians(backSupportAngle))));
sideNet2.rotation.y = -degrees_to_radians(90);
scene.add(sideNet2);

// Ball
const ballGeometry = new THREE.SphereGeometry(goalHeight / 8, 32, 32);
const ball = new THREE.Mesh(ballGeometry, blackMaterial);
ball.position.set(0, goalHeight / 2, goalHeight);
scene.add(ball);
// This is a sample box.
// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( {color: 0x000000} );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );


// This defines the initial distance of the camera
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0,0,5);
camera.applyMatrix4(cameraTranslate)

renderer.render( scene, camera );

const controls = new OrbitControls( camera, renderer.domElement );

let isOrbitEnabled = true;

const toggleOrbit = (e) => {
	if (e.key == "o"){
		isOrbitEnabled = !isOrbitEnabled;
	}
}

document.addEventListener('keydown',toggleOrbit)

//controls.update() must be called after any manual changes to the camera's transform
controls.update();

function animate() {

	requestAnimationFrame( animate );

	controls.enabled = isOrbitEnabled;
	controls.update();

	renderer.render( scene, camera );

}
animate()