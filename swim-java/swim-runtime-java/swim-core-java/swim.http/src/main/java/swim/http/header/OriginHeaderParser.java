// Copyright 2015-2021 Swim Inc.
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
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriHost;
import swim.uri.UriPort;
import swim.uri.UriScheme;
import swim.util.Builder;

final class OriginHeaderParser extends Parser<OriginHeader> {

  final Parser<UriScheme> schemeParser;
  final Parser<UriHost> hostParser;
  final Parser<UriPort> portParser;
  final Builder<Uri, FingerTrieSeq<Uri>> origins;
  final int step;

  OriginHeaderParser(Parser<UriScheme> schemeParser, Parser<UriHost> hostParser,
                     Parser<UriPort> portParser, Builder<Uri, FingerTrieSeq<Uri>> origins, int step) {
    this.schemeParser = schemeParser;
    this.hostParser = hostParser;
    this.portParser = portParser;
    this.origins = origins;
    this.step = step;
  }

  OriginHeaderParser() {
    this(null, null, null, null, 1);
  }

  @Override
  public Parser<OriginHeader> feed(Input input) {
    return OriginHeaderParser.parse(input, this.schemeParser, this.hostParser,
                                    this.portParser, this.origins, this.step);
  }

  static Parser<OriginHeader> parse(Input input, Parser<UriScheme> schemeParser,
                                    Parser<UriHost> hostParser, Parser<UriPort> portParser,
                                    Builder<Uri, FingerTrieSeq<Uri>> origins, int step) {
    do {
      if (step == 1) {
        if (schemeParser == null) {
          schemeParser = Uri.standardParser().parseScheme(input);
        } else {
          schemeParser = schemeParser.feed(input);
        }
        if (schemeParser.isDone()) {
          if (input.isCont() && input.head() == ':') {
            input = input.step();
            step = 2;
          } else if (!input.isEmpty()) {
            if (origins == null && "null".equals(schemeParser.bind().name())) {
              return Parser.done(OriginHeader.empty());
            } else {
              return Parser.error(Diagnostic.expected(':', input));
            }
          }
        } else if (schemeParser.isError()) {
          return schemeParser.asError();
        }
      }
      if (step == 2) {
        if (input.isCont() && input.head() == '/') {
          input = input.step();
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected('/', input));
        }
      }
      if (step == 3) {
        if (input.isCont() && input.head() == '/') {
          input = input.step();
          step = 4;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected('/', input));
        }
      }
      if (step == 4) {
        if (hostParser == null) {
          hostParser = Uri.standardParser().parseHost(input);
        } else {
          hostParser = hostParser.feed(input);
        }
        if (hostParser.isDone()) {
          if (input.isCont() && input.head() == ':') {
            input = input.step();
            step = 5;
          } else if (!input.isEmpty()) {
            if (origins == null) {
              origins = FingerTrieSeq.builder();
            }
            origins.add(Uri.create(schemeParser.bind(), UriAuthority.create(hostParser.bind())));
            schemeParser = null;
            hostParser = null;
            step = 6;
          }
        } else if (hostParser.isError()) {
          return hostParser.asError();
        }
      }
      if (step == 5) {
        if (portParser == null) {
          portParser = Uri.standardParser().parsePort(input);
        } else {
          portParser = portParser.feed(input);
        }
        if (portParser.isDone()) {
          if (origins == null) {
            origins = FingerTrieSeq.builder();
          }
          origins.add(Uri.create(schemeParser.bind(), UriAuthority.create(hostParser.bind(), portParser.bind())));
          schemeParser = null;
          hostParser = null;
          portParser = null;
          step = 6;
        } else if (portParser.isError()) {
          return portParser.asError();
        }
      }
      if (step == 6) {
        if (input.isCont() && input.head() == ' ') {
          input = input.step();
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.done(OriginHeader.create(origins.bind()));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new OriginHeaderParser(schemeParser, hostParser, portParser, origins, step);
  }

  static Parser<OriginHeader> parse(Input input) {
    return OriginHeaderParser.parse(input, null, null, null, null, 1);
  }

}
