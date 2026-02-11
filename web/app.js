const boardEl = document.getElementById("board");
const appEl = document.getElementById("app");
const authScreenEl = document.getElementById("auth-screen");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMessage = document.getElementById("auth-message");
const verificationHelp = document.getElementById("verification-help");
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
const boardSelector = document.getElementById("board-selector");
const createBoardButton = document.getElementById("create-board");
const renameBoardButton = document.getElementById("rename-board");
const deleteBoardButton = document.getElementById("delete-board");
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
const inviteForm = document.getElementById("invite-form");
const inviteList = document.getElementById("invite-list");
const myInviteList = document.getElementById("my-invite-list");
const inviteShareBox = document.getElementById("invite-share");
const inviteShareLink = document.getElementById("invite-share-link");
const inviteCopyLinkButton = document.getElementById("invite-copy-link");
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

const taskDetailsModal = document.getElementById("task-details-modal");
const taskDetailsForm = document.getElementById("task-details-form");
const closeTaskDetailsButton = document.getElementById("close-task-details");
const groupTiles = document.querySelectorAll(".panel-tile--button");
const groupMembersModal = document.getElementById("group-members-modal");
const groupMembersTitle = document.getElementById("group-members-title");
const groupMembersList = document.getElementById("group-members-list");
const closeGroupMembersButton = document.getElementById("close-group-members");
const weekStartDaySelect = document.getElementById("week-start-day");
const highlightWeekendCheckbox = document.getElementById("setting-highlight-weekend");
const doneByColumnCheckbox = document.getElementById("setting-done-by-column");
const doneByFlagCheckbox = document.getElementById("setting-done-by-flag");
const showBoardFilterCheckbox = document.getElementById("setting-show-board-filter");
const boardFilterPanel = document.getElementById("board-filter-panel");
const doneCriteriaHelp = document.getElementById("done-criteria-help");

const currentBoardName = document.getElementById("current-board-name");
const boardSearchInput = document.getElementById("board-search");
const boardFilterButton = document.getElementById("board-filter-button");
const boardMenuButton = document.getElementById("board-menu-button");
const boardSideMenu = document.getElementById("board-side-menu");
const boardMenuOverlay = document.getElementById("board-menu-overlay");
const closeBoardMenuButton = document.getElementById("close-board-menu");
const menuOpenSettingsButton = document.getElementById("menu-open-settings");
const menuAddColumnButton = document.getElementById("menu-add-column");
const menuNewTaskButton = document.getElementById("menu-new-task");
const menuRenameBoardButton = document.getElementById("menu-rename-board");
const menuDeleteBoardButton = document.getElementById("menu-delete-board");

let boardSearchQuery = "";


const defaultBoards = [{ id: "board-default", name: "Основен борд", createdAt: Date.now() }];

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
    completed: false,
  },
  {
    id: "task-2",
    title: "Синхронизиране на екипа",
    description: "Ежеседмично събиране и дефиниране на цели.",
    due: "2024-06-19",
    column: "progress",
    tag: "Екип",
    level: "L2",
    completed: false,
  },
  {
    id: "task-3",
    title: "QA цикъл",
    description: "Проверка на най-важните потребителски сценарии.",
    due: "2024-06-21",
    column: "review",
    tag: "QA",
    level: "L3",
    completed: false,
  },
  {
    id: "task-4",
    title: "Пускане на новата версия",
    description: "Подготовка на release notes и изпращане към екипа.",
    due: "2024-06-25",
    column: "done",
    tag: "Release",
    level: "L2",
    completed: true,
  },
];


const levelOrder = { L1: 1, L2: 2, L3: 3 };

const calendarState = {
  view: localStorage.getItem("teamio-calendar-view") ?? "week",
  focusDate: localStorage.getItem("teamio-calendar-focus") ?? new Date().toISOString().slice(0, 10),
};

const groupLabels = {
  product: "Продуктов екип",
  engineering: "Инженерен екип",
  marketing: "Маркетинг",
};

const loadPreferences = () => {
  const defaults = {
    weekStartDay: "monday",
    highlightWeekend: true,
    doneByColumn: true,
    doneByFlag: false,
    showBoardFilter: true,
  };
  const stored = localStorage.getItem("teamio-preferences");
  if (!stored) {
    localStorage.setItem("teamio-preferences", JSON.stringify(defaults));
    return defaults;
  }
  return { ...defaults, ...JSON.parse(stored) };
};

const savePreferences = (preferences) => {
  localStorage.setItem("teamio-preferences", JSON.stringify(preferences));
};

let preferences = loadPreferences();

const applyBoardFilterVisibility = () => {
  if (!boardFilterPanel) {
    return;
  }
  boardFilterPanel.classList.toggle("board-filter--hidden", !preferences.showBoardFilter);
};


const loadBoards = () => {
  const stored = localStorage.getItem("teamio-boards");
  if (!stored) {
    localStorage.setItem("teamio-boards", JSON.stringify(defaultBoards));
    localStorage.setItem("teamio-current-board", defaultBoards[0].id);
    return [...defaultBoards];
  }
  const boards = JSON.parse(stored);
  if (!Array.isArray(boards) || boards.length === 0) {
    localStorage.setItem("teamio-boards", JSON.stringify(defaultBoards));
    localStorage.setItem("teamio-current-board", defaultBoards[0].id);
    return [...defaultBoards];
  }
  return boards;
};

const saveBoards = (boards) => {
  localStorage.setItem("teamio-boards", JSON.stringify(boards));
};

const getCurrentBoardId = () => {
  const boards = loadBoards();
  const current = localStorage.getItem("teamio-current-board") ?? boards[0]?.id;
  if (boards.some((board) => board.id === current)) {
    return current;
  }
  const fallback = boards[0]?.id ?? "board-default";
  localStorage.setItem("teamio-current-board", fallback);
  return fallback;
};

const setCurrentBoardId = (boardId) => {
  localStorage.setItem("teamio-current-board", boardId);
};

