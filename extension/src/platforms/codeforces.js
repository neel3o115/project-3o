// extension/src/platforms/codeforces.js

(function () {
  function parseCodeforcesProblemUrl(url) {
    // group contest:
    // /group/<groupId>/contest/<contestId>/problem/<index>
    let m = url.match(/\/group\/([^/]+)\/contest\/(\d+)\/problem\/([A-Z0-9]+)/i);
    if (m) {
      return {
        type: "group",
        groupId: m[1],
        contestId: m[2],
        index: m[3].toUpperCase(),
      };
    }

    // contest:
    // /contest/<contestId>/problem/<index>
    m = url.match(/\/contest\/(\d+)\/problem\/([A-Z0-9]+)/i);
    if (m) {
      return {
        type: "contest",
        contestId: m[1],
        index: m[2].toUpperCase(),
      };
    }

    // problemset:
    // /problemset/problem/<contestId>/<index>
    m = url.match(/\/problemset\/problem\/(\d+)\/([A-Z0-9]+)/i);
    if (m) {
      return {
        type: "problemset",
        contestId: m[1],
        index: m[2].toUpperCase(),
      };
    }

    // gym:
    // /gym/<gymId>/problem/<index>
    m = url.match(/\/gym\/(\d+)\/problem\/([A-Z0-9]+)/i);
    if (m) {
      return {
        type: "gym",
        gymId: m[1],
        index: m[2].toUpperCase(),
      };
    }

    return null;
  }

  function buildProblemKey(parsed) {
    if (!parsed) return null;

    if (parsed.type === "contest") {
      return `codeforces:contest:${parsed.contestId}:${parsed.index}`;
    }

    if (parsed.type === "problemset") {
      return `codeforces:problemset:${parsed.contestId}:${parsed.index}`;
    }

    if (parsed.type === "gym") {
      return `codeforces:gym:${parsed.gymId}:${parsed.index}`;
    }

    if (parsed.type === "group") {
      return `codeforces:group:${parsed.groupId}:contest:${parsed.contestId}:${parsed.index}`;
    }

    return null;
  }

  function getCodeforcesTitle() {
    const el = document.querySelector(".problem-statement .title");
    const raw = el?.innerText?.trim() || "Unknown Problem";
    // Example raw: "A. Too Min Too Max"
    return raw.replace(/^[A-Z0-9]+\.\s*/, "").trim();
  }

  // Main extractor
  function getCodeforcesProblemData() {
    const url = window.location.href;
    const parsed = parseCodeforcesProblemUrl(url);
    if (!parsed) return null;

    return {
      platform: "codeforces",
      problemKey: buildProblemKey(parsed),
      title: getCodeforcesTitle(),
      url,
      meta: parsed,
    };
  }

  // expose globally for content.js
  window.Project3O = window.Project3O || {};
  window.Project3O.getCodeforcesProblemData = getCodeforcesProblemData;
})();
