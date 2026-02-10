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
const forgotPasswordButton = document.getElementById("forgot-password");
const resetModal = document.getElementById("reset-modal");
const resetRequestForm = document.getElementById("reset-request-form");
const resetLinkEl = document.getElementById("reset-link");
const closeResetButton = document.getElementById("close-reset");
const newPasswordModal = document.getElementById("new-password-modal");
const newPasswordForm = document.getElementById("new-password-form");
const closeNewPasswordButton = document.getElementById("close-new-password");
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
const teamForm = document.getElementById("team-form");
const teamCreateForm = document.getElementById("team-create-form");
const teamList = document.getElementById("team-list");
const teamCatalog = document.getElementById("team-catalog");
const memberTeamIdsSelect = document.getElementById("member-team-ids");
const taskTeamIdsSelect = document.getElementById("task-team-ids");
const boardTeamFilter = document.getElementById("board-team-filter");
const statTeamSize = document.getElementById("stat-team-size");
const openTeamCreateModalButton = document.getElementById("open-team-create-modal");
const openMemberCreateModalButton = document.getElementById("open-member-create-modal");
const teamCreateModal = document.getElementById("team-create-modal");
const memberCreateModal = document.getElementById("member-create-modal");
const closeTeamCreateModalButton = document.getElementById("close-team-create-modal");
const closeMemberCreateModalButton = document.getElementById("close-member-create-modal");
const calendarForm = document.getElementById("calendar-form");
const calendarList = document.getElementById("calendar-list");
const calendarGrid = document.getElementById("calendar-grid");
const calendarViewSelect = document.getElementById("calendar-view");
const calendarFocusDateInput = document.getElementById("calendar-focus-date");
const calendarPrevButton = document.getElementById("calendar-prev");
const calendarTodayButton = document.getElementById("calendar-today");
const calendarNextButton = document.getElementById("calendar-next");
const reportDone = document.getElementById("report-done");
const reportActive = document.getElementById("report-active");
const reportVelocity = document.getElementById("report-velocity");

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
    level: "L1",
  },
  {
    id: "task-2",
    title: "Синхронизиране на екипа",
    description: "Ежеседмично събиране и дефиниране на цели.",
    due: "2024-06-19",
    column: "progress",
    tag: "Екип",
    level: "L2",
  },
  {
    id: "task-3",
    title: "QA цикъл",
    description: "Проверка на най-важните потребителски сценарии.",
    due: "2024-06-21",
    column: "review",
    tag: "QA",
    level: "L3",
  },
  {
    id: "task-4",
    title: "Пускане на новата версия",
    description: "Подготовка на release notes и изпращане към екипа.",
    due: "2024-06-25",
    column: "done",
    tag: "Release",
    level: "L2",
  },
];


const levelOrder = { L1: 1, L2: 2, L3: 3 };

const calendarState = {
  view: localStorage.getItem("teamio-calendar-view") ?? "week",
  focusDate: localStorage.getItem("teamio-calendar-focus") ?? new Date().toISOString().slice(0, 10),
};

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

const loadAccounts = () => JSON.parse(localStorage.getItem("teamio-accounts") ?? "[]");

const saveAccounts = (accounts) => {
  localStorage.setItem("teamio-accounts", JSON.stringify(accounts));
};

const getCurrentAccount = () => {
  const user = loadCurrentUser();
  if (!user?.accountId) {
    return null;
  }
  return loadAccounts().find((account) => account.id === user.accountId) ?? null;
};

