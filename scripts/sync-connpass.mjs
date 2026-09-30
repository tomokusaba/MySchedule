import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const API_ROOT = "https://connpass.com/api/v2/";
const NICKNAME = "tomo_kusaba";
const PAGE_SIZE = 100;
const MIN_REQUEST_INTERVAL_MS = 1100;
const OUTPUT_PATH = resolve("public/data/events.json");
const PROFILE_URL = `https://connpass.com/user/${NICKNAME}/`;
const ROLE_KEYS = ["attending", "organizing", "speaking"];

function wait(milliseconds) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
}

export function normalizeEvent(event) {
  if (!event || !Number.isSafeInteger(event.id) || typeof event.title !== "string" || !event.title.trim()) {
    throw new Error("Connpass returned an event without a valid id or title.");
  }

  let url;
  try {
    url = new URL(event.url);
  } catch {
    throw new Error(`Connpass returned an invalid URL for event ${event.id}.`);
  }

  if ((url.protocol !== "https:" && url.protocol !== "http:")
    || (url.hostname !== "connpass.com" && !url.hostname.endsWith(".connpass.com"))) {
    throw new Error(`Connpass returned an untrusted URL for event ${event.id}.`);
  }

  if (event.started_at !== null && event.started_at !== undefined && Number.isNaN(Date.parse(event.started_at))) {
    throw new Error(`Connpass returned an invalid event date for event ${event.id}.`);
  }

  return {
    id: event.id,
    title: event.title.trim(),
    catch: typeof event.catch === "string" ? event.catch.trim() : "",
    startedAt: event.started_at ?? null,
    url: url.href,
    groupName: typeof event.group?.title === "string" ? event.group.title.trim() : "",
    place: typeof event.place === "string" ? event.place.trim() : "",
    roles: [],
  };
}

export function mergeEventCollections(collections) {
  const byId = new Map();

  for (const [role, sourceEvents] of Object.entries(collections)) {
    if (!ROLE_KEYS.includes(role) || !Array.isArray(sourceEvents)) {
      throw new Error(`Unexpected event collection: ${role}.`);
    }

    for (const sourceEvent of sourceEvents) {
      const event = normalizeEvent(sourceEvent);
      const existing = byId.get(event.id);
      if (existing) {
        for (const key of ["title", "catch", "startedAt", "url", "groupName", "place"]) {
          if (existing[key] !== event[key] && event[key]) {
            throw new Error(`Conflicting Connpass data for event ${event.id}.`);
          }
        }
        existing.roles.push(role);
      } else {
        event.roles.push(role);
        byId.set(event.id, event);
      }
    }
  }

  return [...byId.values()]
    .map((event) => ({ ...event, roles: ROLE_KEYS.filter((role) => event.roles.includes(role)) }))
    .sort((left, right) => {
      const leftDate = Date.parse(left.startedAt ?? "");
      const rightDate = Date.parse(right.startedAt ?? "");
      if (Number.isNaN(leftDate) && Number.isNaN(rightDate)) return left.title.localeCompare(right.title, "ja");
      if (Number.isNaN(leftDate)) return 1;
      if (Number.isNaN(rightDate)) return -1;
      return rightDate - leftDate;
    });
}

export function createApiClient({ apiKey, fetchImpl = fetch, delay = wait, now = Date.now }) {
  if (!apiKey || !apiKey.trim()) throw new Error("CONNPASS_API_KEY is required to refresh event data.");
  let nextRequestAt = 0;

  return async function requestPage(path, params) {
    const waitFor = Math.max(0, nextRequestAt - now());
    if (waitFor) await delay(waitFor);

    const url = new URL(path, API_ROOT);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
    const requestStartedAt = now();
    nextRequestAt = requestStartedAt + MIN_REQUEST_INTERVAL_MS;

    let response;
    try {
      response = await fetchImpl(url, {
        headers: {
          Accept: "application/json",
          "X-API-Key": apiKey,
        },
        signal: AbortSignal.timeout(30000),
      });
    } catch {
      throw new Error(`Unable to reach the Connpass API endpoint ${path}; the existing data was not replaced.`);
    }

    if (!response.ok) {
      throw new Error(`Connpass API returned HTTP ${response.status} for ${path}; the existing data was not replaced.`);
    }

    let page;
    try {
      page = await response.json();
    } catch {
      throw new Error(`Connpass API returned invalid JSON for ${path}; the existing data was not replaced.`);
    }

    if (!page || !Array.isArray(page.events)
      || !Number.isInteger(page.results_returned)
      || !Number.isInteger(page.results_available)) {
      throw new Error(`Connpass API returned an unexpected response for ${path}; the existing data was not replaced.`);
    }

    if (page.results_returned !== page.events.length) {
      throw new Error(`Connpass API returned an inconsistent result count for ${path}; the existing data was not replaced.`);
    }
    return page;
  };
}

export async function fetchAllEvents(requestPage, path, query = {}) {
  let start = 1;
  let available = Infinity;
  const result = [];

  while (start <= available) {
    const page = await requestPage(path, { ...query, count: PAGE_SIZE, start });
    if (page.events.length === 0 && start <= page.results_available) {
      throw new Error(`Connpass returned no events before the end of ${path}; the existing data was not replaced.`);
    }

    result.push(...page.events);
    available = page.results_available;
    if (page.events.length === 0) break;
    start += page.events.length;
  }

  return result;
}

async function writeDataset(dataset, outputPath = OUTPUT_PATH) {
  await mkdir(dirname(outputPath), { recursive: true });
  const tempPath = `${outputPath}.tmp`;
  try {
    await writeFile(tempPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
    await rename(tempPath, outputPath);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

export async function syncConnpass({ apiKey, outputPath = OUTPUT_PATH, fetchImpl = fetch, delay = wait, now = Date.now }) {
  const requestPage = createApiClient({ apiKey, fetchImpl, delay, now });
  const collections = {
    attending: await fetchAllEvents(requestPage, `users/${NICKNAME}/attended_events/`),
    organizing: await fetchAllEvents(requestPage, "events/", { owner_nickname: NICKNAME }),
    speaking: await fetchAllEvents(requestPage, `users/${NICKNAME}/presenter_events/`),
  };
  const dataset = {
    schemaVersion: 1,
    profile: { nickname: NICKNAME, url: PROFILE_URL },
    generatedAt: new Date(now()).toISOString(),
    events: mergeEventCollections(collections),
  };

  await writeDataset(dataset, outputPath);
  return dataset;
}

async function main() {
  await syncConnpass({ apiKey: process.env.CONNPASS_API_KEY });
  console.log(`Updated ${OUTPUT_PATH} from the Connpass API.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`Connpass data refresh failed: ${error.message}`);
    process.exitCode = 1;
  });
}
