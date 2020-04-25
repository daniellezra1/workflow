<template>
  <section class="screen" @click="closeTaskEdit">
    <section class="task-details" v-if="task" @click.stop>
      <div class="header">
        <button class="close-btn close-task" @click="closeTaskEdit">
          <font-awesome-icon icon="times" />
        </button>
        <div v-if="task.cover" class="cover-container">
          <div class="img-container">
            <img class="cover-img" :src="task.cover" />
          </div>
          <button @click="removeCover" class="task-btn cover-btn">Remove cover</button>
        </div>
      </div>
      <div class="details-container">
        <section class="task-data">
          <div class="task-name">
            <i class="el-icon-s-claim icon"></i>
            <div>
              <h2 v-if="!isOpenName" @click.stop="toggle('isOpenName')">{{task.name}}</h2>
              <input
                class="task"
                v-else
                type="text"
                v-model="task.name"
                @blur="saveName"
                @keyup.enter="saveName"
              />
            </div>
          </div>
          <div class="list-name">In list {{list.name}}</div>
          <div>
            <label class="task-completed" for="isDone">
              <el-checkbox name="isDone" v-model="task.status.isDone" @change="updatsStatus"></el-checkbox>
              <span>Completed task</span>
            </label>
          </div>
          <br />
          <div class="main-data">
            <section class="member-labels-date">
              <div>
                <div class="members-content">
                  <h3 v-if="task.members.length > 0" class="sub-titles">Members</h3>
                  <div
                    v-if="task.members !== undefined && task.members.length > 0"
                    @click="toggle('isAddMember')"
                  >
                    <div class="members">
                      <div v-for="member in task.members" :key="member._id">
                        <img v-if="member.imgUrl" :src="member.imgUrl" class="member-img" />
                        <avatar v-else :username="member.username" class="member"></avatar>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 v-if="task.labels.length > 0" class="sub-titles">Labels</h3>
                <div v-if="task.labels.length > 0" class="labels">
                  <span
                    v-for="label in task.labels"
                    :key="label.id"
                    :style="{backgroundColor:label.color}"
                    class="label"
                    @click="toggle('isLabelsSelected')"
                  >
                    <span class="label-title" v-if="label.title">{{label.title}}</span>
                  </span>
                </div>
              </div>
              <div>
                <h3 v-if="task.dueDate" class="sub-titles">Due date</h3>
                <div v-if="task.dueDate" class="due-date">{{task.dueDate | dueDate}}</div>
              </div>
            </section>
            <div class="description-content">
              <div class="description-title">
                <i class="el-icon-s-unfold icon"></i>
                <h4>Description</h4>
              </div>
              <div
                v-if="!isOpenDescription"
                class="edit-area description-txt"
                @click="toggle('isOpenDescription')"
              >{{(task.description) ? task.description : 'Add a more detailed description'}}</div>
              <div v-else class="edit-description">
                <textarea class="description" v-model="task.description"></textarea>
                <div class="description-btns">
                  <button @click="saveDescription" class="add-btn">Save</button>
                  <button @click="toggle('isOpenDescription')" class="close-btn close-task">
                    <font-awesome-icon icon="times" />
                  </button>
                </div>
              </div>
            </div>
            <div class="checklists-content">
              <checklist-details
                v-for="checklist in task.checklists"
                :key="checklist.id"
                :checklist="checklist"
                @update-checklist="updateChecklist"
                @remove-checklist="removeChecklist"
                @add-todo="addTodo"
                @update-todo-activity="updateTodoActivity"
              ></checklist-details>
            </div>
          </div>
          <div>
            <div class="activity-header">
              <div class="activity-title-content">
                <font-awesome-icon icon="tasks" class="icon" />
                <h4 class="activity-title">Activity</h4>
              </div>
              <button
                class="show-btn task-btn"
                @click="toggle('isOpenActivitylog')"
              >{{activityDetails}}</button>
            </div>
            <activitylog
              v-if="isOpenActivitylog"
              class="task-activitylog"
              :activitieslog="activitieslog"
            ></activitylog>
          </div>
        </section>

        <section class="task-buttons">
          <h4>Add to task</h4>
          <div class="main-buttons">
            <div>
              <button class="main-btn task-btn" @click="toggle('isAddMember')">
                <i class="el-icon-user"></i> Members
              </button>
              <member-picker
                v-if="isAddMember"
                :members="boardMembers"
                @close-member-picker="toggle('isAddMember')"
                @update-member="updateMember"
              ></member-picker>
            </div>
            <div>
              <button class="main-btn task-btn" @click="toggle('isLabelsSelected')">
                <i class="el-icon-price-tag"></i> Labels
              </button>
              <label-picker
                v-if="isLabelsSelected"
                :selectedLabels="task.labels"
                @add-label="addLabel"
                @remove-label="removeLabel"
                @update-label="updateLabel"
                @close-labels="toggle('isLabelsSelected')"
              ></label-picker>
            </div>
            <div>
              <button class="main-btn task-btn" @click="toggle('isDueToSelected')">
                <i class="el-icon-time"></i> Due date
              </button>
              <due-date-picker
                class="due-date-picker"
                v-if="isDueToSelected"
                :dueDate="task.dueDate ? task.dueDate : Date.now()"
                @close-due-date="toggle('isDueToSelected')"
                @date-change="changeDate"
              ></due-date-picker>
            </div>
            <div>
              <button class="main-btn task-btn" @click="toggle('isOpenChecklist')">
                <i class="el-icon-document-checked"></i> Checklist
              </button>
              <checklist-picker
                v-if="isOpenChecklist"
                @add-checklist="addChecklist"
                @close-checklist-picker="toggle('isOpenChecklist')"
              ></checklist-picker>
            </div>
            <div>
              <button class="main-btn task-btn" @click="toggle('isColorPickerOpen')">
                <i class="el-icon-edit"></i> Change color
              </button>
              <color-picker-medium
                v-if="isColorPickerOpen"
                @set-color="setColor"
                @close-color-picker="toggle('isColorPickerOpen')"
              ></color-picker-medium>
            </div>
            <div>
              <label for="add-img" class="cover-content">
                <div class="cover-btn task-btn">
                  <i class="el-icon-picture-outline cover-icon"></i>
                  <span>Cover</span>
                </div>
                <input id="add-img" type="file" @change="addImg" class="cover-input" />
              </label>
            </div>
            <button class="main-btn task-btn" @click="copyTask">
              <i class="el-icon-document-copy"></i> Copy
            </button>
            <div>
              <button class="main-btn task-btn" @click="deleteTask()">
                <i class="el-icon-delete"></i> Delete
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
    <user-msg></user-msg>
  </section>
