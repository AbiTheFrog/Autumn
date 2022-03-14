/**
  *  Matrix-transform library for use with webgl transformations
  *     Made by Abi The Frog
**/

function multiply(a, b){
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
  
    return [
      b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
  }
  
  function translate(x, y, z){
    return [
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1,
    ];
  }
  
  function rotateX(radians){
    const s = Math.sin(radians);
    const c = Math.cos(radians);
  
    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ];
  }
  
  function rotateY(radians){
    const s = Math.sin(radians);
    const c = Math.cos(radians);
  
    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ];
  }
  
  function rotateZ(radians){
    const s = Math.sin(radians);
    const c = Math.cos(radians);
  
    return [
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  }
  
  function rotate(x, y, z){
    var id = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  
    id = multiply(id, rotateX(x));
    id = multiply(id, rotateY(y));
    id = multiply(id, rotateZ(z));
  
    return id;
  }
  
  function scale(x, y, z){
    return [
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1,
    ];
  }
  
  export default class Transform {
    position;   // store position vec3
    rotation;   // store rotation vec3
    curscale;      // store scale vec3
    save;       // save state
    valid;      // valid flag

    constructor(position, rotation, scale){
      this.position = (position == undefined) ? [0, 0, 0] : position;
      this.rotation = (rotation == undefined) ? [0, 0, 0] : rotation;
      this.curscale = (scale    == undefined) ? [1, 1, 1] : scale;
    
      this.compile();
    }
  
    compile(){
      var save = multiply(translate(...this.position), rotate(...this.rotation));
      save = multiply(save, scale(...this.curscale));
      this.save = save;
      this.valid = true;
    }
    
    translate(x, y, z){
      this.position[0] += x;
      this.position[1] += y;
      this.position[2] += z;
      this.valid = false;
    }
  
    rotate(x, y, z){
      this.rotation[0] += x;
      this.rotation[1] += y;
      this.rotation[2] += z;
      this.valid = false;
    }
  
    scale(x, y, z){
      this.curscale[0] += x;
      this.curscale[1] += y;
      this.curscale[2] += z;
      this.valid = false;
    }
  
    get data(){
      if(!this.valid){
        this.compile();
      }
      return this.save;
    }
  };