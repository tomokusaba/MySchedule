import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createApiClient, fetchAllEvents, mergeEventCollections, normalizeEvent, syncConnpass } from "../scripts/sync-connpass.mjs";

const event = (overrides = {}) => ({
  id: 42,
  title: "イベント",
  catch: "公開されたイベントの紹介",
  started_at: "2026-05-01T19:00:00+09:00",
  url: "https://example.connpass.com/event/42/",
  group: { title: "技術コミュニティ" },
  place: "オンライン",
  ...overrides,
});

test("mergeEventCollections deduplicates events and preserves every public activity role", () => {
  const result = mergeEventCollections({
    attending: [event()],
    organizing: [event()],
    speaking: [],
  });

  assert.equal(result.length, 1);
  assert.deepEqual(result[0].roles, ["attending", "organizing"]);
  assert.equal(result[0].groupName, "技術コミュニティ");
});

test("normalizeEvent rejects URLs outside connpass", () => {
  assert.throws(() => normalizeEvent(event({ url: "https://example.org/not-connpass" })), /untrusted URL/);
});

test("fetchAllEvents requests every API page using the returned result count", async () => {
  const requests = [];
  const requestPage = async (_path, params) => {
    requests.push(params.start);
    return params.start === 1
      ? { results_returned: 2, results_available: 3, events: [event({ id: 1 }), event({ id: 2 })] }
      : { results_returned: 1, results_available: 3, events: [event({ id: 3 })] };
  };

  const results = await fetchAllEvents(requestPage, "events/");
  assert.deepEqual(requests, [1, 3]);
  assert.equal(results.length, 3);
});

test("createApiClient authenticates requests and reports API failures without replacing data", async () => {
  let requestOptions;
  const requestPage = createApiClient({
    apiKey: "test-secret",
    fetchImpl: async (_url, options) => {
      requestOptions = options;
      return { ok: false, status: 401 };
    },
    now: () => 0,
  });

  await assert.rejects(requestPage("events/", { count: 100, start: 1 }), /HTTP 401/);
  assert.equal(requestOptions.headers["X-API-Key"], "test-secret");
});

test("createApiClient retries rate-limited requests using Retry-After", async () => {
  let attempts = 0;
  const delays = [];
  let clock = 0;
  const requestPage = createApiClient({
    apiKey: "test-secret",
    fetchImpl: async () => {
      attempts += 1;
      return attempts === 1
        ? { ok: false, status: 429, headers: new Headers({ "Retry-After": "2" }) }
        : {
          ok: true,
          json: async () => ({ results_returned: 0, results_available: 0, events: [] }),
        };
    },
    delay: async (milliseconds) => { delays.push(milliseconds); clock += milliseconds; },
    now: () => clock,
  });

  const result = await requestPage("events/", { count: 100, start: 1 });
  assert.equal(result.results_available, 0);
  assert.equal(attempts, 2);
  assert.deepEqual(delays, [2000]);
});

test("createApiClient stops retrying after the rate-limit retry limit", async () => {
  let attempts = 0;
  const delays = [];
  let clock = 0;
  const requestPage = createApiClient({
    apiKey: "test-secret",
    fetchImpl: async () => {
      attempts += 1;
      return { ok: false, status: 429, headers: new Headers() };
    },
    delay: async (milliseconds) => { delays.push(milliseconds); clock += milliseconds; },
    now: () => clock,
  });

  await assert.rejects(requestPage("events/", { count: 100, start: 1 }), /HTTP 429/);
  assert.equal(attempts, 4);
  assert.deepEqual(delays, [5000, 10000, 20000]);
});

test("syncConnpass fetches all three activity sources and writes one merged dataset", async () => {
  const directory = await mkdtemp(join(tmpdir(), "connpass-sync-"));
  const outputPath = join(directory, "events.json");
  const paths = [];
  let clock = 0;

  try {
    const dataset = await syncConnpass({
      apiKey: "test-secret",
      outputPath,
      now: () => clock,
      delay: async (milliseconds) => { clock += milliseconds; },
      fetchImpl: async (url, options) => {
        assert.equal(options.headers["X-API-Key"], "test-secret");
        const requestUrl = new URL(url);
        paths.push(requestUrl.pathname);
        const id = requestUrl.pathname.includes("attended_events") ? 42
          : requestUrl.pathname.includes("presenter_events") ? 43
            : 44;
        return {
          ok: true,
          json: async () => ({
            results_returned: 1,
            results_available: 1,
            events: [event({ id })],
          }),
        };
      },
    });

    assert.deepEqual(paths, [
      "/api/v2/users/tomo_kusaba/attended_events/",
      "/api/v2/events/",
      "/api/v2/users/tomo_kusaba/presenter_events/",
    ]);
    assert.deepEqual(dataset.events.map((item) => item.roles), [["attending"], ["organizing"], ["speaking"]]);
    assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), dataset);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("syncConnpass leaves the last good dataset untouched when the API fails", async () => {
  const directory = await mkdtemp(join(tmpdir(), "connpass-sync-"));
  const outputPath = join(directory, "events.json");
  const previousData = '{"generatedAt":"previous"}\n';

  try {
    await writeFile(outputPath, previousData, "utf8");
    await assert.rejects(syncConnpass({
      apiKey: "test-secret",
      outputPath,
      fetchImpl: async () => ({ ok: false, status: 503 }),
      delay: async () => {},
      now: () => 0,
    }), /HTTP 503/);
    assert.equal(await readFile(outputPath, "utf8"), previousData);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
