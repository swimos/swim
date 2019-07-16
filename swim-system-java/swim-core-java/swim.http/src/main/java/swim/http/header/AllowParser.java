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

package swim.http.header;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.http.Http;
import swim.http.HttpMethod;
import swim.http.HttpParser;
import swim.util.Builder;

final class AllowParser extends Parser<Allow> {
  final HttpParser http;
  final Parser<HttpMethod> method;
  final Builder<HttpMethod, FingerTrieSeq<HttpMethod>> methods;
  final int step;

  AllowParser(HttpParser http, Parser<HttpMethod> method,
              Builder<HttpMethod, FingerTrieSeq<HttpMethod>> methods, int step) {
    this.http = http;
    this.method = method;
    this.methods = methods;
    this.step = step;
  }

  AllowParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<Allow> feed(Input input) {
    return parse(input, this.http, this.method, this.methods, this.step);
  }

  static Parser<Allow> parse(Input input, HttpParser http, Parser<HttpMethod> method,
                             Builder<HttpMethod, FingerTrieSeq<HttpMethod>> methods, int step) {
    int c = 0;
    if (step == 1) {
      if (method == null) {
        method = http.parseMethod(input);
      } else {
        method = method.feed(input);
      }
      if (method.isDone()) {
        if (methods == null) {
          methods = FingerTrieSeq.builder();
        }
        methods.add(method.bind());
        method = null;
        step = 2;
      } else if (method.isError()) {
        return method.asError();
      }
    }
    do {
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && c == ',') {
          input = input.step();
          step = 3;
        } else if (!input.isEmpty()) {
          return done(Allow.from(methods.bind()));
        }
      }
      if (step == 3) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont()) {
          step = 4;
        } else if (input.isDone()) {
          return error(Diagnostic.unexpected(input));
        }
      }
      if (step == 4) {
        if (method == null) {
          method = http.parseMethod(input);
        } else {
          method = method.feed(input);
        }
        if (method.isDone()) {
          methods.add(method.bind());
          method = null;
          step = 2;
          continue;
        } else if (method.isError()) {
          return method.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new AllowParser(http, method, methods, step);
  }

  static Parser<Allow> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }
}
