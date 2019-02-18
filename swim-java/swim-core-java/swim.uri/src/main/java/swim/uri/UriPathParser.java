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

final class UriPathParser extends Parser<UriPath> {
  final UriParser uri;
  final UriPathBuilder builder;
  final Output<String> output;
  final int c1;
  final int step;

  UriPathParser(UriParser uri, UriPathBuilder builder, Output<String> output, int c1, int step) {
    this.uri = uri;
    this.builder = builder;
    this.output = output;
    this.c1 = c1;
    this.step = step;
  }

  UriPathParser(UriParser uri, UriPathBuilder builder) {
    this(uri, builder, null, 0, 1);
  }

  UriPathParser(UriParser uri) {
    this(uri, null, null, 0, 1);
  }

  @Override
  public Parser<UriPath> feed(Input input) {
    return parse(input, this.uri, this.builder, this.output, this.c1, this.step);
  }

  static Parser<UriPath> parse(Input input, UriParser uri, UriPathBuilder builder,
                               Output<String> output, int c1, int step) {
    int c = 0;
    do {
      if (step == 1) {
        while (input.isCont()) {
          c = input.head();
          if (Uri.isPathChar(c)) {
            if (output == null) {
              output = Utf8.decodedString();
            }
            input = input.step();
            output = output.write(c);
          } else {
            break;
          }
        }
        if (input.isCont() && c == '/') {
          input = input.step();
          if (builder == null) {
            builder = uri.pathBuilder();
          }
          if (output != null) {
            builder.addSegment(output.bind());
            output = null;
          }
          builder.addSlash();
          continue;
        } else if (input.isCont() && c == '%') {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          if (output != null) {
            if (builder == null) {
              builder = uri.pathBuilder();
            }
            builder.addSegment(output.bind());
          }
          if (builder != null) {
            return done(builder.bind());
          } else {
            return done(uri.pathEmpty());
          }
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
            if (output == null) {
              output = Utf8.decodedString();
            }
            input = input.step();
            output = output.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
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
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new UriPathParser(uri, builder, output, c1, step);
  }

  static Parser<UriPath> parse(Input input, UriParser uri, UriPathBuilder builder) {
    return parse(input, uri, builder, null, 0, 1);
  }

  static Parser<UriPath> parse(Input input, UriParser uri) {
    return parse(input, uri, null, null, 0, 1);
  }
}
