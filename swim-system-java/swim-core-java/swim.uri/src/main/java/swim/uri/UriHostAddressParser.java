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

import swim.codec.Base10;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Utf8;

final class UriHostAddressParser extends Parser<UriHost> {
  final UriParser uri;
  final Output<String> output;
  final int c1;
  final int x;
  final int step;

  UriHostAddressParser(UriParser uri, Output<String> output,
                       int c1, int x, int step) {
    this.uri = uri;
    this.output = output;
    this.c1 = c1;
    this.x = x;
    this.step = step;
  }

  UriHostAddressParser(UriParser uri) {
    this(uri, null, 0, 0, 1);
  }

  @Override
  public Parser<UriHost> feed(Input input) {
    return parse(input, this.uri, this.output, this.c1, this.x, this.step);
  }

  static Parser<UriHost> parse(Input input, UriParser uri, Output<String> output,
                               int c1, int x, int step) {
    int c = 0;
    if (output == null) {
      output = Utf8.decodedString();
    }
    while (step <= 4) {
      while (input.isCont()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input = input.step();
          output = output.write(c);
          x = 10 * x + Base10.decodeDigit(c);
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (c == '.' && step < 4 && x <= 255) {
          input = input.step();
          output = output.write(c);
          x = 0;
          step += 1;
        } else if (!Uri.isHostChar(c) && c != '%' && step == 4 && x <= 255) {
          return done(uri.hostIPv4(output.bind()));
        } else {
          x = 0;
          step = 5;
          break;
        }
      } else if (!input.isEmpty()) {
        if (step == 4 && x <= 255) {
          return done(uri.hostIPv4(output.bind()));
        } else {
          return done(uri.hostName(output.bind()));
        }
      } else {
        break;
      }
    }
    do {
      if (step == 5) {
        while (input.isCont()) {
          c = input.head();
          if (Uri.isHostChar(c)) {
            input = input.step();
            output = output.write(Character.toLowerCase(c));
          } else {
            break;
          }
        }
        if (input.isCont() && c == '%') {
          input = input.step();
          step = 6;
        } else if (!input.isEmpty()) {
          return done(uri.hostName(output.bind()));
        }
      }
      if (step == 6) {
        if (input.isCont()) {
          c = input.head();
          if (Base16.isDigit(c)) {
            input = input.step();
            c1 = c;
            step = 7;
          } else {
            return error(Diagnostic.expected("hex digit", input));
          }
        } else if (input.isDone()) {
          return error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step == 7) {
        if (input.isCont()) {
          c = input.head();
          if (Base16.isDigit(c)) {
            input = input.step();
            output = output.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
            c1 = 0;
            step = 5;
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
    return new UriHostAddressParser(uri, output, c1, x, step);
  }

  static Parser<UriHost> parse(Input input, UriParser uri) {
    return parse(input, uri, null, 0, 0, 1);
  }
}
