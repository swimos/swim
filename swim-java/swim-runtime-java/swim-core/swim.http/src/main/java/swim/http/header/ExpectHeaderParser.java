// Copyright 2015-2022 Swim.inc
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

final class ExpectHeaderParser extends Parser<ExpectHeader> {

  final Output<String> valueOutput;
  final int step;

  ExpectHeaderParser(Output<String> valueOutput, int step) {
    this.valueOutput = valueOutput;
    this.step = step;
  }

  ExpectHeaderParser() {
    this(null, 1);
  }

  @Override
  public Parser<ExpectHeader> feed(Input input) {
    return ExpectHeaderParser.parse(input, this.valueOutput, this.step);
  }

  static Parser<ExpectHeader> parse(Input input, Output<String> valueOutput, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (valueOutput == null) {
          valueOutput = Utf8.decodedString();
        }
        while (input.isCont()) {
          c = input.head();
          if (Http.isFieldChar(c)) {
            input = input.step();
            valueOutput.write(c);
          } else {
            break;
          }
        }
        if (input.isCont() && Http.isSpace(c)) {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          return Parser.done(ExpectHeader.create(valueOutput.bind()));
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
          valueOutput.write(' ');
          valueOutput.write(c);
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.done(ExpectHeader.create(valueOutput.bind()));
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new ExpectHeaderParser(valueOutput, step);
  }

  static Parser<ExpectHeader> parse(Input input) {
    return ExpectHeaderParser.parse(input, null, 1);
  }

}
