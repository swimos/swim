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
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Utf8;

final class HttpStatusParser extends Parser<HttpStatus> {
  final HttpParser http;
  final int code;
  final Output<String> phrase;
  final int step;

  HttpStatusParser(HttpParser http, int code, Output<String> phrase, int step) {
    this.http = http;
    this.code = code;
    this.phrase = phrase;
    this.step = step;
  }

  HttpStatusParser(HttpParser http) {
    this(http, 0, null, 1);
  }

  @Override
  public Parser<HttpStatus> feed(Input input) {
    return parse(input, this.http, this.code, this.phrase, this.step);
  }

  static Parser<HttpStatus> parse(Input input, HttpParser http, int code,
                                  Output<String> phrase, int step) {
    int c = 0;
    while (step <= 3) {
      if (input.isCont()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input = input.step();
          code = 10 * code + Base10.decodeDigit(c);
          step += 1;
          continue;
        } else {
          return error(Diagnostic.expected("status code", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("status code", input));
      }
      break;
    }
    if (step == 4) {
      if (input.isCont() && input.head() == ' ') {
        input = input.step();
        step = 5;
      } else if (!input.isEmpty()) {
        return error(Diagnostic.expected("space", input));
      }
    }
    if (step == 5) {
      if (phrase == null) {
        phrase = Utf8.decodedString();
      }
      while (input.isCont()) {
        c = input.head();
        if (Http.isPhraseChar(c)) {
          input = input.step();
          phrase.write(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return done(http.status(code, phrase.bind()));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new HttpStatusParser(http, code, phrase, step);
  }

  static Parser<HttpStatus> parse(Input input, HttpParser http) {
    return parse(input, http, 0, null, 1);
  }
}
