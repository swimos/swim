// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Object notation with attributes, like if JSON and XML had a baby.
 *
 * <h2>Grammar</h2>
 *
 * <pre>
 * SP ::= #x20 | #x9
 *
 * NL ::= #xA | #xD
 *
 * WS ::= SP | NL
 *
 * Char ::= [#x1-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
 *
 * NameStartChar ::=
 *   [A-Z] | "_" | [a-z] |
 *   [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] |
 *   [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] |
 *   [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] |
 *   [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
 *
 * NameChar ::=  NameStartChar | '-' | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
 *
 * MarkupChar ::= Char - ('\\' | '@' | '{' | '}' | '[' | ']')
 *
 * StringChar ::= Char - ('"' | '\\' | '@' | '{' | '}' | '[' | ']' | '\b' | '\f' | '\n' | '\r' | '\t')
 *
 * CharEscape ::= '\\' ('"' | '\\' | '/' | '@' | '{' | '}' | '[' | ']' | 'b' | 'f' | 'n' | 'r' | 't')
 *
 * Base64Char ::= [A-Za-z0-9+/]
 *
 * Block ::= WS* Slots WS*
 *
 * Attr ::= '@' (Ident | String) ('(' Block ')')?
 *
 * Slots ::= Slot SP* ((',' | ';' | NL) WS* Slots)?
 *
 * Slot ::= BlockItem (SP* ':' SP* BlockItem?)?
 *
 * BlockItem ::= Literal SP* (Attr SP* BlockItem?)? | Attr SP* BlockItem? | Comment
 *
 * InlineItem ::= Attr (Record | Markup)? | Record | Markup
 *
 * Literal ::= Record | Markup | Data | Ident | String | Num | Bool | Selector
 *
 * Record ::= '{' Block '}'
 *
 * Markup ::= '[' (MarkupChar* | CharEscape | InlineItem)* ']'
 *
 * Data ::= '%' (Base64Char{4})* (Base64Char Base64Char ((Base64Char '=') | ('=' '=')))?
 *
 * Ident ::= NameStartChar NameChar*
 *
 * String ::= ('"' (StringChar* | CharEscape)* '"') | ('\'' (StringChar* | CharEscape)* '\'')
 *
 * Num ::= '-'? (([1-9] [0-9]*) | [0-9]) ('.' [0-9]+)? (('E' | 'e') ('+' | '-')? [0-9]+)?
 *
 * Bool ::= 'true' | 'false'
 *
 * Comment ::= '#' [^\n]*
 *
 *
 * Selector ::= '$' (Literal | '*:' | ':*' | '*' | '**' | '#' Integer | Filter)
 *              ('.' (Literal | '*:' | ':*' | '*' | '**') | '#' Integer | Filter | '(' Block ')')*
 *
 * Filter ::= '[' BlockExpression ']'
 *
 *
 * BlockExpression ::= LambdaFunc
 *
 * LambdaFunc ::= ConditionalOperator (SP* '=&gt;' SP* ConditionalOperator)?
 *
 * ConditionalOperator ::= OrOperator SP* ('?' SP* ConditionalOperator SP* ':' SP* ConditionalOperator)?
 *
 * OrOperator ::= AndOperator SP* ('||' SP* AndOperator)*
 *
 * AndOperator ::= BitwiseOrOperator SP* ('&amp;&amp;' SP* BitwiseOrOperator)*
 *
 * BitwiseOrOperator ::= BitwiseXorOperator SP* ('|' SP* BitwiseXorOperator)*
 *
 * BitwiseXorOperator ::= BitwiseAndOperator SP* ('^' SP* BitwiseAndOperator)*
 *
 * BitwiseAndOperator ::= ComparisonOperator SP* ('&amp;' SP* ComparisonOperator)*
 *
 * ComparisonOperator ::= AttrExpression SP* (('&lt;' | '&lt;=' | '==' | '&gt;=' | '&gt;') SP* AttrExpression)?
 *
 * AttrExpression ::= AdditiveOperator SP* (Attr SP* AttrExpression?)? | Attr SP* AttrExpression?
 *
 * AdditiveOperator ::= MultiplicativeOperator SP* (('+' | '-') SP* MultiplicativeOperator)*
 *
 * MultiplicativeOperator ::= PrefixOperator SP* (('*' | '/' | '%') SP* PrefixOperator)*
 *
 * PrefixOperator ::= InvokeOperator SP* | ('!' | '~' | '-' | '+') SP* PrefixOperator
 *
 * InvokeOperator ::= Primary ('(' Block ')')*
 *
 * Primary ::= Literal | '(' BlockExpression (',' BlockExpression)* ')'
 * </pre>
 */
package swim.recon;
