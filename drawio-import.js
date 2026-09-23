/*
 * draw.io (diagrams.net) import for the CPM app.
 *
 * Adds an "Import draw.io" button to the Projects page. Given an uncompressed
 * .drawio / .xml file, each graph vertex is read as an activity and each edge as
 * a dependency, and a new project is written straight into the app's IndexedDB
 * (database "cpm-db"), which is the same store the app reads from.
 *
 * Expected node text (one value per vertex, lines separated by newlines):
 *     ID: A
 *     Aktivita: <name>          <- 2nd line: activity name (label prefix optional)
 *     Odhad: 10 dní             <- 3rd line: must contain the number of days
 * A vertex is treated as an activity only when its third line contains a number;
 * plain text boxes (draw.io style "text;...") and legend/notes are ignored.
 * Edges (source -> target) become predecessor -> successor dependencies.
 *
 * This never touches the app bundle; it only reads a file the user picks and
 * writes records the app already understands.
 */
(function () {
  "use strict";

  var DB_NAME = "cpm-db";
  var STORES = ["projects", "activities", "dependencies"];

  function uid(seed) {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return (seed || "id") + "-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  // ---- Parsing -------------------------------------------------------------

  function parse(xmlText) {
    var doc = new DOMParser().parseFromString(xmlText, "application/xml");
    if (doc.querySelector("parsererror")) {
      throw new Error("Soubor se nepodařilo načíst jako XML.");
    }
    var model = doc.querySelector("mxGraphModel");
    if (!model) {
      throw new Error(
        "Diagram je uložený v komprimované podobě. V draw.io prosím uložte " +
        "soubor jako nekomprimovaný (.drawio/.xml bez volby „Compressed“) a zkuste to znovu."
      );
    }
    var diagram = doc.querySelector("diagram");
    var name = (diagram && diagram.getAttribute("name")) || "";

    var cells = [].slice.call(model.querySelectorAll("mxCell"));
    var activities = [];
    var deps = [];

    cells.forEach(function (c) {
      var style = c.getAttribute("style") || "";
      var value = c.getAttribute("value") || "";
      if (c.getAttribute("vertex") === "1") {
        // Skip plain text/label shapes.
        if (/(^|;)\s*text\s*;/.test(style)) return;
        var lines = value.split(/\r?\n/).map(function (s) { return s.trim(); })
          .filter(function (s) { return s.length; });
        if (lines.length < 3) return;
        var durMatch = (lines[2] || "").match(/-?\d+(?:[.,]\d+)?/);
        if (!durMatch) return; // 3rd line has no number -> not an activity
        var dur = parseFloat(durMatch[0].replace(",", "."));
        if (!isFinite(dur) || dur < 0) dur = 0;
        var nameLine = lines[1] || lines[0];
        // Strip a short leading label like "Aktivita:" / "Activity:" / "Name:".
        var nm = nameLine.replace(/^[^:]{1,24}:\s*/, "").trim() || nameLine;
        activities.push({
          cellId: c.getAttribute("id"),
          name: nm,
          durationDays: dur,
          description: ""
        });
      } else if (c.getAttribute("edge") === "1") {
        var s = c.getAttribute("source");
        var t = c.getAttribute("target");
        if (s && t) deps.push({ source: s, target: t });
      }
    });

    var known = {};
    activities.forEach(function (a) { known[a.cellId] = true; });
    // Keep only edges whose both endpoints are activities; drop duplicates.
    var seen = {};
    deps = deps.filter(function (d) {
      if (!known[d.source] || !known[d.target] || d.source === d.target) return false;
      var k = d.source + ">" + d.target;
      if (seen[k]) return false;
      seen[k] = true;
      return true;
    });

    return { name: name, activities: activities, deps: deps };
  }

  // ---- IndexedDB write -----------------------------------------------------

  function openDb() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open(DB_NAME);
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }

  function writeAll(project, activities, dependencies) {
    return openDb().then(function (db) {
      for (var i = 0; i < STORES.length; i++) {
        if (!db.objectStoreNames.contains(STORES[i])) {
          db.close();
          throw new Error(
            "Úložiště aplikace zatím není připravené. Otevřete nejdřív stránku " +
            "se seznamem projektů a zkuste to znovu."
          );
        }
      }
      return new Promise(function (res, rej) {
        var tx = db.transaction(STORES, "readwrite");
        tx.oncomplete = function () { db.close(); res(); };
        tx.onerror = function () { rej(tx.error); };
        tx.onabort = function () { rej(tx.error || new Error("Zápis do databáze se nezdařil.")); };
        tx.objectStore("projects").put(project);
        var as = tx.objectStore("activities");
        activities.forEach(function (a) { as.put(a); });
        var ds = tx.objectStore("dependencies");
        dependencies.forEach(function (d) { ds.put(d); });
      });
    });
  }

  // Parse + persist. Returns a Promise of {projectId, activityCount, depCount}.
  function importXml(xmlText, fallbackName) {
    var parsed = parse(xmlText);
    if (!parsed.activities.length) {
      return Promise.reject(new Error(
        "V diagramu nebyly nalezeny žádné aktivity. Každý uzel musí mít alespoň " +
        "tři řádky, přičemž třetí řádek obsahuje počet dní (např. „Odhad: 10 dní“)."
      ));
    }
    var projectId = uid("project");
    var today = new Date().toISOString().slice(0, 10);
    var idMap = {};
    var activityRecords = parsed.activities.map(function (a) {
      var id = uid("act");
      idMap[a.cellId] = id;
      return {
        id: id,
        projectId: projectId,
        name: a.name || a.cellId,
        description: a.description || "",
        durationDays: a.durationDays
      };
    });
    var depRecords = parsed.deps.map(function (d) {
      var p = idMap[d.source], s = idMap[d.target];
      return { id: p + "->" + s, projectId: projectId, predecessorId: p, successorId: s, lagDays: 0 };
    }).filter(function (d) { return d.predecessorId && d.successorId; });

    var project = {
      id: projectId,
      name: parsed.name || fallbackName || "Importovaný diagram",
      description: "",
      startDate: today,
      createdAt: new Date().toISOString()
    };

    return writeAll(project, activityRecords, depRecords).then(function () {
      return { projectId: projectId, activityCount: activityRecords.length, depCount: depRecords.length };
    });
  }

  // ---- UI ------------------------------------------------------------------

  function appBase() {
    var b = window.__CPM_BASE__;
    return (b && b !== "/") ? b : "";
  }

  // Navigate to the imported project. Use client-side routing (so it also works
  // on static hosts that serve index.html directly at nested paths); fall back
  // to a full load if the SPA router doesn't pick it up.
  function goToProject(projectId) {
    var url = appBase() + "/projects/" + projectId;
    try {
      window.history.pushState({}, "", url);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (e) {
      window.location.href = url;
    }
  }

  function fileInput() {
    var inp = document.getElementById("cpm-drawio-input");
    if (inp) return inp;
    inp = document.createElement("input");
    inp.type = "file";
    inp.id = "cpm-drawio-input";
    inp.accept = ".drawio,.xml,application/xml,text/xml";
    inp.style.display = "none";
    inp.addEventListener("change", function () {
      var file = inp.files && inp.files[0];
      inp.value = ""; // allow re-selecting the same file later
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var fallback = file.name.replace(/\.(drawio|xml)$/i, "");
        Promise.resolve()
          .then(function () { return importXml(String(reader.result), fallback); })
          .then(function (r) { goToProject(r.projectId); })
          .catch(function (err) {
            window.alert("Import z draw.io se nezdařil:\n\n" + (err && err.message ? err.message : err));
          });
      };
      reader.onerror = function () { window.alert("Soubor se nepodařilo přečíst."); };
      reader.readAsText(file);
    });
    document.body.appendChild(inp);
    return inp;
  }

  function ensureButton() {
    // Find the existing "Import"/"Importovat" button in the projects toolbar.
    var ref = null;
    var btns = document.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var t = (btns[i].textContent || "").trim();
      if (t === "Importovat" || t === "Import") { ref = btns[i]; break; }
    }
    if (!ref || !ref.parentElement) return;
    if (ref.parentElement.querySelector("[data-cpm-drawio]")) return; // already added

    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("data-cpm-drawio", "");
    b.setAttribute("data-no-i18n", ""); // keep the Czech overlay from touching it
    b.textContent = "Importovat draw.io";
    b.title = "Importovat aktivity a vazby z draw.io diagramu";
    if (ref.style && ref.style.cssText) b.style.cssText = ref.style.cssText;
    b.addEventListener("click", function () { fileInput().click(); });
    ref.parentElement.insertBefore(b, ref.nextSibling);
  }

  function start() {
    ensureButton();
    var obs = new MutationObserver(function () { ensureButton(); });
    obs.observe(document.documentElement, { subtree: true, childList: true });
    var n = 0;
    var iv = setInterval(function () { ensureButton(); if (++n >= 10) clearInterval(iv); }, 200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  // Exposed for testing / programmatic use.
  window.CPMDrawioImport = { parse: parse, importXml: importXml };
})();
