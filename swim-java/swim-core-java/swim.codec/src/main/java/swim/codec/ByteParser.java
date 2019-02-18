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

final class ByteParser<O> extends Parser<O> {
  final Output<O> output;

  ByteParser(Output<O> output) {
    this.output = output;
  }

  @Override
  public Parser<O> feed(Input input) {
    Output<O> output = this.output;
    while (input.isCont() && output.isCont()) {
      output = output.write(input.head());
      input = input.step();
    }
    if (input.isDone()) {
      return done(output.bind());
    } else if (input.isError()) {
      return error(input.trap());
    } else if (output.isDone()) {
      return error(new ParserException("incomplete"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return this;
  }

  static <O> Parser<O> parse(Input input, Output<O> output) {
    while (input.isCont() && output.isCont()) {
      output = output.write(input.head());
      input = input.step();
    }
    if (input.isDone()) {
      return done(output.bind());
    } else if (input.isError()) {
      return error(input.trap());
    } else if (output.isDone()) {
      return error(new ParserException("incomplete"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new ByteParser<O>(output);
  }
}
