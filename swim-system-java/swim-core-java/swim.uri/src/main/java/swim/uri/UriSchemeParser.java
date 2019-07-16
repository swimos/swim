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
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Utf8;

final class UriSchemeParser extends Parser<UriScheme> {
  final UriParser uri;
  final Output<String> output;
  final int step;

  UriSchemeParser(UriParser uri, Output<String> output, int step) {
    this.uri = uri;
    this.output = output;
    this.step = step;
  }

  UriSchemeParser(UriParser uri) {
    this(uri, null, 1);
  }

  @Override
  public Parser<UriScheme> feed(Input input) {
    return parse(input, this.uri, this.output, this.step);
  }

  static Parser<UriScheme> parse(Input input, UriParser uri, Output<String> output, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Uri.isAlpha(c)) {
          input = input.step();
          if (output == null) {
            output = Utf8.decodedString();
          }
          output = output.write(Character.toLowerCase(c));
          step = 2;
        } else {
          return error(Diagnostic.expected("scheme", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("scheme", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Uri.isSchemeChar(c)) {
          input = input.step();
          output = output.write(Character.toLowerCase(c));
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return done(uri.scheme(output.bind()));
      }
    }
    return new UriSchemeParser(uri, output, step);
  }

  static Parser<UriScheme> parse(Input input, UriParser uri) {
    return parse(input, uri, null, 1);
  }
}
