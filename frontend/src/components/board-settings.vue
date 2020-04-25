<template>
  <div class="board-settings">
    <transition name="fade">
      <div v-if="isLoaded">
        <header>
          <div>
            <font-awesome-icon :icon="[ 'fab', 'trello' ]" />
            <span>Board Actions</span>
          </div>
          <button class="close-btn" @click="closeSettings">
            <font-awesome-icon icon="times" />
          </button>
        </header>

        <section v-if="isMobile" class="mobile-mode">
          <div class="members" v-if="board.members">
            <div v-for="member in board.members" :key="member._id">
              <img v-if="member.imgUrl" :src="member.imgUrl" class="member-img" />
              <avatar v-else :username="member.username" class="member"></avatar>
            </div>
            <span class="add-member-btn" @click="addMember">
              <font-awesome-icon class="new-add-btn" icon="plus" />
            </span>
          </div>
          <div v-if="board.dueDate">{{board.dueDate | dueDate}}</div>
        </section>

        <add-member
          v-if="isAddMember"
          :users="users"
          :members="board.members"
          @add-new-member="addNewMember"
          @remove-member="removeMember"
          @close-add-member="isAddMember=false"
        ></add-member>

        <main>
          <button :class="{active: isChartOpen}" @click="toggle('isChartOpen')">Board dashboard</button>
          <button
            :class="{active: isNameEditorOpen}"
            @click="toggle('isNameEditorOpen')"
          >Change board name</button>
          <button
            :class="{active: isColorPickerOpen}"
            @click="toggle('isColorPickerOpen')"
          >Change background</button>
          <button :class="{active: isDueDateOpen}" @click="toggle('isDueDateOpen')">Change due date</button>
          <!-- <button>Search tasks</button> -->
          <button
            :class="{active: isDeleteQuestOpen}"
            @click="toggle('isDeleteQuestOpen')"
          >Delete board</button>
        </main>

        <section>
          <div v-if="isChartOpen" class="dashboard">
            <bar-chart :chartdata="barChartdata" :options="options"></bar-chart>
            <button class="add-btn">
              <router-link :to="'dashboard/' + board._id ">To the full dashboard</router-link>
            </button>
          </div>

          <color-picker-large v-if="isColorPickerOpen" @set-bgc="setBgc"></color-picker-large>
          <div class="name-editor" v-if="isNameEditorOpen">
            <input type="text" v-model="newName" :placeholder="board.name" class="board" />
            <button @click="changeName" class="add-btn">Save</button>
          </div>
          <due-date-picker
            class="due-date-picker-board"
            v-if="isDueDateOpen"
            :dueDate="board.dueDate ? board.dueDate : Date.now()"
            @close-due-date="isDeleteQuestOpen=!isDeleteQuestOpen"
            @date-change="changeDate"
          ></due-date-picker>
          <div v-if="isDeleteQuestOpen">
            <div>Are you sure?</div>
            <button class="add-btn" @click="isDeleteQuestOpen=!isDeleteQuestOpen">No</button>
            <button class="add-btn" @click="deleteBoard">Yes, delete this board</button>
          </div>
        </section>
      </div>
    </transition>
  </div>
</template>

<script>
import avatar from "vue-avatar";
import colorPickerLarge from "./color-picker-large.vue";
import dueDatePicker from "./due-date-picker.vue";
import addMember from "./add-member.vue";
import barChart from "./chart/bar-chart.vue";
import { utilService } from "../services/util.service.js";

export default {
  props: {
    board: Object
  },
  data() {
    return {
      isLoaded: false,
      isChartOpen: true,
      isColorPickerOpen: false,
      isNameEditorOpen: false,
      isDeleteQuestOpen: false,
      isDueDateOpen: false,
      isMobile: false,
      isAddMember: false,
      users: [],
      newName: "",
      barChartdata: {
        labels: [],
        datasets: [
          {
            label: "Completed Tasks ",
            backgroundColor: [],
            data: []
          },
          {
            label: "Incompleted Tasks ",
            data: []
          }
        ]
      },
      options: {
        scales: {
          yAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
                min: 0
              }
            }
          ],
          xAxes: [
            {
              stacked: true,
              ticks: {
                beginAtZero: true,
                categoryPercentage: 0.5,
                barPercentage: 1
              }
            }
          ]
        },
        responsive: true,
        maintainAspectRatio: false
      }
    };
  },
  methods: {
    isMobileDevice() {
      return window.innerWidth < 550;
    },
    toggle(type) {
      this.isChartOpen = false;
      this.isColorPickerOpen = false;
      this.isNameEditorOpen = false;
      this.isDeleteQuestOpen = false;
      this.isDueDateOpen = false;
      this[type] = !this[type];
    },
    closeSettings() {
      this.isLoaded = false;
      setTimeout(() => {
        this.$emit("toggle-settings");
      }, 100);
    },
    setBgc(bgc) {
      this.$emit("set-bgc", bgc);
    },
    deleteBoard() {
      this.$emit("delete-board");
    },
    changeDate(newDate) {
      this.$emit("change-date", newDate);
    },
    changeName() {
      this.$emit("update-boardname", this.newName);
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
  created() {
    this.isMobile = this.isMobileDevice();
    setTimeout(() => {
      this.isLoaded = true;
    }, 100);
  },
  mounted() {
    let mapMembersTasks = [];
    let tasksCount = 0;
    let completedTasksCount = 0;
    this.board.members.forEach(member => {
      mapMembersTasks.push({
        username: member.username,
        userId: member._id,
        allTasks: 0,
        doneTasks: 0
      });
    });
    mapMembersTasks.push({
      username: "guest",
      allTasks: 0,
      doneTasks: 0
    });

    this.board.taskLists.forEach(list => {
      list.tasks.forEach(task => {
        tasksCount++;
        if (task.status.isDone) {
          mapMembersTasks.forEach(mapMember => {
            if (
              mapMember.userId === task.status.member._id ||
              (mapMember.username === "guest" &&
                mapMember.username === task.status.member.username)
            ) {
              mapMember.doneTasks++;
              completedTasksCount++;
            }
          });
        }
        if (task.members.length > 0) {
          task.members.forEach(member => {
            mapMembersTasks.forEach(mapMember => {
              if (
                mapMember.userId === member._id ||
                (mapMember.username === "guest" &&
                  mapMember.username === member.username)
              ) {
                mapMember.allTasks++;
              }
            });
          });
        }
      });
    });

    const color = utilService.getRandomColor();
    mapMembersTasks.forEach(member => {
      this.barChartdata.labels.push(member.username);
      this.barChartdata.datasets[0].backgroundColor.push(color);
      this.barChartdata.datasets[0].data.push(member.doneTasks);
      this.barChartdata.datasets[1].data.push(
        member.allTasks - member.doneTasks
      );
    });
    this.barChartdata.datasets[0].label += `(${completedTasksCount})`;
    this.barChartdata.datasets[1].label += `(${tasksCount -
      completedTasksCount})`;
  },

  components: {
    avatar,
    colorPickerLarge,
    dueDatePicker,
    addMember,
    barChart
  }
};
</script>