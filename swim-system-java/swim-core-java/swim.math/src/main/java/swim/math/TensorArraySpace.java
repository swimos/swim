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

public abstract class TensorArraySpace<T, V, S> implements TensorSpace<T, S> {
  public abstract TensorSpace<V, S> next();

  public abstract T of(Object... array);

  public abstract Object[] toArray(T tensor);

  public TensorForm<T> form(TensorForm<V> next) {
    return new TensorArraySpaceForm<T, V, S>(this, next);
  }

  protected Object[] newArray(int length) {
    return new Object[length];
  }

  @Override
  public T zero() {
    final int n = dimensions().size;
    final Object[] ws = new Object[n];
    final V zero = next().zero();
    for (int i = 0; i < n; i += 1) {
      ws[i] = zero;
    }
    return of(ws);
  }

  @SuppressWarnings("unchecked")
  @Override
  public T add(T u, T v) {
    final Object[] us = toArray(u);
    final Object[] vs = toArray(v);
    final int n = us.length;
    if (n != vs.length) {
      throw new DimensionException();
    }
    final Object[] ws = newArray(n);
    final TensorSpace<V, S> next = next();
    for (int i = 0; i < n; i += 1) {
      ws[i] = next.add((V) us[i], (V) vs[i]);
    }
    return of(ws);
  }

  @SuppressWarnings("unchecked")
  @Override
  public T opposite(T v) {
    final Object[] vs = toArray(v);
    final int n = vs.length;
    final Object[] ws = newArray(n);
    final TensorSpace<V, S> next = next();
    for (int i = 0; i < n; i += 1) {
      ws[i] = next.opposite((V) vs[i]);
    }
    return of(ws);
  }

  @SuppressWarnings("unchecked")
  @Override
  public T subtract(T u, T v) {
    final Object[] us = toArray(u);
    final Object[] vs = toArray(v);
    final int n = us.length;
    if (n != vs.length) {
      throw new DimensionException();
    }
    final Object[] ws = newArray(n);
    final TensorSpace<V, S> next = next();
    for (int i = 0; i < n; i += 1) {
      ws[i] = next.subtract((V) us[i], (V) vs[i]);
    }
    return of(ws);
  }

  @SuppressWarnings("unchecked")
  @Override
  public T multiply(T u, S a) {
    final Object[] us = toArray(u);
    final int n = us.length;
    final Object[] ws = newArray(n);
    final TensorSpace<V, S> next = next();
    for (int i = 0; i < n; i += 1) {
      ws[i] = next.multiply((V) us[i], a);
    }
    return of(ws);
  }

  @SuppressWarnings("unchecked")
  @Override
  public T combine(S a, T u, S b, T v) {
    final Object[] us = toArray(u);
    final Object[] vs = toArray(v);
    final int n = us.length;
    if (n != vs.length) {
      throw new DimensionException();
    }
    final Object[] ws = newArray(n);
    final TensorSpace<V, S> next = next();
    for (int i = 0; i < n; i += 1) {
      ws[i] = next.combine(a, (V) us[i], b, (V) vs[i]);
    }
    return of(ws);
  }

  public static <V, S> TensorArraySpace<V[], V, S> from(Class<V> type, TensorSpace<V, S> next, TensorDims dims) {
    return new TensorArrayIdentitySpace<V, S>(type, next, dims);
  }

  public static <V, S> TensorArraySpace<V[], V, S> from(Class<V> type, TensorSpace<V, S> next, int n) {
    return new TensorArrayIdentitySpace<V, S>(type, next, next.dimensions().by(n));
  }
}
