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

import swim.codec.Input;
import swim.codec.Parser;
import swim.uri.Uri;
import swim.uri.UriHost;
import swim.uri.UriPort;

final class HostHeaderParser extends Parser<HostHeader> {

  final Parser<UriHost> hostParser;
  final Parser<UriPort> portParser;
  final int step;

  HostHeaderParser(Parser<UriHost> hostParser, Parser<UriPort> portParser, int step) {
    this.hostParser = hostParser;
    this.portParser = portParser;
    this.step = step;
  }

  HostHeaderParser() {
    this(null, null, 1);
  }

  @Override
  public Parser<HostHeader> feed(Input input) {
    return HostHeaderParser.parse(input, this.hostParser, this.portParser, this.step);
  }

  static Parser<HostHeader> parse(Input input, Parser<UriHost> hostParser,
                                  Parser<UriPort> portParser, int step) {
    if (step == 1) {
      if (hostParser == null) {
        hostParser = Uri.standardParser().parseHost(input);
      } else {
        hostParser = hostParser.feed(input);
      }
      if (hostParser.isDone()) {
        step = 2;
      } else if (hostParser.isError()) {
        return hostParser.asError();
      }
    }
    if (step == 2) {
      if (input.isCont() && input.head() == ':') {
        input = input.step();
        step = 3;
      } else if (!input.isEmpty()) {
        return Parser.done(HostHeader.create(hostParser.bind()));
      }
    }
    if (step == 3) {
      if (portParser == null) {
        portParser = Uri.standardParser().parsePort(input);
      } else {
        portParser = portParser.feed(input);
      }
      if (portParser.isDone()) {
        return Parser.done(HostHeader.create(hostParser.bind(), portParser.bind()));
      } else if (portParser.isError()) {
        return portParser.asError();
      }
    }
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new HostHeaderParser(hostParser, portParser, step);
  }

  static Parser<HostHeader> parse(Input input) {
    return HostHeaderParser.parse(input, null, null, 1);
  }

}
