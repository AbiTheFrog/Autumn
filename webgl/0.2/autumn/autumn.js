/**
 *  Autumn
 *      A simple webgl pseudo voxel game
 *      Made by Abi The Frog
 *      Version 0.2
**/

"use strict";

import Mesh from "./graphics/mesh.js";
import MeshControls from "./controls/meshcontrols.js";

// shader program code
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

    // compile program
    const program = (() => {
        const vertexShaderSource = document.getElementById("vertex-shader-2d").text;
        const fragmentShaderSource = document.getElementById("fragment-shader-2d").text;
    
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        return createProgram(gl, vertexShader, fragmentShader);
    })();

    gl.useProgram(program); // for resolution

    const resolutionposition = gl.getUniformLocation(program, "resolution");

    document.onresize = () => {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(resolutionposition, gl.canvas.width, gl.canvas.height);
    }
    
    document.onresize();

    // init mesh
    const cube = new Mesh(gl, [
        0, 0, 0,
        100, 0, 0,
        100, 100, 0,

        100, 100, 0,
        0, 100, 0,
        0, 0, 0,

        0, 100, 0,
        0, 0, 100,
        0, 0, 0,

        0, 0, 100,
        0, 100, 0,
        0, 100, 100,

        100, 100, 100,
        0, 0, 100,
        0, 100, 100,

        0, 0, 100,
        100, 100, 100,
        100, 0, 100,

        100, 100, 100,
        100, 0, 0,
        100, 0, 100,

        100, 100, 100,
        100, 100, 0,
        100, 0, 0,

        0, 0, 0,
        0, 0, 100,
        100, 0, 0,

        100, 0, 0,
        0, 0, 100,
        100, 0, 100,

        0, 100, 100,
        0, 100, 0,
        100, 100, 0,

        0, 100, 100,
        100, 100, 0,
        100, 100, 100,
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

    // setup controls
    const controls = new MeshControls(cube);

    document.onkeydown = (event) => { controls.keydown(event.key); }
    document.onkeyup = (event) => { controls.keyup(event.key); }

    // set render settings
    gl.clearColor(0, 0, 0, 1);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    // render loop
    function render(){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        controls.update();

        cube.render();
    }
    render();
    setInterval(render, 20);
})();