const ensureAccountForUser = (user) => {
  if (!user?.id) {
    return user;
  }

  const accounts = loadAccounts();
  const users = loadUsers();
  const existingUser = users.find((item) => item.id === user.id) ?? user;
  const existingAccount = existingUser.accountId ? accounts.find((account) => account.id === existingUser.accountId) : null;

  if (existingAccount) {
    if (user.accountId !== existingUser.accountId) {
      const nextUser = { ...user, accountId: existingUser.accountId };
      setCurrentUser(nextUser);
      return nextUser;
    }
    return user;
  }

  const accountId = existingUser.accountId ?? `account-${Date.now()}`;
  const nextAccount = {
    id: accountId,
    name: "Моята фирма",
    teams: [
      { id: `team-${Date.now()}-1`, name: "Общ екип" },
      { id: `team-${Date.now()}-2`, name: "Оперативен екип" },
    ],
    members: [],
  };

  saveAccounts([...accounts, nextAccount]);

  const updatedUsers = users.map((item) => (item.id === existingUser.id ? { ...item, accountId } : item));
  if (updatedUsers.length > 0) {
    saveUsers(updatedUsers);
  }

  const nextUser = { ...user, accountId };
  setCurrentUser(nextUser);
  return nextUser;
};

const getSelectedValues = (selectEl) =>
  Array.from(selectEl?.selectedOptions ?? [])
    .map((option) => option.value)
    .filter(Boolean);

const syncTeamSelectors = () => {
  const account = getCurrentAccount();
  const teams = account?.teams ?? [];

  [memberTeamIdsSelect, taskTeamIdsSelect, boardTeamFilter].forEach((selectEl) => {
    if (!selectEl) {
      return;
    }
    const selected = new Set(getSelectedValues(selectEl));
    selectEl.innerHTML = "";
    teams.forEach((team) => {
      const option = document.createElement("option");
      option.value = team.id;
      option.textContent = team.name;
      option.selected = selected.has(team.id);
      selectEl.append(option);
    });
  });
};

const getVisibleTasks = () => {
  const user = loadCurrentUser();
  const allTasks = loadTasks();
  const accountTasks = allTasks.filter((task) => !user?.accountId || task.accountId === user.accountId);
  const selectedTeamIds = getSelectedValues(boardTeamFilter);
  if (selectedTeamIds.length === 0) {
    return accountTasks;
  }
  return accountTasks.filter((task) => (task.teamIds ?? []).some((teamId) => selectedTeamIds.includes(teamId)));
};

const loadCalendar = () => JSON.parse(localStorage.getItem("teamio-calendar") ?? "[]");

