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
import swim.http.Http;
import swim.http.HttpParser;
import swim.http.WebSocketExtension;
import swim.util.Builder;

final class SecWebSocketExtensionsHeaderParser extends Parser<SecWebSocketExtensionsHeader> {

  final HttpParser http;
  final Parser<WebSocketExtension> extensionParser;
  final Builder<WebSocketExtension, FingerTrieSeq<WebSocketExtension>> extensions;
  final int step;

  SecWebSocketExtensionsHeaderParser(HttpParser http, Parser<WebSocketExtension> extensionParser,
                                     Builder<WebSocketExtension, FingerTrieSeq<WebSocketExtension>> extensions, int step) {
    this.http = http;
    this.extensionParser = extensionParser;
    this.extensions = extensions;
    this.step = step;
  }

  SecWebSocketExtensionsHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<SecWebSocketExtensionsHeader> feed(Input input) {
    return SecWebSocketExtensionsHeaderParser.parse(input, this.http, this.extensionParser, this.extensions, this.step);
  }

  static Parser<SecWebSocketExtensionsHeader> parse(Input input, HttpParser http, Parser<WebSocketExtension> extensionParser,
                                                    Builder<WebSocketExtension, FingerTrieSeq<WebSocketExtension>> extensions, int step) {
    int c = 0;
    if (step == 1) {
      if (extensionParser == null) {
        extensionParser = http.parseWebSocketExtension(input);
      } else {
        extensionParser = extensionParser.feed(input);
      }
      if (extensionParser.isDone()) {
        if (extensions == null) {
          extensions = FingerTrieSeq.builder();
        }
        extensions.add(extensionParser.bind());
        extensionParser = null;
        step = 2;
      } else if (extensionParser.isError()) {
        return extensionParser.asError();
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
          return Parser.done(SecWebSocketExtensionsHeader.create(extensions.bind()));
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
        if (extensionParser == null) {
          extensionParser = http.parseWebSocketExtension(input);
        } else {
          extensionParser = extensionParser.feed(input);
        }
        if (extensionParser.isDone()) {
          extensions.add(extensionParser.bind());
          extensionParser = null;
          step = 2;
          continue;
        } else if (extensionParser.isError()) {
          return extensionParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new SecWebSocketExtensionsHeaderParser(http, extensionParser, extensions, step);
  }

  static Parser<SecWebSocketExtensionsHeader> parse(Input input, HttpParser http) {
    return SecWebSocketExtensionsHeaderParser.parse(input, http, null, null, 1);
  }

}
