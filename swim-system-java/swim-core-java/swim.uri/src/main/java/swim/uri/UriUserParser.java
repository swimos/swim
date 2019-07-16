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

final class UriUserParser extends Parser<UriUser> {
  final UriParser uri;
  final Output<String> usernameOutput;
  final Output<String> passwordOutput;
  final int c1;
  final int step;

  UriUserParser(UriParser uri, Output<String> usernameOutput,
                Output<String> passwordOutput, int c1, int step) {
    this.uri = uri;
    this.usernameOutput = usernameOutput;
    this.passwordOutput = passwordOutput;
    this.c1 = c1;
    this.step = step;
  }

  UriUserParser(UriParser uri) {
    this(uri, null, null, 0, 1);
  }

  @Override
  public Parser<UriUser> feed(Input input) {
    return parse(input, this.uri, this.usernameOutput, this.passwordOutput, this.c1, this.step);
  }

  static Parser<UriUser> parse(Input input, UriParser uri, Output<String> usernameOutput,
                               Output<String> passwordOutput, int c1, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (usernameOutput == null) {
          usernameOutput = Utf8.decodedString();
        }
        while (input.isCont()) {
          c = input.head();
          if (Uri.isUserChar(c)) {
            input = input.step();
            usernameOutput.write(c);
          } else {
            break;
          }
        }
        if (input.isCont() && c == ':') {
          input = input.step();
          step = 4;
        } else if (input.isCont() && c == '%') {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          return done(uri.user(usernameOutput.bind(), null));
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
            usernameOutput.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
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
        if (passwordOutput == null) {
          passwordOutput = Utf8.decodedString();
        }
        while (input.isCont()) {
          c = input.head();
          if (Uri.isUserInfoChar(c)) {
            input = input.step();
            passwordOutput.write(c);
          } else {
            break;
          }
        }
        if (input.isCont() && c == '%') {
          input = input.step();
          step = 5;
        } else if (!input.isEmpty()) {
          return done(uri.user(usernameOutput.bind(), passwordOutput.bind()));
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
            passwordOutput.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
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
    return new UriUserParser(uri, usernameOutput, passwordOutput, c1, step);
  }

  static Parser<UriUser> parse(Input input, UriParser uri) {
    return parse(input, uri, null, null, 0, 1);
  }
}
