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

package swim.http;

import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class HttpVersionParser extends Parser<HttpVersion> {
  final HttpParser http;
  final int major;
  final int minor;
  final int step;

  HttpVersionParser(HttpParser http, int major, int minor, int step) {
    this.http = http;
    this.major = major;
    this.minor = minor;
    this.step = step;
  }

  HttpVersionParser(HttpParser http) {
    this(http, 0, 0, 1);
  }

  @Override
  public Parser<HttpVersion> feed(Input input) {
    return parse(input, this.http, this.major, this.minor, this.step);
  }

  static Parser<HttpVersion> parse(Input input, HttpParser http, int major, int minor, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == 'H') {
        input = input.step();
        step = 2;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected('H', input));
      }
    }
    if (step == 2) {
      if (input.isCont() && input.head() == 'T') {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected('T', input));
      }
    }
    if (step == 3) {
      if (input.isCont() && input.head() == 'T') {
        input = input.step();
        step = 4;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected('T', input));
      }
    }
    if (step == 4) {
      if (input.isCont() && input.head() == 'P') {
        input = input.step();
        step = 5;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected('P', input));
      }
    }
    if (step == 5) {
      if (input.isCont() && input.head() == '/') {
        input = input.step();
        step = 6;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected('/', input));
      }
    }
    if (step == 6) {
      if (!input.isEmpty()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input = input.step();
          major = Base10.decodeDigit(c);
          step = 7;
        } else {
          return error(Diagnostic.expected("major version", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("major version", input));
      }
    }
    if (step == 7) {
      if (input.isCont() && input.head() == '.') {
        input = input.step();
        step = 8;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected('.', input));
      }
    }
    if (step == 8) {
      if (!input.isEmpty()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input = input.step();
          minor = Base10.decodeDigit(c);
          return done(http.version(major, minor));
        } else {
          return error(Diagnostic.expected("minor version", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("minor version", input));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new HttpVersionParser(http, major, minor, step);
  }

  static Parser<HttpVersion> parse(Input input, HttpParser http) {
    return parse(input, http, 0, 0, 1);
  }
}
