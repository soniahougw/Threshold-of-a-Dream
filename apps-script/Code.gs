// Threshold of a Dream: receives answers from the website and saves them in Google Drive.
//
// Each submission adds one row per scene to the "Threshold of a Dream — Responses"
// spreadsheet inside FOLDER_ID (the spreadsheet is created on the first submission).
// It also adds one response to the "Threshold of a Dream — Interview" Google Form, once
// setupForm() has been run, so answers can be read in the form's Responses tab.
// See README.md in this folder for how to deploy it.

const FOLDER_ID = "1Nc02LDabOqjEhoYfTINwYEdYekQe7s5k";
const SHEET_NAME = "Threshold of a Dream — Responses";
const FORM_NAME = "Threshold of a Dream — Interview";

// Keep in the same order as SCENES in docs/app.js. After adding one, run setupForm again.
const TRANSITIONS = [
  ["motion-blur", "Motion blur (0a → 1a)"],
  ["darker", "Darker (cl → cld)"],
  ["brighter", "Brighter (b → e)"],
  ["black-and-white", "Black and white (pl → plb)"],
  ["flying", "Flying (fly → flyw)"],
];
const FEELINGS = {
  "about-to-enter": "about to enter a dream",
  "inside": "already inside a dream",
  "unsure": "not sure / something else",
};
// Must match the checkbox values in docs/index.html.
const DREAM_LIKE = ["with clear sight", "getting motion blur", "dark sight", "bright world", "black and white tone"];
const LANGS = { en: "English", zh: "繁中" };

const HEADERS = [
  "Submitted", "Response ID", "How do I describe you?", "Scene",
  "Dream moment", "First click", "First click (seconds)", "Times watched",
  "About to enter / inside", "How's your dream usually like?",
  "Reminds you of a dream?", "Anything else", "Raw JSON",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const r = JSON.parse(e.postData.contents);
    const sheet = getSheet_();
    const rows = (r.scenes || []).map((s) => [
      r.submittedAt, r.id, r.name, s.scene,
      s.neverDream ? "never felt like a dream" : pct_(s.finalProgress),
      s.neverDream ? "" : pct_(s.markProgress),
      s.markSeconds == null ? "" : s.markSeconds,
      s.attempts, s.feeling || "",
      (r.dreamLike || []).join(", "), r.dreamMemory || "", r.feedback || "",
      JSON.stringify(r),
    ].map(safe_));
    if (rows.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    }
    // The spreadsheet row is already saved, so a problem with the form shouldn't lose the answer.
    try { addFormResponse_(r); } catch (err) { console.error("Form response failed: " + err); }
    return ContentService.createTextOutput("ok");
  } finally {
    lock.releaseLock();
  }
}

// Find the responses spreadsheet in the folder, or create it there.
function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty("SHEET_ID");
  let ss = null;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (err) { ss = null; }
  }
  if (!ss) {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const existing = folder.getFilesByName(SHEET_NAME);
    if (existing.hasNext()) {
      ss = SpreadsheetApp.open(existing.next());
    } else {
      ss = SpreadsheetApp.create(SHEET_NAME);
      DriveApp.getFileById(ss.getId()).moveTo(folder);
    }
    props.setProperty("SHEET_ID", ss.getId());
  }
  const sheet = ss.getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

// ---- Google Form ------------------------------------------------------------

// Each form question as [key, type, title, choices].
function formQuestions_() {
  const q = [
    ["describe", "text", "How do I describe you?"],
    ["lang", "choice", "Language", Object.values(LANGS)],
  ];
  TRANSITIONS.forEach(([id, name], i) => {
    const n = `${i + 1} · ${name}`;
    q.push(
      [id + ".moment", "text", `${n}: dream moment (% of the transformation)`],
      [id + ".first", "text", `${n}: first click (%)`],
      [id + ".watched", "text", `${n}: times watched`],
      [id + ".feeling", "choice", `${n}: at that moment, did you feel like you were…`, Object.values(FEELINGS)],
    );
  });
  q.push(
    ["dreamLike", "checks", "How's your dream usually like?", DREAM_LIKE],
    ["dreamMemory", "paragraph", "Does this interview remind you of any dream you've had?"],
    ["feedback", "paragraph", "Anything else you'd like to share?"],
    ["id", "text", "Response ID (same as in the spreadsheet)"],
  );
  return q;
}

