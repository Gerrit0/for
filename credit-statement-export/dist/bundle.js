// credit-statement-export/src/index.ts
await window.pdfjsLibPromise;
var pdfLib = window.pdfjsLib;
pdfLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs";
var input = document.querySelector("#files");
var logs = document.querySelector("#logs");
var download = document.querySelector("#download");
var result = document.querySelector("#result");
var downloadListener;
input.disabled = false;
var XCoord = 4;
var YCoord = 5;
var IGNORED_TEXTS = /* @__PURE__ */ new Set([
  "Other Credits",
  "Purchases and Other Debits",
  "Payments and Other Credits",
  ""
]);
function log(message) {
  if (typeof message === "string") {
    logs.appendChild(document.createElement("li")).textContent = message;
  } else {
    console.error(message);
    const li = logs.appendChild(document.createElement("li"));
    li.textContent = `ERROR: ${message.message}`;
    li.style.color = "red";
  }
}
input.addEventListener("change", () => {
  if (downloadListener) {
    download.disabled = true;
    download.removeEventListener("click", downloadListener);
  }
  if (input.files?.[0]) {
    handleFile(input.files[0]).then(() => {
      download.disabled = false;
    }).catch(log);
  }
});
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
async function getAllText(file) {
  log("Loading PDF...");
  const buffer = await readFile(file);
  log("Read file...");
  const pdf = await pdfLib.getDocument(buffer).promise;
  log(`Loaded PDF, ${pdf.numPages} pages to process`);
  const allTexts = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    log(`Processing page ${i}`);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const texts = content.items.filter(
      (value) => "str" in value
    );
    texts.sort((a, b) => {
      if (a.transform[YCoord] === b.transform[YCoord]) {
        return a.transform[XCoord] - b.transform[XCoord];
      }
      return b.transform[YCoord] - a.transform[YCoord];
    });
    for (const text of texts) {
      allTexts.push(text.str);
    }
  }
  log(`Extracted PDF text.`);
  const filtered = allTexts.filter(
    (t) => !IGNORED_TEXTS.has(t) && !/^\s+$/.test(t)
  );
  window.allTexts = filtered;
  return filtered;
}
function parseSection(section) {
  let i = section.indexOf("Notation");
  if (i === -1)
    return null;
  ++i;
  const name = section[0];
  const transactions = [];
  let account = "";
  let total = "";
  while (i < section.length && section[i] !== "Total for Account") {
    parseTransaction();
  }
  i++;
  if (i < section.length) {
    account = section[i++];
  }
  if (i < section.length) {
    total = section[i++].replace(/^\$/, "");
  }
  if (i < section.length && section[i] === "CR") {
    total = "-" + total;
    i++;
  }
  if (i < section.length) {
    log(`Unparsed part of section: ${JSON.stringify(section.slice(i))}`);
  }
  function peekTransaction() {
    return /^\d+$/.test(section[i]) && section[i + 1] == "/" && /^\d+$/.test(section[i + 2]) && /^\d+$/.test(section[i + 3]) && section[i + 4] == "/" && /^\d+$/.test(section[i + 5]);
  }
  function parseTransaction() {
    if (peekTransaction()) {
      transactions.push({
        postDate: `${section[i]}${section[i + 1]}${section[i + 2]}`,
        transDate: `${section[i + 3]}${section[i + 4]}${section[i + 5]}`,
        ref: section[i + 6],
        desc: section[i + 7],
        amount: ""
      });
      i += 7;
      while (section[i][0] != "$" && i < section.length) {
        transactions[transactions.length - 1].desc += " " + section[i++];
      }
      transactions[transactions.length - 1].amount = section[i++].substring(1);
      if (section[i] === "CR") {
        transactions[transactions.length - 1].amount = "-" + transactions[transactions.length - 1].amount;
        i += 1;
      }
    } else if (!transactions.length) {
      console.log(section);
      throw new Error(
        "Failed to parse PDF, transactions section didn't match expected format"
      );
    } else if (section[i] == "Continued on Next Page") {
      i = section.indexOf("Notation", i);
    } else {
      transactions[transactions.length - 1].desc += "\n" + section[i];
      i += 1;
    }
  }
  return {
    name,
    transactions,
    account,
    total
  };
}
async function handleFile(file) {
  const texts = await getAllText(file);
  const sections = [];
  let start = texts.indexOf("Transactions");
  while (start != -1) {
    let end = texts.indexOf("Total for Account", start);
    if (end == -1)
      break;
    sections.push(texts.slice(start + 1, end + 3));
    start = texts.indexOf("Transactions", end);
  }
  const header = [
    "Name",
    "Post Date",
    "Trans Date",
    "Ref #",
    "Transaction Description",
    "Amount"
  ];
  const csv = [];
  for (const section of sections) {
    const parsed = parseSection(section);
    if (!parsed) {
      log(`Failed to parse section: ${JSON.stringify(section)}`);
      continue;
    }
    csv.push(header);
    for (const trans of parsed.transactions) {
      csv.push([
        parsed.name,
        trans.postDate,
        trans.transDate,
        trans.ref,
        trans.desc,
        trans.amount
      ]);
    }
    csv.push(["", "", "", "", "", "", "Expected Total", parsed.total]);
    csv.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "Actual Total",
      `=SUM(F${csv.length - parsed.transactions.length}:F${csv.length - 1})`
    ]);
    csv.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "Status",
      `=IF(H${csv.length - 1}=H${csv.length}, "OK", "ERROR")`
    ]);
    csv.push([]);
  }
  downloadListener = () => {
    downloadFile(file.name.replace(/\.pdf$/i, ".csv"), toCSV(csv));
  };
  download.addEventListener("click", downloadListener);
  result.innerHTML = "";
  const table = result.appendChild(document.createElement("table"));
  const tbody = table.appendChild(document.createElement("tbody"));
  for (const row of csv) {
    const tr = tbody.appendChild(document.createElement("tr"));
    for (const cell of row) {
      tr.appendChild(document.createElement("td")).textContent = cell;
    }
  }
  log(`Done!`);
}
function toCSV(table) {
  return table.map(
    (row) => row.map((cell) => {
      if (/[\n,"]/.test(cell)) {
        return '"' + cell.replace(/"/g, '""') + '"';
      }
      return cell;
    }).join(",")
  ).join("\n");
}
function downloadFile(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
