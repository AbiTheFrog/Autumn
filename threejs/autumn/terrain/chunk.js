/**
 *  Define world chunk type
**/

export default class Chunk {
    mesh;

    water;
    t = 0;
    noise;
    size;

    ox;
    oz;

    wave(x, z, amp){
        return this.noise.noise3D(x, z, this.t) * amp;
    }

    updateWater(geometry, deltaTime){
        this.t += deltaTime;

        const seg = this.size / 20;
          
        const points = [];

        const amp = 0.3;

        for(var x = 0, nx = 0; nx < 20 + 1; x += seg, ++nx){
            points.push([]);
            for(var z = 0, nz = 0; nz < 20 + 1; z += seg, ++nz){
                points[nx].push(this.wave(this.ox + x, this.oz + z, amp));
            }
        }
        
        const vertices = [];
        
        for(var x = 0, nx = 0; nx < 20; x += seg, ++nx){
            for(var z = 0, nz = 0; nz < 20; z += seg, ++nz){
                vertices.push(...[
                    x + seg, points[nx + 1][nz], z,
                    x, points[nx][nz], z,
                    x + seg, points[nx + 1][nz + 1], z + seg,

                    x, points[nx][nz], z,
                    x, points[nx][nz + 1], z + seg,
                    x + seg, points[nx + 1][nz + 1], z + seg
                ]);
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

        geometry.computeVertexNormals();
        geometry.normalizeNormals();
    }

    constructor(scene, chunk, noise, ox, oy, oz, size, height, waterLevel){
        // generate water
        {
            this.noise = noise;
            this.size = size;

            this.ox = ox;
            this.oz = oz;

            const geometry = new THREE.BufferGeometry();

            this.updateWater(geometry, 0);

            const material = new THREE.MeshLambertMaterial({
                color: 0x6db8ff,
                opacity: 0.5,
                transparent: true,
            });

            const water = new THREE.Mesh(geometry, material);
            
            water.position.set(ox, waterLevel - 0.1, oz);

            scene.add(water);
        }

        // generate land

        const getHeight = (i, j, max, min) => {
            return min + (((noise.noise2D(i / 64, j / 64) + noise.noise2D(i / 124, j / 124)) / 2 + 1) / 2) * (max - min - 1);
        }
        
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
        const objColors = [0, [0.3764, 0.1960, 0.4078], [0, 0, 1]];

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
    }

    unload(scene){
        scene.remove(this.mesh);
        this.mesh.dispose();
    }
};