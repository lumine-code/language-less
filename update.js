// Run this to update the list of builtin less functions.

const fs = require("fs");
const path = require("path");

const FunctionsURL =
  "https://raw.githubusercontent.com/less/less-docs/master/content/functions/data/functions.json";

function sanitizeFunc(functionExample) {
  let example = functionExample.replace(";", "");
  example = example.replace(/\[, /g, ", [");
  example = example.replace(/,] /g, "], ");

  const argsRe = /\(([^)]+)\)/;
  example = example.replace(argsRe, (match) => {
    const args = argsRe
      .exec(match)[1]
      .split(",")
      .map((arg, index) => `\${${index + 1}:${arg.trim()}}`);
    return `(${args.join(", ")})\${${args.length + 1}:;}`;
  });

  return `${example}$0`;
}

async function fetchFunctions() {
  const response = await fetch(FunctionsURL, { headers: { Accept: "application/json" } });
  if (response.status !== 200) {
    console.error(`Request failed: ${response.status}`);
    return null;
  }
  return response.json();
}

async function main() {
  const results = await fetchFunctions();
  if (results == null) return;

  const suggestions = [];
  for (const [functionType, functions] of Object.entries(results)) {
    for (const func of functions) {
      suggestions.push({
        type: "function",
        rightLabel: "Less Builtin",
        snippet: sanitizeFunc(func.example),
        description: func.description,
        descriptionMoreURL: `http://lesscss.org/functions/#${functionType}-${func.name}`,
      });
    }
  }

  const configPath = path.join(__dirname, "settings", "main.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  config[".source.css.less .meta.property-value"].autocomplete.symbols.builtins.suggestions =
    suggestions;
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
}

main().catch((error) => console.error(error));
