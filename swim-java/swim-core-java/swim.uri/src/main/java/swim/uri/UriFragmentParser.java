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

final class UriFragmentParser extends Parser<UriFragment> {
  final UriParser uri;
  final Output<String> output;
  final int c1;
  final int step;

  UriFragmentParser(UriParser uri, Output<String> output, int c1, int step) {
    this.uri = uri;
    this.output = output;
    this.c1 = c1;
    this.step = step;
  }

  UriFragmentParser(UriParser uri) {
    this(uri, null, 0, 1);
  }

  @Override
  public Parser<UriFragment> feed(Input input) {
    return parse(input, this.uri, this.output, this.c1, this.step);
  }

  static Parser<UriFragment> parse(Input input, UriParser uri,
                                   Output<String> output, int c1, int step) {
    int c = 0;
    if (output == null) {
      output = Utf8.decodedString();
    }
    do {
      if (step == 1) {
        while (input.isCont()) {
          c = input.head();
          if (Uri.isFragmentChar(c)) {
            input = input.step();
            output = output.write(c);
          } else {
            break;
          }
        }
        if (input.isCont() && c == '%') {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          return done(uri.fragment(output.bind()));
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
    return new UriFragmentParser(uri, output, c1, step);
  }

  static Parser<UriFragment> parse(Input input, UriParser uri) {
    return parse(input, uri, null, 0, 1);
  }
}
