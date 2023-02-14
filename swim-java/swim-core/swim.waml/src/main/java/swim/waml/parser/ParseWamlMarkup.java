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
import swim.waml.Waml;
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
          form = Assume.conforms(parseAttr.getNonNull());
          parseAttr = null;
          step = 3;
        } else if (parseAttr.isError()) {
          return parseAttr.asError();
        }
      }
      if (step == 3) {
        while (input.isCont()) {
          c = input.head();
          if (parser.isSpace(c)) {
            input.step();
          } else {
            break;
          }
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
        input.step();
        if (builder == null) {
          builder = form.markupBuilder();
        }
        step = 6;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('<', input));
      }
    }
    markup: do {
      if (step == 6) {
        builder = Assume.nonNull(builder);
        while (input.isCont()) {
          c = input.head();
          if (c != '<' && c  != '>' && c != '@' && c != '\\' && c != '{') {
            input.step();
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isCont()) {
          if (c == '<') {
            input.step();
            step = 7;
          } else if (c == '>') {
            input.step();
            step = 8;
          } else if (c == '@') {
            if (textBuilder != null) {
              builder = form.appendText(builder, textBuilder.toString());
              textBuilder = null;
            }
            parseNode = parser.parseInline(input, form.nodeForm());
            step = 9;
          } else if (c == '\\') {
            input.step();
            step = 10;
          } else if (c == '{') {
            input.step();
            if (textBuilder != null) {
              builder = form.appendText(builder, textBuilder.toString());
              textBuilder = null;
            }
            step = 15;
          } else {
            return Parse.error(Diagnostic.unexpected(input));
          }
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 7) {
        builder = Assume.nonNull(builder);
        if (input.isCont()) {
          if (input.head() == '<') {
            if (textBuilder != null) {
              builder = form.appendText(builder, textBuilder.toString());
              textBuilder = null;
            }
            final WamlMarkupForm<?, ?, ?> markupForm = form.nodeForm().markupForm();
            if (markupForm != null) {
              parseNode = parser.parseMarkupRest(input, markupForm);
            } else {
              return Parse.error(Diagnostic.message("unexpected markup", input));
            }
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
        builder = Assume.nonNull(builder);
        if (input.isCont()) {
          if (input.head() == '>') {
            input.step();
            if (textBuilder != null) {
              builder = form.appendText(builder, textBuilder.toString());
            }
            return Parse.done(form.buildMarkup(builder));
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
        builder = Assume.nonNull(builder);
        parseNode = Assume.nonNull(parseNode);
        parseNode = parseNode.consume(input);
        if (parseNode.isDone()) {
          builder = form.appendNode(builder, Assume.conformsNullable(parseNode.get()));
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
          if (c == '"' || c == '\'' || c == '/' || c == '<' || c == '>' || c == '@' || c == '[' || c == '\\' || c == ']' || c == '{' || c == '}') {
            input.step();
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            textBuilder.appendCodePoint(c);
            step = 6;
          } else if (c == 'b') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            input.step();
            textBuilder.append('\b');
            step = 6;
          } else if (c == 'f') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            input.step();
            textBuilder.append('\f');
            step = 6;
          } else if (c == 'n') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            input.step();
            textBuilder.append('\n');
            step = 6;
          } else if (c == 'r') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            input.step();
            textBuilder.append('\r');
            step = 6;
          } else if (c == 't') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            input.step();
            textBuilder.append('\t');
            step = 6;
          } else if (c == 'u') {
            if (textBuilder == null) {
              textBuilder = new StringBuilder();
            }
            input.step();
            step = 11;
          } else {
            return Parse.error(Diagnostic.expected("escape character", input));
          }
          continue;
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.expected("escape character", input));
        }
      }
      if (step >= 11 && step < 15) {
        textBuilder = Assume.nonNull(textBuilder);
        do {
          if (input.isCont()) {
            c = input.head();
            if (Base16.isDigit(c)) {
              input.step();
              escape = 16 * escape + Base16.decodeDigit(c);
              if (step <= 13) {
                step += 1;
                continue;
              } else {
                textBuilder.appendCodePoint(escape);
                escape = 0;
                step = 6;
                continue markup;
              }
            } else {
              return Parse.error(Diagnostic.expected("hex digit", input));
            }
          } else if (input.isDone()) {
            return Parse.error(Diagnostic.expected("hex digit", input));
          }
          break;
        } while (true);
      }
      if (step == 15) {
        while (input.isCont()) {
          c = input.head();
          if (parser.isWhitespace(c)) {
            input.step();
          } else {
            break;
          }
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
        builder = Assume.nonNull(builder);
        if (parseNode == null) {
          parseNode = parser.parseExpr(input, form.nodeForm());
        } else {
          parseNode = parseNode.consume(input);
        }
        if (parseNode.isDone()) {
          builder = form.appendNode(builder, Assume.conformsNullable(parseNode.get()));
          parseNode = null;
          step = 17;
        } else if (parseNode.isError()) {
          return parseNode.asError();
        }
      }
      if (step == 17) {
        while (input.isCont()) {
          c = input.head();
          if (parser.isSpace(c)) {
            input.step();
          } else {
            break;
          }
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
