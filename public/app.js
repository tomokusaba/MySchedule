const ROLE_LABELS = Object.freeze({
  attending: "参加",
  organizing: "主催",
  speaking: "登壇",
});

const elements = {
  counts: {
    attending: document.querySelector("#count-attending"),
    organizing: document.querySelector("#count-organizing"),
    speaking: document.querySelector("#count-speaking"),
  },
  emptyCopy: document.querySelector("#empty-copy"),
  emptyState: document.querySelector("#empty-state"),
  emptyTitle: document.querySelector("#empty-title"),
  filterButtons: [...document.querySelectorAll("[data-filter]")],
  resultsStatus: document.querySelector("#results-status"),
  search: document.querySelector("#search"),
  sortOrder: document.querySelector("#sort-order"),
  timeline: document.querySelector("#timeline"),
  updatedAt: document.querySelector("#updated-at"),
};

let events = [];
let generatedAt = null;
let loadFailed = false;
let activeFilter = "all";

function isValidEvent(event) {
  if (!event || !Number.isSafeInteger(event.id) || typeof event.title !== "string" || !event.title.trim()) {
    return false;
  }

  try {
    const url = new URL(event.url);
    return (url.protocol === "https:" || url.protocol === "http:")
      && (url.hostname === "connpass.com" || url.hostname.endsWith(".connpass.com"));
  } catch {
    return false;
  }
}

function formatDate(value) {
  if (!value) return "開催日未登録";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "開催日未登録";

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  }).format(date);
}

function eventYear(event) {
  if (!event.startedAt) return "開催日未登録";
  const date = new Date(event.startedAt);
  return Number.isNaN(date.getTime())
    ? "開催日未登録"
    : new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "Asia/Tokyo" }).format(date);
}

function eventDateValue(event) {
  const date = Date.parse(event.startedAt ?? "");
  return Number.isNaN(date) ? null : date;
}

function createRoleLabel(role) {
  const label = document.createElement("span");
  label.className = `role-label role-label--${role}`;
  label.textContent = ROLE_LABELS[role];
  return label;
}

function createEventRow(event, latestId) {
  const item = document.createElement("li");
  item.className = `event-row${event.id === latestId ? " event-row--latest" : ""}`;

  const time = document.createElement("time");
  time.className = "event-date";
  time.textContent = formatDate(event.startedAt);
  if (event.startedAt) time.dateTime = event.startedAt;

  const content = document.createElement("div");
  content.className = "event-content";

  const roleList = document.createElement("div");
  roleList.className = "event-roles";
  roleList.setAttribute("aria-label", "活動の種類");
  event.roles.filter((role) => ROLE_LABELS[role]).forEach((role) => roleList.append(createRoleLabel(role)));

  const heading = document.createElement("h4");
  heading.className = "event-title";
  const link = document.createElement("a");
  link.href = event.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = event.title;
  heading.append(link);

  const metaParts = [event.groupName, event.place].filter((part) => typeof part === "string" && part.trim());
  content.append(roleList, heading);

  if (metaParts.length) {
    const meta = document.createElement("p");
    meta.className = "event-meta";
    meta.textContent = metaParts.join(" ・ ");
    content.append(meta);
  }

  if (event.catch) {
    const eventCatch = document.createElement("p");
    eventCatch.className = "event-catch";
    eventCatch.textContent = event.catch;
    content.append(eventCatch);
  }

  const sourceLink = document.createElement("a");
  sourceLink.className = "event-source";
  sourceLink.href = event.url;
  sourceLink.target = "_blank";
  sourceLink.rel = "noopener noreferrer";
  sourceLink.append(document.createTextNode("connpassで見る "));
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  sourceLink.append(arrow);
  const newTab = document.createElement("span");
  newTab.className = "visually-hidden";
  newTab.textContent = "（新しいタブで開きます）";
  sourceLink.append(newTab);
  content.append(sourceLink);

  item.append(time, content);
  return item;
}

function visibleEvents() {
  const query = elements.search.value.trim().toLocaleLowerCase("ja");
  const filtered = events.filter((event) => {
    const matchesRole = activeFilter === "all" || event.roles.includes(activeFilter);
    const searchable = [event.title, event.catch, event.groupName, event.place, ...event.roles.map((role) => ROLE_LABELS[role])]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("ja");
    return matchesRole && (!query || searchable.includes(query));
  });

  return filtered.sort((left, right) => {
    const leftDate = eventDateValue(left);
    const rightDate = eventDateValue(right);
    if (leftDate === null && rightDate === null) return left.title.localeCompare(right.title, "ja");
    if (leftDate === null) return 1;
    if (rightDate === null) return -1;
    return elements.sortOrder.value === "oldest" ? leftDate - rightDate : rightDate - leftDate;
  });
}

