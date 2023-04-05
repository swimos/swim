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

package swim.json;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Parse;

/**
 * A transcoder between JSON array literals and values of type {@code T}.
 *
 * @param <T> the type of values transcoded by this {@code JsonArrayForm}
 */
@Public
@Since("5.0")
public interface JsonArrayForm<E, B, T> extends JsonForm<T> {

  @Override
  default JsonArrayForm<?, ?, ? extends T> arrayForm() throws JsonException {
    return this;
  }

  JsonForm<E> elementForm();

  B arrayBuilder() throws JsonException;

  B appendElement(B builder, @Nullable E element) throws JsonException;

  @Nullable T buildArray(B builder) throws JsonException;

  @Override
  default Parse<T> parse(Input input, JsonParser parser) {
    return parser.parseArray(input, this);
  }

}
