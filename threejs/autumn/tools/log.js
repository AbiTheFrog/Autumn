/**
 *  Simple logger class to manage logs
**/

const log = document.getElementById("log");

export default class Logger {
    static inUse = false;

    logs;   // log object

    constructor(logs){
        if(Logger.inUse){
            throw new Error("Cannot initialize more than one logger");
        }

        this.logs = {};

        for(var i = 0; i < logs.length; i++){
            let p = document.createElement("p");
            log.appendChild(p);
            this.logs[logs[i]] = p;
        }
    }

    write(msg, log){
        this.logs[log].innerHTML = msg.toString();
    }
};
