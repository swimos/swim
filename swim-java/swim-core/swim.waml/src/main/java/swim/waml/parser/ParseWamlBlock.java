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
import swim.codec.Input;
import swim.codec.Parse;
import swim.util.Assume;
import swim.waml.WamlException;
import swim.waml.WamlParser;
import swim.waml.WamlTupleForm;

@Internal
public final class ParseWamlBlock<P, B, T> extends Parse<T> {

  final WamlParser parser;
  final WamlTupleForm<?, P, B, ? extends T> form;
  final @Nullable B builder;
  final @Nullable Parse<P> parseLabel;
  final @Nullable Parse<P> parseParam;
  final int step;

  public ParseWamlBlock(WamlParser parser, WamlTupleForm<?, P, B, ? extends T> form,
                        @Nullable B builder, @Nullable Parse<P> parseLabel,
                        @Nullable Parse<P> parseParam, int step) {
    this.parser = parser;
    this.form = form;
    this.builder = builder;
    this.parseLabel = parseLabel;
    this.parseParam = parseParam;
    this.step = step;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseWamlBlock.parse(input, this.parser, this.form, this.builder,
                                this.parseLabel, this.parseParam, this.step);
  }

  public static <P, B, T> Parse<T> parse(Input input, WamlParser parser,
                                         WamlTupleForm<?, P, B, ? extends T> form,
                                         @Nullable B builder,
                                         @Nullable Parse<P> parseLabel,
                                         @Nullable Parse<P> parseParam, int step) {
    int c = 0;
    do {
      if (step == 1) {
        while (input.isCont() && parser.isWhitespace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && (c == '#' // comment
                            || c == '@' // attr
                            || c == '(' // tuple
                            || c == '{' // object
                            || c == '<' // markup
                            || c == '[' // array
                            || c == '"' // string
                            || parser.isIdentifierStartChar(c) // identifier
                            || c == '+' || c == '-' || (c >= '0' && c <= '9') // number
                            || c == '%' // context expr
                            || c == '$' // global expr
                            || c == '*' // children or descendants expr
                            || c == '!' // not expr
                            || c == '~')) { // bitwise not expr
          if (c == '#') {
            input.step();
            step = 7;
          } else { // value
            if (parseParam != null) {
              try {
                if (builder == null) {
                  builder = form.tupleBuilder();
                }
                builder = form.appendParam(builder, parseParam.getUnchecked());
              } catch (WamlException cause) {
                return Parse.diagnostic(input, cause);
              }
              parseParam = null;
            }
            step = 2;
          }
        } else if (input.isReady()) {
          try {
            if (builder != null) {
              if (parseParam != null) {
                builder = form.appendParam(builder, parseParam.getUnchecked());
              }
              return Parse.done(form.buildTuple(builder));
            } else if (parseParam != null) {
              return Parse.done(form.unaryTuple(parseParam.getUnchecked()));
            } else {
              return Parse.done(form.emptyTuple());
            }
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      }
      if (step == 2) {
        if (parseLabel == null) {
          parseLabel = parser.parseExpr(input, form.paramForm());
        } else {
          parseLabel = parseLabel.consume(input);
        }
        if (parseLabel.isDone()) {
          step = 3;
        } else if (parseLabel.isError()) {
          return parseLabel.asError();
        }
      }
      if (step == 3) {
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && c == ':') {
          input.step();
          step = 4;
        } else if (input.isReady()) {
          parseParam = parseLabel;
          parseLabel = null;
          step = 6;
        }
      }
      if (step == 4) {
        while (input.isCont() && parser.isSpace(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 5;
        }
      }
      if (step == 5) {
        if (parseParam == null) {
          parseParam = parser.parseExpr(input, form.paramForm());
        } else {
          parseParam = parseParam.consume(input);
        }
        if (parseParam.isDone()) {
          try {
            if (builder == null) {
              builder = form.tupleBuilder();
            }
            builder = form.appendParam(builder, Assume.nonNull(parseLabel).getUnchecked(),
                                       parseParam.getUnchecked());
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
          parseParam = null;
          parseLabel = null;
          step = 6;
        } else if (parseParam.isError()) {
          return parseParam.asError();
        }
      }
      if (step == 6) {
        while (input.isCont() && parser.isSpace(c = input.head())) {
          input.step();
        }
        if (input.isCont() && (c == '#' || c == ',' || parser.isNewline(c))) {
          input.step();
          if (c == '#') {
            step = 7;
          } else { // c == ',' || parser.isNewline(c)
            step = 1;
            continue;
          }
        } else if (input.isReady()) {
          try {
            if (builder != null) {
              if (parseParam != null) {
                builder = form.appendParam(builder, parseParam.getUnchecked());
              }
              return Parse.done(form.buildTuple(builder));
            } else if (parseParam != null) {
              return Parse.done(form.unaryTuple(parseParam.getUnchecked()));
            } else {
              return Parse.done(form.emptyTuple());
            }
          } catch (WamlException cause) {
            return Parse.diagnostic(input, cause);
          }
        }
      }
      if (step == 7) {
        while (input.isCont() && !parser.isNewline(input.head())) {
          input.step();
        }
        if (input.isReady()) {
          step = 1;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseWamlBlock<P, B, T>(parser, form, builder, parseLabel,
                                       parseParam, step);
  }

}
