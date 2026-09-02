const SCOPE = "source.css.less";

exports.activate = function () {};

exports.consumeHyperlinkInjection = (hyperlink) => {
  hyperlink.addInjectionPoint(SCOPE, {
    types: ["comment", "js_comment", "string_value"],
  });

  hyperlink.addInjectionPoint(SCOPE, {
    types: ["call_expression"],
    language: () => "hyperlink",
    content(node) {
      const functionName = node.descendantsOfType("function_name")[0]?.text;
      if (functionName?.toLowerCase() !== "url") return null;
      return node.descendantsOfType("plain_value");
    },
  });
};

exports.consumeTodoInjection = (todo) => {
  todo.addInjectionPoint(SCOPE, { types: ["comment", "js_comment"] });
};
