/**
 *  Impliments player controls
**/

const G = -1;

const log = document.getElementById("log");

export default class Player {
    camera;     // three js camera object
    world;      // world object

    light;      // render attribute of player (a point light)

    worldCache; // world height cache

    keys;       // key map

    vy = 0;     // vertical velocity

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
            height: world.height(x, z)
        };

        // init key map
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
        };
    }

    // update world cache
    updateCache(){
        const x = Math.ceil(this.light.position.x), z = Math.ceil(this.light.position.z);
        if(this.worldCache.pos[0] != x || this.worldCache.pos[1] != z){
            this.worldCache = {
                pos: [x, z],
                height: Math.ceil(this.world.height(x, z))
            };
        }
        return this.worldCache.height;
    }

    // update
    update(deltaTime){
        const speed = 5 * deltaTime;

        /* something like this will need to be implimented
        const h = this.updateCache() + 2;

        const cy = this.camera.position.y;

        if(Math.floor(cy) <= h && Math.ceil(cy) >= h){
            this.camera.position.y = h;
            this.vy = 0;
        } else if(cy > h){
            this.vy += G * deltaTime;
            this.camera.position.y += this.vy * deltaTime;
        } else if(cy < h){
            this.vy -= G * deltaTime;
            this.camera.position.y += this.vy * deltaTime;
        }
        */
       this.camera.position.y = this.world.height(this.camera.position.x, this.camera.position.z) + 2;

        if(this.keys.up){
            this.camera.position.z -= speed;
        }

        if(this.keys.down){
            this.camera.position.z += speed;
        }

        if(this.keys.left){
            this.camera.position.x -= speed;
        }

        if(this.keys.right){
            this.camera.position.x += speed;
        }

        // set light to follow
        this.light.position.set(...this.camera.position);

        log.innerHTML = this.camera.position.toArray() + "<br>" + this.vy;
    }

    // handle key events
    keyevent(key, state){
        switch(key){
            case "ArrowUp":
                this.keys.up = state;
                break;
            
            case "ArrowDown":
                this.keys.down = state;
                break;
    
            case "ArrowLeft":
                this.keys.left = state;
                break;

            case "ArrowRight":
                this.keys.right = state;
                break;            
        }
    }

    keydown(key){
        this.keyevent(key, true);
    }

    keyup(key){
        this.keyevent(key, false);
    }
}