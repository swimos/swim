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

package swim.avro;

import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Utf8;
import swim.util.Builder;

final class AvroNameParser extends Parser<AvroName> {

  final Builder<String, AvroNamespace> builder;
  final Output<String> output;
  final int step;

  AvroNameParser(Builder<String, AvroNamespace> builder, Output<String> output, int step) {
    this.builder = builder;
    this.output = output;
    this.step = step;
  }

  AvroNameParser() {
    this(null, null, 1);
  }

  @Override
  public Parser<AvroName> feed(Input input) {
    return AvroNameParser.parse(input, this.builder, this.output, this.step);
  }

  static Parser<AvroName> parse(Input input, Builder<String, AvroNamespace> builder,
                                Output<String> output, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (input.isCont()) {
          c = input.head();
          if (Avro.isNameStartChar(c)) {
            input = input.step();
            output = Utf8.decodedString();
            output = output.write(c);
            step = 2;
          } else {
            return Parser.error(Diagnostic.expected("name", input));
          }
        } else if (input.isDone()) {
          return Parser.error(Diagnostic.expected("name", input));
        }
      }
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (Avro.isNameChar(c)) {
            input = input.step();
            output = output.write(c);
          } else {
            break;
          }
        }
        if (input.isCont() && c == '.') {
          input = input.step();
          if (builder == null) {
            builder = AvroNamespace.builder();
          }
          builder.add(output.bind());
          output = null;
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.done(new AvroName(builder != null ? builder.bind() : AvroNamespace.empty(), output.bind()));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new AvroNameParser(builder, output, step);
  }

  static Parser<AvroName> parse(Input input) {
    return AvroNameParser.parse(input, null, null, 1);
  }

}