// Find the form, or create it in the folder when `create` is true.
function getForm_(create) {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("FORM_ID");
  if (id) {
    try { return FormApp.openById(id); } catch (err) { /* deleted: make a new one below */ }
  }
  if (!create) return null;
  const form = FormApp.create(FORM_NAME);
  form.setDescription("Answers from the Threshold of a Dream website are added here automatically. " +
    "Each response is one participant. Please don't share this form's link; participants use the website.");
  DriveApp.getFileById(form.getId()).moveTo(DriveApp.getFolderById(FOLDER_ID));
  props.setProperty("FORM_ID", form.getId());
  props.deleteProperty("FORM_ITEMS");
  return form;
}

// Run this from the editor to create the form, or to add questions for new transitions.
function setupForm() {
  const props = PropertiesService.getScriptProperties();
  const form = getForm_(true);
  try { form.setPublished(true); } catch (err) { /* older Forms without publishing */ }
  const items = JSON.parse(props.getProperty("FORM_ITEMS") || "{}");
  formQuestions_().forEach(([key, type, title, choices]) => {
    if (items[key] && form.getItemById(items[key])) return;
    let item;
    if (type === "text") item = form.addTextItem();
    else if (type === "paragraph") item = form.addParagraphTextItem();
    else if (type === "choice") item = form.addMultipleChoiceItem().setChoiceValues(choices);
    else item = form.addCheckboxItem().setChoiceValues(choices);
    item.setTitle(title);
    items[key] = item.getId();
  });
  props.setProperty("FORM_ITEMS", JSON.stringify(items));
  Logger.log("Your form: " + form.getEditUrl());
}

function addFormResponse_(r) {
  const form = getForm_(false);
  if (!form) return;
  const items = JSON.parse(PropertiesService.getScriptProperties().getProperty("FORM_ITEMS") || "{}");
  const res = form.createResponse();
  const put = (key, value) => {
    if (value == null || value === "" || (Array.isArray(value) && !value.length)) return;
    const item = items[key] && form.getItemById(items[key]);
    if (!item) return;
    const type = item.getType();
    if (type === FormApp.ItemType.TEXT) res.withItemResponse(item.asTextItem().createResponse(String(value)));
    else if (type === FormApp.ItemType.PARAGRAPH_TEXT) res.withItemResponse(item.asParagraphTextItem().createResponse(String(value)));
    else if (type === FormApp.ItemType.MULTIPLE_CHOICE) res.withItemResponse(item.asMultipleChoiceItem().createResponse(value));
    else if (type === FormApp.ItemType.CHECKBOX) res.withItemResponse(item.asCheckboxItem().createResponse(value));
  };
  put("describe", r.name);
  put("lang", LANGS[r.lang]);
  (r.scenes || []).forEach((s) => {
    put(s.scene + ".moment", s.neverDream ? "never felt like a dream" : pct_(s.finalProgress));
    put(s.scene + ".first", s.neverDream ? "" : pct_(s.markProgress));
    put(s.scene + ".watched", s.attempts);
    put(s.scene + ".feeling", FEELINGS[s.feeling]);
  });
  put("dreamLike", (r.dreamLike || []).filter((v) => DREAM_LIKE.includes(v)));
  put("dreamMemory", r.dreamMemory);
  put("feedback", r.feedback);
  put("id", r.id);
  res.submit();
}

// ---- Helpers ----------------------------------------------------------------

function pct_(p) {
  return p == null ? "" : Math.round(p * 100) + "%";
}

// Stop typed answers from being read as spreadsheet formulas.
function safe_(v) {
  return typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v;
}

// Run this once from the editor to grant Drive access and create the spreadsheet.
function setup() {
  getSheet_();
}
