/**
 *  Autumn
 *      A simple webgl pseudo-voxel game
 *      Made by Abi The Frog
 *      Version 0.1
**/

"use strict";

// import modules
import Mesh from "./autumn/graphics/mesh.js";
import Transform from "./autumn/math/matrix.js";

// asset code
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

// main function
(() => {
    // init. webgl
    const canvas = document.getElementById("canv");
    const gl = canvas.getContext("webgl");
    
    if(!gl){
        console.log("Failed to get webgl context");
        document.body.innerHTML = "Get a better browser";
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.onresize = () => {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        var left = 0;
        var right = gl.canvas.clientWidth;
        var bottom = gl.canvas.clientHeight;
        var top = 0;
        var near = 400;
        var far = -400;
        Transform.orthographic(left, right, bottom, top, near, far);

        console.log(Transform.ortho);
    }
    
    document.onresize();

    // load assets
    var vertexShaderSource = document.getElementById("vertex-shader-2d").text;
    var fragmentShaderSource = document.getElementById("fragment-shader-2d").text;
 
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    var program = createProgram(gl, vertexShader, fragmentShader);
    
    // init mesh
    const cube = new Mesh(gl, [
        0, 0, 0,
        0.5, 0, 0,
        0.5, 0.5, 0,

        0.5, 0.5, 0,
        0, 0.5, 0,
        0, 0, 0,

        0, 0.5, 0,
        0, 0, 0.5,
        0, 0, 0,

        0, 0, 0.5,
        0, 0.5, 0,
        0, 0.5, 0.5,

        0.5, 0.5, 0.5,
        0, 0, 0.5,
        0, 0.5, 0.5,

        0, 0, 0.5,
        0.5, 0.5, 0.5,
        0.5, 0, 0.5,

        0.5, 0.5, 0.5,
        0.5, 0, 0,
        0.5, 0, 0.5,

        0.5, 0.5, 0.5,
        0.5, 0.5, 0,
        0.5, 0, 0,

        0, 0, 0,
        0, 0, 0.5,
        0.5, 0, 0,

        0.5, 0, 0,
        0, 0, 0.5,
        0.5, 0, 0.5,

        0, 0.5, 0.5,
        0, 0.5, 0,
        0.5, 0.5, 0,

        0, 0.5, 0.5,
        0.5, 0.5, 0,
        0.5, 0.5, 0.5,
    ], [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,

        0, 0, 1,
        0, 1, 0,
        1, 0, 0,

        0, 1, 0,
        0, 0, 1,
        1, 0, 0,

        0, 0, 1,
        0, 1, 0,
        1, 0, 0,

        0, 1, 0,
        0, 0, 1,
        1, 0, 0,

        0, 0, 1,
        0, 1, 0,
        1, 0, 0,

        0, 1, 0,
        0, 1, 0,
        1, 0, 0,

        0, 1, 0,
        0, 0, 1,
        0, 1, 0,

        1, 0, 0,
        0, 0, 1,
        0, 1, 0,

        0, 1, 0,
        0, 0, 1,
        1, 0, 0,

        1, 0, 0,
        0, 1, 0,
        0, 0, 1,

        1, 0, 0,
        0, 0, 1,
        0, 1, 0,
    ], program);

    cube.transform.scale(300, 300, 300);
    
    // set rendering settings
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    // control variables
    var rotX = 0, rotY = 0;
    var vX = 0, vY = 0;
    var scale = 0;

    document.onkeydown = (event) => {
        switch(event.key){
            case "ArrowUp":
                rotX = 0.1;
                break;
            
            case "ArrowDown":
                rotX = -0.1;
                break;
            
            case "ArrowLeft":
                rotY = -0.1;
                break;
            
            case "ArrowRight":
                rotY = 0.1;
                break;
            
            case "a":
                vX = -0.1;
                break;
            
            case "d":
                vX = 0.1;
                break;
            
            case "w":
                vY = 0.1;
                break;
            
            case "s":
                vY = -0.1;
                break;
            
            case "+":
                scale = 1;
                break;
            
            case "-":
                scale = -1;
                break;
        }
    }

    document.onkeyup = (event) => {
        switch(event.key){
            case "ArrowUp":
            case "ArrowDown":
                rotX = 0;
                break;
            
            case "ArrowLeft":
            case "ArrowRight":
                rotY = 0;
                break;
            
            case "a":
            case "d":
                vX = 0;
                break;
            
            case "w":
            case "s":
                vY = 0;
                break;
            
            case "+":
            case "-":
            case "=":
                scale = 0;
                break;
        }
    }
    
    // render loop
    function render(){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        cube.transform.translate(vX, vY, 0);
        
        cube.transform.rotate(rotX, rotY, 0);

        cube.transform.scale(scale, scale, scale);

        cube.render();
    }
    render();
    setInterval(render, 20);
})()