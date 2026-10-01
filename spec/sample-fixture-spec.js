const path = require("path");

describe("Less Tree-sitter grammar", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-less");
  });

  it("selects the Wasm grammar and passes the shared grammar checks", async () => {
    const grammar = lumine.grammars.grammarForScopeName("source.css.less");
    expect(grammar.constructor.name).toBe("TreeSitterGrammar");
    expect(grammar.fileTypes).toEqual(["less"]);

    await runGrammarTests(path.join(__dirname, "fixtures", "grammar.less"), /\/\//);
  });

  it("opens the representative sample and provides structural editing", async () => {
    const editor = await lumine.workspace.open(path.join(__dirname, "fixtures", "sample.less"));
    await editor.languageMode.ready;

    expect(editor.getGrammar().constructor.name).toBe("TreeSitterGrammar");
    expect(editor.getGrammar().scopeName).toBe("source.css.less");

    editor.setText(".card {\n  color: red;\n}\n");
    await editor.languageMode.ready;
    expect(editor.isFoldableAtBufferRow(0)).toBe(true);
    expect(editor.suggestedIndentForBufferRow(1)).toBe(1);
  });

  it("highlights Less variables, selectors, mixins, functions, and properties", async () => {
    const editor = await lumine.workspace.open();
    const text = `@tone: #fff;
.rounded(@radius) { border-radius: @radius; }
.card { color: darken(@tone, 10%); }`;
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.css.less"));
    editor.setText(text);
    await editor.languageMode.ready;

    const scopesAt = (needle, offset = 0) => {
      const index = text.indexOf(needle) + offset;
      const point = editor.getBuffer().positionForCharacterIndex(index);
      return editor.scopeDescriptorForBufferPosition(point).getScopesArray();
    };

    expect(scopesAt("@tone")).toContain("variable.other.less");
    expect(scopesAt(".rounded", 1)).toContain("entity.name.function.mixin.less");
    expect(scopesAt("border-radius")).toContain("support.type.property-name.less");
    expect(scopesAt(".card", 1)).toContain("entity.other.attribute-name.class.less");
    expect(scopesAt("darken")).toContain("support.function.misc.less");
  });

  it("combines static comment annotations with descendant-based url() content", async () => {
    const fs = require("fs");
    for (const name of ["language-hyperlink", "language-todo"]) {
      const sibling = path.resolve(__dirname, "..", "..", name);
      await lumine.packages.activatePackage(fs.existsSync(sibling) ? sibling : name);
    }
    const editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.css.less"));
    editor.setText(
      "// TODO visit https://example.com/docs\n" +
        ".card { background: URL(https://example.com/theme.css); }\n" +
        "// ordinary comment\n",
    );
    await editor.languageMode.ready;
    await editor.languageMode.atGrammarSettlement();
    const layers = editor.languageMode.getAllInjectionLayers();
    expect(layers.filter((layer) => layer.grammar.scopeName === "text.todo").length).toBe(1);
    expect(layers.filter((layer) => layer.grammar.scopeName === "text.hyperlink").length).toBe(2);
    const urlLayer = layers.find((layer) => layer.getCurrentRanges()[0]?.start.row === 1);
    expect(urlLayer.getCurrentRanges().map((range) => editor.getTextInBufferRange(range))).toEqual([
      "https://example.com/theme.css",
    ]);
    editor.destroy();
  });
});
