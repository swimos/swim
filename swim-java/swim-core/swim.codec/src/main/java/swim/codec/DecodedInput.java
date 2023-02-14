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

import swim.annotations.CheckReturnValue;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public abstract class DecodedInput extends Input {

  protected DecodedInput() {
    // nop
  }

  @Override
  public abstract DecodedInput asLast(boolean last);

  public abstract DecodedInput resume(Input input);

  @Override
  public abstract DecodedInput step();

  @Override
  public abstract DecodedInput seek(@Nullable SourcePosition position);

  public <T> Parse<T> parseInto(Parse<T> parse) {
    return ParseDecodedInput.parse(this, parse);
  }

  @Override
  public abstract DecodedInput withIdentifier(@Nullable String identifier);

  @Override
  public abstract DecodedInput withPosition(SourcePosition position);

  @Override
  public abstract DecodedInput clone();

}

final class ParseDecodedInput<T> extends Parse<T> {

  final DecodedInput input;
  final Parse<T> parse;

  ParseDecodedInput(DecodedInput input, Parse<T> parse) {
    this.input = input;
    this.parse = parse;
  }

  @Override
  public Parse<T> consume(Input input) {
    return ParseDecodedInput.parse(this.input.resume(input), this.parse);
  }

  @CheckReturnValue
  @Override
  public @Nullable T get() {
    return this.parse.get();
  }

  @Override
  public Throwable getError() {
    return this.parse.getError();
  }

  static <T> Parse<T> parse(DecodedInput input, Parse<T> parse) {
    parse = parse.consume(input);
    if (!parse.isCont()) {
      return parse;
    } else if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseDecodedInput<T>(input, parse);
  }

}
