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

package swim.codec;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
@FunctionalInterface
public interface Parser<T> extends Decoder<T> {

  @Override
  default Decode<T> decode(InputBuffer input) {
    return this.parse(new Utf8DecodedInput(input));
  }

  Parse<T> parse(Input input);

  default Parse<T> parse() {
    return this.parse(StringInput.empty());
  }

  default @Nullable T parse(String string) {
    final Input input = new StringInput(string);
    Parse<T> parse = this.parse(input);
    if (input.isCont() && !parse.isError()) {
      parse = Parse.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parse = Parse.error(input.getError());
    }
    return parse.get();
  }

}
