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

import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class UriPortParser extends Parser<UriPort> {
  final UriParser uri;
  final int number;

  UriPortParser(UriParser uri, int number) {
    this.uri = uri;
    this.number = number;
  }

  UriPortParser(UriParser uri) {
    this(uri, 0);
  }

  @Override
  public Parser<UriPort> feed(Input input) {
    return parse(input, this.uri, this.number);
  }

  static Parser<UriPort> parse(Input input, UriParser uri, int number) {
    int c = 0;
    while (input.isCont()) {
      c = input.head();
      if (Base10.isDigit(c)) {
        input = input.step();
        number = 10 * number + Base10.decodeDigit(c);
        if (number < 0) {
          return error(Diagnostic.message("port overflow", input));
        }
      } else {
        break;
      }
    }
    if (!input.isEmpty()) {
      return done(uri.port(number));
    }
    return new UriPortParser(uri, number);
  }

  static Parser<UriPort> parse(Input input, UriParser uri) {
    return parse(input, uri, 0);
  }
}
