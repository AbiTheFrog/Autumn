/**
 *  Defines a mesh class
 *      Made by Abi The Frog
**/

import Transform from "../math/matrix.js";

export default class Mesh {
    gl;         // webgl instance
    program;    // shader program to draw mesh with
    position;   // location of position attribute
    vertices;   // webgl buffer of vertices
    count;      // number of triangles
    transform;  // data transformation
    transpos;   // transform uniform position
    colors;     // webgl buffer of vertex colors
    colorpos;   // position of color attribute

    /**
     * @param gl webgl context
     * @param vertices an array of raw points
     * @param program the shader program to use
     * @param count triangle count (todo: detect)
     * @param transform starting transform in array format (optional)
    **/
    constructor(gl, vertices, colors, program, transform){
        this.gl = gl;
        this.program = program;

        this.vertices = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.position = gl.getAttribLocation(program, "position");

        this.count = vertices.length / 3;

        this.colors = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colors);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        this.colorpos = gl.getAttribLocation(program, "color");

        if(transform){
            this.transform = new Transform(transform);
        } else {
            this.transform = new Transform();
        }

        this.transpos = gl.getUniformLocation(program, "transform");
    }

    // render mesh
    render(){
        const gl = this.gl;
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colors);
        gl.enableVertexAttribArray(this.colorpos);
        gl.vertexAttribPointer(this.colorpos, 3, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
        gl.enableVertexAttribArray(this.position);
        gl.vertexAttribPointer(this.position, 3, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(this.transpos, false, this.transform.data);
        
        gl.drawArrays(gl.TRIANGLES, 0, this.count);
    }
};
