<template>
    <a-layout>
        <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
            <div class="logo" />
            <a-menu mode="horizontal" :style="{ lineHeight: '64px' }">
                <a-menu-item key="1"><a href="/">我的空间</a></a-menu-item>
                <a-menu-item key="2"><a href="/video/index">娱乐互动</a></a-menu-item>
                <a-menu-item key="3">账户管理</a-menu-item>
            </a-menu>
        </a-layout-header>
        <a-layout-content class="context">
            <div class="window-and-input">
                <div class="header" style="padding: 5px; line-height: 30px;">
                    <a-space v-if="friend">
                        <a-avatar :src="friend.avatar" />
                        <span style="font-weight: 600; font-size: 16px; color: #787878;">{{ friend.name }}</span>
                    </a-space>
                </div>
                <div class="window" ref="msgWindow">
                    <template v-for="(context, index) in chatMessage" >
                        <p v-if="context.type === 'send'" :key="index" class="msg-layout msg-layout-right">
                            <a-space>
                                <span class="msg-bubble msg-bubble-right">{{ context.data.content }}</span>
                                <a-avatar :src="context.data.avatar" />
                            </a-space>
                        </p>
                        <p v-if="context.type === 'reverse'" :key="index" class="msg-layout msg-layout-left">
                            <a-space>
                                <a-avatar :src="context.data.avatar" />
                                <span class="msg-bubble msg-bubble-left">{{ context.data.content }}</span>
                            </a-space>
                        </p>
                    </template>
                </div>
                <div class="tool" style="padding: 8px 10px; box-sizing: border-box;font-size: 18px;">
                    <a-space>
                        <a href="#" @click="()=>{}">
                            <a-icon type="video-camera" />
                        </a>
                        <a href="#" @click="()=>{}">
                            <a-icon type="phone" />
                        </a>
                        <a href="#" @click="()=>{}">
                            <a-icon type="folder"/>
                        </a>
                    </a-space>
                </div>
                <div class="input">
                    <a-input type="textarea" v-model.trim="inputMsg" :rows="3" showCount placeholder="发送消息"
                         @keyup.enter.native="send" />
                    <pre style="text-align: right; line-height:26px; font-size: 12px;color: #aaa;">回车发送</pre>
                </div>
            </div>
            <div class="list-and-tools">
                <a-card title="我的好友" :bordered="false" style="height: 75%;">
                    <template #extra>
                        <a-button type="link" @click="getUserList">刷新</a-button>
                    </template>
                    <a-list item-layout="horizontal" :split="false" :loading="loading">
                        <template v-for="item in userItems">
                            <a-list-item :key="item.id">
                                <a-list-item-meta>
                                    <template slot="title">
                                        <a @click="beginSession(item)" black>{{ item.name }}</a>
                                    </template>
                                    <template slot="description">
                                        <span style="color: #999999; font-size: 12px;">{{ item.alias }}</span>
                                    </template>
                                    <template slot="avatar">
                                        <a-avatar :src="item.avatar" />
                                    </template>
                                </a-list-item-meta>
                            </a-list-item>
                        </template>
                    </a-list>
                </a-card>
                <a-card title="个人信息" :bordered="false" size="small">
                    <a-card-meta :title="self.name" :description="self.alias">
                        <template #avatar>
                            <a-avatar :src="self.avatar" />
                        </template>
                    </a-card-meta>
                </a-card>
            </div>
        </a-layout-content>
        <a-layout-footer :style="{ textAlign: 'center' }">
            Ant Design ©2018 Created by Ant UED
        </a-layout-footer>
    </a-layout>
