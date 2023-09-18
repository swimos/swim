// Copyright 2015-2023 Nstream, inc.
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
  final StringBuilder nameBuilder;
  final Parser<HashTrieMap<String, String>> paramsParser;
  final int step;

  TransferCodingParser(HttpParser http, StringBuilder nameBuilder,
                       Parser<HashTrieMap<String, String>> paramsParser, int step) {
    this.http = http;
    this.nameBuilder = nameBuilder;
    this.paramsParser = paramsParser;
    this.step = step;
  }

  TransferCodingParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<TransferCoding> feed(Input input) {
    return TransferCodingParser.parse(input, this.http, this.nameBuilder,
                                      this.paramsParser, this.step);
  }

  static Parser<TransferCoding> parse(Input input, HttpParser http, StringBuilder nameBuilder,
                                      Parser<HashTrieMap<String, String>> paramsParser, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (nameBuilder == null) {
            nameBuilder = new StringBuilder();
          }
          nameBuilder.appendCodePoint(c);
          step = 2;
        } else {
          return Parser.error(Diagnostic.expected("transfer coding", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("transfer coding", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          nameBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isCont()) {
        step = 3;
      } else if (input.isDone()) {
        return Parser.done(http.transferCoding(nameBuilder.toString(), HashTrieMap.<String, String>empty()));
      }
    }
    if (step == 3) {
      if (paramsParser == null) {
        paramsParser = http.parseParamMap(input);
      } else {
        paramsParser = paramsParser.feed(input);
      }
      if (paramsParser.isDone()) {
        return Parser.done(http.transferCoding(nameBuilder.toString(), paramsParser.bind()));
      } else if (paramsParser.isError()) {
        return paramsParser.asError();
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new TransferCodingParser(http, nameBuilder, paramsParser, step);
  }

  static Parser<TransferCoding> parse(Input input, HttpParser http) {
    return TransferCodingParser.parse(input, http, null, null, 1);
  }

}
