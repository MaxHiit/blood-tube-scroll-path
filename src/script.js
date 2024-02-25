import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import gsap from 'gsap';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

class Cell {
	constructor(cell) {
		this.radius = Math.random() * 0.0002 + 0.0001;
		this.range = 10;
		this.offset = 350;
		this.saturate = Math.floor(Math.random() * 20 + 65);
		this.light = 56;
		this.speed = Math.random() * 0.0004 + 0.0002;
		this.percent = Math.random();
		this.color = new THREE.Color(
			'hsl(' +
				(Math.random() * this.range + this.offset) +
				',' +
				this.saturate +
				'%,' +
				this.light +
				'%)'
		);
		this.mat = new THREE.MeshPhongMaterial({
			color: this.color
		});
		this.geometry = cell.geometry;
		this.offsetVec3 = new THREE.Vector3(
			(Math.random() - 0.5) * 0.025,
			(Math.random() - 0.5) * 0.025,
			0
		);
		this.pos = new THREE.Vector3(0, 0, 0);
		this.rotate = new THREE.Vector3(-Math.random() * 0.1 + 0.01, 0, Math.random() * 0.01);
		this.mesh = new THREE.Mesh(this.geometry, this.mat);
		this.mesh.scale.set(this.radius, this.radius, this.radius);
		this.mesh.position.set(0, 0, 1.5);
	}

	update() {
		this.percent += this.speed * 0.5;

		this.pos = curve.getPoint(1 - (this.percent % 1)).add(this.offsetVec3);
		this.mesh.position.x = this.pos.x;
		this.mesh.position.y = this.pos.y;
		this.mesh.position.z = this.pos.z;
		this.mesh.rotation.x += this.rotate.x;
		this.mesh.rotation.y += this.rotate.y;
		this.mesh.rotation.z += this.rotate.z;
	}
}

/**
 * Textures
 */
// const textureLoader = new THREE.TextureLoader();

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl');

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

/**
 * Cursor
 */
const cursor = {
	x: 0,
	y: 0
};

window.addEventListener('mousemove', (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = -(event.clientY / sizes.height - 0.5);
});

/**
 * Scene
 */
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 0.05, 1.6);

/**
 * Objects
 */

// cell object
const objLoader = new OBJLoader();
let cells = [];

const cellsGroup = new THREE.Group();
scene.add(cellsGroup);

objLoader.load(
	// resource URL
	'models/blood_cell.obj',
	function (object) {
		for (let i = 0; i < pointsLine.length; i++) {
			const cell = new Cell(object.children[0], pointsLine[i]);
			cells.push(cell);
			cellsGroup.add(cell.mesh);
		}
	}
);

// tube object
const points = [
	new THREE.Vector3(163, 452, 56).divideScalar(1000),
	new THREE.Vector3(63, 471, 180).divideScalar(1000),
	new THREE.Vector3(-29, 470, 16).divideScalar(1000),
	new THREE.Vector3(-144, 465, 181).divideScalar(1000),
	new THREE.Vector3(-257, 471, 42).divideScalar(1000)
];

const curve = new THREE.CatmullRomCurve3(points);
curve.type = 'catmullrom';

const pointsLine = curve.getPoints(1000);

const tubeMaterial = new THREE.MeshBasicMaterial({
	side: THREE.BackSide,
	color: 0x781002
});

const tubeGeometry = new THREE.TubeGeometry(curve, 70, 0.02, 30, false);
const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
scene.add(tubeMesh);

/**
 * Lights
 */
const light = new THREE.HemisphereLight(0xe9eff2, 0x01010f, 1);
scene.add(light);

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.001, 1000);
const initialPos = tubeMesh.geometry.parameters.path.getPointAt(0);
const initialPos2 = tubeMesh.geometry.parameters.path.getPointAt(0 + 0.1);

camera.position.copy(initialPos);
camera.lookAt(initialPos2);
scene.add(camera);

/**
 * Control
 */
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
// controls.enableZoom = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true
});

renderer.setSize(sizes.width, sizes.height);

/**
 * Resize
 */
window.addEventListener('resize', () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
// const clock = new THREE.Clock();

// move the camera along curve path
const updateCamera = (percentage) => {
	const curveLength = curve.getLength();
	let time = percentage * curveLength;

	const looptime = 1;
	let t = (time % looptime) / looptime;
	let t2 = ((time + 0.1) % looptime) / looptime;

	const pos = tubeMesh.geometry.parameters.path.getPointAt(t);
	const pos2 = tubeMesh.geometry.parameters.path.getPointAt(t2);

	camera.position.copy(pos);
	camera.lookAt(pos2);
};

gsap.set('h1', { autoAlpha: 1 });
gsap.set('h1', { '--my-variable': 0 });
gsap.set('.letter', { yPercent: 150 });

const introTl = gsap.timeline({
	onComplete: () => {
		ScrollTrigger.create({
			trigger: 'body',
			start: 'top top',
			end: '+=100000',
			pin: true,
			scrub: 2,
			onUpdate: (self) => {
				updateCamera(self.progress);
			}
		});
	}
});

introTl.to('.letter', {
	yPercent: 0,
	duration: 1,
	stagger: {
		from: 'center',
		amount: 1.5
	}
});

introTl.to('h1', { '--barWidth': '100%', duration: 1 });

const headingTl = gsap.timeline();
headingTl.pause();
headingTl.to('h1', { '--barWidth': '0%', duration: 0.51 });
headingTl.to('.letter', {
	yPercent: 150,
	duration: 1,
	stagger: {
		from: 'center',
		amount: 1.5
	}
});

document.addEventListener('scroll', (e) => {
	if (window.scrollY > 1) {
		headingTl.play();
	} else {
		headingTl.reverse();
	}
});

// tick animation
const tick = () => {
	// Time
	// const elapsedTime = clock.getElapsedTime();

	// Update cells objects
	for (let i = 0; i < cells.length; i++) {
		cells[i].update();
	}

	// Update controls
	// controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
