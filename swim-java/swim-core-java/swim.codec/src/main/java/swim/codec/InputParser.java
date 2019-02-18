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

final class InputParser<O> extends Parser<O> {
  final Input input;
  final Parser<O> parser;

  InputParser(Input input, Parser<O> parser) {
    this.input = input;
    this.parser = parser;
  }

  @Override
  public Parser<O> feed(Input input) {
    if (this.input != null) {
      input = this.input.fork(input);
    }
    return parse(input, this.parser);
  }

  @Override
  public Parser<O> fork(Object condition) {
    return new InputParser<O>(this.input, this.parser.fork(condition));
  }

  @Override
  public O bind() {
    return this.parser.bind();
  }

  @Override
  public Throwable trap() {
    return this.parser.trap();
  }

  static <O> Parser<O> parse(Input input, Parser<O> parser) {
    parser = parser.feed(input);
    if (!parser.isCont()) {
      return parser;
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new InputParser<O>(input, parser);
  }
}
