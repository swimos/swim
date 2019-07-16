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
import swim.http.HttpParser;

final class ConnectionParser extends Parser<Connection> {
  final HttpParser http;
  final Parser<FingerTrieSeq<String>> options;

  ConnectionParser(HttpParser http, Parser<FingerTrieSeq<String>> options) {
    this.http = http;
    this.options = options;
  }

  ConnectionParser(HttpParser http) {
    this(http, null);
  }

  @Override
  public Parser<Connection> feed(Input input) {
    return parse(input, this.http, this.options);
  }

  static Parser<Connection> parse(Input input, HttpParser http,
                                  Parser<FingerTrieSeq<String>> options) {
    if (options == null) {
      options = http.parseTokenList(input);
    } else {
      options = options.feed(input);
    }
    if (options.isDone()) {
      final FingerTrieSeq<String> tokens = options.bind();
      if (!tokens.isEmpty()) {
        return done(Connection.from(tokens));
      } else {
        return error(Diagnostic.expected("connection option", input));
      }
    } else if (options.isError()) {
      return options.asError();
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new ConnectionParser(http, options);
  }

  static Parser<Connection> parse(Input input, HttpParser http) {
    return parse(input, http, null);
  }
}
