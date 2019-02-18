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

import java.lang.reflect.Array;

final class TensorArrayIdentitySpace<V, S> extends TensorArraySpace<V[], V, S> {
  final Class<V> type;
  final TensorSpace<V, S> next;
  final TensorDims dims;

  TensorArrayIdentitySpace(Class<V> type, TensorSpace<V, S> next, TensorDims dims) {
    this.type = type;
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

  @SuppressWarnings("unchecked")
  @Override
  public V[] of(Object... array) {
    return (V[]) array;
  }

  @Override
  public Object[] toArray(V[] tensor) {
    return tensor;
  }

  @Override
  public TensorForm<V[]> form(TensorForm<V> next) {
    return TensorArrayForm.from(next);
  }

  @Override
  protected Object[] newArray(int length) {
    return (Object[]) Array.newInstance(type, length);
  }
}
