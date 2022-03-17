/**
 *  Define world chunk type
**/

const waterMaterial = new THREE.MeshLambertMaterial({
    color: 0x6db8ff,
    opacity: 0.5,
    transparent: true
});

waterMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.time = { value: 0 };

    shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        ["vec4 pos = modelMatrix * vec4(position, 1);",
        "vec3 transformed = vec3(position.x,  position.y + sin(time + pos.x + pos.z) * 0.2, position.z);"].join("\n"),
    );
    
    waterMaterial.userData.shader = shader;
};

export default class Chunk {
    mesh;
    water;
    
    static update(time){
        if(waterMaterial.userData.shader){
            waterMaterial.userData.shader.uniforms.time.value = time.time;
        }
    }

    constructor(scene, chunk, noise, ox, oy, oz, size, height, waterLevel){
        // generate water
        {
            const wave = (x, z) => {
                return noise.noise2D(ox + x, oz + z) * 0.3;
            };

            const geometry = new THREE.BufferGeometry();

            const vertices = [];
            
            for(var x = 0; x < size; x++){
                for(var z = 0; z < size; z++){
                    vertices.push(...[
                        x + 1, wave(x + 1, z), z,
                        x, wave(x, z), z,
                        x + 1, wave(x + 1, z + 1), z + 1,

                        x, wave(x, z), z,
                        x, wave(x, z + 1), z + 1,
                        x + 1, wave(x + 1, z + 1), z + 1
                    ]);
                }
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

            geometry.computeVertexNormals();
            geometry.normalizeNormals();

            const water = new THREE.Mesh(geometry, waterMaterial);
            
            water.position.set(ox - 1, waterLevel - 0.1, oz);

            scene.add(water);

            this.water = water;
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
        scene.remove(this.water);
        this.mesh.dispose();
        this.water.dispose();
    }
};