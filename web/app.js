if (!window.__teamioAppInitialized) {
  window.__teamioAppInitialized = true;

const boardEl = document.getElementById("board");
const boardCanvasEl = document.querySelector(".board-canvas");
const appEl = document.getElementById("app");
const authScreenEl = document.getElementById("auth-screen");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMessage = document.getElementById("auth-message");
const verificationHelp = document.getElementById("verification-help");
const authToggleButtons = document.querySelectorAll(".auth-toggle__button");
const profileName = document.getElementById("profile-name");
const profileAvatar = document.getElementById("profile-avatar");
const profilePublicId = document.getElementById("profile-public-id");
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
const boardSelectorHint = document.getElementById("board-selector-hint");
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
const inviteShareNativeButton = document.getElementById("invite-share-native");
const inviteShareWhatsappLink = document.getElementById("invite-share-whatsapp");
const inviteShareFacebookLink = document.getElementById("invite-share-facebook");
const inviteShareTelegramLink = document.getElementById("invite-share-telegram");
const acceptedMembersList = document.getElementById("accepted-members-list");
const noWorkspaceAccess = document.getElementById("no-workspace-access");
const createWorkspaceButton = document.getElementById("create-workspace-button");
const membersInvitesBadge = document.getElementById("members-invites-badge");
const pendingInvitesCount = document.getElementById("pending-invites-count");
const incomingInvitesCount = document.getElementById("incoming-invites-count");
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
const listLimitModal = document.getElementById("list-limit-modal");
const listLimitForm = document.getElementById("list-limit-form");
const closeListLimitModalButton = document.getElementById("close-list-limit-modal");
const removeListLimitButton = document.getElementById("remove-list-limit");
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
const taskDetailsAssigneeSelect = document.getElementById("task-details-assignee");
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
const companyProfileForm = document.getElementById("company-profile-form");
const profilePersonalModeCheckbox = document.getElementById("profile-personal-mode");
const userProfileSetting = document.getElementById("user-profile-setting");
const userProfileForm = document.getElementById("user-profile-form");
const settingsAccordion = document.getElementById("settings-accordion");
const workspaceCompanyName = document.getElementById("workspace-company-name");
const workspaceCompanyLogo = document.getElementById("workspace-company-logo");
const workspaceCompanyDot = document.getElementById("workspace-company-dot");
const workspaceCompanyChip = document.getElementById("workspace-company-chip");
const workspaceCompanyChipLogo = document.getElementById("workspace-company-chip-logo");
const workspaceCompanyChipName = document.getElementById("workspace-company-chip-name");

const currentBoardName = document.getElementById("current-board-name");
const boardContextVisibility = document.getElementById("board-context-visibility");
const acceptedMembersCount = document.getElementById("accepted-members-count");
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
const columnPickerToggleButton = document.getElementById("column-picker-toggle");
const columnPickerEl = document.getElementById("column-picker");
const columnPickerListEl = document.getElementById("column-picker-list");
const boardCompactToggleButton = document.getElementById("board-compact-toggle");

let boardSearchQuery = "";
let isBoardCanvasDragging = false;
let boardCanvasDragStartX = 0;
let boardCanvasDragStartScrollLeft = 0;
let visibleColumnIds = [];
let pinnedColumnIds = [];

const ACCOUNT_PLANS = ["Free", "Pro", "Team"];
const ACCOUNT_STATUSES = ["active", "suspended"];
const BOARD_VISIBILITIES = ["private", "workspace", "public"];
const WORKSPACE_ROLES = ["Owner", "Admin", "Manager", "Member", "Viewer"];
const CARD_PRIORITIES = ["low", "medium", "high", "urgent"];
const CARD_STATUSES = ["todo", "in_progress", "review", "done"];
const SYNC_STORAGE_KEYS = [
  "teamio-boards",
  "teamio-current-board",
  "teamio-columns",
  "teamio-tasks",
  "teamio-calendar",
  "teamio-preferences",
  "teamio-theme",
  "teamio-density",
  "teamio-calendar-view",
  "teamio-calendar-focus",
];


const defaultBoards = [{ id: "board-default", name: "Основен борд", createdAt: Date.now(), visibility: "workspace", createdBy: null, workspaceId: null, members: [], settings: { allowComments: true, allowAttachments: true, labelsEnabled: true } }];

const ensureDefaultBoard = (boards) => {
  const safeBoards = Array.isArray(boards) ? boards : [];
  const hasDefaultBoard = safeBoards.some((board) => board?.id === "board-default");
  const normalizedBoards = safeBoards
    .map((board) => {
      if (board?.id !== "board-default") {
        return board;
      }
      return normalizeBoard({ ...board, workspaceId: null });
    })
    .filter((board, index, list) => board?.id && list.findIndex((entry) => entry?.id === board.id) === index);
  if (hasDefaultBoard) {
    return normalizedBoards;
  }
  return [
    normalizeBoard({ ...defaultBoards[0], workspaceId: null }),
    ...normalizedBoards,
  ];
};

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

const normalizeRole = (role) => {
  const normalized = normalizeText(role).toLowerCase();
  if (!normalized) {
    return "Member";
  }
  if (["owner", "собственик"].includes(normalized)) return "Owner";
  if (normalized === "admin") return "Admin";
  if (normalized === "manager" || normalized === "мениджър") return "Manager";
  if (normalized === "viewer") return "Viewer";
  return "Member";
};

const createDefaultWorkspace = (ownerUserId = null) => ({
  id: `workspace-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  name: "Основно пространство",
  description: "Главно работно пространство",
  ownerUserId,
  memberRoles: ownerUserId ? [{ userId: ownerUserId, role: "Owner" }] : [],
});

const normalizeAccount = (account, fallbackOwnerId = null) => {
  const createdAt = account.createdAt ?? Date.now();
  const ownerUserId = account.ownerUserId ?? fallbackOwnerId ?? null;
  const rawWorkspaces = Array.isArray(account.workspaces) && account.workspaces.length > 0
    ? account.workspaces
    : [createDefaultWorkspace(ownerUserId)];

  const workspaces = rawWorkspaces.map((workspace) => ({
    id: workspace.id ?? `workspace-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: workspace.name ?? "Основно пространство",
    description: workspace.description ?? "",
    ownerUserId: workspace.ownerUserId ?? ownerUserId,
    memberRoles: Array.isArray(workspace.memberRoles)
      ? workspace.memberRoles.map((member) => ({ userId: member.userId, role: normalizeRole(member.role) }))
      : [],
  }));

  return {
    ...account,
    ownerUserId,
    createdAt,
    plan: ACCOUNT_PLANS.includes(account.plan) ? account.plan : "Free",
    status: ACCOUNT_STATUSES.includes(account.status) ? account.status : "active",
    workspaces,
    teams: Array.isArray(account.teams) ? account.teams : [],
    members: Array.isArray(account.members) ? account.members : [],
  };
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
  persistAndSync("teamio-preferences", JSON.stringify(preferences));
};

let preferences = loadPreferences();

const applyBoardFilterVisibility = () => {
  if (!boardFilterPanel) {
    return;
  }
  boardFilterPanel.classList.toggle("board-filter--hidden", !preferences.showBoardFilter);
};



const getCurrentWorkspace = () => {
  const account = getCurrentAccount();
  if (!account) {
    return null;
  }
  const currentUser = loadCurrentUser();
  const preferredWorkspaceId = normalizeText(currentUser?.workspaceId ?? "");
  if (preferredWorkspaceId) {
    const preferredWorkspace = (account.workspaces ?? []).find((workspace) => workspace.id === preferredWorkspaceId);
    if (preferredWorkspace) {
      return preferredWorkspace;
    }
  }
  return account.workspaces?.[0] ?? null;
};

const normalizeBoard = (board) => {
  const currentUser = loadCurrentUser();
  const workspace = getCurrentWorkspace();
  const members = Array.isArray(board.members) ? board.members : [];
  const workspaceId = board.workspaceId === undefined ? workspace?.id ?? null : board.workspaceId;
  return {
    ...board,
    visibility: BOARD_VISIBILITIES.includes(board.visibility) ? board.visibility : "workspace",
    createdBy: board.createdBy ?? currentUser?.id ?? null,
    workspaceId,
    members,
    settings: {
      allowComments: board.settings?.allowComments ?? true,
      allowAttachments: board.settings?.allowAttachments ?? true,
      labelsEnabled: board.settings?.labelsEnabled ?? true,
    },
  };
};

const loadBoards = () => {
  const stored = localStorage.getItem("teamio-boards");
  const workspace = getCurrentWorkspace();
  if (!stored) {
    const seeded = defaultBoards.map((board) => normalizeBoard({ ...board, workspaceId: null }));
    persistAndSync("teamio-boards", JSON.stringify(seeded));
    persistAndSync("teamio-current-board", seeded[0].id);
    return seeded;
  }
  const boards = JSON.parse(stored);
  if (!Array.isArray(boards) || boards.length === 0) {
    const seeded = defaultBoards.map((board) => normalizeBoard({ ...board, workspaceId: null }));
    persistAndSync("teamio-boards", JSON.stringify(seeded));
    persistAndSync("teamio-current-board", seeded[0].id);
    return seeded;
  }
  let normalized = ensureDefaultBoard(boards.map((board) => normalizeBoard(board)));
  if (workspace?.id && !normalized.some((board) => board.workspaceId === workspace.id)) {
    normalized = [
      ...normalized,
      normalizeBoard({
        id: `board-workspace-${workspace.id}`,
        name: `${workspace.name || "Workspace"} борд`,
        createdAt: Date.now(),
        visibility: "workspace",
        createdBy: workspace.ownerUserId ?? loadCurrentUser()?.id ?? null,
        workspaceId: workspace.id,
        members: [],
        settings: { allowComments: true, allowAttachments: true, labelsEnabled: true },
      }),
    ];
  }

  if (workspace?.id) {
    const user = loadCurrentUser();
    const rawTasks = JSON.parse(localStorage.getItem("teamio-tasks") ?? "[]");
    const knownBoardIds = new Set(normalized.map((board) => board.id));
    const missingWorkspaceBoardIds = Array.from(
      new Set(
        rawTasks
          .filter((task) => (!user?.accountId || task.accountId === user.accountId) && task.boardId && task.boardId !== "board-default")
          .map((task) => task.boardId)
          .filter((boardId) => !knownBoardIds.has(boardId))
      )
    );
    if (missingWorkspaceBoardIds.length > 0) {
      const generated = missingWorkspaceBoardIds.map((boardId, index) =>
        normalizeBoard({
          id: boardId,
          name: `Фирмен борд ${index + 1}`,
          createdAt: Date.now(),
          visibility: "workspace",
          createdBy: workspace.ownerUserId ?? user?.id ?? null,
          workspaceId: workspace.id,
          members: [],
          settings: { allowComments: true, allowAttachments: true, labelsEnabled: true },
        })
      );
      normalized = [...normalized, ...generated];
    }
  }
  persistAndSync("teamio-boards", JSON.stringify(normalized));
  if (!workspace?.id) {
    return normalized;
  }
  const workspaceBoards = normalized.filter((board) => !board.workspaceId || board.workspaceId === workspace.id);
  return workspaceBoards.length > 0 ? workspaceBoards : normalized;
};

const saveBoards = (boards) => {
  const workspace = getCurrentWorkspace();
  const existing = JSON.parse(localStorage.getItem("teamio-boards") ?? "[]");
  const safeBoards = ensureDefaultBoard(boards.map((board) => normalizeBoard(board)));
  if (!workspace?.id || !Array.isArray(existing)) {
    persistAndSync("teamio-boards", JSON.stringify(safeBoards));
    return;
  }
  const safeBoardIds = new Set(safeBoards.map((board) => board.id));
  const preserved = existing.filter((board) => board.workspaceId && board.workspaceId !== workspace.id && !safeBoardIds.has(board.id));
  persistAndSync("teamio-boards", JSON.stringify([...preserved, ...safeBoards]));
};

