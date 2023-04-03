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

package swim.waml.parser;

import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parse;
import swim.util.Assume;
import swim.waml.WamlException;
import swim.waml.WamlForm;
import swim.waml.WamlMarkupForm;
import swim.waml.WamlParser;

@Internal
public final class ParseWamlMarkup<N, B, T> extends Parse<T> {

  final WamlParser parser;
  final WamlMarkupForm<N, B, ? extends T> form;
  final @Nullable B builder;
  final @Nullable Parse<WamlForm<T>> parseAttr;
  final @Nullable StringBuilder textBuilder;
  final @Nullable Parse<?> parseNode;
  final int escape;
  final int step;

  public ParseWamlMarkup(WamlParser parser, WamlMarkupForm<N, B, ? extends T> form,
                         @Nullable B builder, @Nullable StringBuilder textBuilder,
                         @Nullable Parse<WamlForm<T>> parseAttr,
                         @Nullable Parse<?> parseNode, int escape, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.textBuilder = textBuilder;
    this.parseAttr = parseAttr;
    this.parseNode = parseNode;
    this.escape = escape;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlMarkup.parse(input, this.parser, this.form, this.builder,
                                 this.textBuilder, this.parseAttr,
                                 this.parseNode, this.escape, this.step);
  }

  public static <N, B, T> Parse<T> parse(Input input, WamlParser parser,
                                         WamlMarkupForm<N, B, ? extends T> form,
                                         @Nullable B builder,
                                         @Nullable StringBuilder textBuilder,
                                         @Nullable Parse<WamlForm<T>> parseAttr,
                                         @Nullable Parse<?> parseNode,
                                         int escape, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == '@') {
        step = 2;
      } else if (input.isReady()) {
        step = 4;
      }
    }
    do {
      if (step == 2) {
        if (parseAttr == null) {
          parseAttr = Assume.conforms(parser.parseAttr(input, form));
        } else {
          parseAttr = parseAttr.consume(input);
        }
        if (parseAttr.isDone()) {
          form = Assume.conforms(parseAttr.getNonNullUnchecked());
          parseAttr = null;
          step = 3;
        } else if (parseAttr.isError()) {
          return parseAttr.asError();
        }
      }
      if (step == 3) {
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == '@') {
          step = 2;
          continue;
        } else if (input.isReady()) {
          step = 4;
        }
      }
      break;
    } while (true);
    if (step == 4) {
      if (input.isCont() && input.head() == '<') {
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('<', input));
      }
    }
    if (step == 5) {
      if (input.isCont() && input.head() == '<') {
        if (builder == null) {
          try {
            builder = form.markupBuilder();
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
        input.step();
        step = 6;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('<', input));
      }
    }
    do {
      if (step == 6) {
        while (input.isCont() && (c = input.head()) != '<' && c != '>'
                              && c != '@' && c != '\\' && c != '{') {
          if (textBuilder == null) {
            textBuilder = new StringBuilder();
          }
          textBuilder.appendCodePoint(c);
          input.step();
        }
        if (input.isCont()) {
          if (c == '<') {
            input.step();
            step = 7;
          } else if (c == '>') {
            input.step();
            step = 8;
          } else if (c == '@') {
            try {
              if (textBuilder != null) {
                builder = form.appendText(Assume.nonNull(builder), textBuilder.toString());
                textBuilder = null;
              }
              parseNode = parser.parseInline(input, form.nodeForm());
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            step = 9;
          } else if (c == '\\') {
            input.step();
            step = 10;
          } else if (c == '{') {
            if (textBuilder != null) {
              try {
                builder = form.appendText(Assume.nonNull(builder), textBuilder.toString());
              } catch (WamlException cause) {
                return Parse.diagnostic(input, cause);
              }
              textBuilder = null;
            }
            input.step();
            step = 15;
          } else {
            return Parse.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 7) {
        if (input.isCont()) {
          if (input.head() == '<') {
            if (textBuilder != null) {
              try {
                builder = form.appendText(Assume.nonNull(builder), textBuilder.toString());
              } catch (WamlException cause) {
                return Parse.diagnostic(input, cause);
              }
              textBuilder = null;
            }
            final WamlMarkupForm<?, ?, ?> markupForm;
            try {
              markupForm = form.nodeForm().markupForm();
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
            parseNode = parser.parseMarkupRest(input, markupForm);
            step = 9;
          } else {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('<');
            step = 6;
            continue;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 8) {
        if (input.isCont()) {
          if (input.head() == '>') {
            try {
              if (textBuilder != null) {
                builder = form.appendText(Assume.nonNull(builder), textBuilder.toString());
              }
              input.step();
              return Parse.done(form.buildMarkup(Assume.nonNull(builder)));
            } catch (WamlException cause) {
              return Parse.diagnostic(input, cause);
            }
          } else {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('>');
            step = 6;
            continue;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 9) {
        parseNode = Assume.nonNull(parseNode).consume(input);
        if (parseNode.isDone()) {
          final N node = Assume.conformsNullable(parseNode.getUnchecked());
          try {
            builder = form.appendNode(Assume.nonNull(builder), node);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseNode = null;
          step = 6;
          continue;
        } else if (parseNode.isError()) {
          return parseNode.asError();
        }
      }
      if (step == 10) {
        if (input.isCont()) {
          c = input.head();
          if (c == '"' || c == '\'' || c == '/' || c == '<' || c == '>' || c == '@' ||
              c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.appendCodePoint(c);
            input.step();
            step = 6;
            continue;
          } else if (c == 'b') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('\b');
            input.step();
            step = 6;
            continue;
          } else if (c == 'f') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('\f');
            input.step();
            step = 6;
            continue;
          } else if (c == 'n') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('\n');
            input.step();
            step = 6;
            continue;
          } else if (c == 'r') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('\r');
            input.step();
            step = 6;
            continue;
          } else if (c == 't') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.append('\t');
            input.step();
            step = 6;
            continue;
          } else if (c == 'u') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            input.step();
            step = 11;
          } else {
            return Parse.error(Diagnostic.expected("escape character", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step == 11) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = Base16.decodeDigit(c);
          input.step();
          step = 12;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 12) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 13;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 13) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          input.step();
          step = 9;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 14) {
        if (input.isCont() && Base16.isDigit(c = input.head())) {
          escape = 16 * escape + Base16.decodeDigit(c);
          Assume.nonNull(textBuilder).appendCodePoint(escape);
          escape = 0;
          input.step();
          step = 6;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 15) {
        while (input.isCont() && parser.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == '}') {
            input.step();
            step = 6;
            continue;
          } else if (c == '#') {
            input.step();
            step = 18;
          } else {
            step = 16;
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      if (step == 16) {
        if (parseNode == null) {
          try {
            parseNode = parser.parseExpr(input, form.nodeForm());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        } else {
          parseNode = parseNode.consume(input);
        }
        if (parseNode.isDone()) {
          final N node = Assume.conformsNullable(parseNode.getUnchecked());
          try {
            builder = form.appendNode(Assume.nonNull(builder), node);
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseNode = null;
          step = 17;
        } else if (parseNode.isError()) {
          return parseNode.asError();
        }
      }
      if (step == 17) {
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont()) {
          if (c == ',' || parser.isNewline(c)) {
            input.step();
            step = 15;
            continue;
          } else if (c == '#') {
            input.step();
            step = 18;
          } else if (c == '}') {
            input.step();
            step = 6;
            continue;
          } else {
            return Parse.error(Diagnostic.expected("'}', ',' or newline", input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected('}', input));
        }
      }
      if (step == 18) {
        while (input.isCont() && !parser.isNewline(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 15;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlMarkup<N, B, T>(parser, form, builder, textBuilder,
                                        parseAttr, parseNode, escape, step);
  }

}
