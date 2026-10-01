const registrations = [];

exports.activate = function () {
  // Error recovery can nest plain_value nodes at arbitrary depths. Preserve
  // their grouping under the call, including the first descendant's name.
  registrations.push(
    lumine.grammars.addInjectionPoint("source.css.less", {
      type: "call_expression",
      language: () => "hyperlink",
      content(node) {
        const functionName = node.descendantsOfType("function_name")[0]?.text;
        if (functionName?.toLowerCase() !== "url") return null;
        return node.descendantsOfType("plain_value");
      },
      languageScope: null,
    }),
  );
};

exports.deactivate = function () {
  for (const registration of registrations.splice(0)) registration.dispose();
};
