const boardEl = document.getElementById("board");
const appEl = document.getElementById("app");
const authScreenEl = document.getElementById("auth-screen");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMessage = document.getElementById("auth-message");
const authToggleButtons = document.querySelectorAll(".auth-toggle__button");
const profileName = document.getElementById("profile-name");
const profileAvatar = document.getElementById("profile-avatar");
const logoutButton = document.getElementById("logout");
const modalEl = document.getElementById("modal");
const formEl = document.getElementById("task-form");
const columnSelect = formEl.querySelector("select[name=\"column\"]");
const newBoardButton = document.getElementById("new-board");
const newColumnButton = document.getElementById("new-column");
const navItems = document.querySelectorAll(".nav__item");
const tabPanels = document.querySelectorAll(".tab-panel");
const settingsButton = document.getElementById("open-settings");
const colorSwatches = document.querySelectorAll(".color-swatch");
const densityButtons = document.querySelectorAll(".density-button");
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

const loadUsers = () => JSON.parse(localStorage.getItem("teamio-users") ?? "[]");

const saveUsers = (users) => {
  localStorage.setItem("teamio-users", JSON.stringify(users));
};

const setAuthMessage = (message) => {
  authMessage.textContent = message;
};

const setCurrentUser = (user) => {
  localStorage.setItem("teamio-current-user", JSON.stringify(user));
};

const loadCurrentUser = () => {
  const stored = localStorage.getItem("teamio-current-user");
  return stored ? JSON.parse(stored) : null;
};

const updateProfile = (user) => {
  if (!user) {
    profileName.textContent = "Гост";
    profileAvatar.textContent = "ТИ";
    return;
  }
  profileName.textContent = user.name;
  profileAvatar.textContent = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const showApp = (user) => {
  authScreenEl.style.display = "none";
  appEl.classList.remove("app--hidden");
  updateProfile(user);
};

const showAuth = () => {
  authScreenEl.style.display = "flex";
  appEl.classList.add("app--hidden");
};

const handleLogin = (email, password) => {
  const users = loadUsers();
  if (users.length === 0) {
    setAuthMessage("Нямаш акаунт. Регистрирай се, за да влезеш.");
    loginForm.classList.remove("auth-form--active");
    registerForm.classList.add("auth-form--active");
    authToggleButtons.forEach((btn) =>
      btn.classList.toggle("auth-toggle__button--active", btn.dataset.auth === "register")
    );
    return;
  }
  const user = users.find((item) => item.email === email && item.password === password);
  if (!user) {
    setAuthMessage("Невалидни данни. Провери имейла и паролата.");
    return;
  }
  setCurrentUser(user);
  setAuthMessage("");
  showApp(user);
};

const handleRegister = (name, email, password) => {
  const users = loadUsers();
  if (users.some((item) => item.email === email)) {
    setAuthMessage("Този имейл вече е регистриран.");
    return;
  }
  const newUser = { id: `user-${Date.now()}`, name, email, password };
  const updated = [...users, newUser];
  saveUsers(updated);
  setCurrentUser(newUser);
  setAuthMessage("");
  showApp(newUser);
};

const applyThemeColor = (color) => {
  if (!color) {
    return;
  }
  document.documentElement.style.setProperty("--primary", color);
  document.documentElement.style.setProperty("--primary-dark", color);
  localStorage.setItem("teamio-theme", color);
};

const loadTheme = () => {
  const saved = localStorage.getItem("teamio-theme");
  if (saved) {
    applyThemeColor(saved);
  }
};

const applyDensity = (mode) => {
  document.body.classList.toggle("density-compact", mode === "compact");
  localStorage.setItem("teamio-density", mode);
};

const loadDensity = () => {
  const saved = localStorage.getItem("teamio-density");
  if (saved) {
    applyDensity(saved);
  }
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

const activateAuthForm = (target) => {
  authToggleButtons.forEach((btn) =>
    btn.classList.toggle("auth-toggle__button--active", btn.dataset.auth === target)
  );
  loginForm.classList.toggle("auth-form--active", target === "login");
  registerForm.classList.toggle("auth-form--active", target === "register");
  setAuthMessage("");
};

authToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateAuthForm(button.dataset.auth);
  });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  handleLogin(formData.get("email").toString(), formData.get("password").toString());
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  handleRegister(
    formData.get("name").toString(),
    formData.get("email").toString(),
    formData.get("password").toString()
  );
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("teamio-current-user");
  showAuth();
});

const activateTab = (tabId) => {
  navItems.forEach((item) => {
    item.classList.toggle("nav__item--active", item.dataset.tab === tabId);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("tab-panel--active", panel.dataset.tabPanel === tabId);
  });
};

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    activateTab(item.dataset.tab);
  });
});

settingsButton.addEventListener("click", () => {
  activateTab("settings");
});

colorSwatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    applyThemeColor(swatch.dataset.color);
  });
});

densityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyDensity(button.dataset.density);
  });
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
loadTheme();
loadDensity();
renderBoard(initialTasks);

const activeUser = loadCurrentUser();
if (activeUser) {
  showApp(activeUser);
} else {
  showAuth();
}
