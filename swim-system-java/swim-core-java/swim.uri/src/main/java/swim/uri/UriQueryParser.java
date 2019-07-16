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

package swim.uri;

import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Utf8;

final class UriQueryParser extends Parser<UriQuery> {
  final UriParser uri;
  final UriQueryBuilder builder;
  final Output<String> keyOutput;
  final Output<String> valueOutput;
  final int c1;
  final int step;

  UriQueryParser(UriParser uri, UriQueryBuilder builder, Output<String> keyOutput,
                 Output<String> valueOutput, int c1, int step) {
    this.uri = uri;
    this.builder = builder;
    this.keyOutput = keyOutput;
    this.valueOutput = valueOutput;
    this.c1 = c1;
    this.step = step;
  }

  UriQueryParser(UriParser uri, UriQueryBuilder builder) {
    this(uri, builder, null, null, 0, 1);
  }

  UriQueryParser(UriParser uri) {
    this(uri, null, null, null, 0, 1);
  }

  @Override
  public Parser<UriQuery> feed(Input input) {
    return parse(input, this.uri, this.builder, this.keyOutput,
                 this.valueOutput, this.c1, this.step);
  }

  static Parser<UriQuery> parse(Input input, UriParser uri, UriQueryBuilder builder,
                                Output<String> keyOutput, Output<String> valueOutput,
                                int c1, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (keyOutput == null) {
          keyOutput = Utf8.decodedString();
        }
        while (input.isCont()) {
          c = input.head();
          if (Uri.isParamChar(c)) {
            input = input.step();
            keyOutput.write(c);
          } else {
            break;
          }
        }
        if (input.isCont() && c == '=') {
          input = input.step();
          step = 4;
        } else if (input.isCont() && c == '&') {
          input = input.step();
          if (builder == null) {
            builder = uri.queryBuilder();
          }
          builder.addParam(keyOutput.bind());
          keyOutput = null;
          continue;
        } else if (input.isCont() && c == '%') {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          if (builder == null) {
            builder = uri.queryBuilder();
          }
          builder.addParam(keyOutput.bind());
          return done(builder.bind());
        }
      }
      if (step == 2) {
        if (input.isCont()) {
          c = input.head();
          if (Base16.isDigit(c)) {
            input = input.step();
            c1 = c;
            step = 3;
          } else {
            return error(Diagnostic.expected("hex digit", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 3) {
        if (input.isCont()) {
          c = input.head();
          if (Base16.isDigit(c)) {
            input = input.step();
            keyOutput.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
            c1 = 0;
            step = 1;
            continue;
          } else {
            return error(Diagnostic.expected("hex digit", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 4) {
        if (valueOutput == null) {
          valueOutput = Utf8.decodedString();
        }
        while (input.isCont()) {
          c = input.head();
          if (Uri.isParamChar(c) || c == '=') {
            input = input.step();
            valueOutput.write(c);
          } else {
            break;
          }
        }
        if (input.isCont() && c == '&') {
          input = input.step();
          if (builder == null) {
            builder = uri.queryBuilder();
          }
          builder.addParam(keyOutput.bind(), valueOutput.bind());
          keyOutput = null;
          valueOutput = null;
          step = 1;
          continue;
        } else if (input.isCont() && c == '%') {
          input = input.step();
          step = 5;
        } else if (!input.isEmpty()) {
          if (builder == null) {
            builder = uri.queryBuilder();
          }
          builder.addParam(keyOutput.bind(), valueOutput.bind());
          return done(builder.bind());
        }
      }
      if (step == 5) {
        if (input.isCont()) {
          c = input.head();
          if (Base16.isDigit(c)) {
            input = input.step();
            c1 = c;
            step = 6;
          } else {
            return error(Diagnostic.expected("hex digit", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 6) {
        if (input.isCont()) {
          c = input.head();
          if (Base16.isDigit(c)) {
            input = input.step();
            valueOutput.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
            c1 = 0;
            step = 4;
            continue;
          } else {
            return error(Diagnostic.expected("hex digit", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new UriQueryParser(uri, builder, keyOutput, valueOutput, c1, step);
  }

  static Parser<UriQuery> parse(Input input, UriParser uri, UriQueryBuilder builder) {
    return parse(input, uri, builder, null, null, 0, 1);
  }

  static Parser<UriQuery> parse(Input input, UriParser uri) {
    return parse(input, uri, null, null, null, 0, 1);
  }
}
