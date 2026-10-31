const path = require("node:path");

describe("less editing settings", () => {
  let editor;

  beforeEach(async () => {
    jasmine.useRealClock();
    const pack = await lumine.packages.activatePackage(path.resolve(__dirname, ".."));
    await pack.resourceLoadPromise;
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.css.less"));
    editor.update({ autoIndent: false });
    await editor.whenGrammarSettled();
  });

  afterEach(() => editor?.destroy());

  async function setText(text) {
    editor.setText(text);
    expect(await editor.whenGrammarSettled()).toBe(true);
  }

  it("selects hyphenated variable names with their prefix", async () => {
    await setText("@font-size: 1rem;");
    editor.setCursorBufferPosition(
      editor.getBuffer().positionForCharacterIndex(editor.getText().indexOf("size") + 1),
    );
    editor.selectWordsContainingCursors();
    expect(editor.getSelectedText()).toBe("@font-size");
  });

  it("keeps LESS brackets and existing backtick pairing without prose smart quotes", async () => {
    await lumine.packages.activatePackage("bracket-matcher");
    for (const [typed, expected] of [
      ["(", "()"],
      ["[", "[]"],
      ["{", "{}"],
      ['"', '""'],
      ["'", "''"],
      ["`", "``"],
      ["“", "“"],
    ]) {
      await setText("");
      await editor.insertText(typed);
      await editor.whenGrammarSettled();
      expect(editor.getText()).withContext(typed).toBe(expected);
    }
  });
});
