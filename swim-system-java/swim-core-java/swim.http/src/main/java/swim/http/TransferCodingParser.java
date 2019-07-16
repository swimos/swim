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

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.HashTrieMap;

final class TransferCodingParser extends Parser<TransferCoding> {
  final HttpParser http;
  final StringBuilder name;
  final Parser<HashTrieMap<String, String>> params;
  final int step;

  TransferCodingParser(HttpParser http, StringBuilder name,
                       Parser<HashTrieMap<String, String>> params, int step) {
    this.http = http;
    this.name = name;
    this.params = params;
    this.step = step;
  }

  TransferCodingParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<TransferCoding> feed(Input input) {
    return parse(input, this.http, this.name, this.params, this.step);
  }

  static Parser<TransferCoding> parse(Input input, HttpParser http, StringBuilder name,
                                      Parser<HashTrieMap<String, String>> params, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (name == null) {
            name = new StringBuilder();
          }
          name.appendCodePoint(c);
          step = 2;
        } else {
          return error(Diagnostic.expected("transfer coding", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("transfer coding", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          name.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isCont()) {
        step = 3;
      } else if (input.isDone()) {
        return done(http.transferCoding(name.toString(), HashTrieMap.<String, String>empty()));
      }
    }
    if (step == 3) {
      if (params == null) {
        params = http.parseParamMap(input);
      } else {
        params = params.feed(input);
      }
      if (params.isDone()) {
        return done(http.transferCoding(name.toString(), params.bind()));
      } else if (params.isError()) {
        return params.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new TransferCodingParser(http, name, params, step);
  }

  static Parser<TransferCoding> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }
}
