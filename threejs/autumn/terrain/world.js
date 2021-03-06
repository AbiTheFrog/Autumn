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
    worldSize = 3;  // size of world in chunks
    waterHeight;    // height of the water level

    chunkMap;       // used to store chunks (2d array)
    origin = {      // used to store chunkMap[0][0]'s origin
        x: 0,
        z: 0
    };
    chunk;          // chunk buffer

    scene;          // three js scene

    log;            // autumn engine log

    constructor(scene, chunkSize, chunkHeight, waterHeight, log){
        // add fog
        scene.fog = new THREE.FogExp2(0x111111, 0.08 / 30);

        this.scene = scene; this.log = log;
      
        // 5 x 5 chunk map by default
        const worldSize = this.worldSize;

        // set some variables
        this.chunkSize = chunkSize; this.chunkHeight = chunkHeight; this.waterHeight = waterHeight;

        // init chunk map
        this.chunkMap = new Array(worldSize);
        for(var i = 0; i < worldSize; i++){
          this.chunkMap[i] = new Array(worldSize);
        }

        // initialize chunk (save allocations)
        const chunk = new Array(chunkSize);
        for(var i = 0; i < chunkSize; i++){
            chunk[i] = new Array(chunkSize);
            for(var j = 0; j < chunkSize; j++){
                chunk[i][j] = new Uint8Array(chunkHeight);
            }
        }

        this.chunk = chunk;

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

    update(time, camera){
        // update water flow
        Chunk.update(time);

        // load new chunks

        /**
         *  ! loading chunks on a monoaxis is fine, but loading on both axies logically fails
        **/

        {
            const ws = this.worldSize;
            const cs = this.chunkSize;
            const mid = Math.floor(this.worldSize / 2);

            var cx = Math.floor((camera.position.x - this.origin.x) / cs), cz = Math.floor((camera.position.z - this.origin.z) / cs);
            this.log.write("(" + cx + "," + cz + ")", "world");

            while(cx != mid){
                if(cx < mid){
                    // update origin
                    this.origin.x -= cs;
                    
                    // update chunks
                    for(var i = 0; i < ws; i++){
                        // unload
                        this.chunkMap[ws - 1][i].unload(this.scene);
                        // shift column over
                        for(var j = ws - 1; j > 0; j--){
                            this.chunkMap[j][i] = this.chunkMap[j - 1][i];
                        }
                        // load new chunks
                        this.chunkMap[0][i] = new Chunk(this.scene, this.chunk, simplex, this.origin.x, 0, (i + this.origin.z) * cs, cs, this.chunkHeight, this.waterHeight);
                    }
                } else {
                    // update origin
                    this.origin.x += cs;
                    
                    // update chunks
                    for(var i = 0; i < ws; i++){
                        // unload
                        this.chunkMap[0][i].unload(this.scene);
                        // shift column over
                        for(var j = 0; j < ws - 1; j++){
                            this.chunkMap[j][i] = this.chunkMap[j + 1][i];
                        }
                        // load new chunks
                        this.chunkMap[ws - 1][i] = new Chunk(this.scene, this.chunk, simplex, this.origin.x + (ws - 1) * cs, 0, (i + this.origin.z) * cs, cs, this.chunkHeight, this.waterHeight);
                    }
                }

                cx = Math.floor((camera.position.x - this.origin.x) / cs);
            }

            while(cz != mid){
                if(cz < mid){
                    // update origin
                    this.origin.z -= cs;

                    // update chunks
                    for(var i = 0; i < ws; i++){
                        // unload
                        this.chunkMap[i][ws - 1].unload(this.scene);
                        // shift
                        for(var j = ws - 1; j > 0; j--){
                            this.chunkMap[i][j] = this.chunkMap[i][j - 1];
                        }
                        // load new chunks
                        this.chunkMap[i][0] = new Chunk(this.scene, this.chunk, simplex, this.origin.x + i * cs, 0, this.origin.z, cs, this.chunkHeight, this.waterHeight);
                    }
                } else {
                    // update origin
                    this.origin.z += cs;

                    // update chunks
                    for(var i = 0; i < ws; i++){
                        // unload
                        this.chunkMap[i][0].unload(this.scene);
                        // shift
                        for(var j = 0; j < ws; j++){
                            this.chunkMap[i][j] = this.chunkMap[i][j + 1];
                        }
                        // load new chunks
                        this.chunkMap[i][ws - 1] = new Chunk(this.scene, this.chunk, simplex, this.origin.x + i * cs, 0, this.origin.z + (ws - 1) * cs, cs, this.chunkHeight, this.waterHeight);
                    }
                }

                cz = Math.floor((camera.position.z - this.origin.z) / cs);
            }
        }
    }
};
