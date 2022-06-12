<template>
  <div class="context">
    <video
      ref="video"
      class="video"
      src=""
      autoplay
      style="with: 100% height: 100%"
    ></video>
    <div class="tools">
      <a-input v-model="videoUrl"></a-input>
      <a-button type="primary" @click="playVideo">播放</a-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "abc",
  data() {
    return {
      videoUrl: null,
    };
  },
  methods: {
    playVideo: function () {
      this.$refs["video"].src = this.videoUrl;
    },
  },
};
</script>

<style scope>
body {
  width: 100%;
  height: 100%;
}
.context {
  /* flex: 1; */
  width: 100%;
  height: 100%;
}
.video {
  width: 50%;
  height: 50%;
  margin: 50px auto 20px;
}

.tools {
  bottom: 10px;
}
</style>