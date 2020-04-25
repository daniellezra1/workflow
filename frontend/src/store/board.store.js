import { boardService } from '../services/board.service.js';
import { utilService } from '../services/util.service.js';
import socketService from "../services/socket.service.js";

const MAX_ACTIVITIES = 150;
const ACTIVITIES_TO_DELETE = 50;

export default {
    state: {
        boards: null,
        board: null,
        currTask: null,
        currList: null,
        currChecklist: null,
        currActivitylog: null,
        currId: ''
    },
    getters: {
        currTask(state) {
            return JSON.parse(JSON.stringify(state.currTask));
        },
        currList(state) {
            return JSON.parse(JSON.stringify(state.currList));
        },
        currChecklist(state) {
            return state.currChecklist;
        },
        currId(state) {
            return state.currId;
        },
        currActivitylog(state) {
            return JSON.parse(JSON.stringify(state.currActivitylog));
        },
        boardMembers(state) {
            return state.board.members;
        },
        board(state) {
            return state.board;
        }
    },
    mutations: {
        setEmptyTask(state) {
            const task = boardService.getEmptyTask();
            state.currTask = task;
        },
        setEmptyTasksList(state) {
            const list = boardService.getEmptyTasksList();
            state.currList = list;
        },
        setEmptyBoard(state) {
            const board = boardService.getEmptyBoard();
            const loggedinUser = JSON.parse(JSON.stringify(this.state.userStore.loggedinUser));
            board.members.push({
                _id: loggedinUser._id,
                username: loggedinUser.username,
                imgUrl: loggedinUser.imgUrl
            });
            state.board = board;
        },
        getTaskActivitylog(state, { taskId }) {
            state.currActivitylog = state.board.activitieslog.filter(activity => activity.taskId === taskId);
        },
        getUserActivitylog(state, { userId }) {
            state.currActivitylog = state.board.activitieslog.filter(activity => activity.user._id === userId);
        },
        setEmptyChecklist(state) {
            const checklist = boardService.getEmptyChecklist();
            state.currChecklist = checklist;
        },
        setListAndTask(state, { taskId }) {
            for (var i = 0; i < state.board.taskLists.length; i++) {
                const list = state.board.taskLists[i];
                state.currTask = list.tasks.find(task => task.id === taskId);
                if (state.currTask) {
                    state.currList = state.board.taskLists[i]
                    return;
                }
            }
        },
        setBoards(state, { boards }) {
            state.boards = boards;
        },
        setBoard(state, { board }) {
            state.board = board;
        },
        addTask(state, { taskData }) {
            const taskList = state.board.taskLists.find(taskList => taskList.id === taskData.taskListId);
            taskList.tasks.push(taskData.newTask);
        },
        addTasksList(state, { listData }) {
            state.board.taskLists.push(listData);
        },
        updateBoard(state, { board }) {
            state.board = board;
        },
        updateTask(state, { task }) {
            for (var i = 0; i < state.board.taskLists.length; i++) {
                const list = state.board.taskLists[i];
                const taskIdx = list.tasks.findIndex(currTask => currTask.id === task.id);
                if (taskIdx >= 0) {
                    state.board.taskLists[i].tasks.splice(taskIdx, 1, task);
                    return;
                }
            }
        },
        deleteTask(state, { task }) {
            for (var i = 0; i < state.board.taskLists.length; i++) {
                const list = state.board.taskLists[i];
                const taskIdx = list.tasks.findIndex(currTask => currTask.id === task.id);
                if (taskIdx >= 0) {
                    state.board.taskLists[i].tasks.splice(taskIdx, 1);
                    return;
                }
            }

            state.currTask = null;
        },
        deleteList(state, { listId }) {
            const listIdx = state.board.taskLists.findIndex(currList => currList.id === listId)
            if (listIdx >= 0) {
                state.board.taskLists.splice(listIdx, 1);
                return;
            }
        },
        updateTitles(state, { label }) {
            state.board.taskLists.forEach(list => {
                list.tasks.forEach(task => {
                    task.labels.forEach(currLabel => {
                        if (label.color === currLabel.color) {
                            if (label.title) {
                                currLabel.title = label.title;
                            } else {
                                label.title = currLabel.title;
                            }
                        }
                    });
                });
            })
        },
        deleteBoard(state) {
            state.board = null
        },
        getId(state) {
            const id = utilService.makeId();
            state.currId = id
        },
        updateActivitieslog(state, { activitylog }) {
            if (state.board.activitieslog.length >= MAX_ACTIVITIES) {
                const startIndex = state.board.activitieslog.length - ACTIVITIES_TO_DELETE;

                state.board.activitieslog = state.board.activitieslog.slice(0, startIndex);
                state.currActivitylog = JSON.parse(JSON.stringify(state.board.activitieslog));
            }

            activitylog.user = this.state.userStore.loggedinUser;
            state.board.activitieslog.unshift(activitylog);
        },
        updateUserName(state, { user }) {
            state.boards.forEach(board => {
                const member = board.members.find(member => member._id === user._id);
                if (member) {
                    member.username = user.username;
                    board.taskLists.forEach(taskList => {
                        taskList.tasks.forEach(task => {
                            if (task.status.member._id === user._id) {
                                task.status.member.username = user.username;
                            }
                        })
                    })
                }
            })
        }
    },
    actions: {
        async loadBoards(context) {
            const boards = await boardService.query();
            context.commit({ type: 'setBoards', boards });
            return boards;
        },
        async loadBoard(context, { boardId }) {
            const board = await boardService.getById(boardId);
            context.commit({ type: 'setBoard', board });
            return board;
        },
        async addTask(context, { taskData }) {
            context.commit({
                type: 'addTask',
                taskData
            });
            const savedBoard = await boardService.save(context.state.board);
            socketService.emit("update board", savedBoard);
            return savedBoard;
        },
        async addTasksList(context, { listData }) {
            context.commit({
                type: 'addTasksList',
                listData
            });
            const savedBoard = await boardService.save(context.state.board);
            socketService.emit("update board", savedBoard);
            return savedBoard;
        },
        async addNewBoard(context) {
            const savedBoard = await boardService.save(context.state.board);
            context.commit({ type: 'setBoard', savedBoard });
            return savedBoard._id
        },
        async updateBoard(context, { board }) {
            context.commit({
                type: 'updateBoard',
                board
            });
            socketService.emit("update board", board);
            const savedBoard = await boardService.save(board);
            return savedBoard;
        },
        async updateTask(context, { task }) {
            context.commit({
                type: 'updateTask',
                task
            });
            const board = await boardService.save(context.state.board);
            socketService.emit("update board", board);
            return JSON.parse(JSON.stringify(task));
        },
        async deleteTask(context, { task }) {
            context.commit({
                type: 'deleteTask',
                task
            });

            const savedBoard = await boardService.save(context.state.board);
            socketService.emit("update board", savedBoard);
            return savedBoard;
        },
        async deleteList(context, { listId }) {
            context.commit({
                type: 'deleteList',
                listId
            });

            const savedBoard = await boardService.save(context.state.board);
            socketService.emit("update board", savedBoard);
            return savedBoard;
        },
        async deleteBoard(context, { boardId }) {
            context.commit({
                type: 'deleteBoard',
                boardId
            });
            await boardService.remove(boardId);
            return boardId
        },
        async uploadImg(context, { ev }) {
            const res = await utilService.uploadImg(ev);
            const { url } = res;
            return url;
        },
        async copyTask(context, { taskData }) {
            taskData.newTask.id = utilService.makeId();
            context.commit({
                type: 'addTask',
                taskData
            });

            const savedBoard = await boardService.save(context.state.board);
            socketService.emit("update board", savedBoard);
            return savedBoard;
        },
        async updateTitles(context, { label }) {
            context.commit({
                type: 'updateTitles',
                label
            });

            const savedBoard = await boardService.save(context.state.board);
            socketService.emit("update board", savedBoard);
            return savedBoard;
        },
        async saveBoards(context) {
            await context.state.boards.forEach(board => {
                socketService.emit("update board", board);
                boardService.save(board);
            })
        }
    }
}