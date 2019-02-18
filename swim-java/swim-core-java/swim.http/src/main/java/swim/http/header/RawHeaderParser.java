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
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Utf8;
import swim.http.Http;

final class RawHeaderParser extends Parser<RawHeader> {
  final String lowerCaseName;
  final String name;
  final Output<String> value;
  final int step;

  RawHeaderParser(String lowerCaseName, String name, Output<String> value, int step) {
    this.lowerCaseName = lowerCaseName;
    this.name = name;
    this.value = value;
    this.step = step;
  }

  RawHeaderParser(String lowerCaseName, String name) {
    this(lowerCaseName, name, null, 1);
  }

  @Override
  public Parser<RawHeader> feed(Input input) {
    return parse(input, this.lowerCaseName, this.name, this.value, this.step);
  }

  static Parser<RawHeader> parse(Input input, String lowerCaseName, String name,
                                 Output<String> value, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (value == null) {
          value = Utf8.decodedString();
        }
        while (input.isCont()) {
          c = input.head();
          if (Http.isFieldChar(c)) {
            input = input.step();
            value.write(c);
          } else {
            break;
          }
        }
        if (input.isCont() && Http.isSpace(c)) {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          return done(RawHeader.from(lowerCaseName, name, value.bind()));
        }
      }
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && Http.isFieldChar(c)) {
          input = input.step();
          value.write(' ');
          value.write(c);
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return done(RawHeader.from(lowerCaseName, name, value.bind()));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return error(input.trap());
    }
    return new RawHeaderParser(lowerCaseName, name, value, step);
  }

  static Parser<RawHeader> parse(Input input, String lowerCaseName, String name) {
    return parse(input, lowerCaseName, name, null, 1);
  }
}
