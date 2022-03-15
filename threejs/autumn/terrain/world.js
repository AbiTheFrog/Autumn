/**
 *  Package world generation state saving into one place
 *      TODO Allow for dynamic world expansion
**/

import SimplexNoise from "https://cdn.skypack.dev/simplex-noise@3.0.1";

const simplex = new SimplexNoise();

function getHeight(i, j, max, min) {
    return min + (((simplex.noise2D(i / 64, j / 64) + simplex.noise2D(i / 124, j / 124)) / 2 + 1) / 2) * (max - min - 1);
}

class Chunk {
    scene;
    mesh;

    constructor(scene, chunk, ox, oy, oz, size, height){
        // make size x size x size chunk
        for(var i = 0; i < size; i++){
            for(var j = 0; j < size; j++){
                const h = getHeight(i + ox, j + oz, height, 0);

                var k = 0;
                for(; k < h; k++){
                    chunk[i][j][k] = 1;
                }
                for(; k < height; k++){
                    chunk[i][j][k] = 0;
                }
            }
        }

        // logically get chunk position (as well as extrapolate to other chunks)
        const get = (chunk, x, y, z) => {
            if(x < 0 || z < 0 || x >= size || z >= size){ return getHeight(x + ox, z + oz, height, 0) >= y ? 1 : 0; }
            if(y < 0 || y >= size){ return -1; }
            return chunk[x][z][y];
        }

        const check = (cur, chunk, x, y, z) => {
            return get(chunk, x, y, z) == 0;
        }

        // object colors
        const objColors = [0, [0.3764, 0.1960, 0.4078]];

        // generate mesh
        const vertices = [];
        const colors = [];

        for(var x = 0; x < size; x++){
            for(var y = 0; y < height; y++){
                for(var z = 0; z < size; z++){
                    const cur = get(chunk, x, y, z);
                    if(cur != 0){
                        var n = 0;

                        if(check(cur, chunk, x + 1, y, z)){
                            vertices.push(...[
                                x, y, z + 1,
                                x, y, z,
                                x, y + 1, z + 1,

                                x, y + 1, z + 1,
                                x, y, z,
                                x, y + 1, z
                            ]);

                            n++;
                        }

                        if(check(cur, chunk, x - 1, y, z)){
                            vertices.push(...[
                                x - 1, y, z,
                                x - 1, y, z + 1,
                                x - 1, y + 1, z + 1,

                                x - 1, y, z,
                                x - 1, y + 1, z + 1,
                                x - 1, y + 1, z
                            ]);

                            n++;
                        }

                        if(check(cur, chunk, x, y + 1, z)){
                            vertices.push(...[
                                x, y + 1, z,
                                x - 1, y + 1, z,
                                x - 1, y + 1, z + 1,

                                x, y + 1, z,
                                x - 1, y + 1, z + 1,
                                x, y + 1, z + 1,
                            ]);

                            n++;
                        }

                        if(check(cur, chunk, x, y - 1, z)){
                            vertices.push(...[
                                x - 1, y, z,
                                x, y, z,
                                x - 1, y, z + 1,

                                x - 1, y, z + 1,
                                x, y, z,
                                x, y, z + 1,
                            ]);
                            
                            n++;
                        }

                        if(check(cur, chunk, x, y, z + 1)){
                            vertices.push(...[
                                x - 1, y, z + 1,
                                x, y, z + 1,
                                x - 1, y + 1, z + 1,

                                x - 1, y + 1, z + 1,
                                x, y, z + 1,
                                x, y + 1, z + 1,
                            ]);
                            
                            n++;
                        }

                        if(check(cur, chunk, x, y, z - 1)){
                            vertices.push(...[
                                x, y, z,
                                x - 1, y, z,
                                x - 1, y + 1, z,

                                x, y, z,
                                x - 1, y + 1, z,
                                x, y + 1, z,
                            ]);
                            
                            n++;
                        }
                        
                        for(var i = 0; i < 2 * 3 * n; i++){
                            colors.push(...objColors[cur]);
                        }
                    }
                }
            }
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        
        geometry.computeVertexNormals();
        geometry.normalizeNormals();
        
        const material = new THREE.MeshLambertMaterial({
            vertexColors: THREE.VertexColors
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(ox, oy, oz);
        
        scene.add(mesh);
        
        this.mesh = mesh;
    
        this.scene = scene;
    }

    unload(){
        this.scene.remove(this.mesh);
        this.mesh.dispose();
    }
};

export default class World {
    chunkSize;      // size of a single chunk (square)
    chunkHeight;    // max height of a chunk
    worldSize;      // size of world in chunks
    waterHeight;    // height of the water level

    chunkMap;       // used to store chunks (2d array)

    constructor(scene, chunkSize, chunkHeight, worldSize, waterHeight){
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
        for(var x = -(chunkSize * worldSize / 2), nx = 0; nx < worldSize; x += chunkSize, nx++){
            for(var z = -(chunkSize * worldSize / 2), nz = 0; nz < worldSize; z += chunkSize, nz++){
                this.chunkMap[nx][nz] = new Chunk(scene, chunk, x, 0, z, chunkSize, chunkHeight);
            }
        }

        // the goal really is to make chunks responsible for their own water though
        {
            const geometry = new THREE.PlaneGeometry(chunkSize * worldSize, chunkSize * worldSize, 100, 100);
            const material = new THREE.MeshLambertMaterial({
                color: 0x6db8ff,
                opacity: 0.5,
                transparent: true,
            });
            const water = new THREE.Mesh(geometry, material);

            water.position.y = waterHeight - 0.1;

            water.rotation.x -= Math.PI / 2;
            
            scene.add(water);
        }
    }

    height(x, z){
        return getHeight(x, z, this.chunkHeight, 0);
    }
};