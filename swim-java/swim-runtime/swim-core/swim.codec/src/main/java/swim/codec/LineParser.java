// Copyright 2015-2023 Nstream, inc.
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

package swim.codec;

final class LineParser extends Parser<String> {

  final StringBuilder output;

  LineParser(StringBuilder output) {
    this.output = output;
  }

  LineParser() {
    this(null);
  }

  @Override
  public Parser<String> feed(Input input) {
    return LineParser.parse(input, this.output);
  }

  static Parser<String> parse(Input input, StringBuilder output) {
    if (output == null) {
      output = new StringBuilder();
    }
    while (input.isCont()) {
      final int c = input.head();
      input = input.step();
      if (c == '\r') {
        continue;
      } else if (c != '\n') {
        output.appendCodePoint(c);
      } else {
        return Parser.done(output.toString());
      }
    }
    if (input.isDone()) {
      return Parser.done(output.toString());
    } else if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new LineParser(output);
  }

}
