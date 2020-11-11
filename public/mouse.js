import * as THREE from '/build/three.module.js';
import {OrbitControls} from '/jsm/controls/OrbitControls.js';
import Stats from '/jsm/libs/stats.module.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth/2, window.innerHeight/2);
document.getElementById('app').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth/2, window.innerHeight/2);
    render();
}, false);

const stats = Stats();

var animate = function () {
    requestAnimationFrame(animate);
    if (autoRotate2 == 1){
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
    controls.update();
    render();
    stats.update();
};

function render() {
    renderer.render(scene, camera);
}

animate();

var autoRotate2 = 0;

document.addEventListener('DOMContentLoaded', function () {
    var checkbox = document.getElementById('mouseRotation');
    checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
            autoRotate2 = 1;
        } else {
            autoRotate2 = 0;
        }
    });
});