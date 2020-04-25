<template>
  <section class="home-page">
    <header>
      <img src="../assets/img/header.jpg" />
    </header>

    <section class="search">
      <i class="el-icon-search"></i>
      <input type="text" placeholder="Search board" v-model="searchKeyword" />
    </section>

    <div v-if="loggedinUser.username !== 'guest'">
      <h4>Personal Boards:</h4>
      <main v-if="boards">
        <div class="board-preview">
          <button @click="addNewBoard">
            <font-awesome-icon class="icon" icon="plus" />Create new board
          </button>
        </div>
        <div
          class="board-preview"
          v-for="board in boardByUser"
          :key="board._id"
          :style="{background: board.style.color || 'url(' + board.style.url + ')' + ' no-repeat center center / cover'}"
        >
          <router-link :to="'/board/' + board._id ">
            <button>{{board.name}}</button>
          </router-link>
        </div>
      </main>
      <h4>All Boards:</h4>
    </div>

    <main v-if="boards">
      <div v-if="loggedinUser.username === 'guest'" class="board-preview">
        <button @click="addNewBoard">
          <font-awesome-icon class="icon" icon="plus" />Create new board
        </button>
      </div>
      <div
        class="board-preview"
        v-for="board in boardBySearch"
        :key="board._id"
        :style="{background: board.style.color || 'url(' + board.style.url + ')' + ' no-repeat center center / cover'}"
      >
        <router-link :to="'/board/' + board._id ">
          <button>{{board.name}}</button>
        </router-link>
      </div>
    </main>
  </section>
</template>

<script>
export default {
  name: "home-page",
  data() {
    return {
      boards: null,
      searchKeyword: "",
      loggedinUser: null
    };
  },
  computed: {
    boardBySearch() {
      if (!this.searchKeyword) return this.boards;
      else
        return this.boards.filter(board =>
          board.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );
    },
    boardByUser() {
      let userBoards = [];
      this.boards.forEach(board => {
        if (
          board.members.find(member => member._id === this.loggedinUser._id)
        ) {
          userBoards.push(board);
        }
      });
      if (!this.searchKeyword) return userBoards;
      else
        return userBoards.filter(board =>
          board.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );
    }
  },
  async created() {
    this.loggedinUser = this.$store.getters.loggedinUser;
    const boards = await this.$store.dispatch({
      type: "loadBoards"
    });
    this.boards = JSON.parse(JSON.stringify(boards));

    await this.$store.commit({
      type: "setEmptyBoard"
    });
  },
  methods: {
    async addNewBoard() {
      const boardId = await this.$store.dispatch({
        type: "addNewBoard"
      });
      this.$router.push(`/board/${boardId}`);
    }
  }
};
</script>