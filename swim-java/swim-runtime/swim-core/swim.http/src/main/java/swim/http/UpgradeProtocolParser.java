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

final class UpgradeProtocolParser extends Parser<UpgradeProtocol> {

  final HttpParser http;
  final StringBuilder nameBuilder;
  final StringBuilder versionBuilder;
  final int step;

  UpgradeProtocolParser(HttpParser http, StringBuilder nameBuilder,
                        StringBuilder versionBuilder, int step) {
    this.http = http;
    this.nameBuilder = nameBuilder;
    this.versionBuilder = versionBuilder;
    this.step = step;
  }

  UpgradeProtocolParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<UpgradeProtocol> feed(Input input) {
    return UpgradeProtocolParser.parse(input, this.http, this.nameBuilder,
                                       this.versionBuilder, this.step);
  }

  static Parser<UpgradeProtocol> parse(Input input, HttpParser http, StringBuilder nameBuilder,
                                       StringBuilder versionBuilder, int step) {
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
          return Parser.error(Diagnostic.expected("upgrade protocol name", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("upgrade protocol name", input));
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
      if (input.isCont() && c == '/') {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return Parser.done(http.upgradeProtocol(nameBuilder.toString(), ""));
      }
    }
    if (step == 3) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (versionBuilder == null) {
            versionBuilder = new StringBuilder();
          }
          versionBuilder.appendCodePoint(c);
          step = 4;
        } else {
          return Parser.error(Diagnostic.expected("upgrade protocol version", input));
        }
      } else if (input.isDone()) {
        return Parser.error(Diagnostic.expected("upgrade protocol version", input));
      }
    }
    if (step == 4) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          versionBuilder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return Parser.done(http.upgradeProtocol(nameBuilder.toString(), versionBuilder.toString()));
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new UpgradeProtocolParser(http, nameBuilder, versionBuilder, step);
  }

  static Parser<UpgradeProtocol> parse(Input input, HttpParser http) {
    return UpgradeProtocolParser.parse(input, http, null, null, 1);
  }

}
