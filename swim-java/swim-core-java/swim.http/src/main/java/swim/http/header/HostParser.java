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

import swim.codec.Input;
import swim.codec.Parser;
import swim.uri.Uri;
import swim.uri.UriHost;
import swim.uri.UriPort;

final class HostParser extends Parser<Host> {
  final Parser<UriHost> host;
  final Parser<UriPort> port;
  final int step;

  HostParser(Parser<UriHost> host, Parser<UriPort> port, int step) {
    this.host = host;
    this.port = port;
    this.step = step;
  }

  HostParser() {
    this(null, null, 1);
  }

  @Override
  public Parser<Host> feed(Input input) {
    return parse(input, this.host, this.port, this.step);
  }

  static Parser<Host> parse(Input input, Parser<UriHost> host, Parser<UriPort> port, int step) {
    if (step == 1) {
      if (host == null) {
        host = Uri.standardParser().parseHost(input);
      } else {
        host = host.feed(input);
      }
      if (host.isDone()) {
        step = 2;
      } else if (host.isError()) {
        return host.asError();
      }
    }
    if (step == 2) {
      if (input.isCont() && input.head() == ':') {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return done(Host.from(host.bind()));
      }
    }
    if (step == 3) {
      if (port == null) {
        port = Uri.standardParser().parsePort(input);
      } else {
        port = port.feed(input);
      }
      if (port.isDone()) {
        return done(Host.from(host.bind(), port.bind()));
      } else if (port.isError()) {
        return port.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new HostParser(host, port, step);
  }

  static Parser<Host> parse(Input input) {
    return parse(input, null, null, 1);
  }
}
