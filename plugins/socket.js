const IMChat = function (ip, port, path){
    this.ip = ip;
    this.port = port;
    this.path = path;
    this.socket = null;
    this.onOpen = function(){}
    this.onMessage = function(){}
    this.onClose = function(){}
    this.onError = function(){}

    this.message = function(conmmand, data) {
        let msg = { conmmand, data };
        this.toText = function(){
            return JSON.stringify(msg);
        }
        this.toMsg = function(data){
            return JSON.parse(data)
        }

    }

    this.openConnection = function(){
        this.socket = new WebSocket("ws://" + this.ip + ":" + this.port + "/" + this.path);
        ws.onopen = this.onOpen;
        ws.onclose = this.onClose;
        ws.onmessage = this.onMessage;
        ws.onerror = this.onError;
        return ws;
    }  

    this.send = function(message) {
        message()
    }
}

let im = new im(null, )

export default im;
