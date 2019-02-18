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

package swim.math;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;

final class TensorArrayObjectSpace<V, S> extends TensorArraySpace<TensorArray<V, S>, V, S> implements Debug {
  final TensorSpace<V, S> next;
  final TensorDims dims;

  TensorArrayObjectSpace(TensorSpace<V, S> next, TensorDims dims) {
    this.next = next;
    this.dims = dims;
  }

  @Override
  public Field<S> scalar() {
    return this.next.scalar();
  }

  @Override
  public TensorDims dimensions() {
    return this.dims;
  }

  @Override
  public TensorSpace<V, S> next() {
    return this.next;
  }

  @Override
  public TensorArray<V, S> of(Object... array) {
    return new TensorArray<V, S>(this, array);
  }

  @Override
  public Object[] toArray(TensorArray<V, S> tensor) {
    return tensor.array;
  }

  @Override
  public void debug(Output<?> output) {
    output.write("TensorArray").write('.').write("space").write('(')
        .debug(this.next).write(", ").debug(this.dims).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }
}
