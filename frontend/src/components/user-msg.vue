<template>
  <section class="msg-container" v-if="msg" :class="msg.type">
    <button class="close-btn" @click="closeMsg">
      <font-awesome-icon icon="times" />
    </button>
    <div>{{msg.txt}}</div>
  </section>
</template>

<script>
import { eventBus } from "../services/event-bus.service.js";

export default {
  data() {
    return {
      msg: null
    };
  },
  methods: {
    closeMsg() {
      this.msg = null;
    }
  },
  created() {
    eventBus.$on("show-msg", msg => {
      this.msg = msg;
      setInterval(() => {
        this.msg = null;
      }, 2000);
    });
  }
};
</script>