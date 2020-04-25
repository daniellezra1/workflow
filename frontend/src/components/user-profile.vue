<template>
  <section class="user-profile">
    <header>
      <button class="close-btn" @click="$emit('close-user-profile')">
        <font-awesome-icon icon="times" />
      </button>
      <div>
        <span class="el-icon-user"></span>
        {{user.username}}
      </div>
    </header>

    <main>
      <button :class="{'active': isProfile}" @click="toggle('isProfile')">Profile and visibility</button>
      <button :class="{'active': isActivity}" @click="toggle('isActivity')">Activity</button>
    </main>

    <section class="profile" v-if="isProfile">
      <div>
        <img v-if="user.imgUrl" :src="user.imgUrl" class="member-img" />
        <avatar v-else :username="user.username" class="member"></avatar>
      </div>

      <div>
        <label for="add-img">
          <div>{{(user.imgUrl) ? 'Change image' : 'Add image' }}</div>
          <input id="add-img" type="file" @change="addImg" class="img-input" />
        </label>
      </div>

      <div class="user-name">
        <label>
          Change your username
          <input
            class="board"
            type="text"
            v-model="newName"
            placeholder="Username"
          />
        </label>
        <button class="add-btn" @click="changeName">Change</button>
      </div>
    </section>

    <section class="activity-container" v-if="isActivity">
      <div class="msg" v-if="!activitieslog.length">{{msg}}</div>

      <ul class="activities">
        <li v-for="(activity,idx) in activitieslog" :key="idx" class="activity">
          <div>
            <img v-if="activity.user.imgUrl" :src="activity.user.imgUrl" class="member-img" />
            <avatar v-else :username="activity.user.username" class="member"></avatar>
          </div>
          <div>
            <span class="username">{{activity.user.username}}</span>
            {{activity.txt}}
            <div class="due-date">{{activity.createdAt | fromDate}}</div>
          </div>
        </li>
      </ul>
    </section>
  </section>
</template>

<script>
import avatar from "vue-avatar";
export default {
  name: "user-profile",
  props: {
    user: Object
  },
  data() {
    return {
      activitieslog: null,
      isProfile: false,
      isActivity: false,
      newName: this.user.username,
      msg: ""
    };
  },
  methods: {
    toggle(type) {
      this[type] = !this[type];
      if (type === "isProfile") this.isActivity = false;
      else this.isProfile = false;
    },
    async updateUser() {
      await this.$store.dispatch({
        type: "updateUser",
        user: JSON.parse(JSON.stringify(this.user))
      });
    },
    async addImg(ev) {
      const url = await this.$store.dispatch({
        type: "uploadImg",
        ev
      });

      this.user.imgUrl = url;
      this.updateUser();
    },
    async changeName() {
      this.user.username = this.newName;
      await this.$store.commit({
        type: "updateUserName",
        user: this.user
      });

      await this.$store.dispatch({
        type: "saveBoards"
      });

      this.updateUser();
    },
    getUserActivitylog() {
      this.$store.commit({
        type: "getUserActivitylog",
        userId: this.user._id
      });
      this.activitieslog = this.$store.getters.currActivitylog;
    }
  },
  async created() {
    await this.$store.dispatch({
      type: "loadBoards"
    });

    this.getUserActivitylog();
    if (this.$route.params.id) {
      this.msg = "You don't have any activity on this board";
    } else {
      this.msg =
        "In order to see your activities, please connect to the boards that you are a member of";
    }
  },
  watch: {
    "$route.params": function() {
      this.$emit("close-user-profile");
    }
  },
  components: {
    avatar
  }
};
</script>