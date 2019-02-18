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
import swim.http.HttpParser;
import swim.http.WebSocketExtension;
import swim.util.Builder;

final class SecWebSocketExtensionsParser extends Parser<SecWebSocketExtensions> {
  final HttpParser http;
  final Parser<WebSocketExtension> extension;
  final Builder<WebSocketExtension, FingerTrieSeq<WebSocketExtension>> extensions;
  final int step;

  SecWebSocketExtensionsParser(HttpParser http, Parser<WebSocketExtension> extension,
                               Builder<WebSocketExtension, FingerTrieSeq<WebSocketExtension>> extensions, int step) {
    this.http = http;
    this.extension = extension;
    this.extensions = extensions;
    this.step = step;
  }

  SecWebSocketExtensionsParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<SecWebSocketExtensions> feed(Input input) {
    return parse(input, this.http, this.extension, this.extensions, this.step);
  }

  static Parser<SecWebSocketExtensions> parse(Input input, HttpParser http, Parser<WebSocketExtension> extension,
                                              Builder<WebSocketExtension, FingerTrieSeq<WebSocketExtension>> extensions, int step) {
    int c = 0;
    if (step == 1) {
      if (extension == null) {
        extension = http.parseWebSocketExtension(input);
      } else {
        extension = extension.feed(input);
      }
      if (extension.isDone()) {
        if (extensions == null) {
          extensions = FingerTrieSeq.builder();
        }
        extensions.add(extension.bind());
        extension = null;
        step = 2;
      } else if (extension.isError()) {
        return extension.asError();
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
          return done(SecWebSocketExtensions.from(extensions.bind()));
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
        if (extension == null) {
          extension = http.parseWebSocketExtension(input);
        } else {
          extension = extension.feed(input);
        }
        if (extension.isDone()) {
          extensions.add(extension.bind());
          extension = null;
          step = 2;
          continue;
        } else if (extension.isError()) {
          return extension.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new SecWebSocketExtensionsParser(http, extension, extensions, step);
  }

  static Parser<SecWebSocketExtensions> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }
}
