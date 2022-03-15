/**
 *  Impliments player controls
**/

export default class Player {
    camera;
    
    constructor(camera){
        this.camera = camera;
    }

    event(key){
        alert(key);
    }
}