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

final class NullParser<O> extends Parser<O> {
  @Override
  public Parser<O> feed(Input input) {
    while (input.isCont()) {
      input = input.step();
    }
    if (input.isDone()) {
      return done();
    } else if (input.isError()) {
      return error(input.trap());
    }
    return this;
  }

  static <O> Parser<O> parse(Input input) {
    while (input.isCont()) {
      input = input.step();
    }
    if (input.isDone()) {
      return done();
    } else if (input.isError()) {
      return error(input.trap());
    }
    return new NullParser<O>();
  }
}
