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

@Public
@Since("5.0")
public interface WamlTupleForm<L, P, B, T> extends WamlForm<T> {

  @Override
  default WamlTupleForm<?, ?, ?, T> tupleForm() {
    return this;
  }

  WamlForm<L> labelForm();

  WamlForm<P> paramForm();

  @Nullable T emptyTuple();

  @Nullable T unaryTuple(@Nullable P param);

  B tupleBuilder();

  B appendParam(B builder, @Nullable P param);

  B appendParam(B builder, @Nullable P label, @Nullable P param);

  @Nullable T buildTuple(B builder);

  @Override
  default Parse<T> parse(Input input, WamlParser parser) {
    return parser.parseTuple(input, this);
  }

}
