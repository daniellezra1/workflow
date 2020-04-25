<template>
  <section class="board-details" v-if="board" :style="{background: boardStyle}">
    <board-nav
      :boardName="board.name"
      :members="board.members"
      :dueDate="board.dueDate"
      :creator="board.creator"
      @toggle-activitylog="toggleActivitylog"
      @toggle-settings="toggleSettings"
      @update-boardname="updateBoardname"
      @add-member="addMember"
    ></board-nav>
    <add-member
      v-if="isAddMember"
      :users="users"
      :members="board.members"
      @add-new-member="addNewMember"
      @remove-member="removeMember"
      @close-add-member="isAddMember=false"
    ></add-member>
    <transition name="slide" appear>
      <board-settings
        v-if="isOpenBoardSetting"
        :board="board"
        :class="{'board-settings-open': isOpenBoardSetting}"
        @toggle-settings="toggleSettings"
        @set-bgc="setBgc"
        @delete-board="deleteBoard"
        @change-date="changeDate"
        @update-boardname="updateBoardname"
      ></board-settings>
    </transition>
    <transition name="slide" appear>
      <activitylog
        v-if="isOpenActivitylog"
        class="main-activitylog"
        :isMain="true"
        :activitieslog="board.activitieslog"
        @close-activitylog="toggleActivitylog"
      ></activitylog>
    </transition>
    <tasklist-list
      :taskLists="board.taskLists"
      :boardId="board._id"
      @update-board="updateLocalBoard"
      @update-lists="updateLists"
      @upadte-activitylog="upadteActivitylog"
    ></tasklist-list>
    <router-view></router-view>
  </section>
</template>

<script>
import boardNav from "../components/board-nav.vue";
import tasklistList from "../components/tasklists-list.vue";
import activitylog from "../components/activitylog.vue";
import boardSettings from "../components/board-settings.vue";
import addMember from "../components/add-member.vue";
import socketService from "../services/socket.service.js";

export default {
  name: "board-details",
  data() {
    return {
      board: null,
      isTaskOpen: false,
      isDrop: true,
      isOpenActivitylog: false,
      isOpenBoardSetting: false,
      isAddMember: false,
      users: []
    };
  },
  computed: {
    boardStyle() {
      var style;
      if (this.board.style.color) style = this.board.style.color;
      else if (this.board.style.url)
        style = `url("${this.board.style.url}") no-repeat fixed 100%`;
      return style;
    }
  },
  methods: {
    updateLocalBoard(board) {
      this.board = board;
    },
    async updateBoard() {
      const board = JSON.parse(JSON.stringify(this.board));
      await this.$store.dispatch({
        type: "updateBoard",
        board
      });
      socketService.emit(
        "update board",
        JSON.parse(JSON.stringify(this.board))
      );
    },
    updateLists(lists) {
      this.board.taskLists = lists;
      this.updateBoard();
    },
    async upadteActivitylog(activitylog) {
      this.$store.commit({
        type: "updateActivitieslog",
        activitylog
      });

      this.board.activitieslog = JSON.parse(JSON.stringify(this.$store.getters.board.activitieslog));
      this.updateBoard();
    },
    toggleActivitylog() {
      this.isOpenActivitylog = !this.isOpenActivitylog;
    },
    toggleSettings() {
      this.isOpenBoardSetting = !this.isOpenBoardSetting;
    },
    setBgc(bgc) {
      this.board.style = bgc;
      this.updateBoard();
    },
    changeDate(newDate) {
      this.board.dueDate = newDate;
      this.updateBoard();
    },
    async deleteBoard() {
      await this.$store.dispatch({
        type: "deleteBoard",
        boardId: this.board._id
      });
      this.$router.push(`/`);
    },
    async updateBoardname(newBoardname) {
      this.board.name = newBoardname;
      await this.$store.dispatch({
        type: "updateBoard",
        board: this.board
      });
    },
    async addMember() {
      const users = await this.$store.dispatch({
        type: "getUsers"
      });

      this.isAddMember = true;
      this.users = users;
    },
    async addNewMember(user) {
      const member = {
        _id: user._id,
        username: user.username,
        imgUrl: user.imgUrl
      };

      this.board.members.push(member);

      await this.$store.dispatch({
        type: "updateBoard",
        board: this.board
      });
    },
    async removeMember(member) {
      const memberIdx = this.board.members.findIndex(
        currMember => currMember._id === member._id
      );

      this.board.members.splice(memberIdx, 1);

      await this.$store.dispatch({
        type: "updateBoard",
        board: this.board
      });
    }
  },
  async created() {
    const boardId = this.$route.params.id;
    const board = await this.$store.dispatch({
      type: "loadBoard",
      boardId
    });
    this.board = JSON.parse(JSON.stringify(board));
    socketService.setup();
    socketService.emit("board topic", this.board._id);
    socketService.on("update newBoard", this.updateLocalBoard);
  },
  destroyed() {
    socketService.off("update newBoard", this.updateLocalBoard);
    socketService.terminate();
  },
  watch: {
    "$route.params": async function() {
      const boardId = this.$route.params.id;
      const board = await this.$store.dispatch({
        type: "loadBoard",
        boardId
      });
      this.board = JSON.parse(JSON.stringify(board));
      socketService.emit("board topic", boardId);
    }
  },
  components: {
    boardNav,
    tasklistList,
    activitylog,
    boardSettings,
    addMember
  }
};
</script>