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

    const canv = document.getElementById("canv");

    const renderer = new THREE.WebGLRenderer({
        canvas: canv
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
        const waterHeight = 10;
        
        world = new World(scene, chunkSize, chunkHeight, worldSize, waterHeight);
    }
    
    const player = new Player(camera, world, canv);

    document.onkeyup = (event) => { player.keyup(event.key); };
    document.onkeydown = (event) => { player.keydown(event.key); };
    document.onmousemove = (event) => { player.rotate(event.movementX, event.movementY); };
    document.onmousedown = () => { canv.requestPointerLock(); }
    
    // render loop
    const time = {
        time: 0,
        deltaTime: 0
    };
    var lastTime = 0;
    const renderloop = (timeStamp) => {
        time.deltaTime = (timeStamp - lastTime) / 1000;
        time.time += time.deltaTime;

        world.update(time);

        player.update(time.deltaTime);

        renderer.render(scene, camera);

        lastTime = timeStamp;
        requestAnimationFrame(renderloop);
    }; requestAnimationFrame(renderloop);
})();