const renderBoardSelector = () => {
  if (!boardSelector) {
    return;
  }
  const boards = loadBoards();
  const currentBoardId = getCurrentBoardId();
  boardSelector.innerHTML = "";
  boards.forEach((board) => {
    const option = document.createElement("option");
    option.value = board.id;
    option.textContent = board.name;
    option.selected = board.id === currentBoardId;
    boardSelector.append(option);
  });
};

const updateBoardTopbar = () => {
  if (!currentBoardName) {
    return;
  }
  const currentBoard = loadBoards().find((board) => board.id === getCurrentBoardId());
  currentBoardName.textContent = currentBoard?.name ?? "Работно табло";
};

const toggleBoardMenu = (isOpen) => {
  if (!boardSideMenu) {
    return;
  }
  boardSideMenu.setAttribute("aria-hidden", (!isOpen).toString());
  boardMenuOverlay?.classList.toggle("board-menu-overlay--open", isOpen);
  boardMenuOverlay?.setAttribute("aria-hidden", (!isOpen).toString());
};

const getFilteredTasksBySearch = (tasks) => {
  if (!boardSearchQuery.trim()) {
    return tasks;
  }
  const query = boardSearchQuery.trim().toLowerCase();
  return tasks.filter((task) => {
    const title = (task.title ?? "").toLowerCase();
    const description = (task.description ?? "").toLowerCase();
    const tag = (task.tag ?? "").toLowerCase();
    return title.includes(query) || description.includes(query) || tag.includes(query);
  });
};

const loadAllColumns = () => JSON.parse(localStorage.getItem("teamio-columns") ?? "[]");

const saveAllColumns = (columns) => {
  localStorage.setItem("teamio-columns", JSON.stringify(columns));
};

