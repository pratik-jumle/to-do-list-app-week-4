let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let deletedTasks = JSON.parse(localStorage.getItem("deletedTasks")) || [];
let darkMode = localStorage.getItem("darkMode") === "true";

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const toggleMode = document.getElementById("toggleMode");

if (darkMode) document.body.classList.add("dark");

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e)=>{
  if(e.key === "Enter") addTask();
});
toggleMode.addEventListener("click", toggleDarkMode);
document.addEventListener("DOMContentLoaded", displayTasks);

/** Core actions **/
function addTask() {
  const taskText = taskInput.value.trim();
  if (taskText === "") return;
  tasks.push({ text: taskText, completed: false, id: cryptoRandom() });
  taskInput.value = "";
  saveAndDisplay();
  // micro animation on input focus
  taskInput.focus();
}

function editTask(id) {
  const idx = tasks.findIndex(t=>t.id===id);
  if(idx===-1) return;
  const newTask = prompt("Edit your task:", tasks[idx].text);
  if (newTask !== null && newTask.trim() !== "") {
    tasks[idx].text = newTask.trim();
    saveAndDisplay();
  }
}

function toggleComplete(id) {
  const idx = tasks.findIndex(t=>t.id===id);
  if(idx===-1) return;
  tasks[idx].completed = !tasks[idx].completed;
  saveAndDisplay(() => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if(el){ el.classList.add('pulse'); setTimeout(()=>el.classList.remove('pulse'), 500); }
  });
}

function deleteTask(id) {
  const li = document.querySelector(`[data-id="${id}"]`);
  if(li){
    li.classList.add('exit');
    li.addEventListener('animationend', () => {
      const idx = tasks.findIndex(t=>t.id===id);
      if(idx>-1){
        deletedTasks.push(tasks[idx]);
        tasks.splice(idx,1);
        saveAndDisplay();
      }
    }, { once:true });
  } else {
    // Fallback if element not found
    const idx = tasks.findIndex(t=>t.id===id);
    if(idx>-1){
      deletedTasks.push(tasks[idx]);
      tasks.splice(idx,1);
      saveAndDisplay();
    }
  }
}

function restoreTask(id) {
  const idx = deletedTasks.findIndex(t=>t.id===id);
  if(idx===-1) return;
  tasks.push(deletedTasks[idx]);
  deletedTasks.splice(idx, 1);
  saveAndDisplay();
}

/** Persistence */
function saveAndDisplay(afterRender){
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
  displayTasks();
  if(typeof afterRender === 'function') afterRender();
}

/** Render */
function displayTasks() {
  const taskList = document.getElementById("taskList");
  const deletedList = document.getElementById("deletedList");
  taskList.innerHTML = "";
  deletedList.innerHTML = "";

  tasks.forEach((task) => taskList.appendChild(renderItem(task, false)));
  deletedTasks.forEach((task) => deletedList.appendChild(renderItem(task, true)));
}

function renderItem(task, isDeleted){
  const li = document.createElement('li');
  li.className = 'item' + (task.completed && !isDeleted ? ' completed' : '');
  li.dataset.id = task.id;

  const left = document.createElement('div');
  left.className = 'item__left';

  const checkbox = document.createElement('div');
  checkbox.className = 'checkbox';
  const dot = document.createElement('div');
  dot.className = 'checkbox__dot';
  checkbox.appendChild(dot);

  const title = document.createElement('div');
  title.className = 'item__title';
  title.textContent = task.text;

  left.appendChild(checkbox);
  left.appendChild(title);

  const actions = document.createElement('div');
  actions.className = 'actions';

  if(!isDeleted){
    const editBtn = document.createElement('button');
    editBtn.className = 'btn edit';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editTask(task.id);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn delete';
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => deleteTask(task.id);

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    left.addEventListener('click', (e)=>{
      if(e.target.closest('.btn')) return;
      toggleComplete(task.id);
    });
  } else {
    const resBtn = document.createElement('button');
    resBtn.className = 'btn restore';
    resBtn.textContent = 'Restore';
    resBtn.onclick = () => restoreTask(task.id);
    actions.appendChild(resBtn);
  }

  li.appendChild(left);
  li.appendChild(actions);
  return li;
}

/** Theme */
function toggleDarkMode(){
  document.body.classList.toggle('dark');
  darkMode = document.body.classList.contains('dark');
  localStorage.setItem('darkMode', darkMode);
}

/** Utils */
function cryptoRandom(){
  if(window.crypto && crypto.getRandomValues){
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return 't'+buf[0].toString(16);
  }
  return 't'+Math.random().toString(16).slice(2);
}
