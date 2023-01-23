// Copyright 2015-2023 Swim.inc
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

final class AllowHeaderParser extends Parser<AllowHeader> {

  final HttpParser http;
  final Parser<HttpMethod> methodParser;
  final Builder<HttpMethod, FingerTrieSeq<HttpMethod>> methods;
  final int step;

  AllowHeaderParser(HttpParser http, Parser<HttpMethod> methodParser,
                    Builder<HttpMethod, FingerTrieSeq<HttpMethod>> methods, int step) {
    this.http = http;
    this.methodParser = methodParser;
    this.methods = methods;
    this.step = step;
  }

  AllowHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<AllowHeader> feed(Input input) {
    return AllowHeaderParser.parse(input, this.http, this.methodParser, this.methods, this.step);
  }

  static Parser<AllowHeader> parse(Input input, HttpParser http, Parser<HttpMethod> methodParser,
                                   Builder<HttpMethod, FingerTrieSeq<HttpMethod>> methods, int step) {
    int c = 0;
    if (step == 1) {
      if (methodParser == null) {
        methodParser = http.parseMethod(input);
      } else {
        methodParser = methodParser.feed(input);
      }
      if (methodParser.isDone()) {
        if (methods == null) {
          methods = FingerTrieSeq.builder();
        }
        methods.add(methodParser.bind());
        methodParser = null;
        step = 2;
      } else if (methodParser.isError()) {
        return methodParser.asError();
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
          return Parser.done(AllowHeader.create(methods.bind()));
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
          return Parser.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 4) {
        if (methodParser == null) {
          methodParser = http.parseMethod(input);
        } else {
          methodParser = methodParser.feed(input);
        }
        if (methodParser.isDone()) {
          methods.add(methodParser.bind());
          methodParser = null;
          step = 2;
          continue;
        } else if (methodParser.isError()) {
          return methodParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new AllowHeaderParser(http, methodParser, methods, step);
  }

  static Parser<AllowHeader> parse(Input input, HttpParser http) {
    return AllowHeaderParser.parse(input, http, null, null, 1);
  }

}