const createDefaultColumnsForBoard = (boardId) =>
  defaultColumns.map((column) => ({ ...column, id: `${column.id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, boardId }));

const loadColumns = () => {
  const currentBoardId = getCurrentBoardId();
  const allColumns = loadAllColumns();
  const boardColumns = allColumns.filter((column) => column.boardId === currentBoardId || !column.boardId);
  if (boardColumns.length > 0) {
    const normalized = boardColumns.map((column) => ({ ...column, boardId: currentBoardId }));
    const otherColumns = allColumns.filter((column) => column.boardId && column.boardId !== currentBoardId);
    saveAllColumns([...otherColumns, ...normalized]);
    return normalized;
  }
  const defaults = createDefaultColumnsForBoard(currentBoardId);
  saveAllColumns([...allColumns, ...defaults]);
  return defaults;
};

const saveColumns = (columns) => {
  const currentBoardId = getCurrentBoardId();
  const allColumns = loadAllColumns().filter((column) => column.boardId !== currentBoardId);
  saveAllColumns([...allColumns, ...columns.map((column) => ({ ...column, boardId: currentBoardId }))]);
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
  const currentBoardId = getCurrentBoardId();
  const accountTasks = allTasks.filter((task) => (!user?.accountId || task.accountId === user.accountId) && (task.boardId ?? currentBoardId) === currentBoardId);
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

const getCalendarItems = () => {
  const manualItems = loadCalendar().map((item) => ({ ...item, source: "calendar" }));
  const user = loadCurrentUser();
  const taskItems = loadTasks()
    .filter((task) => task.due && (!user?.accountId || task.accountId === user.accountId))
    .map((task) => ({
      id: `task-deadline-${task.id}`,
      title: `📌 ${task.title}`,
      date: task.due,
      source: "task",
      taskId: task.id,
    }));

  return [...manualItems, ...taskItems];
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const normalizeText = (value) => value.trim();

const getInviteTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return normalizeText(params.get("invite") ?? "");
};

const hasManagementAccess = () => {
  const currentUser = loadCurrentUser();
  const account = getCurrentAccount();
  if (!currentUser) {
    return false;
  }

  if (account?.ownerUserId && account.ownerUserId === currentUser.id) {
    return true;
  }

  const role = normalizeText(currentUser.role ?? "").toLowerCase();
  return ["admin", "owner", "администратор", "собственик"].some((keyword) => role.includes(keyword));
};

const applyManagementAccessUi = () => {
  const hasAccess = hasManagementAccess();

  if (openTeamCreateModalButton) {
    openTeamCreateModalButton.disabled = !hasAccess;
    openTeamCreateModalButton.title = hasAccess ? "" : "Само администратор/собственик може да добавя екипи.";
  }

  if (openMemberCreateModalButton) {
    openMemberCreateModalButton.disabled = !hasAccess;
    openMemberCreateModalButton.title = hasAccess ? "" : "Само администратор/собственик може да добавя хора.";
  }

  if (boardTeamFilter) {
    boardTeamFilter.disabled = !hasAccess;
    boardTeamFilter.title = hasAccess ? "" : "Само администратор/собственик може да определя филтъра.";
  }

  [createBoardButton, renameBoardButton, deleteBoardButton].forEach((button) => {
    if (!button) {
      return;
    }
    button.disabled = !hasAccess;
    button.title = hasAccess ? "" : "Само администратор/собственик може да управлява бордове.";
  });
};

const loadApiBase = () => {
  const storedBase = (localStorage.getItem("teamio-api-base") ?? "").trim();
  const currentOrigin = window.location.origin;

  if (!storedBase) {
    return currentOrigin;
  }

  try {
    const parsed = new URL(storedBase, currentOrigin);
    if (window.location.hostname !== "localhost" && ["localhost", "127.0.0.1"].includes(parsed.hostname)) {
      return currentOrigin;
    }
    return parsed.origin;
  } catch {
    return currentOrigin;
  }
};

const apiRequest = async (path, options = {}) => {
  const base = loadApiBase();
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

const syncInvitesFromApi = async () => {
  const user = loadCurrentUser();
  if (!user) {
    return;
  }

  const params = new URLSearchParams();
  if (user.accountId) {
    params.set("accountId", user.accountId);
  }
  if (user.email) {
    params.set("email", normalizeEmail(user.email));
  }

  if (!params.toString()) {
    return;
  }

  const apiResult = await apiRequest(`/api/invites?${params.toString()}`);
  if (apiResult?.ok && Array.isArray(apiResult.data?.invites)) {
    saveInvites(apiResult.data.invites);
  }
};

const apiHasUserInAnotherAccount = async (email, accountId) => {
  const apiResult = await apiRequest(`/api/users/by-email?email=${encodeURIComponent(normalizeEmail(email))}`);
  if (!apiResult?.ok) {
    return false;
  }
  const user = apiResult.data?.user;
  return Boolean(user?.accountId && user.accountId !== accountId);
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

const saveVerificationTokens = (tokens) => {
  localStorage.setItem("teamio-verification-tokens", JSON.stringify(tokens));
};

const loadVerificationTokens = () => JSON.parse(localStorage.getItem("teamio-verification-tokens") ?? "[]");

const getOrCreateVerificationToken = (user) => {
  if (!user?.id && !user?.email) {
    return null;
  }

  const now = Date.now();
  const verificationTokens = loadVerificationTokens();
  const activeToken = verificationTokens
    .filter(
      (item) =>
        !item.usedAt &&
        item.expiresAt > now &&
        (item.userId === user.id || normalizeEmail(item.email) === normalizeEmail(user.email))
    )
    .sort((a, b) => b.expiresAt - a.expiresAt)[0];

  if (activeToken) {
    return activeToken.token;
  }

  const token = generateToken();
  verificationTokens.push({
    token,
    userId: user.id,
    email: normalizeEmail(user.email),
    expiresAt: now + 24 * 60 * 60 * 1000,
    usedAt: null,
  });
  saveVerificationTokens(verificationTokens);
  return token;
};

const setAuthMessage = (message) => {
  authMessage.textContent = message;
};

const buildVerificationLink = (token) => {
  const url = new URL(window.location.href);
  url.searchParams.set("verify", token);
  return url.toString();
};

const setVerificationHelp = (token, email) => {
  if (!verificationHelp) {
    return;
  }
  if (!token) {
    verificationHelp.innerHTML = "";
    return;
  }
  const verifyLink = buildVerificationLink(token);
  const safeEmail = email ? `<strong>${email}</strong>` : "посочения имейл";
  verificationHelp.innerHTML = `Не получи имейл за потвърждение за ${safeEmail}? Използвай този линк: <a href="${verifyLink}">Потвърди имейла</a>`;
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

const showApp = async (user) => {
  const normalizedUser = ensureAccountForUser(user);
  authScreenEl.style.display = "none";
  appEl.classList.remove("app--hidden");
  updateProfile(normalizedUser);
  applyManagementAccessUi();
  renderBoardSelector();
  syncTeamSelectors();
  await syncInvitesFromApi();
  renderBoard(getVisibleTasks());
  renderTeams();
  renderInvites();
  renderMyInvites();
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
    await showApp(apiResult.data.user);
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

  if (user.isEmailVerified === false) {
    const activeToken = getOrCreateVerificationToken(user);
    setAuthMessage("Потвърди имейла си преди вход.");
    setVerificationHelp(activeToken, user.email);
    return;
  }

  if (user.password === normalizedPassword) {
    user.password = hashed;
    saveUsers(users);
  }

  setCurrentUser(user);
  setAuthMessage("");
  await showApp(user);
};

const handleRegister = async (name, email, password, companyName) => {
  const normalizedName = normalizeText(name);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = normalizeText(password);
  const normalizedCompanyName = normalizeText(companyName);
  const inviteToken = getInviteTokenFromUrl();

  const matchingInvite = loadInvites()
    .filter((invite) => !invite.acceptedAt && !invite.revokedAt && invite.expiresAt > Date.now() && invite.token === inviteToken)
    .find((invite) => normalizeEmail(invite.email) === normalizedEmail);
  const hasInviteToken = Boolean(inviteToken);

  if (!normalizedName || !normalizedEmail || normalizedPassword.length < 6 || (!hasInviteToken && !matchingInvite && !normalizedCompanyName)) {
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
      inviteToken,
    }),
  });

  if (apiResult?.ok) {
    setAuthMessage("Регистрацията е успешна. Провери имейла си и потвърди акаунта преди вход.");
    setVerificationHelp();
    activateAuthForm("login");
    return;
  }

  const users = loadUsers();
  const accounts = loadAccounts();
  if (users.some((item) => normalizeEmail(item.email) === normalizedEmail)) {
    setAuthMessage(apiResult?.data?.message ?? "Този имейл вече е регистриран.");
    return;
  }

  const accountId = matchingInvite?.accountId ?? `account-${Date.now()}`;
  if (!matchingInvite) {
    const defaultTeams = [
      { id: `team-${Date.now()}-1`, name: "Продуктов екип" },
      { id: `team-${Date.now()}-2`, name: "Инженерен екип" },
    ];
    accounts.push({ id: accountId, name: normalizedCompanyName, ownerUserId: `user-${Date.now()}`, teams: defaultTeams, members: [] });
    saveAccounts(accounts);
  }

  const newUserId = `user-${Date.now()}`;
  const hashed = await hashPassword(normalizedPassword);
  const newUser = {
    id: newUserId,
    name: normalizedName,
    email: normalizedEmail,
    password: hashed,
    role: matchingInvite?.role ?? "Собственик",
    accountId,
    isEmailVerified: false,
    teamIds: [],
  };

  const updatedAccounts = loadAccounts().map((account) => {
    if (account.id !== accountId) {
      return account;
    }

    const nextAccount = {
      ...account,
      members: [
        ...(account.members ?? []).filter((member) => normalizeEmail(member.email ?? "") !== normalizedEmail),
        {
          id: newUserId,
          userId: newUserId,
          name: normalizedName,
          email: normalizedEmail,
          role: matchingInvite?.role ?? "Member",
          teamIds: [],
        },
      ],
    };

    if (!matchingInvite) {
      nextAccount.ownerUserId = newUserId;
    }

    return nextAccount;
  });
  saveAccounts(updatedAccounts);

  if (matchingInvite) {
    saveInvites(
      loadInvites().map((invite) =>
        invite.id === matchingInvite.id ? { ...invite, acceptedAt: Date.now(), acceptedUserId: newUserId } : invite
      )
    );
  }

  const updated = [...users, newUser];
  saveUsers(updated);
  const verificationToken = generateToken();
  const verificationTokens = loadVerificationTokens();
  verificationTokens.push({ token: verificationToken, userId: newUserId, email: normalizedEmail, expiresAt: Date.now() + 24 * 60 * 60 * 1000, usedAt: null });
  saveVerificationTokens(verificationTokens);
  setAuthMessage("Регистрацията е успешна. Потвърди имейла си, за да влезеш.");
  activateAuthForm("login");
  setVerificationHelp(verificationToken, normalizedEmail);
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

const clearSensitiveQueryParams = () => {
  const url = new URL(window.location.href);
  const sensitiveParams = ["email", "password", "verify", "reset", "invite"];
  const hadSensitive = sensitiveParams.some((param) => url.searchParams.has(param));

  if (!hadSensitive) {
    return;
  }

  sensitiveParams.forEach((param) => url.searchParams.delete(param));
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
};

const openVerifyFromUrl = async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("verify");
  if (!token) {
    return;
  }

  const apiResult = await apiRequest("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

  if (apiResult?.ok) {
    setAuthMessage("Имейлът е потвърден. Влез в профила си.");
    setVerificationHelp();
    return;
  }

  const verificationTokens = loadVerificationTokens();
  const tokenRecord = verificationTokens.find((item) => item.token === token);

  if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt < Date.now()) {
    setAuthMessage(apiResult?.data?.message ?? "Линкът за потвърждение е невалиден или изтекъл.");
    return;
  }

  const users = loadUsers();
  const updatedUsers = users.map((user) =>
    user.id === tokenRecord.userId || normalizeEmail(user.email) === normalizeEmail(tokenRecord.email)
      ? { ...user, isEmailVerified: true }
      : user
  );
  saveUsers(updatedUsers);
  const updatedTokens = verificationTokens.map((item) =>
    item.token === token ? { ...item, usedAt: Date.now() } : item
  );
  saveVerificationTokens(updatedTokens);
  setAuthMessage("Имейлът е потвърден. Влез в профила си.");
  setVerificationHelp();
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

const loadAllTasks = () => JSON.parse(localStorage.getItem("teamio-tasks") ?? "[]");

const getNormalizedColumnId = (columnId, boardColumns) => {
  if (!columnId || boardColumns.length === 0) {
    return columnId;
  }

  if (boardColumns.some((column) => column.id === columnId)) {
    return columnId;
  }

  const byPrefix = boardColumns.find((column) => column.id.startsWith(`${columnId}-`));
  if (byPrefix) {
    return byPrefix.id;
  }

  const legacyTitleMap = {
    backlog: "Backlog",
    progress: "В процес",
    review: "Преглед",
    done: "Готово",
  };

  const byTitle = boardColumns.find(
    (column) => column.title.toLowerCase() === (legacyTitleMap[columnId] ?? columnId).toLowerCase()
  );

  return byTitle?.id ?? boardColumns[0]?.id ?? columnId;
};

const loadTasks = () => {
  const stored = localStorage.getItem("teamio-tasks");
  const currentBoardId = getCurrentBoardId();
  const allColumns = loadAllColumns();

  if (!stored) {
    const boardColumns = loadColumns();
    const seeded = defaultTasks.map((task) => ({
      ...task,
      boardId: currentBoardId,
      column: getNormalizedColumnId(task.column, boardColumns),
    }));
    localStorage.setItem("teamio-tasks", JSON.stringify(seeded));
    return seeded;
  }

  let hasChanges = false;
  const parsed = JSON.parse(stored).map((task) => {
    const taskBoardId = task.boardId ?? currentBoardId;
    const boardColumns = allColumns.filter((column) => (column.boardId ?? currentBoardId) === taskBoardId);
    const normalizedColumn = getNormalizedColumnId(task.column, boardColumns);
    if (normalizedColumn !== task.column || !task.boardId || !task.level) {
      hasChanges = true;
    }
    return {
      ...task,
      column: normalizedColumn,
      boardId: taskBoardId,
      level: task.level ?? "L2",
      completed: Boolean(task.completed),
    };
  });

  if (hasChanges) {
    localStorage.setItem("teamio-tasks", JSON.stringify(parsed));
  }

  return parsed;
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

const openTaskDetails = (taskId) => {
  const tasks = loadTasks();
  const task = tasks.find((entry) => entry.id === taskId);
  if (!task || !taskDetailsForm) {
    return;
  }

  taskDetailsForm.querySelector('input[name="taskId"]').value = task.id;
  taskDetailsForm.querySelector('input[name="title"]').value = task.title;
  taskDetailsForm.querySelector('textarea[name="description"]').value = task.description ?? "";
  taskDetailsForm.querySelector('input[name="due"]').value = task.due ?? "";
  taskDetailsForm.querySelector('select[name="level"]').value = task.level ?? "L2";
  taskDetailsForm.querySelector('input[name="completed"]').checked = Boolean(task.completed);
  openModal(taskDetailsModal);
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
  desc.className = "card__desc card__desc--clamp";
  desc.textContent = task.description || "Без описание";

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

  card.addEventListener("click", () => {
    openTaskDetails(task.id);
  });

  return card;
};

const renderBoard = (tasks) => {
  boardEl.innerHTML = "";
  updateBoardTopbar();
  const filteredTasks = getFilteredTasksBySearch(tasks);
  const columns = loadColumns();
  const activeCount = filteredTasks.filter((task) => task.column !== "done").length;
  const dueCount = filteredTasks.filter((task) => task.due).length;
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
    const columnTasks = filteredTasks
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
      renderBoard(getVisibleTasks());
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
      renderCalendar();
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

const loadInvites = () => JSON.parse(localStorage.getItem("teamio-invites") ?? "[]");

const saveInvites = (invites) => {
  localStorage.setItem("teamio-invites", JSON.stringify(invites));
};

const getInviteStatusLabel = (invite) => {
  if (invite.acceptedAt) {
    return "Приета";
  }
  if (invite.declinedAt) {
    return "Отказана";
  }
  if (invite.revokedAt) {
    return "Отменена";
  }
  if (invite.expiresAt < Date.now()) {
    return "Изтекла";
  }
  return "Активна";
};

const renderInvites = () => {
  if (!inviteList) {
    return;
  }
  const currentAccount = getCurrentAccount();
  const invites = loadInvites().filter((invite) => invite.accountId && invite.accountId === currentAccount?.id);
  inviteList.innerHTML = "";

  if (invites.length === 0) {
    const empty = document.createElement("div");
    empty.className = "panel-list__item";
    empty.innerHTML = '<div><strong>Няма активни покани</strong><div class="panel-list__meta">Изпрати първата покана за този борд.</div></div>';
    inviteList.append(empty);
    return;
  }

  invites.forEach((invite) => {
    const status = getInviteStatusLabel(invite);
    const item = document.createElement("div");
    item.className = "panel-list__item";
    item.innerHTML = `<div><strong>${invite.email}</strong><div class="panel-list__meta">Роля: ${invite.role} · ${status}</div></div>`;
    inviteList.append(item);
  });
};

const renderMyInvites = () => {
  if (!myInviteList) {
    return;
  }

  const currentUser = loadCurrentUser();
  if (!currentUser?.email) {
    myInviteList.innerHTML = "";
    return;
  }

  const invites = loadInvites().filter((invite) => normalizeEmail(invite.email) === normalizeEmail(currentUser.email));
  myInviteList.innerHTML = "";

  if (invites.length === 0) {
    const empty = document.createElement("div");
    empty.className = "panel-list__item";
    empty.innerHTML = '<div><strong>Нямаш покани</strong><div class="panel-list__meta">Когато те поканят, ще се покажат тук.</div></div>';
    myInviteList.append(empty);
    return;
  }

  const accounts = loadAccounts();

  invites.forEach((invite) => {
    const accountName = accounts.find((account) => account.id === invite.accountId)?.name ?? "Неизвестна фирма";
    const item = document.createElement("div");
    item.className = "panel-list__item panel-list__item--stack";

    const status = getInviteStatusLabel(invite);
    item.innerHTML = `<div><strong>${accountName}</strong><div class="panel-list__meta">${invite.email} · Роля: ${invite.role} · ${status}</div></div>`;

    const canRespond = !invite.acceptedAt && !invite.declinedAt && !invite.revokedAt && invite.expiresAt > Date.now();
    if (canRespond) {
      const actions = document.createElement("div");
      actions.className = "invite-actions";

      const acceptButton = document.createElement("button");
      acceptButton.type = "button";
      acceptButton.className = "primary";
      acceptButton.textContent = "Приеми";
      acceptButton.addEventListener("click", async () => {
        const apiResult = await apiRequest("/api/invites/respond", {
          method: "POST",
          body: JSON.stringify({ inviteId: invite.id, action: "accept", userId: currentUser.id, email: currentUser.email }),
        });

        if (apiResult?.ok) {
          await syncInvitesFromApi();
        } else {
          const updatedInvites = loadInvites().map((entry) =>
            entry.id === invite.id
              ? { ...entry, acceptedAt: Date.now(), acceptedUserId: currentUser.id, declinedAt: null }
              : entry
          );
          saveInvites(updatedInvites);
        }

        const users = loadUsers();
        const updatedUsers = users.map((user) => {
          if (normalizeEmail(user.email) !== normalizeEmail(currentUser.email)) {
            return user;
          }
          const teamIds = Array.isArray(user.teamIds) ? user.teamIds : [];
          return { ...user, accountId: invite.accountId, role: invite.role, teamIds };
        });
        saveUsers(updatedUsers);

        const nextCurrentUser = { ...currentUser, accountId: invite.accountId, role: invite.role, teamIds: currentUser.teamIds ?? [] };
        setCurrentUser(nextCurrentUser);

        renderInvites();
        renderMyInvites();
        renderTeams();
        syncTeamSelectors();
        renderBoard(getVisibleTasks());
        updateReports();
        setAuthMessage(`Прие поканата за ${accountName}.`);
      });

      const declineButton = document.createElement("button");
      declineButton.type = "button";
      declineButton.className = "ghost";
      declineButton.textContent = "Откажи";
      declineButton.addEventListener("click", async () => {
        const apiResult = await apiRequest("/api/invites/respond", {
          method: "POST",
          body: JSON.stringify({ inviteId: invite.id, action: "decline", userId: currentUser.id, email: currentUser.email }),
        });

        if (apiResult?.ok) {
          await syncInvitesFromApi();
        } else {
          const updatedInvites = loadInvites().map((entry) =>
            entry.id === invite.id
              ? { ...entry, declinedAt: Date.now(), declinedUserId: currentUser.id }
              : entry
          );
          saveInvites(updatedInvites);
        }
        renderInvites();
        renderMyInvites();
      });

      actions.append(acceptButton, declineButton);
      item.append(actions);
    }

    myInviteList.append(item);
  });
};

const openGroupMembers = (groupId) => {
  const members = loadTeams().filter((member) => (member.group ?? "product") === groupId);
  groupMembersTitle.textContent = `${groupLabels[groupId] ?? "Екип"} – хора`;
  groupMembersList.innerHTML = "";

  if (members.length === 0) {
    const empty = document.createElement("div");
    empty.className = "panel-list__meta";
    empty.textContent = "Няма добавени хора в тази група.";
    groupMembersList.append(empty);
  } else {
    members.forEach((member) => {
      const item = document.createElement("div");
      item.className = "panel-list__item";
      item.innerHTML = `<div><strong>${member.name}</strong><div class="panel-list__meta">${member.role}</div></div>`;
      groupMembersList.append(item);
    });
  }

  openModal(groupMembersModal);
};

const renderTeams = () => {
  const canManage = hasManagementAccess();
  const account = getCurrentAccount();
  const registeredUsers = loadUsers()
    .filter((user) => user.accountId === account?.id)
    .map((user) => ({
      id: user.id,
      name: user.name,
      role: user.role ?? "Member",
      teamIds: user.teamIds ?? [],
      userId: user.id,
      isOwner: account?.ownerUserId === user.id,
    }));
  const manualMembers = (account?.members ?? []).map((member) => ({ ...member, userId: member.userId ?? null, isOwner: false }));
  const members = [...registeredUsers];
  manualMembers.forEach((member) => {
    if (!members.some((entry) => (entry.userId ?? entry.id) === (member.userId ?? member.id))) {
      members.push(member);
    }
  });
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
    item.draggable = true;
    item.dataset.memberId = member.id;

    const teamNames = (member.teamIds ?? [])
      .map((teamId) => teams.find((team) => team.id === teamId)?.name)
      .filter(Boolean)
      .join(", ");

    const info = document.createElement("div");
    info.innerHTML = `<strong>${member.name}</strong><div class="panel-list__meta">${member.role} • ${teamNames || "Без екип"}</div><div class="panel-list__meta">Влачи към екип за присвояване</div>`;

    item.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("application/x-teamio-member", member.id);
      event.dataTransfer.effectAllowed = "move";
      item.classList.add("panel-list__item--dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("panel-list__item--dragging");
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "panel-list__remove";
    remove.textContent = "Премахни";
    remove.disabled = !canManage || member.isOwner;
    remove.title = member.isOwner
      ? "Собственикът не може да бъде премахнат."
      : canManage
      ? ""
      : "Само администратор/собственик може да премахва хора.";
    remove.addEventListener("click", () => {
      if (!canManage || member.isOwner) {
        return;
      }

      const memberUserId = member.userId ?? member.id;
      const updatedUsers = loadUsers().map((user) =>
        user.id === memberUserId && user.accountId === account.id
          ? { ...user, accountId: null, teamIds: [] }
          : user
      );
      saveUsers(updatedUsers);

      const accounts = loadAccounts().map((entry) =>
        entry.id === account.id
          ? {
              ...entry,
              members: (entry.members ?? []).filter(
                (current) => current.id !== member.id && (current.userId ?? current.id) !== memberUserId
              ),
            }
          : entry
      );
      saveAccounts(accounts);

      const memberEmail = loadUsers().find((user) => user.id === memberUserId)?.email;
      if (memberEmail) {
        saveInvites(
          loadInvites().map((invite) =>
            invite.accountId === account.id && normalizeEmail(invite.email) === normalizeEmail(memberEmail)
              ? { ...invite, revokedAt: Date.now(), acceptedAt: invite.acceptedAt ?? Date.now() }
              : invite
          )
        );
      }

      renderTeams();
      renderInvites();
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
      teamCard.dataset.teamId = team.id;
      const count = members.filter((member) => (member.teamIds ?? []).includes(team.id)).length;
      teamCard.innerHTML = `<div><strong>${team.name}</strong><div class="panel-list__meta">${count} човека</div><div class="panel-list__meta">Пусни човек тук</div></div>`;

      teamCard.addEventListener("dragover", (event) => {
        if (!canManage) {
          return;
        }
        if (!event.dataTransfer.types.includes("application/x-teamio-member")) {
          return;
        }
        event.preventDefault();
        teamCard.classList.add("panel-list__item--drop-target");
      });

      teamCard.addEventListener("dragleave", () => {
        teamCard.classList.remove("panel-list__item--drop-target");
      });

      teamCard.addEventListener("drop", (event) => {
        if (!canManage) {
          return;
        }
        event.preventDefault();
        teamCard.classList.remove("panel-list__item--drop-target");
        const memberId = event.dataTransfer.getData("application/x-teamio-member");
        if (!memberId) {
          return;
        }

        const updatedAccounts = loadAccounts().map((entry) => {
          if (entry.id !== account.id) {
            return entry;
          }

          const updatedMembers = (entry.members ?? []).map((member) => {
            if (member.id !== memberId) {
              return member;
            }

            const existingTeamIds = member.teamIds ?? [];
            if (existingTeamIds.includes(team.id)) {
              return member;
            }

            return { ...member, teamIds: [...existingTeamIds, team.id] };
          });

          return { ...entry, members: updatedMembers };
        });

        const updatedUsersByTeam = loadUsers().map((user) => {
          if (user.id !== memberId || user.accountId !== account.id) {
            return user;
          }
          const existingTeamIds = user.teamIds ?? [];
          if (existingTeamIds.includes(team.id)) {
            return user;
          }
          return { ...user, teamIds: [...existingTeamIds, team.id] };
        });

        saveUsers(updatedUsersByTeam);
        saveAccounts(updatedAccounts);
        renderTeams();
        updateReports();
      });

      teamCatalog.append(teamCard);
    });
  }

  syncTeamSelectors();
  renderInvites();
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
  const desiredStart =
    preferences.weekStartDay === "sunday" ? 0 : preferences.weekStartDay === "saturday" ? 6 : 1;
  const offset = (day - desiredStart + 7) % 7;
  result.setDate(result.getDate() - offset);
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
    const monthStart = new Date(focus.getFullYear(), focus.getMonth(), 1);
    const gridStart = startOfWeek(monthStart);
    for (let i = 0; i < 42; i += 1) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      days.push(date);
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
    const dayNumber = date.getDay();
    if (preferences.highlightWeekend && (dayNumber === 0 || dayNumber === 6)) {
      dayEl.classList.add("calendar-day--weekend");
    }

    const label = document.createElement("span");
    label.className = "calendar-day__label";
    label.textContent = date.toLocaleDateString("bg-BG", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });

    if (calendarState.view === "month" && date.getMonth() !== focus.getMonth()) {
      dayEl.classList.add("calendar-day--muted");
    }

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
  const items = getCalendarItems();
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

      if (event.source === "task") {
        info.innerHTML = `<strong>${event.title}</strong><div class="panel-list__meta">${dateLabel} · срок по задача</div>`;
        item.append(info);
      } else {
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "panel-list__remove";
        remove.textContent = "Премахни";
        remove.addEventListener("click", () => {
          const manualEvents = loadCalendar();
          saveCalendar(manualEvents.filter((entry) => entry.id !== event.id));
          renderCalendar();
        });

        item.append(info, remove);
      }
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
  setVerificationHelp();
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
  if (!hasManagementAccess()) {
    return;
  }
  teamCreateForm?.reset();
  openModal(teamCreateModal);
});

openMemberCreateModalButton?.addEventListener("click", () => {
  if (!hasManagementAccess()) {
    return;
  }
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
  if (!hasManagementAccess()) {
    return;
  }
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
  if (!hasManagementAccess()) {
    return;
  }
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

if (weekStartDaySelect) {
  weekStartDaySelect.value = preferences.weekStartDay;
}
if (highlightWeekendCheckbox) {
  highlightWeekendCheckbox.checked = preferences.highlightWeekend;
}
if (doneByColumnCheckbox) {
  doneByColumnCheckbox.checked = preferences.doneByColumn;
}
if (doneByFlagCheckbox) {
  doneByFlagCheckbox.checked = preferences.doneByFlag;
}
if (showBoardFilterCheckbox) {
  showBoardFilterCheckbox.checked = preferences.showBoardFilter;
}
applyBoardFilterVisibility();

weekStartDaySelect?.addEventListener("change", () => {
  preferences.weekStartDay = weekStartDaySelect.value;
  savePreferences(preferences);
  renderCalendar();
});

highlightWeekendCheckbox?.addEventListener("change", () => {
  preferences.highlightWeekend = highlightWeekendCheckbox.checked;
  savePreferences(preferences);
  renderCalendar();
});

doneByColumnCheckbox?.addEventListener("change", () => {
  preferences.doneByColumn = doneByColumnCheckbox.checked;
  savePreferences(preferences);
  updateReports();
});

doneByFlagCheckbox?.addEventListener("change", () => {
  preferences.doneByFlag = doneByFlagCheckbox.checked;
  savePreferences(preferences);
  updateReports();
});

showBoardFilterCheckbox?.addEventListener("change", () => {
  preferences.showBoardFilter = showBoardFilterCheckbox.checked;
  savePreferences(preferences);
  applyBoardFilterVisibility();
});

groupTiles.forEach((tile) => {
  tile.addEventListener("click", () => {
    openGroupMembers(tile.dataset.group);
  });
});

closeGroupMembersButton?.addEventListener("click", () => {
  closeModal(groupMembersModal);
});

closeTaskDetailsButton?.addEventListener("click", () => {
  closeModal(taskDetailsModal);
});

taskDetailsForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(taskDetailsForm);
  const taskId = formData.get("taskId")?.toString();
  const tasks = loadTasks();
  const updatedTasks = tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          title: formData.get("title")?.toString().trim() ?? task.title,
          description: formData.get("description")?.toString() ?? "",
          due: formData.get("due")?.toString() ?? "",
          level: formData.get("level")?.toString() ?? "L2",
          completed: formData.get("completed") === "on",
        }
      : task
  );
  saveTasks(updatedTasks);
  renderBoard(updatedTasks);
  updateReports();
  renderCalendar();
  closeModal(taskDetailsModal);
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
    toggleBoardMenu(false);
  });
});

settingsButton?.addEventListener("click", () => {
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

boardSelector?.addEventListener("change", () => {
  setCurrentBoardId(boardSelector.value);
  renderBoardSelector();
  renderBoard(getVisibleTasks());
  renderInvites();
});

boardSearchInput?.addEventListener("input", () => {
  boardSearchQuery = boardSearchInput.value;
  renderBoard(getVisibleTasks());
});

boardFilterButton?.addEventListener("click", () => {
  activateTab("settings");
  document.getElementById("board-team-filter")?.focus();
});

boardMenuButton?.addEventListener("click", () => {
  toggleBoardMenu(true);
});

closeBoardMenuButton?.addEventListener("click", () => {
  toggleBoardMenu(false);
});

boardMenuOverlay?.addEventListener("click", () => {
  toggleBoardMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    toggleBoardMenu(false);
  }
});

menuOpenSettingsButton?.addEventListener("click", () => {
  activateTab("settings");
  toggleBoardMenu(false);
});

menuAddColumnButton?.addEventListener("click", () => {
  newColumnButton?.click();
  toggleBoardMenu(false);
});

menuNewTaskButton?.addEventListener("click", () => {
  openTaskModal();
  toggleBoardMenu(false);
});

menuRenameBoardButton?.addEventListener("click", () => {
  renameCurrentBoard();
  toggleBoardMenu(false);
});

menuDeleteBoardButton?.addEventListener("click", () => {
  deleteCurrentBoard();
  toggleBoardMenu(false);
});

createBoardButton?.addEventListener("click", () => {
  if (!hasManagementAccess()) {
    return;
  }
  const name = window.prompt("Име на новия борд:", "Нов борд");
  if (!name?.trim()) {
    return;
  }
  const boards = loadBoards();
  const boardId = `board-${Date.now()}`;
  boards.push({ id: boardId, name: name.trim(), createdAt: Date.now() });
  saveBoards(boards);
  setCurrentBoardId(boardId);
  const allColumns = loadAllColumns();
  saveAllColumns([...allColumns, ...createDefaultColumnsForBoard(boardId)]);
  renderBoardSelector();
  renderBoard(getVisibleTasks());
  renderInvites();
});

const renameCurrentBoard = () => {
  if (!hasManagementAccess()) {
    return;
  }
  const currentBoardId = getCurrentBoardId();
  const boards = loadBoards();
  const currentBoard = boards.find((board) => board.id === currentBoardId);
  if (!currentBoard) {
    return;
  }
  const nextName = window.prompt("Ново име на борда:", currentBoard.name);
  if (!nextName?.trim()) {
    return;
  }
  saveBoards(boards.map((board) => (board.id === currentBoardId ? { ...board, name: nextName.trim() } : board)));
  renderBoardSelector();
};

const deleteCurrentBoard = () => {
  if (!hasManagementAccess()) {
    return;
  }
  const boards = loadBoards();
  if (boards.length <= 1) {
    setAuthMessage("Трябва да остане поне един борд.");
    return;
  }
  const currentBoardId = getCurrentBoardId();
  const currentBoard = boards.find((board) => board.id === currentBoardId);
  if (!currentBoard) {
    return;
  }
  const confirmed = window.confirm(`Изтриване на борд „${currentBoard.name}“?`);
  if (!confirmed) {
    return;
  }
  const nextBoards = boards.filter((board) => board.id !== currentBoardId);
  saveBoards(nextBoards);
  const nextBoardId = nextBoards[0].id;
  setCurrentBoardId(nextBoardId);
  saveAllColumns(loadAllColumns().filter((column) => column.boardId !== currentBoardId));
  saveTasks(loadAllTasks().filter((task) => task.boardId !== currentBoardId));
  saveInvites(loadInvites().filter((invite) => invite.boardId ? invite.boardId !== currentBoardId : true));
  renderBoardSelector();
  renderBoard(getVisibleTasks());
  renderInvites();
};

renameBoardButton?.addEventListener("click", renameCurrentBoard);

deleteBoardButton?.addEventListener("click", deleteCurrentBoard);

inviteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!hasManagementAccess()) {
    return;
  }
  const formData = new FormData(inviteForm);
  const email = normalizeEmail(formData.get("email")?.toString() ?? "");
  const role = normalizeText(formData.get("role")?.toString() ?? "Member");
  const account = getCurrentAccount();
  if (!account || !email) {
    return;
  }

  const hasUserInAnotherCompanyApi = await apiHasUserInAnotherAccount(email, account.id);
  const hasUserInAnotherCompanyLocal = loadUsers().some(
    (user) => normalizeEmail(user.email) === email && user.accountId && user.accountId !== account.id
  );
  const hasUserInAnotherCompany = hasUserInAnotherCompanyApi || hasUserInAnotherCompanyLocal;
  if (hasUserInAnotherCompany) {
    setAuthMessage("Този имейл вече принадлежи на друг акаунт и не може да бъде поканен.");
    return;
  }

  const localToken = generateToken();
  let invite = {
    id: `invite-${Date.now()}`,
    accountId: account.id,
    invitedByUserId: loadCurrentUser()?.id ?? null,
    email,
    role,
    token: localToken,
    expiresAt: Date.now() + 48 * 60 * 60 * 1000,
    acceptedAt: null,
    declinedAt: null,
    revokedAt: null,
  };

  const apiResult = await apiRequest("/api/invites", {
    method: "POST",
    body: JSON.stringify({
      accountId: account.id,
      invitedByUserId: loadCurrentUser()?.id ?? null,
      email,
      role,
    }),
  });

  if (apiResult?.ok && apiResult.data?.invite) {
    invite = apiResult.data.invite;
    await syncInvitesFromApi();
  } else {
    const invites = loadInvites();
    invites.unshift(invite);
    saveInvites(invites);
  }

  inviteForm.reset();

  const inviteLink = `${window.location.origin}${window.location.pathname}?invite=${invite.token}`;
  if (inviteShareBox && inviteShareLink) {
    inviteShareBox.hidden = false;
    inviteShareLink.href = inviteLink;
    inviteShareLink.textContent = inviteLink;
  }

  setAuthMessage("Поканата е създадена успешно.");
  renderInvites();
  renderMyInvites();
});

inviteCopyLinkButton?.addEventListener("click", async () => {
  const link = inviteShareLink?.href;
  if (!link) {
    return;
  }

  try {
    await navigator.clipboard.writeText(link);
    setAuthMessage("Линкът за поканата е копиран.");
  } catch (error) {
    setAuthMessage("Неуспешно копиране. Копирай линка ръчно.");
  }
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

taskDetailsModal?.addEventListener("click", (event) => {
  if (event.target === taskDetailsModal) {
    closeModal(taskDetailsModal);
  }
});

groupMembersModal?.addEventListener("click", (event) => {
  if (event.target === groupMembersModal) {
    closeModal(groupMembersModal);
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
    boardId: getCurrentBoardId(),
  };
  const updated = [newTask, ...tasks];
  saveTasks(updated);
  renderBoard(getVisibleTasks());
  renderCalendar();
  closeTaskModal();
});

boardTeamFilter?.addEventListener("change", () => {
  if (!hasManagementAccess()) {
    return;
  }
  renderBoard(getVisibleTasks());
});

const initialTasks = getVisibleTasks();
renderBoardSelector();
loadTheme();
loadDensity();
renderBoard(initialTasks);
renderTeams();
renderInvites();
renderMyInvites();
renderCalendar();
updateReports();

const activeUser = loadCurrentUser();
if (activeUser) {
  showApp(activeUser);
} else {
  showAuth();
}

openVerifyFromUrl().finally(() => {
  openResetFromUrl();
  clearSensitiveQueryParams();
});
