<template>
    <main>
         <h1 style="text-align:center">视频通话</h1>
         <a-row>
           <a-col :span="18">
            <a-card>
                <video class="video" ref="localStream"  width="400" height="500" autoplay muted ></video>
                <video class="video" id="remote-video" ref="remoteStream"  width="400" height="500" playsinline autoplay muted></video>
            </a-card>
           </a-col>
           <a-col :span="6">
                <a-form style="width: 300px; height: 400px; margin: 30px auto">
                  <a-form-item>
                      <a-input v-model="source" placeholder="输入我的豆豆号"></a-input>
                      <a-button type="primary" style="width: 100%" @click="createChannel">登录</a-button>
                      <a-input v-model="target" placeholder="输入他的豆豆号"></a-input>
                  </a-form-item>
                  <a-form-item>
                      <a-button type="primary" style="width: 100%" @click="cell">拨号</a-button>
                      <a-button type="danger" style="width: 100%" @click="handup">挂断</a-button>
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
export default {
    data () {
        return {
            localPeer: null,
            remotePeer: null,
            socket: null,
            session: null,
            target: '',
            source: ''
        }
    },
    mounted(){
    },
    methods: {
        createChannel: function () {
            if(typeof(WebSocket) === "undefined"){
                alert("您的浏览器不支持socket")
            }else{
                // 实例化socket
                this.socket = new WebSocket("ws:/localhost:8080/rtc/" + this.source)
                // 监听socket连接
                this.socket.onopen = this.open
                // 监听socket错误信息
                this.socket.onerror = this.error
                // 监听socket消息
                this.socket.onmessage = this.onMessage
            }
        },
        open: function (e) {
            console.log(e)
            console.log("socket连接成功")
            this.alertMsg = "登录成功";
        },
        error: function (e) {
            console.log("连接错误", e)
            this.alertMsg = "网络异常，连接失败";
        },
        onMessage: async function(event){
            const that = this;
            console.log("收到消息： ", event.data)
            const data = JSON.parse(event.data);
            //接受方
            if(data.type == 'offer'){
                await this.createPeerConnection();
            
                this.remotePeer.setRemoteDescription(data.desc);

                this.remotePeer.ontrack =  function(event) {
                    if (event.streams && event.streams[0]) {
                        that.$refs['remoteStream'].srcObject = event.streams[0];
                    }
                };

                this.remotePeer.createAnswer().then((desc) => {
                    console.log("发送answer")
                    that.remotePeer.setLocalDescription(desc);
                    that.sendMessage({desc: desc}, desc.type);
                })

                    
                this.remotePeer.onicecandidate = (event) => {
                    console.log("交换信令 remotePeer ", event.candidate)
                    if( event.candidate !== null ){
                        that.remotePeer.addIceCandidate(event.candidate);
                        // that.sendMessage({candidate: event.candidate}, 'targetCandidate');
                    }
                }
            }
            if(data.type === 'answer'){
                this.localPeer.setRemoteDescription(data.desc);
            }
            if(data.type === 'targetCandidate'){
                if(!this.localPeer){
                    this.localPeer = new RTCPeerConnection();
                }
                this.localPeer.addIceCandidate(data.candidate);
            }
            if(data.type === 'sourceCandidate'){
                if(!this.remotePeer){
                    this.remotePeer = new RTCPeerConnection();
                }
                this.remotePeer.addIceCandidate(data.candidate);
            }
           
        },
        sendMessage: function(data, type){
            console.log("发送 " + type)
            let msg = {...data, type: type, source: this.source, target: this.target}
            this.socket.send(JSON.stringify(msg))
        },
        cell(){
           this.openConn();
        },  
        async createPeerConnection(){
            const that = this;
            await navigator.mediaDevices.getUserMedia({video:true, audio:true}).then(stream => {
                this.$refs['localStream'].srcObject=stream;
                let configuration = {}
                this.localPeer = new RTCPeerConnection(configuration);
                this.remotePeer = new RTCPeerConnection(configuration);
        
                stream.getTracks().forEach(track => {
                    that.localPeer.addTrack(track, stream)
                });

                this.remotePeer.ontrack =  function(event) {
                    if (event.streams && event.streams[0]) {
                        that.$refs['remoteStream'].srcObject = event.streams[0];
                    }
                };
            }).catch(err => {
                console.log(err);
            })
           
        },
       async openConn(){
           const that = this;
           await this.createPeerConnection();

           this.localPeer.createOffer().then((desc) => {
                console.log("发送offer")
                that.localPeer.setLocalDescription(desc);
                that.sendMessage({desc: desc}, desc.type)
            });

            this.localPeer.onicecandidate = (event) => {
                if( event.candidate !== null){
                    that.localPeer.addIceCandidate(event.candidate);
                    // that.sendMessage({candidate: event.candidate}, 'sourceCandidate');
                }
            }
        },
        handup(){
            try {
               this.remotePeer.close();
               this.localPeer.close();
            }finally{
                if(this.remotePeer || this.localPeer){
                    this.localPeer = null;
                    this.remotePeer = null;
                }
                alert("通过结束...")
            }
        }
    }
}
</script>
   