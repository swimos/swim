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

package swim.http;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class HttpCharsetParser extends Parser<HttpCharset> {
  final HttpParser http;
  final StringBuilder name;
  final Parser<Float> weight;
  final int step;

  HttpCharsetParser(HttpParser http, StringBuilder name, Parser<Float> weight, int step) {
    this.http = http;
    this.name = name;
    this.weight = weight;
    this.step = step;
  }

  HttpCharsetParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<HttpCharset> feed(Input input) {
    return parse(input, this.http, this.name, this.weight, this.step);
  }

  static Parser<HttpCharset> parse(Input input, HttpParser http, StringBuilder name,
                                   Parser<Float> weight, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          if (name == null) {
            name = new StringBuilder();
          }
          name.appendCodePoint(c);
          step = 2;
        } else {
          return error(Diagnostic.expected("charset", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("charset", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Http.isTokenChar(c)) {
          input = input.step();
          name.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        step = 3;
      }
    }
    if (step == 3) {
      if (weight == null) {
        weight = http.parseQValue(input);
      } else {
        weight = weight.feed(input);
      }
      if (weight.isDone()) {
        final Float qvalue = weight.bind();
        final float q = qvalue != null ? (float) qvalue : 1f;
        return done(http.charset(name.toString(), q));
      } else if (weight.isError()) {
        return weight.asError();
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new HttpCharsetParser(http, name, weight, step);
  }

  static Parser<HttpCharset> parse(Input input, HttpParser http) {
    return parse(input, http, null, null, 1);
  }
}
