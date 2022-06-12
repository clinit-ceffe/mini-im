<template>
    <main>
         <h1 style="text-align:center">视频通话</h1>
         <a-row>
           <a-col :span="18">
            <a-card>
                <video class="video" ref="video" autoplay ></video>
            </a-card>
           </a-col>
           <a-col :span="6">
                <a-form style="width: 300px; height: 400px; margin: 30px auto">
                  <a-form-item>
                      <a-button type="prthisary" style="width: 100%" @click="handCall">录屏</a-button>
                      <a-button type="danger" style="width: 100%" @click="handClose">停止</a-button>
                  </a-form-item>
                </a-form>
           </a-col>
         </a-row>
    </main>
</template>

<style scoped>
.video{
    border: 20px;
}
</style>

<script>
   
const mediaConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: false
};
export default {
    data () {
        return {
            peer: null,
            ws: null,
            session: null,
            localStream: null,
            clientId: new Date().getTime()
        }
    },
    mounted(){
        this.createChanal(this.clientId)
    },
    methods: {
        createChanal: function(clientId) {
            if(typeof(WebSocket) === "undefined"){
                alert("您的浏览器不支持socket")
            }else{
                this.ws = new WebSocket("ws://192.168.38.1:8080/ws/"+ this.clientId);
                this.ws.onmessage  = this.onMessage;
                this.ws.onopen = this.onOpen;
                this.ws.onerror = this.onError;
            }
        },
        onOpen: function (e) {
            console.log("socket连接成功")
            this.$message.info("主播已上线,连接成功~");
        },
        onError: function (e) {
            console.log("连接错误", e)
            this.$message.console.error("网络异常，连接失败~");
        },
        onMessage: async function(event){
            const data = JSON.parse(event.data);
            console.log("接收消息" + data.type , data);

            if(data.type == 'offer'){
                console.log("处理offter")
                this.initPeer();

                this.peer.setRemoteDescription(data.desc);
                this.peer.ontrack = (event) => {
                    console.log("ontrack 接收到数据流... ", event.streams)
                    if(event.streams[0]){
                        console.log(event, event.streams)
                        this.$refs['video'].srcObject = event.streams[0]
                    }
                }

                this.peer.createAnswer().then(desc => {
                    this.peer.setLocalDescription(desc);
                    this.send({desc}, 'answer');    
                }).catch(alert);
            }
            if( data.type == 'answer'){
                this.$message.info("欢迎加入房间~");
                console.log("处理 answer", data.desc)
                this.peer.setRemoteDescription(data.desc);
            }
            if(data.type == 'ice'){
                console.log("处理 ice", data.candidate)
                this.peer.addIceCandidate(data.candidate)
            }
            
        },
        send: function (data, type) {
            console.log("发送消息类型：", type)
            this.ws.send(JSON.stringify({...data, type: type}))
        },
        initPeer: function (){
            this.peer = new RTCPeerConnection();
            this.peer.onicecandidate = this.onIcecandidate;
            this.peer.oniceconnectionstatechange = (evt) => {
                console.log('连接状态： : ' + evt.target.iceConnectionState);
            }
        },
        onIcecandidate: function(event) {
            console.log(" ice onicecandidate ",  event)
            if(event.candidate){
                this.send({candidate: event.candidate, clientId: this.clientId}, 'ice')
            }
        },
        getLocalStream: async function() {
           this.localStream =  await navigator.mediaDevices.getDisplayMedia({video: true, audio:true});
           return this.localStream;
        },
        handCall: function() {
            console.log("开始录制...")
            this.initPeer();
            this.getLocalStream().then(stream =>{
                this.$refs['video'].srcObject = stream;
                stream.getTracks().forEach((track) =>{
                    this.peer.addTrack(track, stream);
                });
                this.peer.createOffer(mediaConstraints).then(desc => {
                    this.peer.setLocalDescription(desc);
                    this.send({desc}, 'offer');
                }).catch(alert);
            });                
        },
        handClose: function() {
            this.localStream.getTracks().forEach(track => track.stop());
            if(this.peer){
                this.peer.close();
                this.peer = null;
            }
            this.$message.info("主播已下线,直播结束~");
        },
        initSession: function()  {
            //this.createChanal(new Date().getTthise());
        }
    }
}
</script>
   