const saveCalendar = (items) => {
  localStorage.setItem("teamio-calendar", JSON.stringify(items));
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const normalizeText = (value) => value.trim();

const loadApiBase = () => localStorage.getItem("teamio-api-base") ?? "";

const apiRequest = async (path, options = {}) => {
  const base = loadApiBase();
  if (!base) {
    return null;
  }
  try {
    const response = await fetch(`${base}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, data };
    }
    return { ok: true, data };
  } catch (error) {
    return { ok: false, data: { message: "Сървърът не е достъпен." } };
  }
};

const hashPassword = async (password) => {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const saveResetTokens = (tokens) => {
  localStorage.setItem("teamio-reset-tokens", JSON.stringify(tokens));
};

const loadResetTokens = () => JSON.parse(localStorage.getItem("teamio-reset-tokens") ?? "[]");

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
  const normalizedUser = ensureAccountForUser(user);
  authScreenEl.style.display = "none";
  appEl.classList.remove("app--hidden");
  updateProfile(normalizedUser);
  syncTeamSelectors();
  renderBoard(getVisibleTasks());
  renderTeams();
  updateReports();
};

const showAuth = () => {
  authScreenEl.style.display = "flex";
  appEl.classList.add("app--hidden");
};

const handleLogin = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = normalizeText(password);
  const apiResult = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
  });

  if (apiResult?.ok && apiResult.data?.user) {
    setCurrentUser(apiResult.data.user);
    setAuthMessage("");
    showApp(apiResult.data.user);
    return;
  }

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

  const hashed = await hashPassword(normalizedPassword);
  const user = users.find(
    (item) => normalizeEmail(item.email) === normalizedEmail && (item.password === hashed || item.password === normalizedPassword)
  );

  if (!user) {
    setAuthMessage(apiResult?.data?.message ?? "Невалидни данни. Провери имейла и паролата.");
    return;
  }

  if (user.password === normalizedPassword) {
    user.password = hashed;
    saveUsers(users);
  }

  setCurrentUser(user);
  setAuthMessage("");
  showApp(user);
};

const handleRegister = async (name, email, password, companyName) => {
  const normalizedName = normalizeText(name);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = normalizeText(password);
  const normalizedCompanyName = normalizeText(companyName);

  if (!normalizedName || !normalizedEmail || !normalizedCompanyName || normalizedPassword.length < 6) {
    setAuthMessage("Попълни коректно всички полета.");
    return;
  }

  const apiResult = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: normalizedName,
      email: normalizedEmail,
      password: normalizedPassword,
      companyName: normalizedCompanyName,
    }),
  });

  if (apiResult?.ok && apiResult.data?.user) {
    setCurrentUser(apiResult.data.user);
    setAuthMessage("");
    showApp(apiResult.data.user);
    return;
  }

  const users = loadUsers();
  const accounts = loadAccounts();
  if (users.some((item) => normalizeEmail(item.email) === normalizedEmail)) {
    setAuthMessage(apiResult?.data?.message ?? "Този имейл вече е регистриран.");
    return;
  }

  const accountId = `account-${Date.now()}`;
  const defaultTeams = [
    { id: `team-${Date.now()}-1`, name: "Продуктов екип" },
    { id: `team-${Date.now()}-2`, name: "Инженерен екип" },
  ];
  accounts.push({ id: accountId, name: normalizedCompanyName, teams: defaultTeams, members: [] });
  saveAccounts(accounts);

  const hashed = await hashPassword(normalizedPassword);
  const newUser = {
    id: `user-${Date.now()}`,
    name: normalizedName,
    email: normalizedEmail,
    password: hashed,
    accountId,
  };
  const updated = [...users, newUser];
  saveUsers(updated);
  setCurrentUser(newUser);
  setAuthMessage("");
  showApp(newUser);
};

const openModal = (modal) => {
  modal.classList.add("modal--open");
};

const closeModal = (modal) => {
  modal.classList.remove("modal--open");
};

const generateToken = () => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const requestPasswordReset = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  const apiResult = await apiRequest("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: normalizedEmail }),
  });

  if (apiResult?.ok) {
    resetLinkEl.textContent = "Ако имейлът съществува, изпратихме линк за смяна на парола.";
    return;
  }

  const users = loadUsers();
  const user = users.find((item) => normalizeEmail(item.email) === normalizedEmail);
  if (!user) {
    resetLinkEl.textContent = "Ако имейлът съществува, изпратихме линк за смяна на парола.";
    return;
  }
  const tokens = loadResetTokens();
  const token = generateToken();
  tokens.push({ token, email: normalizedEmail, createdAt: Date.now() });
  saveResetTokens(tokens);
  resetLinkEl.textContent = "Линкът за смяна е генериран в демо режим (без реално изпращане на имейл).";
};

const openResetFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("reset");
  if (!token) {
    return;
  }
  newPasswordForm.querySelector("input[name=\"token\"]").value = token;
  openModal(newPasswordModal);
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
  const normalizedMode = mode === "compact" ? "compact" : "comfortable";
  document.body.classList.toggle("density-compact", normalizedMode === "compact");
  document.body.classList.toggle("density-comfortable", normalizedMode === "comfortable");
  densityButtons.forEach((button) => {
    button.classList.toggle("density-button--active", button.dataset.density === normalizedMode);
  });
  localStorage.setItem("teamio-density", normalizedMode);
};

const loadDensity = () => {
  const saved = localStorage.getItem("teamio-density") ?? "comfortable";
  applyDensity(saved);
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

const openTaskModal = () => {
  modalEl.classList.add("modal--open");
};

const closeTaskModal = () => {
  modalEl.classList.remove("modal--open");
  formEl.reset();
};

const createCard = (task, columnColor) => {
  const card = document.createElement("article");
  card.className = "card";
  const level = task.level ?? "L2";
  card.classList.add(`card--${level.toLowerCase()}`);
  card.draggable = true;
  card.dataset.taskId = task.id;
  card.style.setProperty("--card-accent", columnColor ?? "#5b6bff");

  const titleRow = document.createElement("div");
  titleRow.className = "card__title-row";

  const title = document.createElement("div");
  title.className = "card__title";
  title.textContent = task.title;

  const levelBadge = document.createElement("span");
  levelBadge.className = "card__level";
  levelBadge.textContent = level;

  titleRow.append(title, levelBadge);

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
  card.append(titleRow, desc, footer);

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
    const columnTasks = tasks
      .filter((task) => task.column === column.id)
      .sort((a, b) => (levelOrder[a.level ?? "L2"] ?? 2) - (levelOrder[b.level ?? "L2"] ?? 2));
    count.textContent = `${columnTasks.length} задачи`;

    const actions = document.createElement("div");
    actions.className = "column__actions";

    const dragButton = document.createElement("button");
    dragButton.type = "button";
    dragButton.className = "column__drag";
    dragButton.textContent = "☰";
    dragButton.draggable = true;
    dragButton.title = "Премести колона";
    dragButton.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("application/x-teamio-column", column.id);
      event.dataTransfer.effectAllowed = "move";
    });

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

    actions.append(count, dragButton, renameButton);
    header.append(titleWrap, actions);
    columnEl.append(header);

    columnTasks.forEach((task) => {
      columnEl.append(createCard(task, column.color));
    });

    columnEl.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (event.dataTransfer.types.includes("application/x-teamio-column")) {
        columnEl.classList.add("column--drag-over");
      }
    });

    columnEl.addEventListener("dragleave", () => {
      columnEl.classList.remove("column--drag-over");
    });

    columnEl.addEventListener("drop", (event) => {
      event.preventDefault();
      columnEl.classList.remove("column--drag-over");

      const draggedColumnId = event.dataTransfer.getData("application/x-teamio-column");
      if (draggedColumnId) {
        if (draggedColumnId === column.id) {
          return;
        }
        const columns = loadColumns();
        const sourceIndex = columns.findIndex((entry) => entry.id === draggedColumnId);
        const targetIndex = columns.findIndex((entry) => entry.id === column.id);
        if (sourceIndex === -1 || targetIndex === -1) {
          return;
        }
        const nextColumns = [...columns];
        const [moved] = nextColumns.splice(sourceIndex, 1);
        nextColumns.splice(targetIndex, 0, moved);
        saveColumns(nextColumns);
        renderBoard(getVisibleTasks());
        return;
      }

      const taskId = event.dataTransfer.getData("text/plain");
      if (!taskId) {
        return;
      }
      const allTasks = loadTasks();
      const updated = allTasks.map((task) => (task.id === taskId ? { ...task, column: column.id } : task));
      saveTasks(updated);
      renderBoard(getVisibleTasks());
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

  updateReports();
};

const renderTeams = () => {
  const account = getCurrentAccount();
  const members = account?.members ?? [];
  const teams = account?.teams ?? [];

  teamList.innerHTML = "";
  if (members.length === 0) {
    const empty = document.createElement("div");
    empty.className = "panel-list__item";
    empty.innerHTML = '<div><strong>Няма добавени хора</strong><div class="panel-list__meta">Използвай „Добави човек“.</div></div>';
    teamList.append(empty);
  }

  members.forEach((member) => {
    const item = document.createElement("div");
    item.className = "panel-list__item";

    const teamNames = (member.teamIds ?? [])
      .map((teamId) => teams.find((team) => team.id === teamId)?.name)
      .filter(Boolean)
      .join(", ");

    const info = document.createElement("div");
    info.innerHTML = `<strong>${member.name}</strong><div class="panel-list__meta">${member.role} • ${teamNames || "Без екип"}</div>`;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "panel-list__remove";
    remove.textContent = "Премахни";
    remove.addEventListener("click", () => {
      const accounts = loadAccounts().map((entry) =>
        entry.id === account.id
          ? { ...entry, members: (entry.members ?? []).filter((current) => current.id !== member.id) }
          : entry
      );
      saveAccounts(accounts);
      renderTeams();
      updateReports();
    });

    item.append(info, remove);
    teamList.append(item);
  });

  if (teamCatalog) {
    teamCatalog.innerHTML = "";

    if (teams.length === 0) {
      const empty = document.createElement("div");
      empty.className = "panel-list__item";
      empty.innerHTML = '<div><strong>Няма екипи</strong><div class="panel-list__meta">Използвай „Добави екип“.</div></div>';
      teamCatalog.append(empty);
    }

    teams.forEach((team) => {
      const teamCard = document.createElement("div");
      teamCard.className = "panel-list__item";
      const count = members.filter((member) => (member.teamIds ?? []).includes(team.id)).length;
      teamCard.innerHTML = `<div><strong>${team.name}</strong><div class="panel-list__meta">${count} човека</div></div>`;
      teamCatalog.append(teamCard);
    });
  }

  syncTeamSelectors();
};

const parseDateOnly = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateOnly = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + offset);
  result.setHours(0, 0, 0, 0);
  return result;
};

const renderCalendarGrid = (items) => {
  if (!calendarGrid) {
    return;
  }

  calendarGrid.innerHTML = "";
  const focus = parseDateOnly(calendarState.focusDate);
  const days = [];

  if (calendarState.view === "month") {
    const start = new Date(focus.getFullYear(), focus.getMonth(), 1);
    const end = new Date(focus.getFullYear(), focus.getMonth() + 1, 0);
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
  } else {
    const weekStart = startOfWeek(focus);
    for (let i = 0; i < 7; i += 1) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
  }

  const grouped = items.reduce((acc, item) => {
    const key = item.date;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  days.forEach((date) => {
    const key = formatDateOnly(date);
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";

    const label = document.createElement("span");
    label.className = "calendar-day__label";
    label.textContent = date.toLocaleDateString("bg-BG", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });

    dayEl.append(label);

    const dayItems = grouped[key] ?? [];
    if (dayItems.length === 0) {
      const empty = document.createElement("span");
      empty.className = "calendar-day__item";
      empty.textContent = "Няма събития";
      dayEl.append(empty);
    } else {
      dayItems.forEach((entry) => {
        const item = document.createElement("span");
        item.className = "calendar-day__item";
        item.textContent = `• ${entry.title}`;
        dayEl.append(item);
      });
    }

    calendarGrid.append(dayEl);
  });
};

const renderCalendar = () => {
  const items = loadCalendar();
  if (calendarFocusDateInput) {
    calendarFocusDateInput.value = calendarState.focusDate;
  }
  calendarList.innerHTML = "";
  items
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((event) => {
      const item = document.createElement("div");
      item.className = "panel-list__item";

      const info = document.createElement("div");
      const dateLabel = event.date ? new Date(event.date).toLocaleDateString("bg-BG") : "";
      info.innerHTML = `<strong>${event.title}</strong><div class="panel-list__meta">${dateLabel}</div>`;

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "panel-list__remove";
      remove.textContent = "Премахни";
      remove.addEventListener("click", () => {
        saveCalendar(items.filter((entry) => entry.id !== event.id));
        renderCalendar();
      });

      item.append(info, remove);
      calendarList.append(item);
    });

  renderCalendarGrid(items);
};

const updateReports = () => {
  const tasks = getVisibleTasks();
  const doneCount = tasks.filter((task) => task.column === "done").length;
  const activeCount = tasks.filter((task) => task.column !== "done").length;
  const teamCount = getCurrentAccount()?.members?.length ?? 0;
  reportDone.textContent = doneCount.toString();
  reportActive.textContent = activeCount.toString();
  reportVelocity.textContent = teamCount > 0 ? `${Math.round((doneCount / teamCount) * 100)}%` : "0%";
  if (statTeamSize) {
    statTeamSize.textContent = `${teamCount}`;
  }
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
  renderBoard(getVisibleTasks());
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

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  await handleLogin(formData.get("email").toString(), formData.get("password").toString());
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  await handleRegister(
    formData.get("name").toString(),
    formData.get("email").toString(),
    formData.get("password").toString(),
    formData.get("companyName").toString()
  );
});

openTeamCreateModalButton?.addEventListener("click", () => {
  teamCreateForm?.reset();
  openModal(teamCreateModal);
});

openMemberCreateModalButton?.addEventListener("click", () => {
  syncTeamSelectors();
  teamForm?.reset();
  openModal(memberCreateModal);
});

closeTeamCreateModalButton?.addEventListener("click", () => {
  closeModal(teamCreateModal);
});

closeMemberCreateModalButton?.addEventListener("click", () => {
  closeModal(memberCreateModal);
});

teamCreateModal?.addEventListener("click", (event) => {
  if (event.target === teamCreateModal) {
    closeModal(teamCreateModal);
  }
});

memberCreateModal?.addEventListener("click", (event) => {
  if (event.target === memberCreateModal) {
    closeModal(memberCreateModal);
  }
});

teamCreateForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(teamCreateForm);
  const teamName = normalizeText(formData.get("teamName")?.toString() ?? "");
  if (!teamName) {
    return;
  }
  const account = getCurrentAccount();
  if (!account) {
    return;
  }

  const alreadyExists = (account.teams ?? []).some((team) => normalizeText(team.name).toLowerCase() === teamName.toLowerCase());
  if (alreadyExists) {
    return;
  }

  const updatedAccounts = loadAccounts().map((entry) =>
    entry.id === account.id
      ? { ...entry, teams: [...(entry.teams ?? []), { id: `team-${Date.now()}`, name: teamName }] }
      : entry
  );

  saveAccounts(updatedAccounts);
  teamCreateForm.reset();
  closeModal(teamCreateModal);
  renderTeams();
});

teamForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const account = getCurrentAccount();
  if (!account) {
    return;
  }
  const formData = new FormData(teamForm);
  const selectedTeamIds = getSelectedValues(memberTeamIdsSelect);
  if (selectedTeamIds.length === 0) {
    return;
  }
  const newMember = {
    id: `member-${Date.now()}`,
    name: normalizeText(formData.get("name")?.toString() ?? ""),
    role: normalizeText(formData.get("role")?.toString() ?? ""),
    teamIds: selectedTeamIds,
  };
  if (!newMember.name || !newMember.role) {
    return;
  }
  const updatedAccounts = loadAccounts().map((entry) =>
    entry.id === account.id ? { ...entry, members: [...(entry.members ?? []), newMember] } : entry
  );
  saveAccounts(updatedAccounts);
  teamForm.reset();
  closeModal(memberCreateModal);
  renderTeams();
  updateReports();
});

calendarForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(calendarForm);
  const newEvent = {
    id: `event-${Date.now()}`,
    title: formData.get("title").toString(),
    date: formData.get("date").toString(),
  };
  const updated = [...loadCalendar(), newEvent];
  saveCalendar(updated);
  calendarForm.reset();
  renderCalendar();
});

if (calendarViewSelect) {
  calendarViewSelect.value = calendarState.view;
}
if (calendarFocusDateInput) {
  calendarFocusDateInput.value = calendarState.focusDate;
}

calendarViewSelect?.addEventListener("change", () => {
  calendarState.view = calendarViewSelect.value;
  localStorage.setItem("teamio-calendar-view", calendarState.view);
  renderCalendar();
});

calendarFocusDateInput?.addEventListener("change", () => {
  if (!calendarFocusDateInput.value) {
    return;
  }
  calendarState.focusDate = calendarFocusDateInput.value;
  localStorage.setItem("teamio-calendar-focus", calendarState.focusDate);
  renderCalendar();
});

calendarTodayButton?.addEventListener("click", () => {
  calendarState.focusDate = new Date().toISOString().slice(0, 10);
  localStorage.setItem("teamio-calendar-focus", calendarState.focusDate);
  if (calendarFocusDateInput) {
    calendarFocusDateInput.value = calendarState.focusDate;
  }
  renderCalendar();
});

calendarPrevButton?.addEventListener("click", () => {
  const current = parseDateOnly(calendarState.focusDate);
  if (calendarState.view === "month") {
    current.setMonth(current.getMonth() - 1);
  } else {
    current.setDate(current.getDate() - 7);
  }
  calendarState.focusDate = formatDateOnly(current);
  localStorage.setItem("teamio-calendar-focus", calendarState.focusDate);
  if (calendarFocusDateInput) {
    calendarFocusDateInput.value = calendarState.focusDate;
  }
  renderCalendar();
});

calendarNextButton?.addEventListener("click", () => {
  const current = parseDateOnly(calendarState.focusDate);
  if (calendarState.view === "month") {
    current.setMonth(current.getMonth() + 1);
  } else {
    current.setDate(current.getDate() + 7);
  }
  calendarState.focusDate = formatDateOnly(current);
  localStorage.setItem("teamio-calendar-focus", calendarState.focusDate);
  if (calendarFocusDateInput) {
    calendarFocusDateInput.value = calendarState.focusDate;
  }
  renderCalendar();
});

forgotPasswordButton.addEventListener("click", () => {
  resetLinkEl.textContent = "";
  resetRequestForm.reset();
  openModal(resetModal);
});

closeResetButton.addEventListener("click", () => {
  closeModal(resetModal);
});

resetRequestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(resetRequestForm);
  requestPasswordReset(formData.get("email").toString());
});

newPasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(newPasswordForm);
  const token = formData.get("token").toString();
  const newPassword = formData.get("password").toString();

  const apiResult = await apiRequest("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password: newPassword }),
  });

  if (apiResult?.ok) {
    closeModal(newPasswordModal);
    setAuthMessage("Паролата е обновена. Можеш да влезеш.");
    return;
  }

  const tokens = loadResetTokens();
  const tokenRecord = tokens.find((item) => item.token === token);
  if (!tokenRecord) {
    setAuthMessage(apiResult?.data?.message ?? "Линкът за възстановяване е невалиден.");
    return;
  }
  const users = loadUsers();
  const updatedUsers = await Promise.all(
    users.map(async (user) => {
      if (normalizeEmail(user.email) !== normalizeEmail(tokenRecord.email)) {
        return user;
      }
      return { ...user, password: await hashPassword(newPassword) };
    })
  );
  saveUsers(updatedUsers);
  saveResetTokens(tokens.filter((item) => item.token !== token));
  closeModal(newPasswordModal);
  setAuthMessage("Паролата е обновена. Можеш да влезеш.");
});

closeNewPasswordButton.addEventListener("click", () => {
  closeModal(newPasswordModal);
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

newBoardButton.addEventListener("click", openTaskModal);
closeModalButton.addEventListener("click", closeTaskModal);
modalEl.addEventListener("click", (event) => {
  if (event.target === modalEl) {
    closeTaskModal();
  }
});

resetModal.addEventListener("click", (event) => {
  if (event.target === resetModal) {
    closeModal(resetModal);
  }
});

newPasswordModal.addEventListener("click", (event) => {
  if (event.target === newPasswordModal) {
    closeModal(newPasswordModal);
  }
});

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(formEl);
  const currentUser = loadCurrentUser();
  const selectedTeamIds = getSelectedValues(taskTeamIdsSelect);
  if (selectedTeamIds.length === 0) {
    return;
  }
  const tasks = loadTasks();
  const newTask = {
    id: `task-${Date.now()}`,
    title: formData.get("title").toString(),
    description: formData.get("description").toString(),
    due: formData.get("due").toString(),
    column: formData.get("column").toString(),
    tag: "Ново",
    level: formData.get("level")?.toString() ?? "L2",
    teamIds: selectedTeamIds,
    accountId: currentUser?.accountId,
  };
  const updated = [newTask, ...tasks];
  saveTasks(updated);
  renderBoard(getVisibleTasks());
  closeTaskModal();
});

boardTeamFilter?.addEventListener("change", () => {
  renderBoard(getVisibleTasks());
});

const initialTasks = getVisibleTasks();
loadTheme();
loadDensity();
renderBoard(initialTasks);
renderTeams();
renderCalendar();
updateReports();

const activeUser = loadCurrentUser();
if (activeUser) {
  showApp(activeUser);
} else {
  showAuth();
}

openResetFromUrl();
