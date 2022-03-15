/**
 *  Impliments player controls
**/

export default class Player {
    camera;
    world;

    render;

    worldCache;

    constructor(camera, world){
        // save camera and world
        this.camera = camera;
        this.world = world;
        
        // set player physically as a light
        {
            const light = new THREE.PointLight(0xFFFFFF, 1, 30);
            light.position.set(...camera.position);
            world.scene.add(light);
            this.light = light;
        }

        // init world cache
        const x = Math.floor(this.light.position.x), z = Math.floor(this.light.position.z);
        this.worldCache = {
            pos: [x, z],
            hight: world.height(x, z)
        };
    }

    // update world cache
    updateCache(){
        const x = Math.floor(this.light.position.x), z = Math.floor(this.light.position.z);
        if(this.worldCache.pos[0] == x && this.worldCache.pos[1] == z){
            return this.worldCache.height;
        } else {
            this.worldCache = {
                pos: [x, z],
                hight: this.world.height(x, z)
            };
        }
    }

    // update
    update(){
        this.light.position.set(...this.camera.position);
    }

    // handle key events
    keydown(key){
        alert(key);
    }

    keyup(key){
        alert(key);
    }
}