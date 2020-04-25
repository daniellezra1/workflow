<template>
  <div
    class="board-dashboard container board-details"
    v-if="board"
    :style="{background: boardStyle}"
  >
    <div class="title">
      Management Dashboard |
      <button @click="$router.push(`/board/${boardId}`)">Back to board</button>
    </div>
    <summary-dashboard
      :memberCount="board.members.length"
      :tasksCount="tasksCount"
      :completedTasksCount="completedTasksCount"
    ></summary-dashboard>
    <div class="chart main-chart">
      <h4>Project progress by timeline:</h4>
      <p>(from the begining of the project until due date)</p>
      <div class="line-chart-container">
        <line-chart v-if="loaded" :chartdata="lineChartdata" :options="optionsLine"></line-chart>
      </div>
    </div>
    <div class="charts">
      <div class="chart">
        <h4>Tasks count per lists (total and completed):</h4>
        <pai-chart v-if="loaded" :chartdata="paiChartdata"></pai-chart>
      </div>
      <div class="chart">
        <h4>Tasks status per member:</h4>
        <bar-chart v-if="loaded" :chartdata="barChartdata" :options="optionsBar"></bar-chart>
      </div>
    </div>
  </div>
</template>

<script>
import summaryDashboard from "../components/chart/summary-dashboard.vue";
import lineChart from "../components/chart/line-chart.vue";
import paiChart from "../components/chart/pai-chart.vue";
import barChart from "../components/chart/bar-chart.vue";

import { utilService } from "../services/util.service.js";

export default {
  name: "PaiChartContainer",
  components: { summaryDashboard, lineChart, paiChart, barChart },
  data() {
    return {
      loaded: false,
      board: null,
      boardId: null,
      tasksCount: 0,
      completedTasksCount: 0,
      lineChartdata: {
        labels: [],
        datasets: []
      },
      paiChartdata: {
        labels: [],
        datasets: [
          {
            backgroundColor: [],
            data: []
          },
          {
            backgroundColor: [],
            data: []
          }
        ]
      },
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
      optionsLine: {
        maintainAspectRatio: false
      },
      optionsBar: {
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
  computed: {
    boardStyle() {
      var style;
      if (this.board.style.color) style = this.board.style.color;
      else if (this.board.style.url)
        style = `url("${this.board.style.url}") no-repeat fixed 100%`;
      return style;
    }
  },
  async mounted() {
    this.loaded = false;
    try {
      const boardId = this.$route.params.id;
      const board = await this.$store.dispatch({
        type: "loadBoard",
        boardId
      });
      this.boardId = boardId;
      this.board = board;

      let mapMembersTasks = [];
      let completedTasksTimes = [board.createdAt, board.dueDate];
      board.members.forEach(member => {
        mapMembersTasks.push({
          username: member.username,
          userId: member._id,
          allTasks: 0,
          doneTasks: 0
        });
        this.lineChartdata.datasets.push({
          label: member.username,
          borderColor: [utilService.getRandomColor()],
          fill: false,
          data: []
        });
      });
      mapMembersTasks.push({
        username: "guest",
        allTasks: 0,
        doneTasks: 0
      });

      board.taskLists.forEach(list => {
        this.paiChartdata.labels.push(list.name);
        this.paiChartdata.datasets[0].data.push(list.tasks.length);
        var color = utilService.getRandomColor();
        this.paiChartdata.datasets[0].backgroundColor.push(color);
        this.paiChartdata.datasets[1].backgroundColor.push(color);

        let countDoneTasksPerList = 0;
        list.tasks.forEach(task => {
          this.tasksCount++;
          if (task.status.isDone) {
            completedTasksTimes.push(task.status.date);
            countDoneTasksPerList++;

            mapMembersTasks.forEach(mapMember => {
              if (mapMember.username === task.status.member.username) {
                mapMember.doneTasks++;
                this.completedTasksCount++;
              }
            });
          }
          if (task.members.length > 0) {
            task.members.forEach(member => {
              mapMembersTasks.forEach(mapMember => {
                if (mapMember.username === member.username){
                  mapMember.allTasks++;
                }
              });
            });
          }
        });
        this.paiChartdata.datasets[1].data.push(countDoneTasksPerList);
      });
      completedTasksTimes.sort((a, b) => a - b);
      completedTasksTimes = completedTasksTimes.map(time =>
        new Date(time).toDateString()
      );
      completedTasksTimes = new Set(completedTasksTimes);
      this.lineChartdata.labels = [...completedTasksTimes];

      completedTasksTimes.forEach(time => {
        this.lineChartdata.datasets.forEach(dataset => {
          dataset.data.push({
            x: time,
            y: 0
          });
        });
      });
      this.board.taskLists.forEach(list => {
        list.tasks.forEach(task => {
          if (task.status.isDone) {
            this.lineChartdata.datasets.forEach(dataset => {
              if (dataset.label === task.status.member.username) {
                dataset.data.forEach(item => {
                  if (item.x === new Date(task.status.date).toDateString()) {
                    item.y++;
                  }
                });
              }
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

      this.barChartdata.datasets[0].label += `(${this.completedTasksCount})`;
      this.barChartdata.datasets[1].label += `(${this.tasksCount -
        this.completedTasksCount})`;
      this.loaded = true;
    } catch (e) {
      // console.error(e);
    }
  }
};
</script>