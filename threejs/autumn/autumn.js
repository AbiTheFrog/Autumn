/**
  * Autumn - story explorer
  *     Made by Abi the Frog
  *     ThreeJS edition
  *     Consider face overlapping?
**/

import SimplexNoise from "https://cdn.skypack.dev/simplex-noise@3.0.1";

// main function
(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("canv")
    });

    renderer.setSize(window.innerWidth - 0.1, window.innerHeight - 0.1);    // why!!!

    camera.position.z = 5;

    // generate chunks
    {
        const simplex = new SimplexNoise();

        // used to make height map
        const getHeight = (i, j, max, min) => {
            return min + (((simplex.noise2D(i / 64, j / 64) + simplex.noise2D(i / 124, j / 124)) / 2 + 1) / 2) * (max - min - 1);
        }

        const genChunk = (ox, oy, oz, size, height, water) => {
            // make size x size x size chunk
            var chunk = new Array(size);
            for(var i = 0; i < size; i++){
                chunk[i] = new Array(size);
                for(var j = 0; j < size; j++){
                    chunk[i][j] = new Uint8Array(height);

                    // set chunk values
                    const h = getHeight(i + ox, j + oz, height, 0);

                    var k = 0;
                    for(; k < h; k++){
                        chunk[i][j][k] = 2;
                    }
                    for(; k < water; k++){
                        chunk[i][j][k] = 1;
                    }
                }
            }

            // logically get chunk position
            const get = (chunk, x, y, z) => {
                if(x < 0 || y < 0 || z < 0){ return 0; }
                if(x >= size || y >= size || z >= size){ return 0; }
                return chunk[x][z][y];
            }

            const check = (cur, chunk, x, y, z) => {
                return (cur == 1 && get(chunk, x, y, z) == 0) || (cur != 1 && get(chunk, x, y, z) < 2);
            }

            // object colors
            const objColors = [0, [0.1, 0.1, 1.0], [0.3764, 0.1960, 0.4078]];

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
        };

        const chunkSize = 100;
        const chunkHeight = 24;
        const chunkBlock = 4;
        const waterHeight = 10;

        for(var x = -(chunkSize * chunkBlock / 2), nx = 0; nx < chunkBlock; x += chunkSize, nx++){
            for(var z = -(chunkSize * chunkBlock / 2), nz = 0; nz < chunkBlock; z += chunkSize, nz++){
                genChunk(x, 0, z, chunkSize, chunkHeight, waterHeight);
            }
        }
    }

    // add light at camera
    const light = new THREE.PointLight(0xFFFFFF, 1, 100);
    light.position.set(...camera.position);
    scene.add(light);

    const ambient = new THREE.AmbientLight(0x404040); // soft white light
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