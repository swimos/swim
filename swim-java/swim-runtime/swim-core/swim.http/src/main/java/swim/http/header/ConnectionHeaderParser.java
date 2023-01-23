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
import swim.http.HttpParser;

final class ConnectionHeaderParser extends Parser<ConnectionHeader> {

  final HttpParser http;
  final Parser<FingerTrieSeq<String>> optionsParser;

  ConnectionHeaderParser(HttpParser http, Parser<FingerTrieSeq<String>> optionsParser) {
    this.http = http;
    this.optionsParser = optionsParser;
  }

  ConnectionHeaderParser(HttpParser http) {
    this(http, null);
  }

  @Override
  public Parser<ConnectionHeader> feed(Input input) {
    return ConnectionHeaderParser.parse(input, this.http, this.optionsParser);
  }

  static Parser<ConnectionHeader> parse(Input input, HttpParser http,
                                        Parser<FingerTrieSeq<String>> optionsParser) {
    if (optionsParser == null) {
      optionsParser = http.parseTokenList(input);
    } else {
      optionsParser = optionsParser.feed(input);
    }
    if (optionsParser.isDone()) {
      final FingerTrieSeq<String> tokens = optionsParser.bind();
      if (!tokens.isEmpty()) {
        return Parser.done(ConnectionHeader.create(tokens));
      } else {
        return Parser.error(Diagnostic.expected("connection option", input));
      }
    } else if (optionsParser.isError()) {
      return optionsParser.asError();
    } else if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new ConnectionHeaderParser(http, optionsParser);
  }

  static Parser<ConnectionHeader> parse(Input input, HttpParser http) {
    return ConnectionHeaderParser.parse(input, http, null);
  }

}
