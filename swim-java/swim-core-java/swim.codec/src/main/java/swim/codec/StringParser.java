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

package swim.codec;

final class StringParser extends Parser<String> {
  final StringBuilder builder;

  StringParser(StringBuilder builder) {
    this.builder = builder;
  }

  StringParser() {
    this(null);
  }

  @Override
  public Parser<String> feed(Input input) {
    return parse(input, this.builder);
  }

  static Parser<String> parse(Input input, StringBuilder builder) {
    if (builder == null) {
      builder = new StringBuilder();
    }
    while (input.isCont()) {
      builder.appendCodePoint(input.head());
      input = input.step();
    }
    if (input.isDone()) {
      return done(builder.toString());
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new StringParser(builder);
  }

  static Parser<String> parse(Input input) {
    return parse(input, null);
  }
}
