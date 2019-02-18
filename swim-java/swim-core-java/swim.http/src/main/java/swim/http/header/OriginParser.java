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
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriHost;
import swim.uri.UriPort;
import swim.uri.UriScheme;
import swim.util.Builder;

final class OriginParser extends Parser<Origin> {
  final Parser<UriScheme> scheme;
  final Parser<UriHost> host;
  final Parser<UriPort> port;
  final Builder<Uri, FingerTrieSeq<Uri>> origins;
  final int step;

  OriginParser(Parser<UriScheme> scheme, Parser<UriHost> host, Parser<UriPort> port,
                    Builder<Uri, FingerTrieSeq<Uri>> origins, int step) {
    this.scheme = scheme;
    this.host = host;
    this.port = port;
    this.origins = origins;
    this.step = step;
  }

  OriginParser() {
    this(null, null, null, null, 1);
  }

  @Override
  public Parser<Origin> feed(Input input) {
    return parse(input, this.scheme, this.host, this.port, this.origins, this.step);
  }

  static Parser<Origin> parse(Input input, Parser<UriScheme> scheme, Parser<UriHost> host,
                              Parser<UriPort> port, Builder<Uri, FingerTrieSeq<Uri>> origins, int step) {
    do {
      if (step == 1) {
        if (scheme == null) {
          scheme = Uri.standardParser().parseScheme(input);
        } else {
          scheme = scheme.feed(input);
        }
        if (scheme.isDone()) {
          if (input.isCont() && input.head() == ':') {
            input = input.step();
            step = 2;
          } else if (!input.isEmpty()) {
            if (origins == null && "null".equals(scheme.bind().name())) {
              return done(Origin.empty());
            } else {
              return error(Diagnostic.expected(':', input));
            }
          }
        } else if (scheme.isError()) {
          return scheme.asError();
        }
      }
      if (step == 2) {
        if (input.isCont() && input.head() == '/') {
          input = input.step();
          step = 3;
        } else if (!input.isEmpty()) {
          return error(Diagnostic.expected('/', input));
        }
      }
      if (step == 3) {
        if (input.isCont() && input.head() == '/') {
          input = input.step();
          step = 4;
        } else if (!input.isEmpty()) {
          return error(Diagnostic.expected('/', input));
        }
      }
      if (step == 4) {
        if (host == null) {
          host = Uri.standardParser().parseHost(input);
        } else {
          host = host.feed(input);
        }
        if (host.isDone()) {
          if (input.isCont() && input.head() == ':') {
            input = input.step();
            step = 5;
          } else if (!input.isEmpty()) {
            if (origins == null) {
              origins = FingerTrieSeq.builder();
            }
            origins.add(Uri.from(scheme.bind(), UriAuthority.from(host.bind())));
            scheme = null;
            host = null;
            step = 6;
          }
        } else if (host.isError()) {
          return host.asError();
        }
      }
      if (step == 5) {
        if (port == null) {
          port = Uri.standardParser().parsePort(input);
        } else {
          port = port.feed(input);
        }
        if (port.isDone()) {
          if (origins == null) {
            origins = FingerTrieSeq.builder();
          }
          origins.add(Uri.from(scheme.bind(), UriAuthority.from(host.bind(), port.bind())));
          scheme = null;
          host = null;
          port = null;
          step = 6;
        } else if (port.isError()) {
          return port.asError();
        }
      }
      if (step == 6) {
        if (input.isCont() && input.head() == ' ') {
          input = input.step();
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return done(Origin.from(origins.bind()));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new OriginParser(scheme, host, port, origins, step);
  }

  static Parser<Origin> parse(Input input) {
    return parse(input, null, null, null, null, 1);
  }
}
