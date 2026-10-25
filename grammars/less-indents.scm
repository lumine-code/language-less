; Interpolation opens with `@{` or `${`, not a block-opening brace.
(interpolation "}" @_IGNORE_ (#set! capture.final true))
(property_value "}" @_IGNORE_ (#set! capture.final true))

["{" "(" "["] @indent
["}" ")" "]"] @dedent
