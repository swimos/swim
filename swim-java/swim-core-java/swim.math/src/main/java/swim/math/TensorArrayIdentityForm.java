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

final class TensorArrayIdentityForm<V> extends TensorArrayForm<V[], V> {
  final TensorForm<V> next;

  TensorArrayIdentityForm(TensorForm<V> next) {
    this.next = next;
  }

  @Override
  public Class<?> type() {
    return (Class<?>) Array.newInstance(this.next.type(), 0).getClass();
  }

  @Override
  public TensorForm<V> next() {
    return this.next;
  }

  @SuppressWarnings("unchecked")
  @Override
  public V[] fromArray(Object... array) {
    return (V[]) array;
  }

  @Override
  public Object[] toArray(V[] tensor) {
    return tensor;
  }
}
