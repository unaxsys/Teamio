const boardEl = document.getElementById("board");
const modalEl = document.getElementById("modal");
const formEl = document.getElementById("task-form");
const columnSelect = formEl.querySelector("select[name=\"column\"]");
const newBoardButton = document.getElementById("new-board");
const newColumnButton = document.getElementById("new-column");
const closeModalButton = document.getElementById("close-modal");
const statActive = document.getElementById("stat-active");
const statDue = document.getElementById("stat-due");

const defaultColumns = [
  { id: "backlog", title: "Backlog", color: "#5b6bff" },
  { id: "progress", title: "В процес", color: "#2bb8a1" },
  { id: "review", title: "Преглед", color: "#f8b259" },
  { id: "done", title: "Готово", color: "#7b8afd" },
];

const columnPalette = ["#5b6bff", "#2bb8a1", "#f8b259", "#7b8afd", "#ff7a7a", "#6dd3ff"];

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

const loadColumns = () => {
  const stored = localStorage.getItem("teamio-columns");
  if (!stored) {
    localStorage.setItem("teamio-columns", JSON.stringify(defaultColumns));
    return [...defaultColumns];
  }
  return JSON.parse(stored);
};

const saveColumns = (columns) => {
  localStorage.setItem("teamio-columns", JSON.stringify(columns));
};

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

const createCard = (task, columnColor) => {
  const card = document.createElement("article");
  card.className = "card";
  card.draggable = true;
  card.dataset.taskId = task.id;
  card.style.setProperty("--card-accent", columnColor ?? "#5b6bff");

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
  const columns = loadColumns();
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

    const titleWrap = document.createElement("div");
    titleWrap.className = "column__title";

    const swatch = document.createElement("span");
    swatch.className = "column__swatch";
    swatch.style.background = column.color;

    const title = document.createElement("h3");
    title.textContent = column.title;

    titleWrap.append(swatch, title);

    const count = document.createElement("span");
    count.className = "column__count";
    const columnTasks = tasks.filter((task) => task.column === column.id);
    count.textContent = `${columnTasks.length} задачи`;

    const actions = document.createElement("div");
    actions.className = "column__actions";

    const renameButton = document.createElement("button");
    renameButton.type = "button";
    renameButton.className = "column__rename";
    renameButton.textContent = "Преименувай";
    renameButton.addEventListener("click", () => {
      const newName = window.prompt("Ново име на колоната:", column.title);
      if (!newName) {
        return;
      }
      const updatedColumns = columns.map((item) =>
        item.id === column.id ? { ...item, title: newName.trim() } : item
      );
      saveColumns(updatedColumns);
      renderBoard(tasks);
    });

    actions.append(count, renameButton);
    header.append(titleWrap, actions);
    columnEl.append(header);

    columnTasks.forEach((task) => {
      columnEl.append(createCard(task, column.color));
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

  columnSelect.innerHTML = "";
  columns.forEach((column) => {
    const option = document.createElement("option");
    option.value = column.id;
    option.textContent = column.title;
    columnSelect.append(option);
  });
};

newColumnButton.addEventListener("click", () => {
  const name = window.prompt("Име на новата колона:");
  if (!name) {
    return;
  }
  const columns = loadColumns();
  const nextColor = columnPalette[columns.length % columnPalette.length];
  const newColumn = {
    id: `column-${Date.now()}`,
    title: name.trim(),
    color: nextColor,
  };
  const updated = [...columns, newColumn];
  saveColumns(updated);
  renderBoard(loadTasks());
});

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