const getCurrentBoardId = () => {
  const boards = loadBoards();
  const current = localStorage.getItem("teamio-current-board") ?? boards[0]?.id;
  if (boards.some((board) => board.id === current)) {
    return current;
  }
  const fallback = boards[0]?.id ?? "board-default";
  persistAndSync("teamio-current-board", fallback);
  return fallback;
};

const setCurrentBoardId = (boardId) => {
  persistAndSync("teamio-current-board", boardId);
};

const renderBoardSelector = () => {
  if (!boardSelector) {
    return;
  }
  const boards = loadBoards();
  const currentBoardId = getCurrentBoardId();
  boardSelector.innerHTML = "";
  const workspace = getCurrentWorkspace();
  boards.forEach((board) => {
    const option = document.createElement("option");
    option.value = board.id;
    const isPersonalBoard = !board.workspaceId;
    const isCurrentWorkspaceBoard = Boolean(workspace?.id && board.workspaceId === workspace.id);
    const boardScopeLabel = isPersonalBoard ? "Личен" : (isCurrentWorkspaceBoard ? "Фирмен" : "Друг workspace");
    option.textContent = `[${boardScopeLabel}] ${board.name}`;
    option.selected = board.id === currentBoardId;
    boardSelector.append(option);
  });
  if (boardSelectorHint) {
    boardSelectorHint.hidden = true;
    boardSelectorHint.textContent = "";
  }
};

const ensurePreferredWorkspaceBoard = () => {
  const boards = loadBoards();
  const workspace = getCurrentWorkspace();
  const currentBoardId = getCurrentBoardId();
  const currentBoard = boards.find((board) => board.id === currentBoardId) ?? null;
  const workspaceBoard = boards.find((board) => board.workspaceId && workspace?.id && board.workspaceId === workspace.id) ?? null;
  if (workspaceBoard && (!currentBoard || !currentBoard.workspaceId)) {
    setCurrentBoardId(workspaceBoard.id);
  }
};

const updateBoardTopbar = () => {
  if (!currentBoardName) {
    return;
  }
  const currentBoard = loadBoards().find((board) => board.id === getCurrentBoardId());
  const currentUser = loadCurrentUser();
  const workspace = getCurrentWorkspace();
  currentBoardName.textContent = currentBoard?.name ?? "Работно табло";

  if (!boardContextVisibility) {
    return;
  }

  const isPersonalBoard = !currentBoard?.workspaceId || currentBoard.workspaceId === "board-default";
  const isSharedWorkspace = Boolean(workspace?.id && workspace.ownerUserId && currentUser?.id && workspace.ownerUserId !== currentUser.id);
  if (isPersonalBoard) {
    boardContextVisibility.textContent = "Личен борд";
    return;
  }
  if (isSharedWorkspace) {
    boardContextVisibility.textContent = "Споделен workspace борд";
    return;
  }
  boardContextVisibility.textContent = "Workspace борд";
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
  persistAndSync("teamio-columns", JSON.stringify(columns));
};