</template>
<script>
export default {
    name: 'Chat',
    data() {
        return {
            socket: null,
            inputMsg: null,
            userItems: [],
            loading: false,
            friend: null,
            self: {},
            visible: true,
            chatMessage: []
        }
    },
    mounted() {
        this.self = this.$auth.$storage.getLocalStorage('userInfo')
        console.log("加载中...", this.self)
        if (!this.self) {
            this.$router.push('/login');
            return;
        }
        this.createConnection();
        this.getUserList();
    },
    methods: {
        createConnection() {
            this.socket = new WebSocket("ws://127.0.0.1:9099/ws?" + this.self.id);
            this.socket.onmessage = this.onmessage;
            this.socket.onopen = console.log;
            this.socket.onerror = console.error;
        },
        onmessage(event) {
            let data = JSON.parse(event.data);
            if (data.content) {
                //不是当前聊天好友发来消息
                if(!this.friend){
                    this.$notification.info({
                        message: data.source,
                        description: data.content
                    });
                    return;
                }

                this.friend = this.userItems.filter(i => i.id == data.source)[0];
                this.chatMessage.push({ type: 'reverse', data: { ...data, avatar: this.friend.avatar } });
                this.$nextTick(()=> {
                    this.$refs['msgWindow'].scrollTop = this.$refs['msgWindow'].scrollHeight + 300;
                })
            }
        },
        send() {
            if (!this.inputMsg || this.inputMsg == "\n" || !this.friend) {
                this.inputMsg = null;
                return;
            }
            let data = { command: 'one.one.chat', data: { target: this.friend.id, source: this.self.id, content: this.inputMsg } };
            this.socket.send(JSON.stringify(data));
            this.chatMessage.push({ type: 'send', data: { ...data.data, avatar: this.self.avatar } });
            this.inputMsg = null;
            this.$nextTick(()=> {
                this.$refs['msgWindow'].scrollTop = this.$refs['msgWindow'].scrollHeight + 50;
            })
        },
        beginSession(item) {
            this.chatMessage = [];
            this.friend = item;
        },
        getUserList() {
            this.loading = true;
            this.$axios.$get('/api/user/list').then(resp => {
                this.userItems = resp
            }).finally(() => {
                this.loading = false
            })

        }
    }
}
</script>
<style scoped>
#components-layout-demo-fixed .logo {
  width: 120px;
    height: 31px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px 24px 16px 0;
    float: left;
}

.site-layout .site-layout-background {
    background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
    background: #141414;
}

.context {
    background-color: #fff;
    padding: 24px;
    height: 590px;
    margin: 0 50px;
    margin-top: 100px;
    display: flex;
    border-radius: 6px;
}

.window-and-input {
    flex: 1;
    order: -1;
    height: 100%;
    padding: 1px 10px;
    border-right: 1px solid rgb(233, 227, 227);
}

.list-and-tools {
    width: 20%;
    min-width: 200px;
    height: 100%;
    padding: 10px;
}

.window {
    height: 380px;
    background-color: #f5f5f5;
    border-radius: 6px;
    padding: 18px 5px;
    box-sizing: border-box;
    /* margin-bottom: 20px; */
    overflow-y: auto;
}

.window::-webkit-scrollbar{
    display:  none;
}

.msg-layout{
     line-height: 30px; 
     padding: 3px 15px;
     box-sizing: border-box;
}

.msg-layout-left{
     text-align: left;
}

.msg-layout-right{
 text-align: right;
}

.msg-bubble{
    color: #444; 
     font-size: 12px; 
     font-weight: 500; 
     padding: 8px 12px;
     box-sizing: border-box;
     border-radius: 6px;
     box-shadow: 1px 1px 20 rgba(255, 255, 255, 0.2);
}
.msg-bubble-right{
    background: rgb(91, 76, 175);
    color: #eee;
    position: relative;
}

.msg-bubble-right::after{
    position: absolute;
    content: "";
    width: 0;
    height: 0;
    left: 100%;
    top: 6px;
    border-top: 7px solid transparent;
    border-left: 10px solid rgb(91, 76, 175);
    border-bottom: 4px solid transparent;
}

.msg-bubble-left{
    color: rgb(44, 19, 19);
     background: rgb(177, 231, 116);
     position: relative;
}
.msg-bubble-left::before{
    position: absolute;
    content: "";
    width: 0;
    height: 0;
    right: 100%;
    top: 6px;
    border-top: 7px solid transparent;
    border-right: 10px solid rgb(177, 231, 116);
    border-bottom: 4px solid transparent;
}
.a-list-item:hover {
    background-color: #141414;
    user-select: pointer;
}
.ant-notification-notice {
    border-radius: 6px;
}
</style> 