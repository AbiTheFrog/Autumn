/**
 *  Impliments player controls
**/

const log = document.getElementById("log");

const sin = Math.sin;
const cos = Math.cos;

const sens = 2;

const xaxis = new THREE.Vector3(1, 0, 0);
const yaxis = new THREE.Vector3(0, 1, 0);

const clamp = (num, min, max) => {
    if(num < min){
        return min;
    } else if(num > max){
        return max;
    } else {
        return num;
    }
};

const PI = Math.PI;

export default class Player {
    camera;     // three js camera object
    world;      // world object

    light;      // render attribute of player (a point light)

    keys;       // key map

    rx = 0;
    ry = 0;

    phi;        // used for rotation    y
    theta;      // used for rotation    x

    constructor(camera, world, canvas){
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

        // init key map
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            jump: false,
            crouch: false,
            run: false,
        };

        // initialize height
        this.camera.position.y = this.world.height(this.camera.position.x, this.camera.position.z) + 2;
    }

    // update
    update(deltaTime){
        const speed = this.keys.run ? 30 * deltaTime : 10 * deltaTime;

        // move along x - z
        {
            const fv = (this.keys.up ? 1 : 0) + (this.keys.down ? -1 : 0);
            const hv = (this.keys.left ? 1 : 0) + (this.keys.right ? -1 : 0);

            const forward = new THREE.Vector3(-hv * speed, 0, -fv * speed);
            forward.applyQuaternion(this.camera.quaternion);
            
            this.camera.position.add(forward);
        }

        // move along y
        {
            if(this.keys.jump){
                this.camera.position.y += speed;
            }

            if(this.keys.crouch){
                this.camera.position.y -= speed;
            }
        }

        // set light to follow
        this.light.position.set(...this.camera.position);
        
        // update log
        log.innerHTML = this.camera.position.toArray();
    }

    // handle key events
    keyevent(key, state){
        switch(key){
            case "ArrowUp":
            case "w":
                this.keys.up = state;
                break;
            
            case "ArrowDown":
                case "s":
                this.keys.down = state;
                break;
    
            case "ArrowLeft":
            case "a":
                this.keys.left = state;
                break;

            case "ArrowRight":
            case "d":
                this.keys.right = state;
                break;
            
            case "q":
                this.keys.jump = state;
                break;
            
            case "e":
                this.keys.crouch = state;
                break;
            
            case " ":
                this.keys.run = state;
                break;
            
            default:
                console.log("No action mapped to " + key);
                break;
        }
    }

    keydown(key){
        this.keyevent(key, true);
    }

    keyup(key){
        this.keyevent(key, false);
    }

    rotate(deltaX, deltaY){
        this.ry -= (deltaX / window.innerWidth) * sens;
        this.rx -= (deltaY / window.innerHeight) * sens;

        if(this.rx > PI / 3){
            this.rx = PI / 3;
        } else if(this.rx < -PI / 3){
            this.rx = -PI / 3;
        }

        const phi = this.ry;
        const theta = this.rx;

        const qx = new THREE.Quaternion();
        const qy = new THREE.Quaternion();

        qx.setFromAxisAngle(yaxis, phi);
        qy.setFromAxisAngle(xaxis, theta);

        const q = new THREE.Quaternion();

        q.multiply(qx);
        q.multiply(qy);

        this.camera.quaternion.copy(q);
    }
}
