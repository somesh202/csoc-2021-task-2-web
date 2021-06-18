import axios from 'axios';
function displaySuccessToast(message) {
    iziToast.success({
        title: 'Success',
        message: message
    });
}

function displayErrorToast(message) {
    iziToast.error({
        title: 'Error',
        message: message
    });
}

function displayInfoToast(message) {
    iziToast.info({
        title: 'Info',
        message: message
    });
}

const API_BASE_URL = 'https://todo-app-csoc.herokuapp.com/';

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login/';
}

function registerFieldsAreValid(firstName, lastName, email, username, password) {
    if (firstName === '' || lastName === '' || email === '' || username === '' || password === '') {
        displayErrorToast("Please fill all the fields correctly.");
        return false;
    }
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        displayErrorToast("Please enter a valid email address.")
        return false;
    }
    return true;
}

function register() {
    const firstName = document.getElementById('inputFirstName').value.trim();
    const lastName = document.getElementById('inputLastName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const username = document.getElementById('inputUsername').value.trim();
    const password = document.getElementById('inputPassword').value;

    if (registerFieldsAreValid(firstName, lastName, email, username, password)) {
        displayInfoToast("Please wait...");

        const dataForApiRequest = {
            name: firstName + " " + lastName,
            email: email,
            username: username,
            password: password
        }

        axios({
            url: API_BASE_URL + 'auth/register/',
            method: 'post',
            data: dataForApiRequest,
        }).then(function ({ data, status }) {
            localStorage.setItem('token', data.token);
            window.location.href = '/';
        }).catch(function (err) {
            displayErrorToast('An account using same email or username is already created');
        })
    }
}

function loginFieldsAreValid(username, password) {
    if (username == "" || password == "") {
        displayErrorToast("Please fill all the fields correctly.");
        return false;
    }
    return true;
}

function login() {

    const username = document.getElementById('inputUsername').value.trim();
    const password = document.getElementById('inputPassword').value;

    if (loginFieldsAreValid(username, password)) {
        displayInfoToast("Please Wait...")


        const dataForApiRequest = {
            username: username,
            password: password
        }

        axios({
            url: API_BASE_URL + 'auth/login/',
            method: 'post',
            data: dataForApiRequest,
        }).then(function ({ data, status }) {
            localStorage.setItem('token', data.token);
            window.location.href = '/';
        }).catch(function (err) {
            displayErrorToast('The username or password is incorrect');
        })
    }
}

function addTask() {

    // console.log("TASK ADDED");

    let taskData = document.getElementById('task').value.trim();
    console.log(taskData);

    axios({
        headers: {
            Authorization: "Token " + localStorage.getItem("token"),
        },
        url: API_BASE_URL + 'todo/create/',
        method: 'post',
        data: {
            title: taskData
        }
    })
        .then(function (response) {

            axios({
                headers: {
                    Authorization: 'Token ' + localStorage.getItem('token')
                },
                url: API_BASE_URL + 'todo/',
                method: 'get'
            }).then(function ({ data, status }) {
                const newTask = data[data.length - 1]
                const taskIndex = newTask.id
                taskHTML(taskData, taskIndex)
            });

        })
        .catch(function (err) {
            displayErrorToast('No input task to add');
        });
    document.getElementById('task').value = "";
    if(taskData!= ""){
        displaySuccessToast("Your task has been added succesfully")
    }

}

function editTask(id) {
    document.getElementById('task-' + id).classList.add('hideme');
    document.getElementById('task-actions-' + id).classList.add('hideme');
    document.getElementById('input-button-' + id).classList.remove('hideme');
    document.getElementById('done-button-' + id).classList.remove('hideme');
    // console.log("to be edited");
}

function deleteTask(id) {

    // console.log("Deleted");
    axios({
        headers: {
            Authorization: 'Token ' + localStorage.getItem('token'),
        },
        url: API_BASE_URL + 'todo/' + id + '/',
        method: 'delete'
    }).then(function ({ data, status }) {
        // console.log(data);
        document.querySelector(`#todo-${id}`).remove();
    }).catch(function (err) {
        console.log(err);
        displayErrorToast("An error occurred");
    });
    displaySuccessToast("Task has been deleted!")
}

function updateTask(id) {
    const newtaskData = document.getElementById('input-button-' + id).value;
    // console.log("updated");
    if (!newtaskData) {
        displayErrorToast("Input field is empty")
        return;
    }
    axios({
        headers: {
            Authorization: 'Token ' + localStorage.getItem('token'),
        },
        url: API_BASE_URL + 'todo/' + id + '/',
        method: 'patch',
        data: {
            title: newtaskData
        }
    }).then(function ({ data, status }) {
        document.getElementById('task-' + id).classList.remove('hideme');
        document.getElementById('task-actions-' + id).classList.remove('hideme');
        document.getElementById('input-button-' + id).classList.add('hideme');
        document.getElementById('done-button-' + id).classList.add('hideme');
        document.getElementById('task-' + id).innerText = newtaskData;
    }).catch(function (err) {
        console.log(err);
        displayErrorToast("An error occurred");
    });
    displaySuccessToast("Task has been updated!")
}



function taskHTML(taskData, taskIndex) {
    const taskList = document.querySelector(".todo-available-tasks");

    const list = document.createElement("li");
    list.className = 'list-group-item d-flex justify-content-between align-items-center';
    list.innerHTML = `
    <input id="input-button-${taskIndex}" type="text" class="form-control todo-edit-task-input hideme" placeholder="Edit The Task">
    <div id="done-button-${taskIndex}"  class="input-group-append hideme">
        <button class="btn btn-outline-secondary todo-update-task" type="button" id="updateTask-${taskIndex}">Done</button>
    </div>
    <div id="task-${taskIndex}" class="todo-task">
      ${taskData}
    </div>

    <span id="task-actions-${taskIndex}">
        <button style="margin-right:5px;" type="button" id = "editTask-${taskIndex}"
            class="btn btn-outline-warning">
            <img src="https://res.cloudinary.com/nishantwrp/image/upload/v1587486663/CSOC/edit.png"
                width="18px" height="20px">
        </button>
        <button type="button" class="btn btn-outline-danger" id="deleteTask-${taskIndex}">
            <img src="https://res.cloudinary.com/nishantwrp/image/upload/v1587486661/CSOC/delete.svg"
                width="18px" height="22px">
        </button>
    </span>`;


    list.id = `todo-${taskIndex}`;
    taskList.appendChild(list);
    const deleteTaskBtn = document.getElementById(`deleteTask-${taskIndex}`);
    const editTaskBtn = document.getElementById(`editTask-${taskIndex}`);
    const updateTaskBtn = document.getElementById(`updateTask-${taskIndex}`);
    document.getElementById('input-button-' + taskIndex).value = taskData;

    deleteTaskBtn.addEventListener("click", () => deleteTask(taskIndex));
    editTaskBtn.addEventListener("click", () => editTask(taskIndex));
    updateTaskBtn.addEventListener("click", () => updateTask(taskIndex));
}


const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const logoutBtn = document.getElementById('logout');
const addTaskBtn = document.getElementById('addTask');


if (registerBtn) {
    registerBtn.onclick = register;
}

if (loginBtn) {
    loginBtn.onclick = login;
}

if (logoutBtn) {
    logoutBtn.onclick = logout;
}
if (addTaskBtn) {
    addTaskBtn.onclick = addTask;
}

export { taskHTML };