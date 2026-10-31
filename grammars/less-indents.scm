; Existing literal and comment contents are user data, including whitespace.
([(string_value) (comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))

; Interpolation opens with `@{` or `${`, not a block-opening brace.
(interpolation "}" @_IGNORE_ (#set! capture.final true))
(property_value "}" @_IGNORE_ (#set! capture.final true))

["{" "(" "["] @indent
["}" ")" "]"] @dedent