const createDefaultColumnsForBoard = (boardId) =>
  defaultColumns.map((column) => ({ ...column, id: `${column.id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, boardId, wipLimit: null }));

const normalizeColumn = (column, currentBoardId) => {
  const parsedLimit = Number.parseInt(column.wipLimit, 10);
  return {
    ...column,
    boardId: column.boardId ?? currentBoardId,
    wipLimit: Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : null,
  };
};

const loadColumns = () => {
  const currentBoardId = getCurrentBoardId();
  const allColumns = loadAllColumns();
  const boardColumns = allColumns.filter((column) => column.boardId === currentBoardId || !column.boardId);
  if (boardColumns.length > 0) {
    const normalized = boardColumns.map((column) => normalizeColumn(column, currentBoardId));
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
  saveAllColumns([...allColumns, ...columns.map((column) => normalizeColumn(column, currentBoardId))]);
};

const loadAccounts = () => {
  const parsed = JSON.parse(localStorage.getItem("teamio-accounts") ?? "[]");
  if (!Array.isArray(parsed)) {
    return [];
  }
  const normalized = parsed.map((account) => normalizeAccount(account));
  persistAndSync("teamio-accounts", JSON.stringify(normalized));
  return normalized;
};

const saveAccounts = (accounts) => {
  persistAndSync("teamio-accounts", JSON.stringify(accounts));
};

const upsertAccountFromServer = (accountPayload) => {
  if (!accountPayload?.id) {
    return;
  }
  const accounts = loadAccounts();
  const normalized = normalizeAccount(accountPayload, accountPayload.ownerUserId ?? null);
  const nextAccounts = [...accounts.filter((entry) => entry.id !== normalized.id), normalized];
  saveAccounts(nextAccounts);
};

const syncCurrentAccountFromApi = async (user) => {
  if (!user?.accountId || !user?.id) {
    return;
  }

  const params = new URLSearchParams({
    accountId: user.accountId,
    requesterUserId: user.id,
  });
  const apiResult = await apiRequest(`/api/accounts/context?${params.toString()}`);
  if (apiResult?.ok && apiResult.data?.account) {
    upsertAccountFromServer(apiResult.data.account);
  }
};

const syncBoardsFromApi = async () => {
  const apiResult = await apiRequest("/api/boards");
  if (!apiResult?.ok || !Array.isArray(apiResult.data?.boards)) {
    return;
  }
  const workspace = getCurrentWorkspace();
  const currentUser = loadCurrentUser();
  const remoteBoards = apiResult.data.boards.map((board) =>
    normalizeBoard({
      id: board.id,
      name: board.name,
      createdAt: board.createdAt,
      visibility: "workspace",
      workspaceId: workspace?.id ?? null,
      createdBy: currentUser?.id ?? null,
      members: [],
      settings: { allowComments: true, allowAttachments: true, labelsEnabled: true },
    })
  );
  const localBoards = loadBoards().filter((board) => !board.workspaceId);
  saveBoards([...localBoards, ...remoteBoards]);
};

const ensureWorkspaceMembersLoaded = async () => {
  if (Array.isArray(workspaceMembersCache) && workspaceMembersCache.length > 0) {
    return;
  }
  const user = loadCurrentUser();
  if (!user?.accountId || !user?.id) {
    return;
  }
  const params = new URLSearchParams({ accountId: user.accountId, requesterUserId: user.id });
  const apiResult = await apiRequest(`/api/workspaces/members-summary?${params.toString()}`);
  if (apiResult?.ok && Array.isArray(apiResult.data?.acceptedMembers)) {
    workspaceMembersCache = apiResult.data.acceptedMembers;
    workspaceMembersCountCache = Math.max(workspaceMembersCache.length, 1);
  }
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
  const preferredAccountId = user.accountId || null;
  const existingUser = { ...user, accountId: preferredAccountId };
  const existingAccount = preferredAccountId ? accounts.find((account) => account.id === preferredAccountId) : null;

  if (existingAccount) {
    if (user.accountId !== preferredAccountId) {
      const nextUser = { ...user, accountId: preferredAccountId };
      setCurrentUser(nextUser);
      return nextUser;
    }
    return user;
  }

  const accountId = preferredAccountId ?? `account-${Date.now()}`;
  const nextAccount = normalizeAccount({
    id: accountId,
    name: "Моята фирма",
    ownerUserId: existingUser.id,
    plan: "Free",
    status: "active",
    createdAt: Date.now(),
    teams: [
      { id: `team-${Date.now()}-1`, name: "Общ екип" },
      { id: `team-${Date.now()}-2`, name: "Оперативен екип" },
    ],
    members: [{ id: existingUser.id, userId: existingUser.id, name: existingUser.name, email: existingUser.email, role: "Owner", teamIds: [] }],
  }, existingUser.id);

  saveAccounts([...accounts, nextAccount]);

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
  const boards = loadBoards();
  const currentBoard = boards.find((board) => board.id === currentBoardId);
  const accountScopedTasks = allTasks.filter((task) => !user?.accountId || task.accountId === user.accountId);
  const boardScopedTasks = !currentBoard?.workspaceId
    ? accountScopedTasks.filter((task) => (task.assignedUserIds ?? []).includes(user?.id))
    : accountScopedTasks.filter((task) => (task.boardId ?? currentBoardId) === currentBoardId);
  const selectedTeamIds = getSelectedValues(boardTeamFilter);
  if (selectedTeamIds.length === 0) {
    return boardScopedTasks;
  }
  return boardScopedTasks.filter((task) => (task.teamIds ?? []).some((teamId) => selectedTeamIds.includes(teamId)));
};


const loadCalendar = () => JSON.parse(localStorage.getItem("teamio-calendar") ?? "[]");

const saveCalendar = (items) => {
  persistAndSync("teamio-calendar", JSON.stringify(items));
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
const loadUserProfilePreferences = () => JSON.parse(localStorage.getItem("teamio-user-profile-preferences") ?? "{}");
const saveUserProfilePreferences = (preferences) => {
  persistAndSync("teamio-user-profile-preferences", JSON.stringify(preferences));
};
const getCurrentUserProfilePreference = () => {
  const user = loadCurrentUser();
  if (!user?.id) return { personalMode: false, profile: {} };
  const all = loadUserProfilePreferences();
  return all[user.id] ?? { personalMode: false, profile: {} };
};
const saveCurrentUserProfilePreference = (nextValue) => {
  const user = loadCurrentUser();
  if (!user?.id) return;
  const all = loadUserProfilePreferences();
  all[user.id] = { ...(all[user.id] ?? {}), ...nextValue };
  saveUserProfilePreferences(all);
};

const getInviteTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return normalizeText(params.get("invite") ?? "");
};

const hasPermission = (scope, action) => {
  const currentUser = loadCurrentUser();
  const account = getCurrentAccount();
  if (!currentUser) {
    return false;
  }

  if (account?.ownerUserId && account.ownerUserId === currentUser.id) {
    return true;
  }

  const normalizedRole = normalizeRole(currentUser.role ?? "Member");
  const matrix = {
    Account: { billing: ["Owner"], delete: ["Owner"] },
    Workspace: { members: ["Owner", "Admin"], boards: ["Owner", "Admin"] },
    Board: { lists: ["Owner", "Admin"], cards: ["Owner", "Admin", "Member"] },
    Card: { edit: ["Owner", "Admin", "Manager"], assign: ["Owner", "Admin"], comment: ["Owner", "Admin", "Manager", "Member", "Viewer"] },
  };

  const allowedRoles = matrix[scope]?.[action] ?? [];
  return allowedRoles.includes(normalizedRole);
};

const hasManagementAccess = () => hasPermission("Workspace", "members") || hasPermission("Workspace", "boards");
const canManageDefaultBoard = () => {
  const role = normalizeRole(loadCurrentUser()?.role ?? "Member");
  return ["Owner", "Admin", "Manager"].includes(role);
};

const canCreateCards = () => hasPermission("Board", "cards");
const canManageBoardStructure = () => hasPermission("Board", "lists");
const canViewReports = () => {
  const role = normalizeRole(loadCurrentUser()?.role ?? "Member");
  return ["Owner", "Admin", "Manager"].includes(role);
};
const roleWeight = { Owner: 4, Admin: 3, Manager: 2, Member: 1, Viewer: 0 };
const canInviteRole = (targetRole) => {
  const currentRole = normalizeRole(loadCurrentUser()?.role ?? "Member");
  return (roleWeight[currentRole] ?? 0) > (roleWeight[normalizeRole(targetRole)] ?? 0);
};
const canEditTask = (task) => {
  const user = loadCurrentUser();
  if (!user || !task) {
    return false;
  }
  if (hasPermission("Card", "edit")) {
    return true;
  }
  return normalizeRole(user.role ?? "Member") === "Member" && task.createdBy === user.id;
};

const canAssignTask = () => {
  const role = normalizeRole(loadCurrentUser()?.role ?? "Member");
  return ["Owner", "Admin", "Manager"].includes(role);
};

const getAssignableMembers = () => {
  const account = getCurrentAccount();
  const accountMembers = (account?.members ?? []).filter((member) => Boolean(member?.id));
  const workspaceMembers = getWorkspaceMembers().map((member) => ({
    id: member.userId ?? member.id,
    userId: member.userId ?? member.id,
    name: member.name,
    email: member.email,
    role: member.role,
  }));
  const byId = new Map();
  [...accountMembers, ...workspaceMembers].forEach((member) => {
    const key = member.userId ?? member.id;
    if (key && !byId.has(key)) {
      byId.set(key, member);
    }
  });
  return Array.from(byId.values());
};

const renderTaskDetailsAssigneeOptions = (task) => {
  if (!taskDetailsAssigneeSelect) {
    return;
  }

  const members = getAssignableMembers();
  const currentAssignedId = Array.isArray(task?.assignedUserIds) ? (task.assignedUserIds[0] ?? "") : "";
  taskDetailsAssigneeSelect.innerHTML = "";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "Няма";
  taskDetailsAssigneeSelect.append(emptyOption);

  members.forEach((member) => {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = `${member.name} (${member.role})`;
    taskDetailsAssigneeSelect.append(option);
  });

  taskDetailsAssigneeSelect.value = currentAssignedId;
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

  if (createBoardButton) {
    createBoardButton.disabled = !hasAccess;
    createBoardButton.title = hasAccess ? "" : "Само администратор/собственик може да създава бордове.";
  }

  const currentBoardId = getCurrentBoardId();
  const canManageCurrentBoard = hasAccess || (currentBoardId === "board-default" && canManageDefaultBoard());
  [renameBoardButton, deleteBoardButton].forEach((button) => {
    if (!button) {
      return;
    }
    button.disabled = !canManageCurrentBoard;
    button.title = canManageCurrentBoard ? "" : "Само собственик, администратор или мениджър може да управлява основния борд.";
  });

  if (newColumnButton) {
    const canManage = canManageBoardStructure();
    newColumnButton.disabled = !canManage;
    newColumnButton.title = canManage ? "" : "Нямаш право да управляваш листове.";
  }

  if (newBoardButton) {
    const canCreate = canCreateCards();
    newBoardButton.disabled = !canCreate;
    newBoardButton.title = canCreate ? "" : "Нямаш право да създаваш карти.";
  }
};

const loadApiBase = () => {
  const storedBase = (localStorage.getItem("teamio-api-base") ?? "").trim();
  const currentOrigin = window.location.origin;
  const { protocol, hostname } = window.location;

  const buildApiOriginFromCurrentHost = (port = "") => {
    const normalizedPort = normalizeText(port);
    return `${protocol}//${hostname}${normalizedPort ? `:${normalizedPort}` : ""}`;
  };

  if (!storedBase) {
    if (["localhost", "127.0.0.1"].includes(hostname)) {
      return buildApiOriginFromCurrentHost("8787");
    }
    return currentOrigin;
  }

  try {
    const parsed = new URL(storedBase, currentOrigin);
    if (window.location.hostname !== "localhost" && ["localhost", "127.0.0.1"].includes(parsed.hostname)) {
      return currentOrigin;
    }
    return parsed.origin;
  } catch {
    if (["localhost", "127.0.0.1"].includes(hostname)) {
      return buildApiOriginFromCurrentHost("8787");
    }
    return currentOrigin;
  }
};

const apiRequest = async (path, options = {}) => {
  const base = loadApiBase();
  const sameOriginBase = window.location.origin;
  const fetchJson = async (apiBase) => {
    const token = loadAuthToken();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${apiBase}${path}`, {
      headers: { "Content-Type": "application/json", ...authHeaders, ...(options.headers ?? {}) },
      ...options,
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json().catch(() => ({}));
      return { response, data };
    }

    const text = await response.text().catch(() => "");
    return { response, data: { message: text.slice(0, 200) || "Непозната грешка от сървъра." } };
  };

  try {
    let { response, data } = await fetchJson(base);

    if (
      !response.ok &&
      response.status >= 500 &&
      base !== sameOriginBase &&
      !["localhost", "127.0.0.1"].includes(window.location.hostname)
    ) {
      ({ response, data } = await fetchJson(sameOriginBase));
    }

    if (!response.ok) {
      if (response.status === 502) {
        return {
          ok: false,
          data: {
            message:
              "Сървърът върна 502 Bad Gateway. Вероятно backend процесът е паднал или reverse proxy не може да се свърже към него.",
          },
        };
      }
      return { ok: false, data };
    }
    return { ok: true, data };
  } catch (error) {
    const isGithubPages = window.location.hostname.endsWith("github.io");
    const hint = isGithubPages
      ? ` Нужен е външен API сървър. Задай го така: localStorage.setItem("teamio-api-base", "https://your-api-domain.com") и презареди.`
      : ` Ако си на IP сървър, пробвай: localStorage.removeItem("teamio-api-base"); location.reload()`;
    return { ok: false, data: { message: `Сървърът не е достъпен (${base}).${hint}` } };
  }
};

const getSyncContext = () => {
  const user = loadCurrentUser();
  const workspace = getCurrentWorkspace();
  if (!user?.accountId || !user?.id || !workspace?.id) {
    return null;
  }
  return {
    accountId: user.accountId,
    requesterUserId: user.id,
    workspaceId: workspace.id,
  };
};

const buildWorkspaceSnapshot = () => {
  const snapshot = {};
  SYNC_STORAGE_KEYS.forEach((key) => {
    snapshot[key] = localStorage.getItem(key);
  });
  return snapshot;
};

const applyWorkspaceSnapshot = (snapshot) => {
  if (!snapshot || typeof snapshot !== "object") {
    return;
  }
  SYNC_STORAGE_KEYS.forEach((key) => {
    const value = snapshot[key];
    if (typeof value === "string") {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  });
};

let syncInProgress = false;
let syncTimer = null;
let syncDirty = false;
let invitesSyncInFlight = false;
let lastInvitesSyncKey = "";
let workspaceMembersCountCache = null;
let workspaceMembersCache = [];

const pushWorkspaceState = async () => {
  const context = getSyncContext();
  if (!context || syncInProgress || !syncDirty) {
    return;
  }

  syncInProgress = true;
  syncDirty = false;
  try {
    await apiRequest("/api/workspace-state", {
      method: "PUT",
      body: JSON.stringify({
        ...context,
        payload: buildWorkspaceSnapshot(),
      }),
    });
  } finally {
    syncInProgress = false;
    if (syncDirty) {
      void pushWorkspaceState();
    }
  }
};

const scheduleWorkspaceSync = () => {
  syncDirty = true;
  if (syncTimer) {
    clearTimeout(syncTimer);
  }
  syncTimer = setTimeout(() => {
    syncTimer = null;
    void pushWorkspaceState();
  }, 350);
};

let lastWorkspaceStateUpdatedAt = 0;
let workspacePollTimer = null;

const pullWorkspaceState = async ({ force = false } = {}) => {
  const context = getSyncContext();
  if (!context) {
    return false;
  }
  const params = new URLSearchParams(context);
  const apiResult = await apiRequest(`/api/workspace-state?${params.toString()}`);
  if (!apiResult?.ok || !apiResult.data?.state || typeof apiResult.data.state !== "object") {
    return false;
  }

  const remoteUpdatedAt = Number(apiResult.data.updatedAt ?? 0);
  if (!force && remoteUpdatedAt > 0 && remoteUpdatedAt <= lastWorkspaceStateUpdatedAt) {
    return false;
  }

  const beforeSnapshot = JSON.stringify(buildWorkspaceSnapshot());
  applyWorkspaceSnapshot(apiResult.data.state);
  const afterSnapshot = JSON.stringify(buildWorkspaceSnapshot());
  if (remoteUpdatedAt > 0) {
    lastWorkspaceStateUpdatedAt = remoteUpdatedAt;
  }
  return beforeSnapshot !== afterSnapshot;
};

const persistAndSync = (key, value) => {
  const currentValue = localStorage.getItem(key);
  if (typeof value === "string") {
    if (currentValue === value) {
      return;
    }
    localStorage.setItem(key, value);
  } else {
    if (currentValue === null) {
      return;
    }
    localStorage.removeItem(key);
  }
  scheduleWorkspaceSync();
};

const syncInvitesFromApi = async ({ force = false } = {}) => {
  const user = loadCurrentUser();
  if (!user) {
    return;
  }

  const syncContextKey = [
    user.id ?? "",
    normalizeEmail(user.email ?? ""),
    user.accountId ?? "",
    hasManagementAccess() ? "manage" : "member",
  ].join("|");

  if (invitesSyncInFlight) {
    return;
  }
  if (!force && syncContextKey === lastInvitesSyncKey) {
    return;
  }

  invitesSyncInFlight = true;

  const existingInvites = loadInvites();
  const existingIncomingInvites = existingInvites.filter((invite) => invite?.__scope === "incoming");
  const existingAccountInvites = existingInvites.filter((invite) => invite?.__scope === "account");

  let incomingInvites = existingIncomingInvites;
  let accountInvites = existingAccountInvites;

  const myInvitesParams = new URLSearchParams();
  if (user.id) {
    myInvitesParams.set("userId", user.id);
  }
  if (user.email) {
    myInvitesParams.set("email", normalizeEmail(user.email));
  }

  try {
    if (myInvitesParams.toString()) {
      const myInvitesResult = await apiRequest(`/api/me/invites`);
      if (myInvitesResult?.ok && Array.isArray(myInvitesResult.data?.invites)) {
        incomingInvites = myInvitesResult.data.invites
          .filter((invite) => invite?.id)
          .map((invite) => ({ ...invite, __scope: "incoming" }));
      }
    }

    if (user.accountId && hasManagementAccess()) {
      const accountParams = new URLSearchParams();
      accountParams.set("accountId", user.accountId);
      accountParams.set("requesterUserId", user.id);

      const accountResult = await apiRequest(`/api/invites?${accountParams.toString()}`);
      if (accountResult?.ok && Array.isArray(accountResult.data?.invites)) {
        accountInvites = accountResult.data.invites
          .filter((invite) => invite?.id)
          .map((invite) => ({ ...invite, __scope: "account" }));
      }
    } else {
      accountInvites = [];
    }

    const mergedInvites = new Map();
    [...accountInvites, ...incomingInvites].forEach((invite) => {
      if (invite?.id) {
        mergedInvites.set(invite.id, invite);
      }
    });

    saveInvites(Array.from(mergedInvites.values()));
    lastInvitesSyncKey = syncContextKey;
  } finally {
    invitesSyncInFlight = false;
  }
};

const refreshInviteUi = async ({ force = false } = {}) => {
  await syncInvitesFromApi({ force });
  renderMyInvites();
  renderMembersInvitesSummary();
};

const normalizeInviteFormFields = () => {
  if (!inviteForm) {
    return;
  }
  const duplicatedUserIdFields = inviteForm.querySelectorAll('input[name="invitedUserId"]');
  duplicatedUserIdFields.forEach((field, index) => {
    if (index === 0) {
      return;
    }
    const label = field.closest("label");
    if (label) {
      label.remove();
    } else {
      field.remove();
    }
  });
};

const stopInvitesPolling = () => {
  // no-op: polling е премахнат, за да не прави render/fetch loop
};

const startInvitesPolling = () => {
  // no-op: refresh става само при mount/login и при връщане към таба
};

const startWorkspacePolling = () => {
  stopWorkspacePolling();
  workspacePollTimer = setInterval(async () => {
    const changed = await pullWorkspaceState();
    if (!changed) {
      return;
    }
    syncTeamSelectors();
    renderBoardSelector();
    renderBoard(getVisibleTasks());
    renderCalendar();
    updateReports();
  }, 4000);
};

const stopWorkspacePolling = () => {
  if (workspacePollTimer) {
    clearInterval(workspacePollTimer);
    workspacePollTimer = null;
  }
};


const hashPassword = async (password) => {
  const subtleCrypto = globalThis.crypto?.subtle;
  if (!subtleCrypto) {
    return password;
  }

  const data = new TextEncoder().encode(password);
  const hashBuffer = await subtleCrypto.digest("SHA-256", data);
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

const setVerificationHelpWithLink = (verificationLink, email) => {
  if (!verificationHelp) {
    return;
  }
  if (!verificationLink) {
    verificationHelp.innerHTML = "";
    return;
  }
  const safeEmail = email ? `<strong>${email}</strong>` : "посочения имейл";
  verificationHelp.innerHTML = `Не получи имейл за потвърждение за ${safeEmail}? Използвай този линк: <a href="${verificationLink}">Потвърди имейла</a>`;
};

const setCurrentUser = (user) => {
  persistAndSync("teamio-current-user", JSON.stringify(user));
};

const loadCurrentUser = () => {
  const stored = localStorage.getItem("teamio-current-user");
  return stored ? JSON.parse(stored) : null;
};

const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("teamio-auth-token", token);
    return;
  }
  localStorage.removeItem("teamio-auth-token");
};

const loadAuthToken = () => localStorage.getItem("teamio-auth-token") ?? "";

const updateProfile = (user) => {
  if (!user) {
    profileName.textContent = "Гост";
    profileAvatar.textContent = "ТИ";
    if (profilePublicId) profilePublicId.textContent = "ID: -";
    return;
  }
  profileName.textContent = user.name;
  if (profilePublicId) profilePublicId.textContent = `ID: ${user.publicId || "-"}`;
  profileAvatar.textContent = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const showApp = async (user) => {
  await syncCurrentAccountFromApi(user);
  const normalizedUser = ensureAccountForUser(user);
  await syncBoardsFromApi();
  normalizeInviteFormFields();
  await pullWorkspaceState({ force: true });
  authScreenEl.style.display = "none";
  appEl.classList.remove("app--hidden");
  updateProfile(normalizedUser);
  applyManagementAccessUi();
  applyRoleBasedTabVisibility();
  ensurePreferredWorkspaceBoard();
  renderBoardSelector();
  syncTeamSelectors();
  await syncInvitesFromApi({ force: true });
  renderBoard(getVisibleTasks());
  renderTeams();
  renderInvites();
  renderMyInvites();
  renderMembersInvitesSummary();
  renderTeams();
  await syncCompanyProfileForm();
  updateReports();
  startInvitesPolling();
  startWorkspacePolling();
};

const showAuth = () => {
  stopInvitesPolling();
  stopWorkspacePolling();
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
    if (apiResult.data.account) {
      upsertAccountFromServer(apiResult.data.account);
    }
    setAuthToken(apiResult.data.token ?? "");
    setCurrentUser(apiResult.data.user);
    setAuthMessage("");
    setVerificationHelp();
    if (!apiResult.data.user?.tenantId || !apiResult.data.user?.role) {
      setAuthMessage("Нямаш достъп/нямаш workspace.");
    }
    await showApp(apiResult.data.user);
    return;
  }

  setAuthMessage(apiResult?.data?.message ?? "Невалидни данни. Провери имейла и паролата.");
};

const handleRegister = async (name, email, password) => {
  const normalizedName = normalizeText(name);
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = normalizeText(password);
  const inviteToken = getInviteTokenFromUrl();

  const matchingInvite = loadInvites()
    .filter((invite) => !invite.acceptedAt && !invite.revokedAt && invite.expiresAt > Date.now() && invite.token === inviteToken)
    .find((invite) => normalizeEmail(invite.email) === normalizedEmail);
  const hasInviteToken = Boolean(inviteToken);

  if (!normalizedName || !normalizedEmail || normalizedPassword.length < 6) {
    setAuthMessage("Попълни коректно всички полета.");
    return;
  }

  const apiResult = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: normalizedName,
      email: normalizedEmail,
      password: normalizedPassword,
      inviteToken,
    }),
  });

  if (apiResult?.ok) {
    activateAuthForm("login");
    setAuthMessage("Регистрацията е успешна. Можеш да влезеш веднага.");
    setVerificationHelp();
    return;
  }

  setAuthMessage(apiResult?.data?.message ?? "Регистрацията не беше успешна. Провери данните и опитай отново.");
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

  if (apiResult?.ok && apiResult.data?.resetLink) {
    window.location.href = apiResult.data.resetLink;
    return;
  }

  resetLinkEl.textContent = apiResult?.data?.message ?? "Ако имейлът съществува, изпратихме линк за смяна на парола.";
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

  setAuthMessage(apiResult?.data?.message ?? "Линкът за потвърждение е невалиден или изтекъл.");
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
  persistAndSync("teamio-theme", color);
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
  boardCompactToggleButton?.setAttribute("aria-pressed", (normalizedMode === "compact").toString());
  persistAndSync("teamio-density", normalizedMode);
};

const loadDensity = () => {
  const saved = localStorage.getItem("teamio-density") ?? "comfortable";
  applyDensity(saved);
};

const loadAllTasks = () => JSON.parse(localStorage.getItem("teamio-tasks") ?? "[]");

const getCurrentBoardColumnPreferenceKey = () => `teamio-board-visible-columns-${getCurrentBoardId()}`;
const getCurrentBoardPinnedPreferenceKey = () => `teamio-board-pinned-columns-${getCurrentBoardId()}`;

const loadVisibleColumnsPreference = (columns) => {
  const saved = JSON.parse(localStorage.getItem(getCurrentBoardColumnPreferenceKey()) ?? "[]");
  if (!Array.isArray(saved) || saved.length === 0) {
    return columns.map((column) => column.id);
  }
  const allowed = new Set(columns.map((column) => column.id));
  const filtered = saved.filter((id) => allowed.has(id));
  return filtered.length > 0 ? filtered : columns.map((column) => column.id);
};

const saveVisibleColumnsPreference = (columnIds) => {
  persistAndSync(getCurrentBoardColumnPreferenceKey(), JSON.stringify(columnIds));
};

const loadPinnedColumnsPreference = (columns) => {
  const saved = JSON.parse(localStorage.getItem(getCurrentBoardPinnedPreferenceKey()) ?? "[]");
  if (!Array.isArray(saved) || saved.length === 0) {
    return [];
  }
  const allowed = new Set(columns.map((column) => column.id));
  return saved.filter((id) => allowed.has(id)).slice(0, 2);
};

const savePinnedColumnsPreference = (columnIds) => {
  persistAndSync(getCurrentBoardPinnedPreferenceKey(), JSON.stringify(columnIds.slice(0, 2)));
};

const ensureBoardColumnPreferences = (columns) => {
  // Винаги показваме всички колони, за да не изчезват задачи при стари/несъвместими localStorage филтри.
  visibleColumnIds = columns.map((column) => column.id);
  pinnedColumnIds = loadPinnedColumnsPreference(columns).filter((id) => visibleColumnIds.includes(id));
  saveVisibleColumnsPreference(visibleColumnIds);
  savePinnedColumnsPreference(pinnedColumnIds);
};

const renderColumnPicker = (columns) => {
  if (!columnPickerListEl) {
    return;
  }
  columnPickerListEl.innerHTML = "";
  columns.forEach((column) => {
    const row = document.createElement("label");
    row.className = "column-picker__item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.disabled = true;
    checkbox.title = "Всички колони са видими";

    const text = document.createElement("span");
    text.textContent = column.title;

    row.append(checkbox, text);
    columnPickerListEl.append(row);
  });
};

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
      listId: getNormalizedColumnId(task.column, boardColumns),
      status: task.completed ? "done" : "todo",
      priority: "medium",
      assignedUserIds: [],
      labels: [],
      checklists: [],
      attachments: [],
      comments: [],
      activityLog: [],
      createdBy: loadCurrentUser()?.id ?? null,
    }));
    persistAndSync("teamio-tasks", JSON.stringify(seeded));
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
      status: CARD_STATUSES.includes(task.status) ? task.status : (Boolean(task.completed) ? "done" : "todo"),
      priority: CARD_PRIORITIES.includes(task.priority) ? task.priority : "medium",
      listId: task.listId ?? normalizedColumn,
      assignedUserIds: Array.isArray(task.assignedUserIds) ? task.assignedUserIds : [],
      labels: Array.isArray(task.labels) ? task.labels : [],
      checklists: Array.isArray(task.checklists) ? task.checklists : [],
      attachments: Array.isArray(task.attachments) ? task.attachments : [],
      comments: Array.isArray(task.comments) ? task.comments : [],
      activityLog: Array.isArray(task.activityLog) ? task.activityLog : [],
    };
  });

  if (hasChanges) {
    persistAndSync("teamio-tasks", JSON.stringify(parsed));
  }

  return parsed;
};

const saveTasks = (tasks) => {
  persistAndSync("teamio-tasks", JSON.stringify(tasks));
};

const openTaskModal = () => {
  modalEl.classList.add("modal--open");
};

const closeTaskModal = () => {
  modalEl.classList.remove("modal--open");
  formEl.reset();
};

const openTaskDetails = async (taskId) => {
  const tasks = loadTasks();
  const task = tasks.find((entry) => entry.id === taskId);
  if (!task || !taskDetailsForm) {
    return;
  }

  await ensureWorkspaceMembersLoaded();
  taskDetailsForm.querySelector('input[name="taskId"]').value = task.id;
  taskDetailsForm.querySelector('input[name="title"]').value = task.title;
  taskDetailsForm.querySelector('textarea[name="description"]').value = task.description ?? "";
  taskDetailsForm.querySelector('input[name="due"]').value = task.due ?? "";
  taskDetailsForm.querySelector('select[name="level"]').value = task.level ?? "L2";
  taskDetailsForm.querySelector('input[name="completed"]').checked = Boolean(task.completed);
  renderTaskDetailsAssigneeOptions(task);
  const editable = canEditTask(task);
  const assignable = canAssignTask();
  Array.from(taskDetailsForm.querySelectorAll("input, textarea, select, button[type='submit']")).forEach((control) => {
    if (control.name === "taskId") return;
    if (control.name === "assignedUserId") {
      control.disabled = !assignable;
      return;
    }
    control.disabled = !editable;
  });
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

  const assignedUserId = Array.isArray(task.assignedUserIds) ? task.assignedUserIds[0] : "";
  if (assignedUserId) {
    const assignee = getAssignableMembers().find((member) => member.id === assignedUserId);
    const assigneeTag = document.createElement("span");
    assigneeTag.className = "card__tag";
    assigneeTag.textContent = `👤 ${assignee?.name ?? "Присвоена"}`;
    footer.append(assigneeTag);
  }

  footer.append(tag, due);
  card.append(titleRow, desc, footer);

  card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", task.id);
  });

  card.addEventListener("click", async () => {
    await openTaskDetails(task.id);
  });
  if (!canEditTask(task)) {
    card.classList.add("card--readonly");
  }

  return card;
};

const isDoneColumn = (columnId) => {
  const column = loadColumns().find((entry) => entry.id === columnId);
  const title = normalizeText(column?.title ?? "").toLowerCase();
  return title.includes("готов") || title.includes("done") || String(columnId).startsWith("done");
};

const normalizeTaskCompletion = (task) => {
  const completedByColumn = preferences.doneByColumn && isDoneColumn(task.column);
  const completedByFlag = preferences.doneByFlag && (Boolean(task.completed) || task.status === "done");
  const completed = completedByColumn || completedByFlag;
  return {
    ...task,
    completed,
    status: completed ? "done" : (task.status === "done" ? "todo" : (task.status ?? "todo")),
    completedAt: completed ? (task.completedAt ?? Date.now()) : null,
  };
};

const renderBoard = (tasks) => {
  boardEl.innerHTML = "";
  updateBoardTopbar();
  const filteredTasks = getFilteredTasksBySearch(tasks);
  const columns = loadColumns();
  ensureBoardColumnPreferences(columns);
  const activeCount = filteredTasks.filter((task) => !normalizeTaskCompletion(task).completed).length;
  const dueCount = filteredTasks.filter((task) => task.due).length;
  statActive.textContent = activeCount.toString();
  statDue.textContent = dueCount.toString();

  const visibleColumns = columns.filter((column) => visibleColumnIds.includes(column.id));
  const pinnedColumns = visibleColumns.filter((column) => pinnedColumnIds.includes(column.id));
  const regularColumns = visibleColumns.filter((column) => !pinnedColumnIds.includes(column.id));
  const orderedColumns = [...pinnedColumns, ...regularColumns];

  orderedColumns.forEach((column) => {
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
    const hasLimit = Number.isInteger(column.wipLimit) && column.wipLimit > 0;
    const isOverLimit = hasLimit && columnTasks.length > column.wipLimit;
    count.textContent = hasLimit ? `${columnTasks.length}/${column.wipLimit}` : `${columnTasks.length} задачи`;
    count.classList.toggle("column__count--limit", hasLimit);
    count.classList.toggle("column__count--over", isOverLimit);
    columnEl.classList.toggle("column--limit-over", isOverLimit);

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

    const limitButton = document.createElement("button");
    limitButton.type = "button";
    limitButton.className = "column__limit";
    limitButton.textContent = hasLimit ? "Промени лимит" : "WIP лимит";
    limitButton.title = "Максимален брой карти в колоната";
    limitButton.addEventListener("click", () => {
      if (!listLimitForm || !listLimitModal) {
        return;
      }
      listLimitForm.querySelector('input[name="columnId"]').value = column.id;
      listLimitForm.querySelector('input[name="wipLimit"]').value = hasLimit ? column.wipLimit.toString() : "";
      openModal(listLimitModal);
    });

    const pinButton = document.createElement("button");
    pinButton.type = "button";
    pinButton.className = "column__pin";
    const isPinned = pinnedColumnIds.includes(column.id);
    pinButton.textContent = isPinned ? "Откачи" : "Закачи";
    pinButton.title = "Закачи колоната вляво";
    pinButton.addEventListener("click", () => {
      const alreadyPinned = pinnedColumnIds.includes(column.id);
      if (alreadyPinned) {
        pinnedColumnIds = pinnedColumnIds.filter((id) => id !== column.id);
      } else {
        pinnedColumnIds = [...pinnedColumnIds, column.id].slice(0, 2);
      }
      savePinnedColumnsPreference(pinnedColumnIds);
      renderBoard(getVisibleTasks());
    });

    const canManageLists = canManageBoardStructure();
    [dragButton, renameButton, limitButton, pinButton].forEach((btn) => {
      btn.disabled = !canManageLists;
      btn.style.display = canManageLists ? "inline-flex" : "none";
    });
    actions.append(count, dragButton, renameButton, limitButton);

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
        const boardColumns = loadColumns();
        const sourceIndex = boardColumns.findIndex((entry) => entry.id === draggedColumnId);
        const targetIndex = boardColumns.findIndex((entry) => entry.id === column.id);
        if (sourceIndex === -1 || targetIndex === -1) {
          return;
        }
        const nextColumns = [...boardColumns];
        const [moved] = nextColumns.splice(sourceIndex, 1);
        nextColumns.splice(targetIndex, 0, moved);
        saveColumns(nextColumns);
        renderBoard(getVisibleTasks());
        return;
      }

      const taskId = event.dataTransfer.getData("text/plain");
      if (!canManageBoardStructure() && !canCreateCards()) {
        return;
      }
      if (!taskId) {
        return;
      }
      const allTasks = loadTasks();
      const movingTask = allTasks.find((task) => task.id === taskId);
      if (!movingTask || !canEditTask(movingTask)) {
        setAuthMessage("Нямаш право да местиш тази карта.");
        return;
      }
      const updated = allTasks.map((task) => {
        if (task.id !== taskId) return task;
        const movedToDoneColumn = isDoneColumn(column.id);
        return normalizeTaskCompletion({
          ...task,
          column: column.id,
          listId: column.id,
          status: movedToDoneColumn ? "done" : (task.status === "done" ? "todo" : (task.status ?? "todo")),
          completed: movedToDoneColumn ? true : false,
        });
      });
      saveTasks(updated);
      renderBoard(getVisibleTasks());
      renderCalendar();
    });

    boardEl.append(columnEl);
  });

  columnSelect.innerHTML = "";
  orderedColumns.forEach((column) => {
    const option = document.createElement("option");
    option.value = column.id;
    option.textContent = column.title;
    columnSelect.append(option);
  });

  renderColumnPicker(columns);
  updateReports();
};

const loadNotifications = () => JSON.parse(localStorage.getItem("teamio-notifications") ?? "[]");

const saveNotifications = (items) => {
  persistAndSync("teamio-notifications", JSON.stringify(items));
};

const pushNotification = (notification) => {
  const items = loadNotifications();
  items.unshift({
    id: notification.id ?? `notif-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    createdAt: notification.createdAt ?? Date.now(),
    readAt: notification.readAt ?? null,
    type: notification.type ?? "generic",
    ...notification,
  });
  saveNotifications(items.slice(0, 300));
};

