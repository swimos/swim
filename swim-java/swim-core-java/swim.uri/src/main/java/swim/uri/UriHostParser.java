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

import swim.codec.Input;
import swim.codec.Parser;

final class UriHostParser extends Parser<UriHost> {
  final UriParser uri;

  UriHostParser(UriParser uri) {
    this.uri = uri;
  }

  @Override
  public Parser<UriHost> feed(Input input) {
    return parse(input, this.uri);
  }

  static Parser<UriHost> parse(Input input, UriParser uri) {
    if (input.isCont()) {
      final int c = input.head();
      if (c == '[') {
        return uri.parseHostLiteral(input);
      } else {
        return uri.parseHostAddress(input);
      }
    } else if (input.isDone()) {
      return done(uri.hostName(""));
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new UriHostParser(uri);
  }
}
