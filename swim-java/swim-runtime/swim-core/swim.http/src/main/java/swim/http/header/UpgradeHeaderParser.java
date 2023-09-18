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

package swim.http.header;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.http.Http;
import swim.http.HttpParser;
import swim.http.UpgradeProtocol;
import swim.util.Builder;

final class UpgradeHeaderParser extends Parser<UpgradeHeader> {

  final HttpParser http;
  final Parser<UpgradeProtocol> protocolParser;
  final Builder<UpgradeProtocol, FingerTrieSeq<UpgradeProtocol>> protocols;
  final int step;

  UpgradeHeaderParser(HttpParser http, Parser<UpgradeProtocol> protocolParser,
                      Builder<UpgradeProtocol, FingerTrieSeq<UpgradeProtocol>> protocols, int step) {
    this.http = http;
    this.protocolParser = protocolParser;
    this.protocols = protocols;
    this.step = step;
  }

  UpgradeHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<UpgradeHeader> feed(Input input) {
    return UpgradeHeaderParser.parse(input, this.http, this.protocolParser, this.protocols, this.step);
  }

  static Parser<UpgradeHeader> parse(Input input, HttpParser http, Parser<UpgradeProtocol> protocolParser,
                                     Builder<UpgradeProtocol, FingerTrieSeq<UpgradeProtocol>> protocols, int step) {
    int c = 0;
    if (step == 1) {
      if (protocolParser == null) {
        protocolParser = http.parseUpgradeProtocol(input);
      } else {
        protocolParser = protocolParser.feed(input);
      }
      if (protocolParser.isDone()) {
        if (protocols == null) {
          protocols = FingerTrieSeq.builder();
        }
        protocols.add(protocolParser.bind());
        protocolParser = null;
        step = 2;
      } else if (protocolParser.isError()) {
        return protocolParser.asError();
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
          return Parser.done(UpgradeHeader.create(protocols.bind()));
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
        if (protocolParser == null) {
          protocolParser = http.parseUpgradeProtocol(input);
        } else {
          protocolParser = protocolParser.feed(input);
        }
        if (protocolParser.isDone()) {
          protocols.add(protocolParser.bind());
          protocolParser = null;
          step = 2;
          continue;
        } else if (protocolParser.isError()) {
          return protocolParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new UpgradeHeaderParser(http, protocolParser, protocols, step);
  }

  static Parser<UpgradeHeader> parse(Input input, HttpParser http) {
    return UpgradeHeaderParser.parse(input, http, null, null, 1);
  }

}
