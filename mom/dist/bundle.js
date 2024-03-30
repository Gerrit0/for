// mom/src/index.ts
var tools = [
  [
    "Unique",
    "Enter lines",
    (value) => {
      const unique = new Set(value.split("\n"));
      unique.delete("");
      return Array.from(unique).join("\n");
    }
  ]
];
var transformFn = tools[0][2];
var dropdown = document.querySelector("select");
var left = document.querySelector(".left textarea");
var right = document.querySelector(".right");
var copyButton = document.querySelector("button");
dropdown.addEventListener("input", () => {
  transformFn = tools.find((tool) => tool[0] === dropdown.textContent)[2];
  transform();
});
left.addEventListener("input", transform);
copyButton.addEventListener("click", () => {
  navigator.clipboard.writeText(right.innerText).catch(console.error);
  copyButton.textContent = "Copied!";
  setTimeout(() => copyButton.textContent = "Copy", 750);
});
for (const tool of tools) {
  const option = dropdown.appendChild(document.createElement("option"));
  option.textContent = tool[0];
  left.placeholder = tool[1];
}
function transform() {
  try {
    right.innerText = transformFn(left.value);
  } catch (err) {
    right.innerText = `Error: ${err.message}`;
  }
}
