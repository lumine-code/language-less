const fs = require("fs");
const path = require("path");
const { Point } = require("lumine");

const HIGHLIGHTS_PATH = path.join(__dirname, "..", "grammars", "less-highlights.scm");

describe("Less Tree-sitter highlights", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-less");
  });

  afterEach(() => editor?.destroy());

  async function setUp(text) {
    editor = await lumine.workspace.open("highlights.less");
    editor.setText(text);
    await editor.getBuffer().languageMode.ready;
  }

  function rawCaptures(startRow, endRow) {
    const layer = editor.getBuffer().languageMode.rootLanguageLayer;
    return layer.queries.highlightsQuery.captures(layer.tree.rootNode, {
      startPosition: new Point(startRow, 0),
      endPosition: new Point(endRow, 0),
    });
  }

  it("preserves mixin argument and parameter scopes", async () => {
    const source = `.generated(@first, @second) {}
a { .generated(@first, @second); }`;
    await setUp(source);

    const scopesAt = (needle, occurrence = 0) => {
      let index = -1;
      for (let count = 0; count <= occurrence; count++) {
        index = source.indexOf(needle, index + 1);
      }
      const point = editor.getBuffer().positionForCharacterIndex(index);
      return editor.scopeDescriptorForBufferPosition(point).getScopesArray();
    };

    expect(scopesAt("@first", 0)).toContain("variable.parameter.less");
    expect(scopesAt("@second", 0)).toContain("variable.parameter.less");
    expect(scopesAt("@first", 1)).toContain("variable.parameter.less");
    expect(scopesAt("@second", 1)).toContain("variable.parameter.less");
  });

  it("keeps large argument and parameter parents leaf-rooted with local tile captures", async () => {
    const argumentsSource = ["a {", "  .generated("];
    for (let index = 0; index < 6000; index++) {
      argumentsSource.push(`    @value${index}${index < 5999 ? "," : ""}`);
    }
    argumentsSource.push("  );", "}");
    await setUp(argumentsSource.join("\r\n"));

    let captures = rawCaptures(3000, 3006);
    expect(captures.length).toBeLessThanOrEqual(28);
    expect(
      captures.every(
        (capture) =>
          capture.node.startPosition.row >= 3000 && capture.node.startPosition.row < 3006,
      ),
    ).toBe(true);

    const parametersSource = [".generated("];
    for (let index = 0; index < 6000; index++) {
      parametersSource.push(`  @value${index}${index < 5999 ? "," : ""}`);
    }
    parametersSource.push(") {}");
    editor.setText(parametersSource.join("\r\n"));
    await editor.getBuffer().languageMode.atTransactionEnd();

    captures = rawCaptures(3000, 3006);
    expect(captures.length).toBeLessThanOrEqual(28);
    expect(
      captures.every(
        (capture) =>
          capture.node.startPosition.row >= 3000 && capture.node.startPosition.row < 3006,
      ),
    ).toBe(true);

    const query = fs.readFileSync(HIGHLIGHTS_PATH, "utf8");
    expect(query).toContain('(#is? test.typeAt "parent.parent parameters")');
    expect(query).toContain("(#is? test.childOfType arguments)");
    expect(query).not.toMatch(/\((?:arguments|parameters)\s+\(/);
  });
});