function render() {
  const visible = visibleEvents();
  const latestEvent = events.reduce((latest, event) => {
    if (!latest) return event;
    const latestDate = eventDateValue(latest);
    const currentDate = eventDateValue(event);
    return currentDate !== null && (latestDate === null || currentDate > latestDate) ? event : latest;
  }, null);
  const latestId = latestEvent?.id ?? null;
  const sections = new Map();

  for (const event of visible) {
    const year = eventYear(event);
    if (!sections.has(year)) sections.set(year, []);
    sections.get(year).push(event);
  }

  const fragment = document.createDocumentFragment();
  for (const [year, yearEvents] of sections) {
    const section = document.createElement("section");
    section.className = "timeline-year";
    const yearHeading = document.createElement("h3");
    yearHeading.className = "year-heading";
    yearHeading.append(document.createTextNode(year));

    if (year !== "開催日未登録") {
      const suffix = document.createElement("span");
      suffix.className = "year-heading__suffix";
      suffix.textContent = "年";
      yearHeading.append(suffix);
    }

    const list = document.createElement("ol");
    list.className = "year-events";
    for (const event of yearEvents) list.append(createEventRow(event, latestId));
    section.append(yearHeading, list);
    fragment.append(section);
  }

  elements.timeline.replaceChildren(fragment);
  elements.timeline.hidden = visible.length === 0;
  elements.emptyState.hidden = visible.length !== 0;

  if (loadFailed) {
    elements.emptyTitle.textContent = "イベント記録を読み込めませんでした";
    elements.emptyCopy.textContent = "時間をおいて再読み込みするか、connpassプロフィールで公開情報をご確認ください。";
    elements.resultsStatus.textContent = "イベントデータの読み込みに失敗しました。";
  } else if (!generatedAt) {
    elements.emptyTitle.textContent = "公開イベント情報はまだ同期されていません";
    elements.emptyCopy.textContent = "初回更新後に公開記録が表示されます。現在の情報はconnpassプロフィールで確認できます。";
    elements.resultsStatus.textContent = "イベント情報の初回同期前です。";
  } else if (events.length === 0) {
    elements.emptyTitle.textContent = "公開イベント記録はありません";
    elements.emptyCopy.textContent = "同期済みのconnpass公開情報に表示できるイベントはありません。";
    elements.resultsStatus.textContent = "同期済みですが、表示できるイベント記録はありません。";
  } else if (visible.length === 0) {
    elements.emptyTitle.textContent = "一致するイベントはありません";
    elements.emptyCopy.textContent = "検索語を変えるか、活動の種類を「すべて」に戻してください。";
    elements.resultsStatus.textContent = "条件に一致するイベントはありません。";
  } else {
    elements.resultsStatus.textContent = `${visible.length.toLocaleString("ja-JP")}件を表示しています。`;
  }
}

function setCounts() {
  for (const role of Object.keys(ROLE_LABELS)) {
    elements.counts[role].textContent = events.filter((event) => event.roles.includes(role)).length.toLocaleString("ja-JP");
  }
}

function setUpdatedAt(value) {
  if (!value || Number.isNaN(Date.parse(value))) {
    elements.updatedAt.textContent = "未同期";
    return;
  }

  elements.updatedAt.dateTime = value;
  elements.updatedAt.textContent = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

async function loadEvents() {
  try {
    const response = await fetch("./data/events.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Event data request failed with status ${response.status}.`);
    const data = await response.json();
    if (!data || !Array.isArray(data.events)) throw new Error("Event data has an invalid format.");

    events = data.events.filter(isValidEvent).map((event) => ({
      ...event,
      roles: Array.isArray(event.roles) ? event.roles.filter((role) => ROLE_LABELS[role]) : [],
    })).filter((event) => event.roles.length > 0);
    generatedAt = data.generatedAt;
    setUpdatedAt(generatedAt);
    setCounts();
    render();
  } catch {
    loadFailed = true;
    setUpdatedAt(null);
    setCounts();
    render();
  }
}

for (const button of elements.filterButtons) {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    for (const item of elements.filterButtons) {
      item.setAttribute("aria-pressed", String(item === button));
    }
    render();
  });
}

elements.search.addEventListener("input", render);
elements.sortOrder.addEventListener("change", render);
setUpdatedAt(generatedAt);
loadEvents();
