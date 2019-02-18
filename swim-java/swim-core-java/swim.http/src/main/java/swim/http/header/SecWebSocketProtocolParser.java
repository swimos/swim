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

final class SecWebSocketProtocolParser extends Parser<SecWebSocketProtocol> {
  final HttpParser http;
  final Parser<FingerTrieSeq<String>> protocols;

  SecWebSocketProtocolParser(HttpParser http, Parser<FingerTrieSeq<String>> protocols) {
    this.http = http;
    this.protocols = protocols;
  }

  SecWebSocketProtocolParser(HttpParser http) {
    this(http, null);
  }

  @Override
  public Parser<SecWebSocketProtocol> feed(Input input) {
    return parse(input, this.http, this.protocols);
  }

  static Parser<SecWebSocketProtocol> parse(Input input, HttpParser http,
                                            Parser<FingerTrieSeq<String>> protocols) {
    if (protocols == null) {
      protocols = http.parseTokenList(input);
    } else {
      protocols = protocols.feed(input);
    }
    if (protocols.isDone()) {
      final FingerTrieSeq<String> tokens = protocols.bind();
      if (!tokens.isEmpty()) {
        return done(SecWebSocketProtocol.from(tokens));
      } else {
        return error(Diagnostic.expected("websocket protocol", input));
      }
    } else if (protocols.isError()) {
      return protocols.asError();
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new SecWebSocketProtocolParser(http, protocols);
  }

  static Parser<SecWebSocketProtocol> parse(Input input, HttpParser http) {
    return parse(input, http, null);
  }
}
