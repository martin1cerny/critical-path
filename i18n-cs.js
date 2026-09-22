/*
 * Czech localization overlay for CPM — Critical Path Analysis Tool.
 * Translates rendered UI text and selected attributes to Czech at runtime,
 * without modifying the app's internal logic strings (type tags, storage
 * keys, error codes). Applied via a MutationObserver so it survives
 * re-renders and navigation.
 *
 * NOTE: This only affects what is shown in the DOM. Content written into the
 * exported .xlsx file is generated in JS from English literals and is not
 * covered here.
 */

/*
 * Base-path auto-detection for hosting under a subdirectory (e.g. GitHub Pages
 * project sites like https://user.github.io/critical-path/). This runs as a
 * classic script BEFORE the deferred app module, and sets window.__CPM_BASE__,
 * which the patched React Router reads as its `basename`. Derived from this
 * script's own URL, so it works at the domain root and at any subpath with no
 * hardcoding.
 */
(function () {
  try {
    var el = document.currentScript;
    var src = el && el.src;
    if (src) {
      var dir = new URL(".", src).pathname; // e.g. "/critical-path/" or "/"
      var base = dir.replace(/\/+$/, ""); // React Router basename: no trailing slash
      window.__CPM_BASE__ = base || "/";
    } else {
      window.__CPM_BASE__ = "/";
    }
  } catch (e) {
    window.__CPM_BASE__ = "/";
  }
})();

