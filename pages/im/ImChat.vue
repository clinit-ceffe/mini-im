<template>
    <main class="im-warp">
        <a-row>
          <a-col :span="6">
            <a-card :title="userInfo.name" style="width: 250px">
                <a-list v-if="onlineUsers != []" item-layout="horizontal">
                    <a-list-item v-for="item in onlineUsers" :key="item.id">
                        <a-list-item-meta
                        description="在线"
                        >
                        <template #title>
                         <a-button type="link" @click="startChat(item)" danger>{{item.name}}</a-button>
                        </template>
                        <template #avatar>
                            <a-avatar :src="item.icon" />
                        </template>
                        </a-list-item-meta>
                    </a-list-item>
                </a-list>
            </a-card>
          </a-col>
          <a-col :span="18">
            <a-alert type="warning" show-icon message="提示信息" :description="userInfo.name +''+alertMsg" v-show="alertMsg.length > 0" style="margin-bottom: 15px"></a-alert>
            <a-card :title="session.name" style="overflow:hidden;">
                <template #extra><a href="#"> 更改</a></template>
                <div class="msg-view" style="height: 300px; overflow: scroll">
                    <p v-for="msg in sends" :key="msg">
                         <a-list-item-meta :description="msg.content" >
                            <template #title>
                                <a-button type="link" @click="startChat(msg)" danger>{{msg.name}}</a-button>
                            </template>
                            <template #avatar>
                                <a-avatar :src="msg.icon" />
                            </template>
                        </a-list-item-meta>
                    </p>
                    <p v-for="msg in resvose" :key="msg" style="text-aligin: right">
                         <a-list-item-meta :description="msg.body.content" >
                            <template #title>
                                <a-button type="link" @click="startChat(msg)" danger>{{msg.body.name}}</a-button>
                            </template>
                            <template #avatar>
                                <a-avatar :src="msg.body.icon" />
                            </template>
                        </a-list-item-meta>
                    </p>
                </div>
            </a-card>
             <a-card  v-if="session.id" style="margin-top: 10px">
                <a-form class="im-form" >
                    <a-form-item style="width: 100%">
                         <a-textarea v-model="msg"  placeholder="开始聊天吧~"  style="width:100%" :rows="2" />
                    </a-form-item>
                    <a-form-item style="text-align:right; margin:0">
                        <template v-if="msg == ''">
                            <a-button type="primary" disabled  @click="send"> 发送消息 </a-button>
                        </template>
                        <template v-else>
                            <a-button type="primary" @click="send"> 发送消息 </a-button>
                        </template>   
                    </a-form-item>
                </a-form>
             </a-card>
          </a-col>
        </a-row>
    </main>
</template>
 
<script>

let message = {
    header: {},
    body: {},
    attribute: {}
}

export default {
    data () {
        return {
            path:"ws://127.0.0.1:8098/ws",
            socket:"",
            msg: "",
            alertMsg: "",
            resvose: [],
            sends: [],
            userInfo: {},
            onlineUsers: [],
            message: {},
            session: {}
        }
    },
    mounted () {    
        // 初始化
        this.init()
    },
    methods: {
        init: function () {
            if(typeof(WebSocket) === "undefined"){
                alert("您的浏览器不支持socket")
            }else{
                // 实例化socket
                this.socket = new WebSocket(this.path)
                // 监听socket连接
                this.socket.onopen = this.open
                // 监听socket错误信息
                this.socket.onerror = this.error
                // 监听socket消息
                this.socket.onmessage = this.getMessage
            }
        },
        open: function () {
            console.log("socket连接成功")
            this.alertMsg = "登录成功";
        },
        error: function (e) {
            console.log("连接错误", e)
            this.alertMsg = "网络异常，连接失败";
        },
        getMessage: function (msg) {
            let msgObj = JSON.parse(msg.data);
            if(msgObj.header.register){
                this.userInfo = {
                    id: msgObj.attribute.id,
                    name: msgObj.attribute.name
                }
                return;
            }
            if(msgObj.header.online){
                this.onlineUsers = msgObj.body;
                return;
            }
            this.$notification.open({
                message: msgObj.body.name + "给你发来一条消息",
                description: msgObj.body.content
            })
            this.resvose.push(msgObj);
            console.log("接受到：",  this.resvose)
        },
        send: function () {
            let pkg = {...this.message};
            pkg.body.content=this.msg;
            let text = JSON.stringify(pkg);
            this.socket.send(text);
            this.sends.push({
                name: this.userInfo.name,
                content: this.msg,
                icon: this.userInfo.icon
            })

        },
        close: function () {
            console.log("socket已经关闭")
            this.alertMsg = "已退出IM"
        },
        startChat: function(item){
            this.session = {...item}
            this.message = {
                header : {
                    chat: true,
                    type: 'p2p',
                    uId: this.userInfo.id,
                    name: this.userInfo.name,
                    icon: this.userInfo.icon
                },
                body: {
                    tId: item.id,
                    name: item.name,
                    icon: item.icon,
                    content: this.msg
                }
            }
            this.resvose = []
            this.sends=[]
        }
    },
    destroyed () {
        // 销毁监听
        this.socket.onclose = this.close
    }
}
</script>
 
<style>
body{
    background: #f3f3f361;
}
.im-warp{
    width: 1100px;
    margin: 30px auto 0;
    /* box-shadow: 0 0 20 rgba(0, 0, 0, .3); */
}
.msg-view {
    max-height: 200px;
    overflow: scroll-y;
    padding: 10px;
    box-sizing: border-box;
}

.msg-view::-webkit-scrollbar {
    display: none;
}
</style>