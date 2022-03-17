/**
 *  Package world generation state saving into one place
 *      TODO Allow for dynamic world expansion
**/

import SimplexNoise from "https://cdn.skypack.dev/simplex-noise@3.0.1";
import Chunk from "./chunk.js";

const simplex = new SimplexNoise();

function getHeight(i, j, max, min) {
    return min + (((simplex.noise2D(i / 64, j / 64) + simplex.noise2D(i / 124, j / 124)) / 2 + 1) / 2) * (max - min - 1);
}

export default class World {
    chunkSize;      // size of a single chunk (square)
    chunkHeight;    // max height of a chunk
    worldSize;      // size of world in chunks
    waterHeight;    // height of the water level

    chunkMap;       // used to store chunks (2d array)
    origin = [0, 0];

    scene;

    constructor(scene, chunkSize, chunkHeight, worldSize, waterHeight){
        // add fog
        scene.fog = new THREE.FogExp2(0x111111, 0.08 / 30);

        this.scene = scene;
        
        this.chunkSize = chunkSize; this.chunkHeight = chunkHeight; this.worldSize = worldSize; this.waterHeight = waterHeight;

        this.chunkMap = new Array(worldSize).fill(new Array(worldSize));

        // initialize chunk (save allocations)
        const chunk = new Array(chunkSize);
        for(var i = 0; i < chunkSize; i++){
            chunk[i] = new Array(chunkSize);
            for(var j = 0; j < chunkSize; j++){
                chunk[i][j] = new Uint8Array(chunkHeight);
            }
        }

        // fill chunkmap with initial chunks
        for(var x = 0, nx = 0; nx < worldSize; x += chunkSize, nx++){
            for(var z = 0, nz = 0; nz < worldSize; z += chunkSize, nz++){
                this.chunkMap[nx][nz] = new Chunk(scene, chunk, simplex, x, 0, z, chunkSize, chunkHeight, waterHeight);
            }
        }
        
        // create ambient light
        {
            const ambient = new THREE.AmbientLight(0x404040 * 5); // soft white light
            scene.add(ambient);
        }
    }

    height(x, z){
        return getHeight(x, z, this.chunkHeight, 0);
    }

    update(time, player){
        // update water flow
        Chunk.update(time);

        // load new chunks
        
    }
};