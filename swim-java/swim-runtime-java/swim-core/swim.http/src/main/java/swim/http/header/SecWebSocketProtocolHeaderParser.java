// Copyright 2015-2022 Swim.inc
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

final class SecWebSocketProtocolHeaderParser extends Parser<SecWebSocketProtocolHeader> {

  final HttpParser http;
  final Parser<FingerTrieSeq<String>> protocolsParser;

  SecWebSocketProtocolHeaderParser(HttpParser http, Parser<FingerTrieSeq<String>> protocolsParser) {
    this.http = http;
    this.protocolsParser = protocolsParser;
  }

  SecWebSocketProtocolHeaderParser(HttpParser http) {
    this(http, null);
  }

  @Override
  public Parser<SecWebSocketProtocolHeader> feed(Input input) {
    return SecWebSocketProtocolHeaderParser.parse(input, this.http, this.protocolsParser);
  }

  static Parser<SecWebSocketProtocolHeader> parse(Input input, HttpParser http,
                                                  Parser<FingerTrieSeq<String>> protocolsParser) {
    if (protocolsParser == null) {
      protocolsParser = http.parseTokenList(input);
    } else {
      protocolsParser = protocolsParser.feed(input);
    }
    if (protocolsParser.isDone()) {
      final FingerTrieSeq<String> tokens = protocolsParser.bind();
      if (!tokens.isEmpty()) {
        return Parser.done(SecWebSocketProtocolHeader.create(tokens));
      } else {
        return Parser.error(Diagnostic.expected("websocket protocol", input));
      }
    } else if (protocolsParser.isError()) {
      return protocolsParser.asError();
    } else if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new SecWebSocketProtocolHeaderParser(http, protocolsParser);
  }

  static Parser<SecWebSocketProtocolHeader> parse(Input input, HttpParser http) {
    return SecWebSocketProtocolHeaderParser.parse(input, http, null);
  }

}
