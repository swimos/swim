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

import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class MaxForwardsParser extends Parser<MaxForwards> {
  final int count;
  final int step;

  MaxForwardsParser(int count, int step) {
    this.count = count;
    this.step = step;
  }

  MaxForwardsParser() {
    this(0, 1);
  }

  @Override
  public Parser<MaxForwards> feed(Input input) {
    return parse(input, this.count, this.step);
  }

  static Parser<MaxForwards> parse(Input input, int count, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input = input.step();
          count = Base10.decodeDigit(c);
          step = 2;
        } else {
          return error(Diagnostic.expected("digit", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 2) {
      while (input.isCont()) {
        c = input.head();
        if (Base10.isDigit(c)) {
          input = input.step();
          count = 10 * count + Base10.decodeDigit(c);
          if (count < 0) {
            return error(Diagnostic.message("max forwards overflow", input));
          }
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return done(MaxForwards.from(count));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new MaxForwardsParser(count, step);
  }

  static Parser<MaxForwards> parse(Input input) {
    return parse(input, 0, 1);
  }
}
