/**
  * Autumn - story explorer
  *     Made by Abi the Frog
  *     ThreeJS edition
**/

import World from "./terrain/world.js";

// main function
(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("canv")
    });

    renderer.setSize(window.innerWidth - 0.1, window.innerHeight - 0.1);    // why!!!

    window.onresize = () => {
        console.log("Resize");
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    var world;

    {
        const chunkSize = 50;
        const chunkHeight = 24;
        const worldSize = 4;
        const waterHeight = 5;
        
        world = new World(scene, chunkSize, chunkHeight, worldSize, waterHeight);

        camera.position.set(0, chunkHeight * 1.5, chunkHeight);
    }

    // add light at camera
    const light = new THREE.PointLight(0xFFFFFF, 1, 30);
    light.position.set(...camera.position);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x404040 * 2); // soft white light
    scene.add(ambient);

    // setup controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);

    // render loop
    const renderloop = () => {
        requestAnimationFrame(renderloop);

        controls.update();

        light.position.set(...camera.position);

        renderer.render(scene, camera);
    }; renderloop();
})();