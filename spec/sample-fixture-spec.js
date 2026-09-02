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

  it("registers comment and url() injections", () => {
    const main = require("../lib/main");
    const hyperlinkCalls = [];
    const todoCalls = [];

    main.consumeHyperlinkInjection({
      addInjectionPoint(scope, options) {
        hyperlinkCalls.push({ scope, options });
      },
    });
    main.consumeTodoInjection({
      addInjectionPoint(scope, options) {
        todoCalls.push({ scope, options });
      },
    });

    expect(hyperlinkCalls[0]).toEqual({
      scope: "source.css.less",
      options: { types: ["comment", "js_comment", "string_value"] },
    });
    expect(todoCalls).toEqual([
      {
        scope: "source.css.less",
        options: { types: ["comment", "js_comment"] },
      },
    ]);

    const urlInjection = hyperlinkCalls[1].options;
    const call = (name) => ({
      descendantsOfType(type) {
        if (type === "function_name") return [{ text: name }];
        if (type === "plain_value") return [{ text: "https://example.com/a.css" }];
        return [];
      },
    });
    expect(urlInjection.content(call("url"))).toEqual([{ text: "https://example.com/a.css" }]);
    expect(urlInjection.content(call("darken"))).toBeNull();
  });
});
