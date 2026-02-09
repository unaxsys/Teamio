const boardEl = document.getElementById("board");
const modalEl = document.getElementById("modal");
const formEl = document.getElementById("task-form");
const newBoardButton = document.getElementById("new-board");
const closeModalButton = document.getElementById("close-modal");
const statActive = document.getElementById("stat-active");
const statDue = document.getElementById("stat-due");

const columns = [
  { id: "backlog", title: "Backlog" },
  { id: "progress", title: "В процес" },
  { id: "review", title: "Преглед" },
  { id: "done", title: "Готово" },
];

const defaultTasks = [
  {
    id: "task-1",
    title: "Онбординг поток",
    description: "Преглед на копи и микроанимации за нови клиенти.",
    due: "2024-06-18",
    column: "backlog",
    tag: "UX",
  },
  {
    id: "task-2",
    title: "Синхронизиране на екипа",
    description: "Ежеседмично събиране и дефиниране на цели.",
    due: "2024-06-19",
    column: "progress",
    tag: "Екип",
  },
  {
    id: "task-3",
    title: "QA цикъл",
    description: "Проверка на най-важните потребителски сценарии.",
    due: "2024-06-21",
    column: "review",
    tag: "QA",
  },
  {
    id: "task-4",
    title: "Пускане на новата версия",
    description: "Подготовка на release notes и изпращане към екипа.",
    due: "2024-06-25",
    column: "done",
    tag: "Release",
  },
];

const loadTasks = () => {
  const stored = localStorage.getItem("teamio-tasks");
  if (!stored) {
    localStorage.setItem("teamio-tasks", JSON.stringify(defaultTasks));
    return [...defaultTasks];
  }
  return JSON.parse(stored);
};

const saveTasks = (tasks) => {
  localStorage.setItem("teamio-tasks", JSON.stringify(tasks));
};

const openModal = () => {
  modalEl.classList.add("modal--open");
};

const closeModal = () => {
  modalEl.classList.remove("modal--open");
  formEl.reset();
};

const createCard = (task) => {
  const card = document.createElement("article");
  card.className = "card";
  card.draggable = true;
  card.dataset.taskId = task.id;

  const title = document.createElement("div");
  title.className = "card__title";
  title.textContent = task.title;

  const desc = document.createElement("p");
  desc.className = "card__desc";
  desc.textContent = task.description;

  const footer = document.createElement("div");
  footer.className = "card__footer";

  const tag = document.createElement("span");
  tag.className = "card__tag";
  tag.textContent = task.tag ?? "Общо";

  const due = document.createElement("span");
  due.textContent = task.due ? new Date(task.due).toLocaleDateString("bg-BG") : "Без срок";

  footer.append(tag, due);
  card.append(title, desc, footer);

  card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", task.id);
  });

  return card;
};

const renderBoard = (tasks) => {
  boardEl.innerHTML = "";
  const activeCount = tasks.filter((task) => task.column !== "done").length;
  const dueCount = tasks.filter((task) => task.due).length;
  statActive.textContent = activeCount.toString();
  statDue.textContent = dueCount.toString();

  columns.forEach((column) => {
    const columnEl = document.createElement("section");
    columnEl.className = "column";
    columnEl.dataset.column = column.id;

    const header = document.createElement("div");
    header.className = "column__header";

    const title = document.createElement("h3");
    title.textContent = column.title;

    const count = document.createElement("span");
    count.className = "column__count";
    const columnTasks = tasks.filter((task) => task.column === column.id);
    count.textContent = `${columnTasks.length} задачи`;

    header.append(title, count);
    columnEl.append(header);

    columnTasks.forEach((task) => {
      columnEl.append(createCard(task));
    });

    columnEl.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    columnEl.addEventListener("drop", (event) => {
      event.preventDefault();
      const taskId = event.dataTransfer.getData("text/plain");
      const updated = tasks.map((task) =>
        task.id === taskId ? { ...task, column: column.id } : task
      );
      saveTasks(updated);
      renderBoard(updated);
    });

    boardEl.append(columnEl);
  });
};

newBoardButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);
modalEl.addEventListener("click", (event) => {
  if (event.target === modalEl) {
    closeModal();
  }
});

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(formEl);
  const tasks = loadTasks();
  const newTask = {
    id: `task-${Date.now()}`,
    title: formData.get("title").toString(),
    description: formData.get("description").toString(),
    due: formData.get("due").toString(),
    column: formData.get("column").toString(),
    tag: "Ново",
  };
  const updated = [newTask, ...tasks];
  saveTasks(updated);
  renderBoard(updated);
  closeModal();
});

const initialTasks = loadTasks();
renderBoard(initialTasks);
