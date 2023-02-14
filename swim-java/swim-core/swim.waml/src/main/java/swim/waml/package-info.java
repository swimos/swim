// Copyright 2015-2022 Swim.inc
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
 * Attributed markup language codec.
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
 * MarkupChar ::= Char - ('<' | '>' | '@' | '\\')
 *
 * StringChar ::= Char - ('\b' | '\f' | '\n' | '\r')
 *
 * HexDigit ::= [0-9A-Fa-f]
 *
 * CharEscape ::= '\\' ('"' | '\'' | '/' | '<' | '>' | '@' | '[' | '\\' | ']' | '{' | '}' | 'b' | 'f' | 'n' | 'r' | 't' | 'u' HexDigit{4})
 *
 * Comment ::= '#' [^\n]*
 *
 * Unit ::= '()'
 *
 * Boolean ::= 'true' | 'false'
 *
 * Number ::= '-'? (([1-9] [0-9]*) | [0-9]) ('.' [0-9]+)? (('E' | 'e') ('+' | '-')? [0-9]+)?
 *
 * Identifier ::= NameStartChar NameChar*
 *
 * Text ::= '"""' ((StringChar - '"') | CharEscape | ('"' ((StringChar - '"') | ('"' (StringChar - '"')))))* '"""'
 *
 * String ::= '"' ((StringChar - '"') | CharEscape)* '"'
 *
 * Primitive ::= Unit | Boolean | Number | Identifier | Text | String | Selector
 *
 * Key ::= Identifier | String
 *
 * Attr ::= '@' Key Tuple?
 *
 * Repr ::= (Attr SP*)* SP* (Primitive | Composite)
 *
 * Field ::= Key SP* ':' SP* Repr
 *
 * Tuple ::= '(' WS* ((Repr | Field) SP* (',' WS* (Repr | Field))* SP* ','?)? WS* ')'
 *
 * Object ::= '{' WS* (Field SP* ((',' | NL) WS* Field)* SP* ','?)? WS* '}'
 *
 * Array ::= '[' WS* (Repr SP* ((',' | NL) WS* Repr)* SP* ','?)? WS* ']'
 *
 * MarkupEscape ::= '{' WS* (Repr SP* ((',' | NL) WS* Repr)* SP* ','?)? WS* '}'
 *
 * Markup ::= '<' '<' (MarkupChar* | Attr Markup? | Markup | MarkupEscape | CharEscape)* '>' '>'
 *
 * Composite ::= Tuple | Object | Array | Markup
 *
 *
 * Selector ::= '$' (Repr | '*:' | ':*' | '*' | '**' | '#' Integer | Filter)
 *              ('.' (Repr | '*:' | ':*' | '*' | '**') | '#' Integer | Filter | '(' WS* Reprs WS* ')')*
 *
 * Filter ::= '[' Expression ']'
 *
 *
 * Expression ::= LambdaFunc
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
 * InvokeOperator ::= Primary ('(' WS* Reprs WS* ')')*
 *
 * Primary ::= Repr | '(' Expression (',' Expression)* ')'
 * </pre>
 */
@Public
@Since("5.0")
package swim.waml;

import swim.annotations.Public;
import swim.annotations.Since;
