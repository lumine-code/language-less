const SCOPE = "source.css.less";

exports.activate = function () {};

exports.consumeHyperlinkInjection = (hyperlink) => {
  const registrations = [];
  registrations.push(
    hyperlink.addInjectionPoint(SCOPE, {
      types: ["comment", "js_comment", "string_value"],
    }),
  );

  registrations.push(
    hyperlink.addInjectionPoint(SCOPE, {
      types: ["call_expression"],
      language: () => "hyperlink",
      content(node) {
        const functionName = node.descendantsOfType("function_name")[0]?.text;
        if (functionName?.toLowerCase() !== "url") return null;
        return node.descendantsOfType("plain_value");
      },
    }),
  );
  return {
    dispose() {
      for (const registration of registrations.splice(0)) registration.dispose();
    },
  };
};

exports.consumeTodoInjection = (todo) => {
  return todo.addInjectionPoint(SCOPE, { types: ["comment", "js_comment"] });
};
