<template>
    <a-layout>
        <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
            <div class="logo" />
            <a-menu theme="dark" mode="horizontal" :style="{ lineHeight: '64px' }">
                <a-menu-item key="1">nav 1</a-menu-item>
                <a-menu-item key="2">nav 2</a-menu-item>
                <a-menu-item key="3">nav 3</a-menu-item>
            </a-menu>
        </a-layout-header>
        <a-layout-content class="context">
            <div class="window-and-input">
                <a-page-header style="font-size: 14px; font-weight:500;padding: 5px" v-show="friend"
                    :title="friend.name" :avatar="{ src: friend.avatar }" />
                <div class="window">
                    <template v-for="context in chatMessage">
                        <p v-if="context.type === 'send'" style="text-align: right; line-height: 30px; padding: 16px 15px; box-sizing: border-box;">
                            <a-space>
                                <span>{{ context.content }}</span>
                                <a-avatar :src="context.avatar" />
                            </a-space>
                        </p>
                        <p v-if="context.type === 'reverse'" style="text-align: left; line-height: 30px; padding: 16px 15px; box-sizing: border-box;">
                            <a-space>
                                <a-avatar :src="context.avatar" />
                                <span>{{ context.content }}</span>
                            </a-space>
                        </p>
                    </template>
                </div>
                <div class="tool">
                </div>
                <div class="input">
                    <a-input ref="input" type="textarea" v-model="inputMsg" :rows="3" showCount placeholder="发送消息"
                        @keyup.enter.native="send"></a-input>
                    <pre style="text-align: right; line-height:26px; font-size: 12px;color: #aaa;">回车发送</pre>
                </div>
            </div>
            <div class="list-and-tools">
                <a-card title="我的好友" :bordered="false">
                    <template #extra>
                        <a-button type="link" @click="getUserList">刷新</a-button>
                    </template>
                    <a-list item-layout="horizontal" :split="false" :loading="loading">
                        <template v-for="item in userItems">
                            <a-list-item>
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
                <p>我是谁?</p>
                <a-select v-model:value="self.id" style="width: 100%; margin: 10px auto;">
                    <a-select-option v-for="item in userItems" :value="item.id">{{ item.name }}</a-select-option>
                </a-select>
                <a-button type="primary" @click="selectAccount" block>选择</a-button>
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
            friend: {},
            self: {},
            visible: true,
            chatMessage: []
        }
    },
    methods: {
        createConnection() {
            this.socket = new WebSocket("ws://127.0.0.1:8080/ws/" + this.self.id);
            this.socket.onmessage = this.onmessage;
            this.socket.onopen = console.log;
            this.socket.onerror = console.error;
        },
        onmessage(event) {
            let data = JSON.parse(event.data);
            if (data.content) {
                this.chatMessage.push({ type: 'reverse', data: { ...data, avatar: this.friend.avatar } });
            }
        },
        send() {
            let data = { command: 'im.chat', data: { target: this.friend.id, source: this.self.id, content: this.inputMsg } };
            this.socket.send(JSON.stringify(data));
            this.chatMessage.push({ type: 'send', data: { ...data.data, avatar: this.self.avatar } });
            this.inputMsg = null;
        },
        beginSession(item) {
            this.sendContext = [];
            this.friend = item;
        },
        getUserList() {
            this.loading = true;
            this.$axios.$get('/api/user/list').then(resp => {
                this.userItems = resp
            }).finally(() => {
                this.loading = false
            })

        },
        selectAccount() {
            this.self = this.userItems.filter(e => e.id === this.self.id)[0];
            this.createConnection();
        },
        mounted() {
            this.getUserList();
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
    height: 100%;
    padding: 10px;
}

.window {
    height: 400px;
    background-color: #f5f5f5;
    border-radius: 6px;
    margin-bottom: 20px;
    overflow-y: auto;
}

.a-list-item:hover {
    background-color: #141414;
    user-select: pointer;
}
</style>    