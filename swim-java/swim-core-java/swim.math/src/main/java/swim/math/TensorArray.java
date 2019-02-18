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
import swim.util.Murmur3;

public class TensorArray<V, S> implements Debug {
  final TensorSpace<TensorArray<V, S>, S> space;
  final Object[] array;

  public TensorArray(TensorSpace<TensorArray<V, S>, S> space, Object... array) {
    this.space = space;
    this.array = array;
  }

  public final TensorSpace<TensorArray<V, S>, S> space() {
    return this.space;
  }

  public final TensorDims dimensions() {
    return this.space.dimensions();
  }

  @SuppressWarnings("unchecked")
  public final V get(int i) {
    return (V) this.array[i];
  }

  public TensorArray<V, S> plus(TensorArray<V, S> that) {
    return this.space.add(this, that);
  }

  public TensorArray<V, S> opposite() {
    return this.space.opposite(this);
  }

  public TensorArray<V, S> minus(TensorArray<V, S> that) {
    return this.space.subtract(this, that);
  }

  public TensorArray<V, S> times(S scalar) {
    return this.space.multiply(this, scalar);
  }

  protected boolean canEqual(TensorArray<?, ?> that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TensorArray<?, ?>) {
      final TensorArray<?, ?> that = (TensorArray<?, ?>) other;
      if (that.canEqual(this)) {
        final Object[] us = this.array;
        final Object[] vs = that.array;
        final int n = us.length;
        if (n == vs.length) {
          for (int i = 0; i < n; i += 1) {
            final Object u = us[i];
            final Object v = vs[i];
            if (u == null ? v != null : !u.equals(v)) {
              return false;
            }
          }
          return true;
        }
      }
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(TensorArray.class);
    }
    int code = hashSeed;
    final Object[] us = this.array;
    for (int i = 0, n = us.length; i < n; i += 1) {
      code = Murmur3.mix(code, Murmur3.hash(us[i]));
    }
    return Murmur3.mash(code);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.debug(this.space).write('.').write("fromArray").write('(');
    final Object[] us = this.array;
    final int n = us.length;
    if (n > 0) {
      output = output.debug(us[0]);
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(us[i]);
      }
    }
    output = output.write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static <V, S> TensorArraySpace<TensorArray<V, S>, V, S> space(TensorSpace<V, S> next, TensorDims dims) {
    return new TensorArrayObjectSpace<V, S>(next, dims);
  }

  public static <V, S> TensorArraySpace<TensorArray<V, S>, V, S> space(TensorSpace<V, S> next, int n) {
    return new TensorArrayObjectSpace<V, S>(next, next.dimensions().by(n));
  }
}
