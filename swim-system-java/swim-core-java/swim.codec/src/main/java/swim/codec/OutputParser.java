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

final class OutputParser<O> extends Parser<O> {
  final Input input;
  final Output<O> output;

  OutputParser(Input input, Output<O> output) {
    this.input = input;
    this.output = output;
  }

  @Override
  public Parser<O> feed(Input input) {
    if (this.input != null) {
      input = this.input.fork(input);
    }
    return parse(input, this.output);
  }

  static <O> Parser<O> parse(Input input, Output<O> output) {
    while (input.isCont()) {
      output = output.write(input.head());
      input = input.step();
    }
    if (input.isDone()) {
      return done(output.bind());
    } else if (input.isError()) {
      return error(input.trap());
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new OutputParser<O>(input, output);
  }
}
