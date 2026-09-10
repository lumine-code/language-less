; Based on mdovale/tree-sitter-less queries/highlights.scm at
; 02988c765d30adb0476657b5d220e8dfde1c07d3 (MIT).

(comment) @comment.block.less
((js_comment) @comment.line.double-slash.less
  (#set! adjust.endBeforeFirstMatchOf "\\r?$"))

(tag_name) @entity.name.tag.less
(nesting_selector) @entity.name.tag.reference.less
(universal_selector) @entity.name.tag.universal.less

[
  "~"
  ">"
  "+"
  "-"
  "*"
  "/"
  "="
  "=="
  "!="
  ">="
  "<="
  "^="
  "|="
  "~="
  "$="
  "*="
] @keyword.operator.less

[
  "and"
  "or"
  "not"
  "only"
] @keyword.operator.logical.less

(attribute_selector (plain_value) @string.unquoted.less)

((property_name) @variable.other.less
  (#match? @variable.other.less "^(@|--)"))
((plain_value) @variable.other.less
  (#match? @variable.other.less "^--"))

(class_name) @entity.other.attribute-name.class.less
(id_name) @entity.other.attribute-name.id.less
(namespace_name) @entity.name.namespace.less
((property_name) @support.type.property-name.less
  (#not-match? @support.type.property-name.less "^(@|--)"))
(feature_name) @support.type.property-name.less

(pseudo_element_selector (tag_name) @entity.other.attribute-name.pseudo-element.less)
(pseudo_class_selector (class_name) @entity.other.attribute-name.pseudo-class.less)
(attribute_name) @entity.other.attribute-name.less

(function_name) @support.function.misc.less

[
  "@media"
  "@import"
  "@charset"
  "@namespace"
  "@supports"
  "@keyframes"
] @keyword.control.at-rule.less
(at_keyword) @keyword.control.at-rule.less
[(to) (from)] @keyword.control.less
(important) @keyword.other.important.less

(string_value) @string.quoted.less
(color_value) @constant.other.color.less

(integer_value) @constant.numeric.less
(float_value) @constant.numeric.less
(unit) @keyword.other.unit.less

[
  "#"
  ","
  "."
  ":"
  "::"
  ";"
] @punctuation.separator.less

[
  "{"
  "}"
  "("
  ")"
  "["
  "]"
] @punctuation.section.less

(mixin_statement
  (function_name) @entity.name.function.mixin.less)

(mixin_definition
  (class_name) @entity.name.function.mixin.less)

((variable) @variable.parameter.less
  (#is? test.typeAt "parent parameter")
  (#is? test.typeAt "parent.parent parameters"))

((plain_value) @string.unquoted.less
  (#not-match? @string.unquoted.less "^--"))

(keyword_query) @support.function.misc.less
(identifier) @variable.other.less
(variable) @variable.other.less

((variable) @variable.parameter.less
  (#is? test.childOfType arguments))

; Preserve the scope used by the package's value completions without making
; the property name part of the value.
(declaration
  (property_name)
  (_) @meta.property-value.less)
