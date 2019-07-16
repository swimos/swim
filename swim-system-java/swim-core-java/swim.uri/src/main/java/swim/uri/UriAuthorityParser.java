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

package swim.uri;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class UriAuthorityParser extends Parser<UriAuthority> {
  final UriParser uri;
  final Parser<UriUser> userParser;
  final Parser<UriHost> hostParser;
  final Parser<UriPort> portParser;
  final int step;

  UriAuthorityParser(UriParser uri, Parser<UriUser> userParser, Parser<UriHost> hostParser,
                     Parser<UriPort> portParser, int step) {
    this.uri = uri;
    this.userParser = userParser;
    this.hostParser = hostParser;
    this.portParser = portParser;
    this.step = step;
  }

  UriAuthorityParser(UriParser uri) {
    this(uri, null, null, null, 1);
  }

  @Override
  public Parser<UriAuthority> feed(Input input) {
    return parse(input, this.uri, this.userParser, this.hostParser, this.portParser, this.step);
  }

  static Parser<UriAuthority> parse(Input input, UriParser uri, Parser<UriUser> userParser,
                                    Parser<UriHost> hostParser, Parser<UriPort> portParser, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        Input look = input.clone();
        while (look.isCont()) {
          c = look.head();
          if (c != '@' && c != '/') {
            look = look.step();
          } else {
            break;
          }
        }
        if (look.isCont() && c == '@') {
          step = 2;
        } else {
          step = 3;
        }
      } else if (input.isDone()) {
        step = 3;
      }
    }
    if (step == 2) {
      if (userParser == null) {
        userParser = uri.parseUser(input);
      } else {
        userParser = userParser.feed(input);
      }
      if (userParser.isDone()) {
        if (input.isCont() && input.head() == '@') {
          input = input.step();
          step = 3;
        } else if (!input.isEmpty()) {
          return error(Diagnostic.expected('@', input));
        }
      } else if (userParser.isError()) {
        return userParser.asError();
      }
    }
    if (step == 3) {
      if (hostParser == null) {
        hostParser = uri.parseHost(input);
      } else {
        hostParser = hostParser.feed(input);
      }
      if (hostParser.isDone()) {
        if (input.isCont() && input.head() == ':') {
          input = input.step();
          step = 4;
        } else if (!input.isEmpty()) {
          return done(uri.authority(userParser != null ? userParser.bind() : null,
                                    hostParser.bind(), null));
        }
      } else if (hostParser.isError()) {
        return hostParser.asError();
      }
    }
    if (step == 4) {
      if (portParser == null) {
        portParser = uri.parsePort(input);
      } else {
        portParser = portParser.feed(input);
      }
      if (portParser.isDone()) {
        return done(uri.authority(userParser != null ? userParser.bind() : null,
                                  hostParser != null ? hostParser.bind() : null,
                                  portParser.bind()));
      } else if (portParser.isError()) {
        return portParser.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new UriAuthorityParser(uri, userParser, hostParser, portParser, step);
  }

  static Parser<UriAuthority> parse(Input input, UriParser uri) {
    return parse(input, uri, null, null, null, 1);
  }
}