const loadInvites = () => JSON.parse(localStorage.getItem("teamio-invites") ?? "[]");

const saveInvites = (invites) => {
  persistAndSync("teamio-invites", JSON.stringify(invites));
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
  const expiresAtTs = invite.expiresAt ? new Date(invite.expiresAt).getTime() : null;
  if (Number.isFinite(expiresAtTs) && expiresAtTs <= Date.now()) {
    return "Изтекла";
  }
  return "Активна";
};

const renderInvites = () => {
  if (!inviteList) {
    return;
  }

  // Pending invites за admin/owner се рендерират от renderMembersInvitesSummary().
  // Избягваме двойно рендериране върху един и същ контейнер (flicker).
  if (hasManagementAccess()) {
    return;
  }

  const currentAccount = getCurrentAccount();
  const invites = loadInvites().filter((invite) => invite.accountId && invite.accountId === currentAccount?.id);
  inviteList.innerHTML = "";

  if (incomingInvitesCount) {
    incomingInvitesCount.textContent = String(invites.filter((invite) => !invite.acceptedAt && !invite.declinedAt && !invite.revokedAt).length);
  }

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

const renderMembersInvitesSummary = async () => {
  const hasWorkspaceAccess = Boolean(loadCurrentUser()?.tenantId && loadCurrentUser()?.role);
  if (noWorkspaceAccess) noWorkspaceAccess.hidden = hasWorkspaceAccess;
  if (!hasWorkspaceAccess) {
    workspaceMembersCountCache = null;
    workspaceMembersCache = [];
    if (acceptedMembersList) acceptedMembersList.innerHTML = "";
    if (inviteList) inviteList.innerHTML = "";
    if (acceptedMembersCount) acceptedMembersCount.textContent = "0";
    return;
  }
  if (!acceptedMembersList) {
    return;
  }
  const user = loadCurrentUser();
  if (!user?.accountId) {
    acceptedMembersList.innerHTML = "";
    if (pendingInvitesCount) pendingInvitesCount.textContent = "0";
    if (membersInvitesBadge) membersInvitesBadge.textContent = "0";
    if (acceptedMembersCount) acceptedMembersCount.textContent = "0";
    return;
  }

  const params = new URLSearchParams({ accountId: user.accountId, requesterUserId: user.id });
  const apiResult = await apiRequest(`/api/workspaces/members-summary?${params.toString()}`);
  if (!apiResult?.ok) {
    return;
  }

  const pending = Array.isArray(apiResult.data?.pendingInvites) ? apiResult.data.pendingInvites : [];
  const accepted = Array.isArray(apiResult.data?.acceptedMembers) ? apiResult.data.acceptedMembers : [];
  workspaceMembersCache = accepted;
  workspaceMembersCountCache = Math.max(accepted.length, 1);
  if (acceptedMembersCount) acceptedMembersCount.textContent = String(accepted.length);
  updateReports();

  if (!hasManagementAccess()) {
    acceptedMembersList.innerHTML = "";
    if (pendingInvitesCount) pendingInvitesCount.textContent = "0";
    return;
  }

  if (pendingInvitesCount) pendingInvitesCount.textContent = String(pending.length);
  if (membersInvitesBadge) membersInvitesBadge.textContent = String(pending.length);

  inviteList.innerHTML = "";
  if (pending.length === 0) {
    inviteList.innerHTML = '<div class="panel-list__item"><div><strong>Няма pending покани</strong></div></div>';
  } else {
    pending.forEach((invite) => {
      const item = document.createElement("div");
      item.className = "panel-list__item panel-list__item--stack";
      const invitedBy = invite.invitedByName || "Неизвестен";
      item.innerHTML = `<div><strong>${invite.email}</strong><div class="panel-list__meta">Поканил: ${invitedBy} · ${new Date(invite.createdAt).toLocaleDateString("bg-BG")}</div></div>`;

      const revokeButton = document.createElement("button");
      revokeButton.type = "button";
      revokeButton.className = "ghost";
      revokeButton.textContent = "Спри поканата";
      revokeButton.addEventListener("click", async () => {
        const currentUser = loadCurrentUser();
        if (!currentUser?.accountId) {
          return;
        }

        const apiResult = await apiRequest("/api/invites/revoke", {
          method: "POST",
          body: JSON.stringify({
            inviteId: invite.id,
            accountId: currentUser.accountId,
            requesterUserId: currentUser.id,
          }),
        });

        if (apiResult?.ok) {
          setAuthMessage(`Поканата към ${invite.email} е отменена.`);
          await syncInvitesFromApi({ force: true });
          renderInvites();
          renderMyInvites();
          renderMembersInvitesSummary();
          return;
        }

        setAuthMessage(apiResult?.data?.message || "Неуспешно отменяне на поканата.");
      });

      const actions = document.createElement("div");
      actions.className = "invite-actions";
      actions.append(revokeButton);
      item.append(actions);
      inviteList.append(item);
    });
  }

  acceptedMembersList.innerHTML = "";
  if (accepted.length === 0) {
    acceptedMembersList.innerHTML = '<div class="panel-list__item"><div><strong>Няма приети членове</strong></div></div>';
  } else {
    accepted.forEach((member) => {
      const item = document.createElement("div");
      item.className = "panel-list__item panel-list__item--stack";
      const joinedAt = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("bg-BG") : "-";
      item.innerHTML = `<div><strong>${member.name}</strong><div class="panel-list__meta">${member.email} · ${member.role} · ${joinedAt}</div></div>`;

      if (hasManagementAccess() && normalizeRole(member.role) !== "Owner") {
        const roleSelect = document.createElement("select");
        ["Admin", "Manager", "Member", "Viewer"].forEach((roleOption) => {
          const option = document.createElement("option");
          option.value = roleOption;
          option.textContent = roleOption;
          option.selected = normalizeRole(member.role) === roleOption;
          roleSelect.append(option);
        });

        const saveRoleButton = document.createElement("button");
        saveRoleButton.type = "button";
        saveRoleButton.className = "ghost";
        saveRoleButton.textContent = "Запази роля";
        saveRoleButton.addEventListener("click", async () => {
          const apiResult = await apiRequest("/api/accounts/members/role", {
            method: "POST",
            body: JSON.stringify({
              memberUserId: member.userId ?? member.id,
              role: roleSelect.value,
            }),
          });
          if (apiResult?.ok) {
            setAuthMessage(`Ролята на ${member.email || member.name} е обновена.`);
            renderMembersInvitesSummary();
            return;
          }
          setAuthMessage(apiResult?.data?.message || "Неуспешна смяна на роля.");
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "ghost";
        removeButton.textContent = "Премахни достъп";
        removeButton.addEventListener("click", async () => {
          const currentUser = loadCurrentUser();
          if (!currentUser?.accountId) {
            return;
          }

          const confirmed = window.confirm(`Да бъде ли премахнат достъпът на ${member.email || member.name}?`);
          if (!confirmed) {
            return;
          }

          const apiResult = await apiRequest("/api/accounts/members/remove", {
            method: "POST",
            body: JSON.stringify({
              accountId: currentUser.accountId,
              requesterUserId: currentUser.id,
              memberUserId: member.userId ?? null,
              memberEmail: member.email ?? "",
            }),
          });

          if (apiResult?.ok) {
            setAuthMessage(`Достъпът на ${member.email || member.name} е прекратен.`);
            await syncInvitesFromApi({ force: true });
            renderInvites();
            renderMyInvites();
            renderMembersInvitesSummary();
            return;
          }

          setAuthMessage(apiResult?.data?.message || "Неуспешно прекратяване на достъп.");
        });

        const actions = document.createElement("div");
        actions.className = "invite-actions";
        actions.append(roleSelect, saveRoleButton, removeButton);
        item.append(actions);
      }

      acceptedMembersList.append(item);
    });
  }
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

  const invites = loadInvites().filter((invite) => {
    if (!invite) return false;
    if (invite.__scope === "account") return false;
    return normalizeEmail(invite.email) === normalizeEmail(currentUser.email) || invite.invitedUserId === currentUser.id;
  });
  myInviteList.innerHTML = "";

  if (incomingInvitesCount) {
    incomingInvitesCount.textContent = String(invites.filter((invite) => !invite.acceptedAt && !invite.declinedAt && !invite.revokedAt).length);
  }

  if (invites.length === 0) {
    const empty = document.createElement("div");
    empty.className = "panel-list__item";
    empty.innerHTML = '<div><strong>Нямаш покани</strong><div class="panel-list__meta">Когато те поканят, ще се покажат тук.</div></div>';
    myInviteList.append(empty);
    return;
  }

  const accounts = loadAccounts();
  invites.forEach((invite) => {
    const accountName = invite.accountName || invite.workspaceName || accounts.find((account) => account.id === invite.accountId)?.name || "Неизвестна фирма";
    const invitedByName =
      invite.invitedByName ||
      "Неизвестен";
    const item = document.createElement("div");
    item.className = "panel-list__item panel-list__item--stack";

    const status = getInviteStatusLabel(invite);
    const workspaceLabel = invite.workspaceName || (invite.workspaceId ? "Избрано пространство" : "Всички пространства");
    const boardLabel = invite.boardName || (invite.boardId ? "Избран борд" : "");
    item.innerHTML = `<div><strong>${accountName}</strong><div class="panel-list__meta">Покана от: ${invitedByName} · До: ${invite.email} · Пространство: ${workspaceLabel}${boardLabel ? ` · Борд: ${boardLabel}` : ""} · Роля: ${invite.role} · ${status}</div></div>`;

    const expiresAtTs = invite.expiresAt ? new Date(invite.expiresAt).getTime() : null;
    const canRespond = !invite.acceptedAt && !invite.declinedAt && !invite.revokedAt && (!Number.isFinite(expiresAtTs) || expiresAtTs > Date.now());
    if (canRespond) {
      const actions = document.createElement("div");
      actions.className = "invite-actions";

      const acceptButton = document.createElement("button");
      acceptButton.type = "button";
      acceptButton.className = "primary";
      acceptButton.textContent = "Приеми";
      acceptButton.addEventListener("click", async () => {
        const apiResult = await apiRequest(`/api/invites/${invite.id}/accept`, { method: "POST" });

        if (apiResult?.ok) {
          await syncInvitesFromApi({ force: true });
        } else {
          const updatedInvites = loadInvites().map((entry) =>
            entry.id === invite.id
              ? { ...entry, acceptedAt: Date.now(), acceptedUserId: currentUser.id, declinedAt: null }
              : entry
          );
          saveInvites(updatedInvites);
        }

        const nextCurrentUser = {
          ...currentUser,
          accountId: invite.accountId ?? currentUser.accountId,
          role: invite.role,
          tenantId: invite.tenantId ?? currentUser.tenantId,
          workspaceId: invite.tenantId ?? currentUser.workspaceId,
          teamIds: currentUser.teamIds ?? [],
        };
        setCurrentUser(nextCurrentUser);

        const allBoards = JSON.parse(localStorage.getItem("teamio-boards") ?? "[]");
        const inviteWorkspaceBoard = allBoards.find((board) => board?.workspaceId && board.workspaceId === invite.tenantId);
        if (invite.boardId) {
          setCurrentBoardId(invite.boardId);
        } else if (inviteWorkspaceBoard?.id) {
          setCurrentBoardId(inviteWorkspaceBoard.id);
        }

        await syncBoardsFromApi();
        renderBoardSelector();
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
        const apiResult = await apiRequest(`/api/invites/${invite.id}/decline`, { method: "POST" });

        if (apiResult?.ok) {
          await syncInvitesFromApi({ force: true });
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
  const manualMembers = (account?.members ?? []).map((member) => ({ ...member, userId: member.userId ?? null, isOwner: false }));
  const members = [];
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

      const memberEmail = member.email;
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

        saveAccounts(updatedAccounts);
        renderTeams();
        updateReports();
      });

      teamCatalog.append(teamCard);
    });
  }

  syncTeamSelectors();
  renderInvites();
  void pushWorkspaceState();
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

const getWorkspaceMembers = () => {
  if (Array.isArray(workspaceMembersCache) && workspaceMembersCache.length > 0) {
    return workspaceMembersCache;
  }
  return [];
};

const getWorkspaceMemberCount = () => {
  if (Number.isFinite(workspaceMembersCountCache) && workspaceMembersCountCache > 0) {
    return workspaceMembersCountCache;
  }
  const accountMembersCount = getCurrentAccount()?.members?.length ?? 0;
  return Math.max(1, accountMembersCount);
};

const updateReports = () => {
  const tasks = getVisibleTasks().map(normalizeTaskCompletion);
  const doneCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.filter((task) => !task.completed).length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const doneThisWeek = tasks.filter((task) => task.completed && (task.completedAt ?? 0) >= weekAgo).length;
  reportDone.textContent = doneCount.toString();
  reportActive.textContent = activeCount.toString();
  reportVelocity.textContent = `${doneThisWeek} / 7 дни`;
  const teamCount = getWorkspaceMemberCount();
  if (statTeamSize) {
    statTeamSize.textContent = `${teamCount}`;
  }
};

newColumnButton.addEventListener("click", () => {
  if (!canManageBoardStructure()) {
    setAuthMessage("Нямаш право да създаваш листове.");
    return;
  }
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
    wipLimit: null,
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
    formData.get("password").toString()
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


closeListLimitModalButton?.addEventListener("click", () => {
  closeModal(listLimitModal);
});

removeListLimitButton?.addEventListener("click", () => {
  if (!listLimitForm) {
    return;
  }
  const columnId = listLimitForm.querySelector('input[name="columnId"]')?.value;
  if (!columnId) {
    closeModal(listLimitModal);
    return;
  }
  const columns = loadColumns();
  const updated = columns.map((column) => (column.id === columnId ? { ...column, wipLimit: null } : column));
  saveColumns(updated);
  closeModal(listLimitModal);
  renderBoard(getVisibleTasks());
});

listLimitForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(listLimitForm);
  const columnId = formData.get("columnId")?.toString();
  const rawLimit = formData.get("wipLimit")?.toString().trim() ?? "";
  if (!columnId) {
    return;
  }
  const parsedLimit = Number.parseInt(rawLimit, 10);
  const nextLimit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : null;
  const columns = loadColumns();
  const updated = columns.map((column) => (column.id === columnId ? { ...column, wipLimit: nextLimit } : column));
  saveColumns(updated);
  closeModal(listLimitModal);
  renderBoard(getVisibleTasks());
});

listLimitModal?.addEventListener("click", (event) => {
  if (event.target === listLimitModal) {
    closeModal(listLimitModal);
  }
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
    role: normalizeRole(formData.get("role")?.toString() ?? "Member"),
    teamIds: selectedTeamIds,
  };
  if (!canInviteRole(newMember.role)) {
    setAuthMessage("Можеш да добавиш човек само с по-ниска роля.");
    return;
  }
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
  persistAndSync("teamio-calendar-view", calendarState.view);
  renderCalendar();
});

calendarFocusDateInput?.addEventListener("change", () => {
  if (!calendarFocusDateInput.value) {
    return;
  }
  calendarState.focusDate = calendarFocusDateInput.value;
  persistAndSync("teamio-calendar-focus", calendarState.focusDate);
  renderCalendar();
});

calendarTodayButton?.addEventListener("click", () => {
  calendarState.focusDate = new Date().toISOString().slice(0, 10);
  persistAndSync("teamio-calendar-focus", calendarState.focusDate);
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
  persistAndSync("teamio-calendar-focus", calendarState.focusDate);
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
  persistAndSync("teamio-calendar-focus", calendarState.focusDate);
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
  const sourceTask = tasks.find((task) => task.id === taskId);
  if (!canEditTask(sourceTask)) {
    setAuthMessage("Нямаш право да редактираш тази карта.");
    return;
  }
  const selectedAssigneeId = formData.get("assignedUserId")?.toString().trim() ?? "";
  const allowAssignmentUpdate = canAssignTask();
  const updatedTasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }
    return normalizeTaskCompletion({
      ...task,
      title: formData.get("title")?.toString().trim() ?? task.title,
      description: formData.get("description")?.toString() ?? "",
      due: formData.get("due")?.toString() ?? "",
      level: formData.get("level")?.toString() ?? "L2",
      assignedUserIds: allowAssignmentUpdate ? (selectedAssigneeId ? [selectedAssigneeId] : []) : (Array.isArray(task.assignedUserIds) ? task.assignedUserIds : []),
      completed: formData.get("completed") === "on",
      status: formData.get("completed") === "on" ? "done" : (task.status ?? "todo"),
      activityLog: [
        ...(task.activityLog ?? []),
        { id: `activity-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, type: "card_updated", userId: loadCurrentUser()?.id ?? null, createdAt: Date.now() },
      ],
    });
  });
  saveTasks(updatedTasks);
  renderBoard(getVisibleTasks());
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

  setAuthMessage(apiResult?.data?.message ?? "Линкът за възстановяване е невалиден.");
});

closeNewPasswordButton.addEventListener("click", () => {
  closeModal(newPasswordModal);
});


const isOwnerOfCurrentAccount = () => {
  const account = getCurrentAccount();
  const currentUser = loadCurrentUser();
  if (!currentUser) {
    return false;
  }

  const byAccountOwnerId = Boolean(account?.ownerUserId && account.ownerUserId === currentUser.id);
  const byRole = normalizeRole(currentUser.role ?? "Member") === "Owner";
  return byAccountOwnerId || byRole;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Неуспешно качване на лого."));
    reader.readAsDataURL(file);
  });

const updateWorkspaceCompanyIdentity = () => {
  const account = getCurrentAccount();
  const profile = account?.companyProfile ?? {};
  const companyName = normalizeText(account?.name ?? "") || "Teamio";
  const logo = normalizeText(profile.logoDataUrl ?? "");

  workspaceCompanyName && (workspaceCompanyName.textContent = companyName);
  workspaceCompanyChipName && (workspaceCompanyChipName.textContent = companyName);

  if (workspaceCompanyLogo) {
    workspaceCompanyLogo.hidden = !logo;
    workspaceCompanyLogo.src = logo || "";
  }
  if (workspaceCompanyDot) {
    workspaceCompanyDot.hidden = Boolean(logo);
  }

  if (workspaceCompanyChip) {
    workspaceCompanyChip.hidden = !companyName;
  }
  if (workspaceCompanyChipLogo) {
    workspaceCompanyChipLogo.hidden = !logo;
    workspaceCompanyChipLogo.src = logo || "";
  }
};

const syncProfileSettingsVisibility = () => {
  const preference = getCurrentUserProfilePreference();
  const personalMode = Boolean(preference.personalMode);
  if (profilePersonalModeCheckbox) {
    profilePersonalModeCheckbox.checked = personalMode;
  }
  const companySection = companyProfileForm?.closest(".setting-item");
  if (companySection) {
    companySection.hidden = personalMode || !isOwnerOfCurrentAccount();
  }
  if (userProfileSetting) {
    userProfileSetting.hidden = !personalMode;
  }
};

const syncUserProfileForm = () => {
  if (!userProfileForm) return;
  const preference = getCurrentUserProfilePreference();
  const profile = preference.profile ?? {};
  Object.entries({
    fullName: profile.fullName ?? "",
    birthDate: profile.birthDate ?? "",
    city: profile.city ?? "",
    district: profile.district ?? "",
    streetAddress: profile.streetAddress ?? "",
    phone: profile.phone ?? "",
    jobTitle: profile.jobTitle ?? "",
    department: profile.department ?? "",
  }).forEach(([key, value]) => {
    if (userProfileForm.elements[key]) userProfileForm.elements[key].value = value;
  });
};

const syncCompanyProfileForm = async () => {
  if (!companyProfileForm) {
    updateWorkspaceCompanyIdentity();
    return;
  }

  const account = getCurrentAccount();
  const currentUser = loadCurrentUser();
  const isOwner = isOwnerOfCurrentAccount();
  if (!account || !currentUser) {
    syncProfileSettingsVisibility();
    updateWorkspaceCompanyIdentity();
    return;
  }

  if (!isOwner) {
    syncProfileSettingsVisibility();
    updateWorkspaceCompanyIdentity();
    return;
  }

  const params = new URLSearchParams({ accountId: account.id, requesterUserId: currentUser.id });
  const apiResult = await apiRequest(`/api/accounts/company-profile?${params.toString()}`);

  if (apiResult?.ok && apiResult.data?.companyProfile) {
    const profile = apiResult.data.companyProfile;
    const updatedAccounts = loadAccounts().map((entry) =>
      entry.id === account.id
        ? {
            ...entry,
            name: normalizeText(profile.name ?? entry.name ?? ""),
            companyProfile: {
              ...(entry.companyProfile ?? {}),
              vatId: normalizeText(profile.vatId ?? ""),
              vatNumber: normalizeText(profile.vatNumber ?? ""),
              address: normalizeText(profile.address ?? ""),
              logoDataUrl: normalizeText(profile.logoDataUrl ?? ""),
            },
          }
        : entry
    );
    saveAccounts(updatedAccounts);
  }

  const refreshedAccount = getCurrentAccount();
  const refreshedProfile = refreshedAccount?.companyProfile ?? {};
  companyProfileForm.elements.name.value = refreshedAccount?.name ?? "";
  companyProfileForm.elements.vatId.value = refreshedProfile.vatId ?? "";
  companyProfileForm.elements.vatNumber.value = refreshedProfile.vatNumber ?? "";
  companyProfileForm.elements.address.value = refreshedProfile.address ?? "";
  companyProfileForm.elements.logo.value = "";

  updateWorkspaceCompanyIdentity();
  syncProfileSettingsVisibility();
  syncUserProfileForm();
};

profilePersonalModeCheckbox?.addEventListener("change", () => {
  saveCurrentUserProfilePreference({ personalMode: Boolean(profilePersonalModeCheckbox.checked) });
  syncProfileSettingsVisibility();
  syncUserProfileForm();
});

userProfileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(userProfileForm);
  const avatarFile = formData.get("avatar");
  const existing = getCurrentUserProfilePreference().profile ?? {};
  const avatarDataUrl = avatarFile && typeof avatarFile === "object" && avatarFile.size > 0
    ? await fileToDataUrl(avatarFile)
    : (existing.avatarDataUrl ?? "");
  saveCurrentUserProfilePreference({
    profile: {
      fullName: normalizeText(formData.get("fullName")?.toString() ?? ""),
      birthDate: normalizeText(formData.get("birthDate")?.toString() ?? ""),
      city: normalizeText(formData.get("city")?.toString() ?? ""),
      district: normalizeText(formData.get("district")?.toString() ?? ""),
      streetAddress: normalizeText(formData.get("streetAddress")?.toString() ?? ""),
      phone: normalizeText(formData.get("phone")?.toString() ?? ""),
      jobTitle: normalizeText(formData.get("jobTitle")?.toString() ?? ""),
      department: normalizeText(formData.get("department")?.toString() ?? ""),
      avatarDataUrl,
    },
  });
  setAuthMessage("Потребителските данни са запазени.");
  syncUserProfileForm();
});

companyProfileForm?.elements?.vatId?.addEventListener("blur", async () => {
  const vatId = normalizeText(companyProfileForm.elements.vatId.value ?? "");
  if (!vatId) {
    return;
  }
  const apiResult = await apiRequest(`/api/accounts/company-profile-by-vat?vatId=${encodeURIComponent(vatId)}`);
  if (!apiResult?.ok || !apiResult.data?.companyProfile) {
    return;
  }
  const profile = apiResult.data.companyProfile;
  if (!normalizeText(companyProfileForm.elements.name.value)) {
    companyProfileForm.elements.name.value = profile.name ?? "";
  }
  if (!normalizeText(companyProfileForm.elements.vatNumber.value)) {
    companyProfileForm.elements.vatNumber.value = profile.vatNumber ?? "";
  }
  if (!normalizeText(companyProfileForm.elements.address.value)) {
    companyProfileForm.elements.address.value = profile.address ?? "";
  }
});

companyProfileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const account = getCurrentAccount();
  const currentUser = loadCurrentUser();
  if (!account || !currentUser) {
    return;
  }

  if (!isOwnerOfCurrentAccount()) {
    setAuthMessage("Само собственикът може да редактира фирмените данни.");
    return;
  }

  const formData = new FormData(companyProfileForm);
  const companyName = normalizeText(formData.get("name")?.toString() ?? "");
  if (!companyName) {
    setAuthMessage("Името на фирмата е задължително.");
    return;
  }

  const logoFile = formData.get("logo");
  const existingLogo = normalizeText(account.companyProfile?.logoDataUrl ?? "");
  const logoDataUrl = logoFile && typeof logoFile === "object" && logoFile.size > 0
    ? await fileToDataUrl(logoFile)
    : existingLogo;

  const apiResult = await apiRequest("/api/accounts/company-profile", {
    method: "POST",
    body: JSON.stringify({
      accountId: account.id,
      requesterUserId: currentUser.id,
      name: companyName,
      vatId: normalizeText(formData.get("vatId")?.toString() ?? ""),
      vatNumber: normalizeText(formData.get("vatNumber")?.toString() ?? ""),
      address: normalizeText(formData.get("address")?.toString() ?? ""),
      logoDataUrl,
    }),
  });

  if (!apiResult?.ok || !apiResult.data?.companyProfile) {
    setAuthMessage(apiResult?.data?.message ?? "Неуспешно запазване на фирмените данни.");
    return;
  }

  const profile = apiResult.data.companyProfile;
  const updatedAccounts = loadAccounts().map((entry) =>
    entry.id === account.id
      ? {
          ...entry,
          name: normalizeText(profile.name ?? companyName),
          companyProfile: {
            ...(entry.companyProfile ?? {}),
            vatId: normalizeText(profile.vatId ?? ""),
            vatNumber: normalizeText(profile.vatNumber ?? ""),
            address: normalizeText(profile.address ?? ""),
            logoDataUrl: normalizeText(profile.logoDataUrl ?? ""),
          },
        }
      : entry
  );

  saveAccounts(updatedAccounts);
  await syncCompanyProfileForm();
  setAuthMessage("Фирмените данни са обновени.");
});

logoutButton.addEventListener("click", () => {
  stopInvitesPolling();
  setAuthToken("");
  persistAndSync("teamio-current-user", null);
  showAuth();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden || !loadCurrentUser()) {
    return;
  }
  void refreshInviteUi({ force: true });
});


const applyRoleBasedTabVisibility = () => {
  const canManage = hasManagementAccess();
  document.querySelectorAll('[data-tab="members"]').forEach((item) => {
    item.style.display = canManage ? "inline-flex" : "none";
  });
  document.querySelectorAll('[data-tab-panel="members"]').forEach((panel) => {
    panel.style.display = canManage ? "" : "none";
  });

  const canSeeReports = canViewReports();
  document.querySelectorAll('[data-tab="reports"]').forEach((item) => {
    item.style.display = canSeeReports ? "inline-flex" : "none";
  });
  document.querySelectorAll('[data-tab-panel="reports"]').forEach((panel) => {
    panel.style.display = canSeeReports ? "" : "none";
  });
};

const activateTab = (tabId) => {
  const canManage = hasManagementAccess();
  const safeMembersTabId = tabId === "members" && !canManage ? "boards" : tabId;
  const safeTabId = safeMembersTabId === "reports" && !canViewReports() ? "boards" : safeMembersTabId;
  navItems.forEach((item) => {
    item.classList.toggle("nav__item--active", item.dataset.tab === safeTabId);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("tab-panel--active", panel.dataset.tabPanel === safeTabId);
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
  applyManagementAccessUi();
  renderBoardSelector();
  renderBoard(getVisibleTasks());
  renderInvites();
  void pushWorkspaceState();
});

boardSearchInput?.addEventListener("input", () => {
  boardSearchQuery = boardSearchInput.value;
  renderBoard(getVisibleTasks());
});

boardCanvasEl?.addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || !boardEl) {
    return;
  }

  const boardRect = boardEl.getBoundingClientRect();
  const pointerInColumnsRow =
    event.clientY >= boardRect.top &&
    event.clientY <= boardRect.bottom &&
    event.clientX >= boardRect.left &&
    event.clientX <= boardRect.right;

  if (!pointerInColumnsRow) {
    return;
  }

  boardCanvasEl.scrollLeft += event.deltaY;
  event.preventDefault();
}, { passive: false });

boardCanvasEl?.addEventListener("mousedown", (event) => {
  if (event.button != 0) {
    return;
  }
  if (event.target.closest("button, input, textarea, select, a, label, [draggable='true']")) {
    return;
  }
  isBoardCanvasDragging = true;
  boardCanvasDragStartX = event.pageX;
  boardCanvasDragStartScrollLeft = boardCanvasEl.scrollLeft;
  boardCanvasEl.classList.add("board-canvas--dragging");
  document.body.classList.add("is-board-canvas-dragging");
});

window.addEventListener("mousemove", (event) => {
  if (!isBoardCanvasDragging || !boardCanvasEl) {
    return;
  }
  const delta = event.pageX - boardCanvasDragStartX;
  boardCanvasEl.scrollLeft = boardCanvasDragStartScrollLeft - delta;
});

window.addEventListener("mouseup", () => {
  if (!isBoardCanvasDragging || !boardCanvasEl) {
    return;
  }
  isBoardCanvasDragging = false;
  boardCanvasEl.classList.remove("board-canvas--dragging");
  document.body.classList.remove("is-board-canvas-dragging");
});

boardFilterButton?.addEventListener("click", () => {
  activateTab("settings");
  document.getElementById("board-team-filter")?.focus();
});

boardMenuButton?.addEventListener("click", () => {
  toggleBoardMenu(true);
});

columnPickerToggleButton?.addEventListener("click", () => {
  if (!columnPickerEl) {
    return;
  }
  const isHidden = columnPickerEl.hasAttribute("hidden");
  if (isHidden) {
    columnPickerEl.removeAttribute("hidden");
  } else {
    columnPickerEl.setAttribute("hidden", "hidden");
  }
});

boardCompactToggleButton?.addEventListener("click", () => {
  const isCompact = document.body.classList.contains("density-compact");
  applyDensity(isCompact ? "comfortable" : "compact");
  boardCompactToggleButton.setAttribute("aria-pressed", (!isCompact).toString());
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
  const boardId = `board-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const workspace = getCurrentWorkspace();
  const currentUser = loadCurrentUser();
  boards.push(
    normalizeBoard({
      id: boardId,
      name: name.trim(),
      createdAt: Date.now(),
      visibility: "workspace",
      createdBy: currentUser?.id ?? null,
      workspaceId: workspace?.id ?? null,
      members: currentUser?.id ? [currentUser.id] : [],
      settings: { allowComments: true, allowAttachments: true, labelsEnabled: true },
    })
  );
  saveBoards(boards);
  setCurrentBoardId(boardId);
  const allColumns = loadAllColumns();
  saveAllColumns([...allColumns, ...createDefaultColumnsForBoard(boardId)]);
  renderBoardSelector();
  renderBoard(getVisibleTasks());
  renderInvites();
  void pushWorkspaceState();
});

const renameCurrentBoard = () => {
  const currentBoardId = getCurrentBoardId();
  const boards = loadBoards();
  const currentBoard = boards.find((board) => board.id === currentBoardId);
  if (!currentBoard) {
    return;
  }
  const canManageCurrentBoard = currentBoard.id === "board-default" ? canManageDefaultBoard() : hasManagementAccess();
  if (!canManageCurrentBoard) {
    return;
  }
  const nextName = window.prompt("Ново име на борда:", currentBoard.name);
  if (!nextName?.trim()) {
    return;
  }
  saveBoards(boards.map((board) => (board.id === currentBoardId ? { ...board, name: nextName.trim() } : board)));
  renderBoardSelector();
  void pushWorkspaceState();
};

const deleteCurrentBoard = () => {
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
  const canManageCurrentBoard = currentBoard.id === "board-default" ? canManageDefaultBoard() : hasManagementAccess();
  if (!canManageCurrentBoard) {
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
  void pushWorkspaceState();
};

renameBoardButton?.addEventListener("click", renameCurrentBoard);

deleteBoardButton?.addEventListener("click", deleteCurrentBoard);

createWorkspaceButton?.addEventListener("click", async () => {
  setAuthMessage("Създай workspace чрез нова регистрация (или администратор да те покани).");
});

inviteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!hasManagementAccess()) {
    setAuthMessage("Нямаш достъп до покани.");
    return;
  }
  const formData = new FormData(inviteForm);
  const inviteeEmailRaw = normalizeText(formData.get("inviteEmail")?.toString() ?? "");
  const inviteeUserIdRaw = normalizeText(formData.get("invitedUserId")?.toString() ?? "");
  const inviteeEmail = inviteeEmailRaw ? normalizeEmail(inviteeEmailRaw) : "";
  const inviteeUserId = inviteeUserIdRaw.toUpperCase();
  const hasInviteeEmail = Boolean(inviteeEmailRaw);
  const hasInviteeUserId = Boolean(inviteeUserIdRaw);
  const inviteTargetLabel = inviteeUserId || inviteeEmail || inviteeUserIdRaw || inviteeEmailRaw;
  const role = normalizeRole(formData.get("role")?.toString() ?? "Member");
  if (!canInviteRole(role)) {
    setAuthMessage("Можеш да каниш само с роля по-ниска от твоята.");
    return;
  }
  const account = getCurrentAccount();
  if (!account) {
    return;
  }
  if (!hasInviteeEmail && !hasInviteeUserId) {
    setAuthMessage("Попълнете имейл или потребителско ID.");
    return;
  }
  if (hasInviteeEmail && hasInviteeUserId) {
    setAuthMessage("Попълнете само едно поле: имейл ИЛИ потребителско ID.");
    return;
  }
  if (hasInviteeEmail && !inviteeEmail) {
    setAuthMessage("Невалиден имейл адрес.");
    return;
  }

  const localToken = generateToken();
  let invite = {
    id: `invite-${Date.now()}`,
    accountId: account.id,
    invitedByUserId: loadCurrentUser()?.id ?? null,
    email: hasInviteeEmail ? inviteeEmail : "",
    role,
    token: localToken,
    expiresAt: Date.now() + 48 * 60 * 60 * 1000,
    acceptedAt: null,
    declinedAt: null,
    revokedAt: null,
  };

  const workspaceId = normalizeText(loadCurrentUser()?.tenantId ?? "");
  const payload = {
    role,
    inviteeEmail: hasInviteeEmail ? inviteeEmail : undefined,
    inviteeUserId: hasInviteeUserId ? inviteeUserId : undefined,
    // backward-compatible payload for текущ backend/интеграции
    email: hasInviteeEmail ? inviteeEmail : undefined,
    public_id: hasInviteeUserId ? inviteeUserId : undefined,
  };

  if (!workspaceId) {
    setAuthMessage("Нямаш активен workspace.");
    return;
  }

  const apiResult = await apiRequest(`/api/workspaces/${workspaceId}/invites`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  let deliveryReport = null;
  if (apiResult?.ok && apiResult.data?.invite) {
    invite = apiResult.data.invite;
    deliveryReport = apiResult.data.deliveryReport ?? null;
    await syncInvitesFromApi({ force: true });
  } else {
    if (apiResult?.data?.message === "Forbidden") {
      setAuthMessage("403 Forbidden: Нямаш право да изпращаш покани.");
      return;
    }
    setAuthMessage(apiResult?.data?.message || "Поканата не беше изпратена. Провери връзката със сървъра.");
    return;
  }

  inviteForm.reset();

  const inviteIdOrToken = invite.inviteId || invite.token || invite.id;
  const inviteLink = invite.inviteLink || `${window.location.origin}${window.location.pathname}?invite=${inviteIdOrToken}`;
  if (inviteShareBox && inviteShareLink) {
    const isInternalInvite = invite.delivery === "internal";
    inviteShareBox.hidden = isInternalInvite;
    if (!isInternalInvite) {
      inviteShareLink.href = inviteLink;
      inviteShareLink.textContent = inviteLink;
      if (inviteShareWhatsappLink) {
        inviteShareWhatsappLink.href = `https://wa.me/?text=${encodeURIComponent(inviteLink)}`;
      }
      if (inviteShareFacebookLink) {
        inviteShareFacebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`;
      }
      if (inviteShareTelegramLink) {
        inviteShareTelegramLink.href = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}`;
      }
    }
  }

  pushNotification({
    type: "board_invite",
    accountId: account.id,
    boardId: getCurrentBoardId(),
    email: inviteeEmail || invite.email,
    role,
    message: `Изпратена е покана към ${inviteTargetLabel || invite.email}`,
  });
  if (invite.delivery === "internal") {
    setAuthMessage("Поканата е изпратена вътрешно към регистрирания потребител.");
  } else if (deliveryReport && deliveryReport.delivered === false) {
    setAuthMessage("Поканата е създадена, но имейлът не е изпратен автоматично. Използвай линка за ръчно споделяне.");
  } else {
    setAuthMessage("Поканата е създадена успешно.");
  }
  renderInvites();
  renderMyInvites();
  renderMembersInvitesSummary();
  renderTeams();
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

inviteShareNativeButton?.addEventListener("click", async () => {
  const link = inviteShareLink?.href;
  if (!link || !navigator.share) {
    setAuthMessage("Споделянето не е налично в този браузър.");
    return;
  }

  try {
    await navigator.share({
      title: "Покана за Teamio",
      text: "Присъедини се към работното поле в Teamio:",
      url: link,
    });
    setAuthMessage("Линкът е споделен успешно.");
  } catch (error) {
    if (error?.name !== "AbortError") {
      setAuthMessage("Неуспешно споделяне. Използвай бутон Копирай.");
    }
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

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canCreateCards()) {
    setAuthMessage("Нямаш право да създаваш карти.");
    return;
  }
  const formData = new FormData(formEl);
  const currentUser = loadCurrentUser();
  const selectedTeamIds = getSelectedValues(taskTeamIdsSelect);
  if (selectedTeamIds.length === 0) {
    return;
  }
  const tasks = loadTasks();
  const cardColumn = formData.get("column").toString();
  const now = Date.now();
  const newTask = normalizeTaskCompletion({
    id: `task-${now}`,
    title: formData.get("title").toString(),
    description: formData.get("description").toString(),
    due: formData.get("due").toString(),
    column: cardColumn,
    listId: cardColumn,
    tag: "Ново",
    level: formData.get("level")?.toString() ?? "L2",
    priority: "medium",
    status: "todo",
    createdBy: currentUser?.id ?? null,
    assignedUserIds: [],
    labels: [],
    checklists: [],
    attachments: [],
    comments: [],
    activityLog: [{ id: `activity-${now}`, type: "card_created", userId: currentUser?.id ?? null, createdAt: now }],
    teamIds: selectedTeamIds,
    accountId: currentUser?.accountId,
    boardId: getCurrentBoardId(),
  });
  const apiResult = await apiRequest("/api/cards", {
    method: "POST",
    body: JSON.stringify({
      accountId: currentUser?.accountId,
      requesterUserId: currentUser?.id,
      boardId: getCurrentBoardId(),
      listId: cardColumn,
      title: newTask.title,
      description: newTask.description,
      due: newTask.due,
      level: newTask.level,
    }),
  });
  if (!apiResult?.ok && apiResult?.data?.message === "Forbidden") {
    setAuthMessage("403 Forbidden: Нямаш право за това действие.");
    return;
  }
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

settingsAccordion?.querySelectorAll(".setting-item__toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".setting-item");
    if (!item) {
      return;
    }
    item.classList.toggle("setting-item--open");
  });
});

const activeUser = loadCurrentUser();

loadTheme();
loadDensity();

if (activeUser) {
  showApp(activeUser);
} else {
  const initialTasks = getVisibleTasks();
  applyRoleBasedTabVisibility();
  renderBoardSelector();
  renderBoard(initialTasks);
  renderTeams();
  renderInvites();
  renderMyInvites();
  renderMembersInvitesSummary();
  renderCalendar();
  updateReports();
  showAuth();
}

openVerifyFromUrl().finally(() => {
  openResetFromUrl();
  clearSensitiveQueryParams();
});

}