(function () {
  "use strict";

  // Czech plural forms: [n==1, n in 2..4, else (incl. 0)].
  var PLURAL = {
    den: ["den", "dny", "dní"],
    cinnost: ["činnost", "činnosti", "činností"],
    zavislost: ["závislost", "závislosti", "závislostí"],
    projekt: ["projekt", "projekty", "projektů"]
  };
  function pl(n, key) {
    var f = PLURAL[key];
    n = Math.abs(n);
    if (n === 1) return f[0];
    if (n >= 2 && n <= 4) return f[1];
    return f[2];
  }

  var MONTHS = {
    Jan: "led", Feb: "úno", Mar: "bře", Apr: "dub", May: "kvě", Jun: "čvn",
    Jul: "čvc", Aug: "srp", Sep: "zář", Sept: "zář", Oct: "říj", Nov: "lis", Dec: "pro"
  };

  // Exact-match dictionary. Keys must match the rendered text exactly
  // (leading/trailing whitespace is handled separately by the engine).
  var DICT = {
    // ---- Landing page ----
    "Critical Path Analysis — In Your Browser": "Analýza kritické cesty — přímo v prohlížeči",
    "The Critical Path Method (CPM) identifies the longest sequence of dependent tasks in your project, revealing which activities drive the schedule and where you have float to absorb delays.": "Metoda kritické cesty (CPM) určí nejdelší sled navazujících činností ve vašem projektu a odhalí, které činnosti řídí harmonogram a kde máte rezervu na pokrytí zpoždění.",
    "Get Started": "Začít",
    "What You Can Do": "Co dokážete",
    "How It Works": "Jak to funguje",
    "Your Data Stays in Your Browser": "Vaše data zůstávají ve vašem prohlížeči",
    "Use ": "Použijte ",
    "JSON export": "export do JSON",
    " to back up projects or transfer them between machines.": " k zálohování projektů nebo jejich přenosu mezi počítači.",
    "Ready to plan your project?": "Připraveni naplánovat svůj projekt?",
    "Network Diagram": "Síťový diagram",
    "Visualize activity dependencies as an interactive graph you can rearrange by dragging nodes.": "Zobrazte závislosti činností jako interaktivní graf, který můžete přeuspořádat tažením uzlů.",
    "Gantt Chart": "Ganttův diagram",
    "Timeline view with critical-path highlighting, float bars, and milestone markers.": "Časová osa se zvýrazněním kritické cesty, pruhy rezerv a značkami milníků.",
    "Resource Scheduling": "Plánování zdrojů",
    "FTE-constrained scheduling with utilization histograms and overallocation detection.": "Plánování omezené kapacitou FTE s histogramy využití a detekcí přetížení.",
    "What-If Analysis": "Analýza co když",
    "Instantly see how changing a duration or adding a dependency affects the entire schedule.": "Okamžitě uvidíte, jak změna trvání nebo přidání závislosti ovlivní celý harmonogram.",
    "Excel Export": "Export do Excelu",
    "Download professional Gantt charts and schedule tables as formatted .xlsx workbooks.": "Stáhněte profesionální Ganttovy diagramy a tabulky harmonogramu jako formátované sešity .xlsx.",
    "Dependency Management": "Správa závislostí",
    "Drag-to-connect activities, fuzzy search predecessors, and set lag days between tasks.": "Propojujte činnosti tažením, vyhledávejte předchůdce a nastavujte dny prodlevy mezi úkoly.",
    "Create a project": "Vytvořte projekt",
    "Start from scratch or load the built-in demo template to explore CPM concepts immediately.": "Začněte od nuly nebo načtěte vestavěnou ukázkovou šablonu a hned prozkoumejte principy CPM.",
    "Add activities & connect dependencies": "Přidejte činnosti a propojte závislosti",
    "Define tasks with durations, then link them with finish-to-start dependencies and optional lag.": "Definujte úkoly s trváním a propojte je závislostmi typu konec–začátek s volitelnou prodlevou.",
    "View CPM results": "Zobrazte výsledky CPM",
    "See the critical path, total float, Gantt chart, and network diagram — all computed instantly.": "Prohlédněte si kritickou cestu, celkovou rezervu, Ganttův diagram a síťový diagram — vše spočítané okamžitě.",
    "All project data is stored locally in your browser using IndexedDB. Nothing is sent to a server — your schedules won't appear on other browsers or devices.": "Všechna data projektů se ukládají lokálně ve vašem prohlížeči pomocí IndexedDB. Nic se neodesílá na server — vaše harmonogramy se neobjeví v jiných prohlížečích ani na jiných zařízeních.",

    // ---- Brand / global ----
    "Critical Path": "Kritická cesta",
    "CPM App": "Aplikace CPM",
    "Something went wrong": "Něco se pokazilo",
    "An unexpected error occurred": "Došlo k neočekávané chybě",
    "Try Again": "Zkusit znovu",
    "Go to Projects": "Přejít na projekty",
    "Unknown error": "Neznámá chyba",
    "Network error": "Chyba sítě",
    "Authentication expired": "Platnost přihlášení vypršela",

    // ---- Projects list ----
    "Projects": "Projekty",
    "New Project": "Nový projekt",
    "Import": "Importovat",
    "Search projects...": "Hledat projekty…",
    "Clear search": "Vymazat hledání",
    "No matching projects": "Žádné odpovídající projekty",
    "No projects yet": "Zatím žádné projekty",
    "Create your first project to start planning with critical path analysis.": "Vytvořte svůj první projekt a začněte plánovat pomocí analýzy kritické cesty.",
    "Create Your First Project": "Vytvořit první projekt",
    "Loading projects...": "Načítání projektů…",
    "Failed to load projects:": "Nepodařilo se načíst projekty:",
    "Failed to import project:": "Nepodařilo se importovat projekt:",
    "Invalid JSON file. Please select a valid project export file.": "Neplatný soubor JSON. Vyberte platný exportovaný soubor projektu.",
    "Name": "Název",
    "Activities": "Činnosti",
    "Progress": "Postup",
    "Created": "Vytvořeno",

    // ---- Create / edit project ----
    "Create Project": "Vytvořit projekt",
    "Set up a new project for critical path planning": "Nastavte nový projekt pro plánování kritické cesty",
    "Update your project details": "Upravte údaje projektu",
    "Start from": "Začít z",
    "Blank Project": "Prázdný projekt",
    "Start fresh with an empty project": "Začněte s prázdným projektem",
    "50 activities, 64 dependencies — full demo": "50 činností, 64 závislostí — plná ukázka",
    "Project Name": "Název projektu",
    "Choose a clear name that describes this project": "Zvolte srozumitelný název, který projekt vystihuje",
    "e.g., Website Redesign, Product Launch": "např. Redesign webu, Uvedení produktu",
    "Description": "Popis",
    "(optional)": "(nepovinné)",
    "What is this project about?": "O čem tento projekt je?",
    "Help team members understand the project scope and goals": "Pomozte členům týmu pochopit rozsah a cíle projektu",
    "Start Date": "Datum zahájení",
    "Day 1 of the project schedule begins on this date": "Den 1 harmonogramu projektu začíná tímto datem",
    "Cancel": "Zrušit",
    "Back to Projects": "Zpět na projekty",
    "Back to Project": "Zpět na projekt",
    "Project name is required.": "Název projektu je povinný.",
    "Project name is required": "Název projektu je povinný",
    "Start date is required": "Datum zahájení je povinné",
    "Start date must be between 1900 and 2100": "Datum zahájení musí být mezi roky 1900 a 2100",
    "Failed to save project:": "Nepodařilo se uložit projekt:",

    // ---- Editor header / stats ----
    "← Projects": "← Projekty",
    "← Back to Projects": "← Zpět na projekty",
    "Duration": "Trvání",
    "Team Size": "Velikost týmu",
    "Scheduled": "Naplánováno",
    "Utilization": "Využití",
    "Delayed": "Zpožděno",
    "Network": "Síť",
    "Gantt": "Gantt",
    "Add Activity": "Přidat činnost",

    // ---- Network view ----
    "No activities yet": "Zatím žádné činnosti",
    "Add activities to build your project network": "Přidejte činnosti a vytvořte síť projektu",
    "+ Add First Activity": "+ Přidat první činnost",
    "CRITICAL": "KRITICKÁ",
    "Zoom In": "Přiblížit",
    "Zoom Out": "Oddálit",
    "Fit to View": "Přizpůsobit zobrazení",
    "Zoom in": "Přiblížit",
    "Zoom out": "Oddálit",
    "Reset zoom": "Obnovit přiblížení",
    "Drag handle to connect | Click arrow to delete | Scroll to zoom | Drag to pan": "Táhněte za úchyt pro spojení | Klikněte na šipku pro smazání | Kolečkem přiblížíte | Tažením posunete",
    "activities": "činností",
    "dependencies": "závislostí",

    // ---- Gantt view ----
    "Reset": "Obnovit",
    "Resources ON": "Zdroje ZAP",
    "Resources OFF": "Zdroje VYP",
    "Resources ": "Zdroje ",
    "Resources": "Zdroje",
    "ON": "ZAP",
    "OFF": "VYP",
    "Excel": "Excel",
    "Critical": "Kritická",
    "Normal": "Normální",
    "Delay": "Zpoždění",
    "Activity": "Činnost",
    "FTE Usage": "Využití FTE",
    "Export Gantt chart to Excel": "Exportovat Ganttův diagram do Excelu",
    "Hide resource schedule": "Skrýt rozvrh zdrojů",
    "Show resource schedule": "Zobrazit rozvrh zdrojů",
    "Duration: ": "Trvání: ",
    "CPM: Day ": "CPM: Den ",
    " - Day ": " – Den ",
    "CRITICAL PATH": "KRITICKÁ CESTA",
    "Scheduled: Day ": "Naplánováno: Den ",
    "Resource Delay: +": "Zpoždění zdroji: +",
    "Day ": "Den ",

    // ---- Add / edit activity ----
    "New Activity": "Nová činnost",
    "Edit Activity": "Upravit činnost",
    "Close modal": "Zavřít okno",
    "Name ": "Název ",
    "Activity name": "Název činnosti",
    "Activity name is required": "Název činnosti je povinný",
    "Duration (days) ": "Trvání (dny) ",
    "Duration (days)": "Trvání (dny)",
    "Duration must be a number of days": "Trvání musí být počet dní",
    "Optional description...": "Nepovinný popis…",
    "Float": "Rezerva",
    "Critical Path": "Kritická cesta",
    "Early Start": "Nejdřívější začátek",
    "Early Finish": "Nejdřívější konec",
    "Late Start": "Nejpozdější začátek",
    "Late Finish": "Nejpozdější konec",
    "Predecessors": "Předchůdci",
    "Successors": "Následníci",
    "+ Add": "+ Přidat",
    "+ Add Another": "+ Přidat další",
    "No predecessors (starts immediately)": "Bez předchůdců (začíná ihned)",
    "Search activities...": "Hledat činnosti…",
    "Search activities": "Hledat činnosti",
    "Lag days (optional)": "Dny prodlevy (nepovinné)",
    "Remove dependency": "Odebrat závislost",
    "Delete Activity": "Smazat činnost",
    "Create Activity": "Vytvořit činnost",
    "Save Changes": "Uložit změny",
    "Activity Created": "Činnost vytvořena",
    "Failed to save activity:": "Nepodařilo se uložit činnost:",
    "Failed to delete activity:": "Nepodařilo se smazat činnost:",
    "Failed to add dependency:": "Nepodařilo se přidat závislost:",
    "Failed to remove dependency:": "Nepodařilo se odebrat závislost:",
    "Failed to delete dependency": "Nepodařilo se smazat závislost",
    "Cannot create self-dependency": "Nelze vytvořit závislost na sebe sama",
    "Dependency already exists": "Závislost už existuje",
    "This connection would create a cycle or is redundant": "Toto propojení by vytvořilo cyklus nebo je nadbytečné",
    "Activity not found": "Činnost nenalezena",
    "Dependency not found": "Závislost nenalezena",
    "Project not found": "Projekt nenalezen",
    "Activity name must not be empty": "Název činnosti nesmí být prázdný",
    "Activity duration must not be negative": "Trvání činnosti nesmí být záporné",

    // ---- What-if panel ----
    "Modify durations to see instant schedule impact": "Upravte trvání a uvidíte okamžitý dopad na harmonogram",
    "Reset All": "Obnovit vše",
    "Original Duration": "Původní trvání",
    "Modified Duration": "Upravené trvání",
    "Changes (": "Změny (",
    "Reset to original": "Obnovit na původní",
    "Adjust Durations": "Upravit trvání",
    "Show only critical activities and ones you have already changed": "Zobrazit jen kritické činnosti a ty, které jste již změnili",
    "Critical + changed": "Kritické + změněné",
    "No activities match this filter.": "Tomuto filtru neodpovídají žádné činnosti.",
    "Could not apply changes.": "Změny se nepodařilo použít.",
    " Your changes are still here — try again.": " Vaše změny jsou stále zde — zkuste to znovu.",

    // ---- Project view menu / errors ----
    "Export JSON": "Exportovat JSON",
    "Export Project": "Exportovat projekt",
    "Edit Project": "Upravit projekt",
    "Delete Project": "Smazat projekt",
    "Export project data": "Exportovat data projektu",
    "Team Size ": "Velikost týmu ",
    "Failed to open project:": "Nepodařilo se otevřít projekt:",
    "Failed to load project": "Nepodařilo se načíst projekt",
    "Failed to load project:": "Nepodařilo se načíst projekt:",
    "Schedule computation failed": "Výpočet harmonogramu selhal",
    "Could not compute the schedule": "Harmonogram nelze vypočítat",
    "Error loading project": "Chyba při načítání projektu",
    "Loading project...": "Načítání projektu…",
    "This project does not exist or has been deleted.": "Tento projekt neexistuje nebo byl smazán.",
    "Failed to delete project:": "Nepodařilo se smazat projekt:",
    "Failed to export project:": "Nepodařilo se exportovat projekt:",
    "Failed to export Excel:": "Nepodařilo se exportovat Excel:",
    "Failed to export Excel file": "Nepodařilo se exportovat soubor Excel",
    "Invalid dependency ID format:": "Neplatný formát ID závislosti:",
    "Failed to create dependency": "Nepodařilo se vytvořit závislost",
    "Invalid dependency ID": "Neplatné ID závislosti",
    "CPM computation failed:": "Výpočet CPM selhal:",
    "Original CPM computation failed:": "Výpočet původního CPM selhal:",
    "Modified CPM computation failed:": "Výpočet upraveného CPM selhal:",

    // ---- Import validation ----
    "Invalid file: expected a JSON object.": "Neplatný soubor: očekáván objekt JSON.",
    "Invalid file format. Expected a Critical Path project file.": "Neplatný formát souboru. Očekáván soubor projektu Critical Path.",
    "Missing project data.": "Chybí data projektu.",
    "Missing or invalid activities list.": "Chybí nebo je neplatný seznam činností.",
    "Project must have at least one activity.": "Projekt musí mít alespoň jednu činnost.",
    "Missing or invalid dependencies list.": "Chybí nebo je neplatný seznam závislostí.",
    "FTE must be at least 1": "FTE musí být alespoň 1",

    // ---- Wallet sync (secondary feature) ----
    "Sign in to Critical Path with your Ethereum wallet.": "Přihlaste se do Critical Path pomocí své Ethereum peněženky.",
    "Session initiation failed": "Zahájení relace selhalo",
    "Authentication failed": "Ověření selhalo",
    "Authentication failed. Try again.": "Ověření selhalo. Zkuste to znovu.",
    "MetaMask not installed": "MetaMask není nainstalován",
    "Contract query failed:": "Dotaz na kontrakt selhal:",
    "Backend not available. Try again later.": "Backend není dostupný. Zkuste to později.",
    "Connection failed": "Připojení selhalo",
    "User rejected": "Uživatel odmítl",
    "Checking access...": "Kontrola přístupu…",
    "Sign message...": "Podepsat zprávu…",
    "Connect Wallet": "Připojit peněženku",
    "Click to disconnect": "Kliknutím odpojíte",
    "Local mode — no sync credits": "Místní režim — bez kreditů na synchronizaci",
    "Sync Local Projects?": "Synchronizovat místní projekty?",
    "You have ": "Máte ",
    " local project": " místní projekt",
    " local projects": " místních projektů",
    " on this device. Would you like to sync them to your wallet for cross-device access?": " na tomto zařízení. Chcete je synchronizovat do peněženky pro přístup napříč zařízeními?",
    "Sync All": "Synchronizovat vše",
    "Syncing Projects...": "Synchronizace projektů…",
    " synced successfully.": " úspěšně synchronizováno.",
    "Migration Complete": "Migrace dokončena",
    "Migration Partial": "Migrace částečná",

    // ---- Excel/report labels that also appear in the DOM ----
    "Task Name": "Název úkolu",
    "Float (Slack)": "Rezerva",
    "Float (days)": "Rezerva (dny)",
    "Project Duration (days)": "Trvání projektu (dny)",
    "Total Activities": "Celkem činností",
    "Total Dependencies": "Celkem závislostí",
    "Critical Path Activities": "Činnosti kritické cesty",
    "Critical Path Length": "Délka kritické cesty",
    "Average Float (days)": "Průměrná rezerva (dny)",
    "Resource Schedule": "Rozvrh zdrojů",
    "FTE (Team Size)": "FTE (velikost týmu)",
    "Scheduled Duration (days)": "Naplánované trvání (dny)",
    "Duration Increase (days)": "Nárůst trvání (dny)",
    "Avg Utilization (%)": "Prům. využití (%)",
    "Activities Delayed": "Zpožděné činnosti",
    "Avg Resource Delay (days)": "Prům. zpoždění zdroji (dny)",
    "Max Resource Delay (days)": "Max. zpoždění zdroji (dny)",
    "Lag (days)": "Prodleva (dny)",

    // ---- Generic single-word actions ----
    "Delete": "Smazat",
    "Save": "Uložit",

    // ---- Demo template: project ----
    "Mobile App Launch": "Spuštění mobilní aplikace",
    "Demo: Mobile App Launch": "Demo: Spuštění mobilní aplikace",
    "Cross-platform mobile app development with backend API, demonstrating parallel work streams and realistic CPM scheduling.": "Vývoj multiplatformní mobilní aplikace s backendovým API, demonstrující paralelní pracovní toky a realistické plánování CPM.",

    // ---- Demo template: activities (name + description) ----
    "Project Kickoff": "Zahájení projektu",
    "Team assembly, goals alignment, and project charter": "Sestavení týmu, sladění cílů a zakládací listina projektu",
    "Requirements Workshop": "Workshop požadavků",
    "Stakeholder interviews and requirements documentation": "Rozhovory se zainteresovanými a dokumentace požadavků",
    "Technical Architecture": "Technická architektura",
    "System design, technology selection, and architecture docs": "Návrh systému, výběr technologií a dokumentace architektury",
    "API Contract Design": "Návrh API kontraktu",
    "OpenAPI specs and endpoint definitions": "Specifikace OpenAPI a definice endpointů",
    "UX Research": "UX výzkum",
    "User interviews, personas, and journey mapping": "Uživatelské rozhovory, persony a mapování cesty",
    "Design System": "Design systém",
    "Colors, typography, components, and design tokens": "Barvy, typografie, komponenty a design tokeny",
    "Database Schema": "Databázové schéma",
    "PostgreSQL schema design and migrations": "Návrh schématu PostgreSQL a migrace",
    "Auth Service": "Autentizační služba",
    "JWT authentication and authorization": "Autentizace a autorizace pomocí JWT",
    "User Service": "Uživatelská služba",
    "User profile and preferences API": "API pro profil a předvolby uživatele",
    "Product Catalog API": "API katalogu produktů",
    "Product listing and search endpoints": "Endpointy pro výpis a vyhledávání produktů",
    "Order Service": "Objednávková služba",
    "Shopping cart and order management": "Nákupní košík a správa objednávek",
    "Payment Integration": "Integrace plateb",
    "Stripe/PayPal payment processing": "Zpracování plateb Stripe/PayPal",
    "Notification Service": "Notifikační služba",
    "Email and push notification system": "Systém e-mailových a push notifikací",
    "Backend Testing": "Testování backendu",
    "Unit and integration tests for all services": "Jednotkové a integrační testy všech služeb",
    "Component Library": "Knihovna komponent",
    "Reusable React component library": "Znovupoužitelná knihovna React komponent",
    "Auth Screens": "Přihlašovací obrazovky",
    "Login, register, and password reset": "Přihlášení, registrace a obnova hesla",
    "Dashboard Screen": "Obrazovka dashboardu",
    "Main dashboard and navigation": "Hlavní dashboard a navigace",
    "Profile Screens": "Obrazovky profilu",
    "User profile and settings": "Profil uživatele a nastavení",
    "Product Screens": "Obrazovky produktů",
    "Product list, detail, and search": "Seznam, detail a vyhledávání produktů",
    "Checkout Flow": "Proces pokladny",
    "Cart, shipping, and payment screens": "Obrazovky košíku, dopravy a platby",
    "Notification Center": "Centrum notifikací",
    "In-app notification display": "Zobrazení notifikací v aplikaci",
    "Frontend Testing": "Testování frontendu",
    "Component and E2E tests": "Komponentové a E2E testy",
    "React Native Setup": "Nastavení React Native",
    "Project scaffolding and configuration": "Založení projektu a konfigurace",
    "iOS Implementation": "Implementace iOS",
    "iOS-specific features and styling": "Funkce a styling specifické pro iOS",
    "Android Implementation": "Implementace Androidu",
    "Android-specific features and styling": "Funkce a styling specifické pro Android",
    "Push Notifications": "Push notifikace",
    "FCM and APNs integration": "Integrace FCM a APNs",
    "Offline Mode": "Offline režim",
    "Local storage and sync": "Místní úložiště a synchronizace",
    "Mobile Testing": "Testování mobilu",
    "Device testing and debugging": "Testování na zařízeních a ladění",
    "iOS TestFlight": "iOS TestFlight",
    "Beta distribution setup": "Nastavení beta distribuce",
    "Android Beta": "Android Beta",
    "Play Store beta track setup": "Nastavení beta kanálu Play Store",
    "Cloud Setup": "Nastavení cloudu",
    "AWS/Azure infrastructure with Terraform": "Infrastruktura AWS/Azure pomocí Terraform",
    "Kubernetes Config": "Konfigurace Kubernetes",
    "K8s cluster and deployment configs": "Cluster K8s a konfigurace nasazení",
    "CI/CD Pipeline": "CI/CD pipeline",
    "GitHub Actions build and deploy": "Sestavení a nasazení přes GitHub Actions",
    "Staging Environment": "Staging prostředí",
    "Staging cluster deployment": "Nasazení staging clusteru",
    "Production Environment": "Produkční prostředí",
    "Production cluster with HA": "Produkční cluster s vysokou dostupností",
    "Monitoring Setup": "Nastavení monitoringu",
    "Prometheus, Grafana dashboards": "Dashboardy Prometheus a Grafana",
    "Log Aggregation": "Agregace logů",
    "ELK stack for centralized logging": "ELK stack pro centralizované logování",
    "Security Hardening": "Zabezpečení systému",
    "WAF, secrets management, scanning": "WAF, správa tajemství a skenování",
    "System Integration": "Systémová integrace",
    "Connect all components end-to-end": "Propojení všech komponent od začátku do konce",
    "Security Audit": "Bezpečnostní audit",
    "Penetration testing and vulnerability scan": "Penetrační testy a sken zranitelností",
    "Performance Testing": "Výkonnostní testování",
    "Load testing and optimization": "Zátěžové testování a optimalizace",
    "Accessibility Audit": "Audit přístupnosti",
    "WCAG compliance testing": "Testování shody s WCAG",
    "UAT Testing": "UAT testování",
    "User acceptance testing with stakeholders": "Uživatelské akceptační testování se zainteresovanými",
    "Bug Fix Sprint": "Sprint oprav chyb",
    "Address issues from all testing": "Řešení problémů ze všech testů",
    "Regression Testing": "Regresní testování",
    "Verify bug fixes and stability": "Ověření oprav a stability",
    "Release Candidate": "Release Candidate",
    "Final build and sign-off": "Finální sestavení a schválení",
    "Soft Launch": "Měkké spuštění",
    "Limited release to beta users": "Omezené vydání pro beta uživatele",
    "Feedback Collection": "Sběr zpětné vazby",
    "Gather and analyze user feedback": "Získání a analýza zpětné vazby",
    "Final Polish": "Finální doladění",
    "Last-minute fixes and improvements": "Poslední opravy a vylepšení",
    "Production Launch": "Produkční spuštění",
    "Full public release and marketing": "Plné veřejné vydání a marketing"
  };

  // Reverse guard: never re-translate a string that is already a Czech value.
  var CZECH_VALUES = null;
  function isCzechValue(s) {
    if (CZECH_VALUES === null) {
      CZECH_VALUES = Object.create(null);
      for (var k in DICT) if (DICT.hasOwnProperty(k)) CZECH_VALUES[DICT[k]] = 1;
    }
    return CZECH_VALUES[s] === 1;
  }

  function translateCore(s) {
    if (DICT.hasOwnProperty(s)) return DICT[s];
    if (isCzechValue(s)) return null;
    var m;
    // Date "22 Sept 2026" -> "22. zář 2026"
    m = s.match(/^(\d{1,2}) ([A-Z][a-z]{2,3})\.? (\d{4})$/);
    if (m && MONTHS[m[2]]) return m[1] + ". " + MONTHS[m[2]] + " " + m[3];
    // "3 days" / "1 day"
    m = s.match(/^(\d+)\s+days?$/);
    if (m) return m[1] + " " + pl(parseInt(m[1], 10), "den");
    // "50 activities"
    m = s.match(/^(\d+)\s+activities$/);
    if (m) return m[1] + " " + pl(parseInt(m[1], 10), "cinnost");
    // "64 dependencies"
    m = s.match(/^(\d+)\s+dependencies$/);
    if (m) return m[1] + " " + pl(parseInt(m[1], 10), "zavislost");
    // "2 projects" / "1 project"
    m = s.match(/^(\d+)\s+projects?$/);
    if (m) return m[1] + " " + pl(parseInt(m[1], 10), "projekt");
    // "Day 25" -> "Den 25"
    m = s.match(/^Day\s+(\d+)$/);
    if (m) return "Den " + m[1];
    // JS-truncated names in the network view, e.g. "Staging Environm...".
    // Match the English prefix against a known full name and re-truncate the
    // Czech translation to the same length.
    var tm = s.match(/^(.+?)(\.\.\.|…)$/);
    if (tm && tm[1].replace(/\s+$/, "").length >= 3) {
      var p = tm[1];
      var best = null;
      for (var k in DICT) {
        if (!DICT.hasOwnProperty(k)) continue;
        if (k.length > p.length && k.slice(0, p.length) === p) {
          if (!best || k.length > best.length) best = k;
        }
      }
      if (best) return DICT[best].slice(0, p.length) + tm[2];
    }
    // Compact "ES:19 EF:21 | Float:8" -> localize the Float label only.
    if (/Float:/.test(s)) return s.replace(/Float:/g, "Rez.:");
    return null;
  }

  function translateWhitespaceAware(raw) {
    if (!raw) return null;
    // Exact match first, so dictionary keys that intentionally carry
    // leading/trailing spaces (sentence fragments) are honored.
    if (DICT.hasOwnProperty(raw)) return DICT[raw];
    var lead = raw.match(/^\s*/)[0];
    var trail = raw.match(/\s*$/)[0];
    var core = raw.slice(lead.length, raw.length - trail.length);
    if (!core) return null;
    var t = translateCore(core);
    if (t == null || t === core) return null;
    return lead + t + trail;
  }

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  function inSkippedContext(node) {
    var el = node.parentElement;
    while (el) {
      if (SKIP_TAGS[el.tagName]) return true;
      if (el.isContentEditable) return true;
      if (el.getAttribute && el.getAttribute("data-no-i18n") != null) return true;
      el = el.parentElement;
    }
    return false;
  }

  function processTextNode(node) {
    if (inSkippedContext(node)) return;
    var t = translateWhitespaceAware(node.nodeValue);
    if (t != null && t !== node.nodeValue) node.nodeValue = t;
  }

  // React splits interpolations like `{n} project{n===1?'':'s'}` into separate
  // text nodes ("2", " project", "s"). Handle these at the element level by
  // rewriting text-node VALUES only (never adding/removing nodes) so React's
  // DOM bookkeeping stays intact.
  var COMPOSITE = [
    { re: /^(\d+)\s+projects?$/, key: "projekt" },
    { re: /^(\d+)\s+activities$/, key: "cinnost" },
    { re: /^(\d+)\s+dependencies$/, key: "zavislost" },
    { re: /^(\d+)\s+days?$/, key: "den" }
  ];
  function fixComposite(el) {
    if (!el || el.nodeType !== 1 || el.childNodes.length < 2) return;
    // Take the leading run of consecutive text nodes (React interpolations
    // split "0 days" into "0" + " days"); ignore any element siblings after.
    var run = [];
    for (var c = el.firstChild; c && c.nodeType === 3; c = c.nextSibling) run.push(c);
    if (run.length < 2) return;
    if (inSkippedContext(run[0])) return;
    var combined = "";
    for (var r = 0; r < run.length; r++) combined += run[r].nodeValue;
    var core = combined.replace(/^\s+|\s+$/g, "");
    for (var i = 0; i < COMPOSITE.length; i++) {
      var m = core.match(COMPOSITE[i].re);
      if (m) {
        var out = m[1] + " " + pl(parseInt(m[1], 10), COMPOSITE[i].key);
        if (run[0].nodeValue !== out) run[0].nodeValue = out;
        for (var j = 1; j < run.length; j++) {
          if (run[j].nodeValue !== "") run[j].nodeValue = "";
        }
        return;
      }
    }
  }

  var ATTRS = ["placeholder", "title", "aria-label", "alt"];
  function processElementAttrs(el) {
    if (!el.getAttribute) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (!el.hasAttribute(a)) continue;
      var v = el.getAttribute(a);
      var t = translateWhitespaceAware(v);
      if (t != null && t !== v) el.setAttribute(a, t);
    }
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { processTextNode(root); return; }
    if (root.nodeType !== 1) return;
    if (SKIP_TAGS[root.tagName]) return;
    processElementAttrs(root);
    fixComposite(root);
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    var batch = [];
    while ((n = tw.nextNode())) batch.push(n);
    for (var i = 0; i < batch.length; i++) processTextNode(batch[i]);
    // attributes + composite counts on descendants
    var els = root.getElementsByTagName ? root.getElementsByTagName("*") : [];
    for (var j = 0; j < els.length; j++) {
      processElementAttrs(els[j]);
      fixComposite(els[j]);
    }
  }

  var observer;
  function onMutations(muts) {
    for (var i = 0; i < muts.length; i++) {
      var mu = muts[i];
      if (mu.type === "characterData") {
        if (mu.target && mu.target.nodeType === 3) {
          processTextNode(mu.target);
          fixComposite(mu.target.parentElement);
        }
      } else if (mu.type === "attributes") {
        if (mu.target && mu.target.nodeType === 1) processElementAttrs(mu.target);
      } else {
        for (var j = 0; j < mu.addedNodes.length; j++) walk(mu.addedNodes[j]);
      }
    }
  }

  function start() {
    walk(document.body || document.documentElement);
    observer = new MutationObserver(onMutations);
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
    // A few extra sweeps to catch the first React paints cleanly.
    var sweeps = 0;
    var iv = setInterval(function () {
      walk(document.body || document.documentElement);
      if (++sweeps >= 8) clearInterval(iv);
    }, 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
