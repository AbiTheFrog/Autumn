/**
  * Autumn - story explorer
  *     Made by Abi the Frog
  *     ThreeJS edition
**/

import World from "./terrain/world.js";
import Player from "./entity/character.js";

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

        camera.position.set(0, chunkHeight, chunkHeight);
    }
    
    const player = new Player(camera, world);

    document.onkeyup = (event) => { player.keyup(event.key); };
    document.onkeydown = (event) => { player.keydown(event.key); };

    // render loop
    var deltaTime = 0;
    const renderloop = () => {
        var start = Date.now();
        requestAnimationFrame(renderloop);

        player.update(deltaTime);

        renderer.render(scene, camera);

        deltaTime = (Date.now() - start) / 100;
    }; renderloop();
})();