</template>
<script>
import labelPicker from "../components/label-picker.vue";
import dueDatePicker from "../components/due-date-picker.vue";
import checklistPicker from "../components/checklist-picker.vue";
import colorPickerMedium from "../components/‏‏color-picker-medium.vue";
import memberPicker from "../components/member-picker.vue";
import avatar from "vue-avatar";
import checklistDetails from "../components/checklist-details.vue";
import activitylog from "../components/activitylog.vue";
import socketService from "../services/socket.service.js";
import moment from "moment";
import { eventBus } from "../services/event-bus.service.js";
import userMsg from "../components/user-msg.vue";

export default {
  name: "task-details",
  data() {
    return {
      task: null,
      list: null,
      activitieslog: null,
      loggedinUser: null,
      isLabelsSelected: false,
      isDueToSelected: false,
      isOpenDescription: false,
      isOpenName: false,
      isOpenCover: false,
      isOpenChecklist: false,
      isColorPickerOpen: false,
      isOpenActivitylog: false,
      isAddMember: false,
      newChecklist: null,
      boardMembers: []
    };
  },
  methods: {
    getListAndTask(taskId) {
      this.$store.commit({
        type: "setListAndTask",
        taskId
      });

      this.task = this.$store.getters.currTask;
      this.list = this.$store.getters.currList;
    },
    getTaskActivitylog() {
      this.$store.commit({
        type: "getTaskActivitylog",
        taskId: this.task.id
      });

      this.activitieslog = this.$store.getters.currActivitylog;
    },
    saveTaskData(activitylog) {
      socketService.emit("add activitylog", activitylog);
      this.saveTask(activitylog);
      this.getTaskActivitylog();
    },
    async saveTask(activitylog = null) {
      if (activitylog) {
        this.$store.commit({
          type: "updateActivitieslog",
          activitylog
        });
      }

      try {
        const task = await this.$store.dispatch({
          type: "updateTask",
          task: JSON.parse(JSON.stringify(this.task))
        });

        this.task = task;
      } catch (err) {
        // console.log("Err in updateTask");
      }
    },
    toggle(type) {
      this[type] = !this[type];

      if (type === "isOpenChecklist") {
        this.getEmptyChecklist();
      }
    },
    async addLabel(newLabel) {
      this.task.labels.push(newLabel);
      const activitylog = this.createActivitylog(
        `added label to ${this.task.name}`
      );
      this.updateAllTitles(newLabel);
      this.saveTaskData(activitylog);
    },
    async removeLabel(labelToRemove) {
      const labelIndex = this.task.labels.findIndex(
        label => label.color === labelToRemove.color
      );
      this.task.labels.splice(labelIndex, 1);
      const activitylog = this.createActivitylog(
        `removed label from ${this.task.name}`
      );
      this.saveTaskData(activitylog);
    },
    async updateLabel(labelToUpdate) {
      const labelIndex = this.task.labels.findIndex(
        label => label.color === labelToUpdate.color
      );

      this.updateAllTitles(labelToUpdate);

      if (labelIndex !== -1) {
        this.task.labels.splice(labelIndex, 1, labelToUpdate);
      } else {
        this.addLabel(labelToUpdate);
      }

      const activitylog = this.createActivitylog(
        `updated label in ${this.task.name}`
      );

      this.saveTaskData(activitylog);
    },
    async updateAllTitles(selectedLabel) {
      try {
        await this.$store.dispatch({
          type: "updateTitles",
          label: selectedLabel
        });
      } catch (err) {
        // console.log("Err in updateTitles");
      }
    },
    changeDate(newDate) {
      this.task.dueDate = newDate;
      const dueDate = moment(new Date(this.task.dueDate)).format("MMM Do YY");
      const activitylog = this.createActivitylog(
        `changed the due date of ${this.task.name} to ${dueDate}`
      );

      this.saveTaskData(activitylog);
    },
    async deleteTask() {
      try {
        const activitylog = this.createActivitylog(
          `removed task ${this.task.name}`
        );
        this.$store.commit({
          type: "updateActivitieslog",
          activitylog
        });

        await this.$store.dispatch({
          type: "deleteTask",
          task: this.task
        });

        const msg = {
          txt: `The task '${this.task.name}' has been successfully deleted`,
          type: "success"
        };

        eventBus.$emit("show-msg", msg);

        setTimeout(() => {
          const boardId = this.$route.params.id;
          this.$router.push(`/board/${boardId}`);
        }, 1200);
      } catch (err) {
        // console.log("Err in deleteTask");
      }
    },
    closeTaskEdit() {
      const boardId = this.$route.params.id;
      this.$router.push(`/board/${boardId}`);
    },
    saveDescription() {
      const activitylog = this.createActivitylog(
        `updated description in ${this.task.name} to ${this.task.description}`
      );

      this.saveTaskData(activitylog);
      this.toggle("isOpenDescription");
    },
    saveName() {
      const activitylog = this.createActivitylog(
        `updated task name to ${this.task.name}`
      );

      this.isOpenName = false;
      this.saveTaskData(activitylog);
    },
    updatsStatus() {
      var activitylog;
      if (!this.task.status.isDone) {
        this.task.status.member = {};
        this.task.status.date = null;
        activitylog = this.createActivitylog(
          `incompleted task ${this.task.name}`
        );
      } else {
        this.task.status.member = JSON.parse(JSON.stringify(this.loggedinUser));
        this.task.status.date = Date.now();
        activitylog = this.createActivitylog(
          `completed task ${this.task.name}`
        );
      }
      this.saveTaskData(activitylog);
    },
    async addImg(ev) {
      const url = await this.$store.dispatch({
        type: "uploadImg",
        ev
      });

      this.updateCover(url);
    },
    updateCover(url) {
      const activitylog = this.createActivitylog(
        `added cover in ${this.task.name}`
      );

      this.task.cover = url;
      this.saveTaskData(activitylog);
    },
    removeCover() {
      const activitylog = this.createActivitylog(
        `removed cover in ${this.task.name}`
      );

      this.task.cover = "";
      this.saveTaskData(activitylog);
    },
    async copyTask() {
      const activitylog = this.createActivitylog(`copy task ${this.task.name}`);

      this.$store.commit({
        type: "updateActivitieslog",
        activitylog
      });

      const task = JSON.parse(JSON.stringify(this.task));
      const taskData = { newTask: task, taskListId: this.list.id };
      try {
        await this.$store.dispatch({
          type: "copyTask",
          taskData
        });

        const msg = {
          txt: `The task '${this.task.name}' has been successfully copied`,
          type: "success"
        };
        eventBus.$emit("show-msg", msg);
      } catch (err) {
        // console.log("Err in copyTask");
      }

      this.getTaskActivitylog();
    },
    async addChecklist(title) {
      if (!title) return;
      this.newChecklist.name = title;
      this.task.checklists.push(this.newChecklist);
      const activitylog = this.createActivitylog(
        `added checklist in ${this.task.name}`
      );

      this.saveTaskData(activitylog);
      this.toggle("isOpenChecklist");
    },
    updateChecklist(checklist) {
      const checklistIndex = this.task.checklists.findIndex(
        currChecklist => currChecklist.id === checklist.id
      );
      this.task.checklists.splice(checklistIndex, 1, checklist);
      this.saveTask();
    },
    removeChecklist(checklistId) {
      const checklistIndex = this.task.checklists.findIndex(
        checklist => checklist.id === checklistId
      );
      this.task.checklists.splice(checklistIndex, 1);

      const activitylog = this.createActivitylog(
        `removed checklist from ${this.task.name}`
      );

      this.saveTaskData(activitylog);
    },
    addTodo(checklistId, todo) {
      this.$store.commit({
        type: "getId"
      });
      const newId = this.$store.getters.currId;
      todo.id = newId;

      const checklistIndex = this.task.checklists.findIndex(
        checklist => checklist.id === checklistId
      );
      this.task.checklists[checklistIndex].todos.push(todo);

      const activitylog = this.createActivitylog(
        `added item to checklist in ${this.task.name}`
      );

      this.saveTaskData(activitylog);
    },
    updateTodoActivity(currTodo) {
      let activitylog;

      if (currTodo.isDone) {
        activitylog = this.createActivitylog(
          `completed ${currTodo.text} on ${this.task.name}`
        );
      } else {
        activitylog = this.createActivitylog(
          `incomplete ${currTodo.text} on ${this.task.name}`
        );
      }

      this.saveTaskData(activitylog);
    },
    setColor(color) {
      this.task.backgroundColor = color;

      const activitylog = this.createActivitylog(
        `changed the background of ${this.task.name}`
      );

      this.saveTaskData(activitylog);
    },
    updateMember(member) {
      let activitylog;

      const memberIdx = this.task.members.findIndex(
        currMember => currMember._id === member._id
      );

      if (memberIdx === -1) {
        this.task.members.push(member);

        activitylog = this.createActivitylog(`joined to ${this.task.name}`);
      } else {
        this.task.members.splice(memberIdx, 1);

        activitylog = this.createActivitylog(`left from ${this.task.name}`);
      }

      this.saveTaskData(activitylog);
    },
    getEmptyChecklist() {
      try {
        this.$store.commit({
          type: "setEmptyChecklist"
        });

        this.newChecklist = JSON.parse(
          JSON.stringify(this.$store.getters.currChecklist)
        );
      } catch (err) {
        // console.log("Err in getEmptyChecklist");
      }
    },
    createActivitylog(txt) {
      return {
        txt,
        createdAt: Date.now(),
        taskId: this.task.id
      };
    },
    addActivity(newActivitylog) {
      this.saveTask(newActivitylog);
      this.getTaskActivitylog();
    }
  },
  computed: {
    activityDetails() {
      return this.isOpenActivitylog ? "Hide Details" : "Show Details";
    }
  },
  created() {
    const taskId = this.$route.params.taskId;
    this.getListAndTask(taskId);
    this.getTaskActivitylog();
    this.boardMembers = this.$store.getters.boardMembers;
    this.loggedinUser = this.$store.getters.loggedinUser;

    socketService.setup();
    socketService.emit("task topic", this.task.id);
    socketService.on("activitylog updated", this.addActivity);
  },
  destroyed() {
    socketService.off("activitylog updated", this.addActivity);
    // socketService.terminate();
  },
  components: {
    labelPicker,
    dueDatePicker,
    checklistPicker,
    avatar,
    checklistDetails,
    colorPickerMedium,
    activitylog,
    memberPicker,
    userMsg
  }
};
</script>