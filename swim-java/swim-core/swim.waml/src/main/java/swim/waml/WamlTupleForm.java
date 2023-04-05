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

package swim.waml;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Parse;

/**
 * A transcoder between WAML tuple literals and values of type {@code T}.
 *
 * @param <T> the type of values transcoded by this {@code WamlTupleForm}
 */
@Public
@Since("5.0")
public interface WamlTupleForm<L, P, B, T> extends WamlForm<T> {

  @Override
  default WamlTupleForm<?, ?, ?, ? extends T> tupleForm() throws WamlException {
    return this;
  }

  WamlForm<L> labelForm();

  WamlForm<P> paramForm();

  @Nullable T emptyTuple() throws WamlException;

  @Nullable T unaryTuple(@Nullable P param) throws WamlException;

  B tupleBuilder() throws WamlException;

  B appendParam(B builder, @Nullable P param) throws WamlException;

  B appendParam(B builder, @Nullable P label, @Nullable P param) throws WamlException;

  @Nullable T buildTuple(B builder) throws WamlException;

  @Override
  default Parse<T> parse(Input input, WamlParser parser) {
    return parser.parseTuple(input, this);
  }

}
