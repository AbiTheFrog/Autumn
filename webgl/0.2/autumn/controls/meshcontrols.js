/**
 *  Used for controlling mesh transformations
**/

export default class MeshControls {
    rotX = 0;
    rotY = 0;
    rotZ = 0;
    
    vX = 0;
    vY = 0;
    vZ = 0;
    
    scale = 0;

    rotSpeed = 0.01;
    vSpeed = 0.1;
    scaleSpeed = 1;

    constructor(mesh){
        this.mesh = mesh;
    }

    keydown(key){
        switch(key){
            case 'ArrowUp':
                this.rotX = this.rotSpeed;
                break;
            
            case "ArrowDown":
                this.rotX = -this.rotSpeed;
                break;
            
            case "ArrowRight":
                this.rotY = this.rotSpeed;
                break;
            
            case "ArrowLeft":
                this.rotY = -this.rotSpeed;
                break;
            
            case 'w':
                this.vY = this.vSpeed;
                break;
            
            case 's':
                this.vY = -this.vSpeed;
                break;
            
            case 'd':
                this.vX = this.vSpeed;
                break;
            
            case 'a':
                this.vX = -this.vSpeed;
                break;
            
            case 'r':
                this.rotZ = this.rotSpeed;
                break;
        }
    }

    keyup(key){
        switch(key){
            case 'ArrowUp':
            case "ArrowDown":
                this.rotX = 0;
                break;
            
            case "ArrowRight":
            case "ArrowLeft":
                this.rotY = 0;
                break;
            
            case 'w':
            case 's':
                this.vY = 0;
                break;
            
            case 'd':
            case 'a':
                this.vX = 0;
                break;
            
            case 'r':
                this.rotZ = 0;
                break;
        }
    }
    
    update(){
        this.mesh.transform.rotate(this.rotX, this.rotY, this.rotZ);

        this.mesh.transform.translate(this.vX, this.vY, 0);

        this.mesh.transform.scale(this.scale, this.scale, this.scale);
    }
};