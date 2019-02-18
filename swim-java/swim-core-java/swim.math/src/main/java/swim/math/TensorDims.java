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
import swim.structure.Form;
import swim.structure.Kind;
import swim.structure.Value;
import swim.util.Murmur3;

public final class TensorDims implements Debug {
  public final int size;
  public final int stride;
  final TensorDims next;

  TensorDims(int size, int stride, TensorDims next) {
    this.size = size;
    this.stride = stride;
    this.next = next;
  }

  public boolean isDefined() {
    return this.size != 0 || this.stride != 0 || this.next != null;
  }

  public int rank() {
    TensorDims dim = this;
    int n = 0;
    do {
      dim = dim.next;
      n += 1;
    } while (dim != null);
    return n;
  }

  public int size() {
    return this.size;
  }

  public int stride() {
    return this.stride;
  }

  public TensorDims next() {
    return this.next;
  }

  public boolean isPacked() {
    return this.stride == (this.next != null ? this.next.size * this.next.stride : 1);
  }

  public boolean isFullyPacked() {
    TensorDims dim = this;
    do {
      if (!dim.isPacked()) {
        return false;
      }
      dim = dim.next;
    } while (dim != null);
    return true;
  }

  public TensorDims by(int size, int stride) {
    if (!isDefined()) {
      return of(size, stride);
    } else if (stride == this.size * this.stride) {
      return by(size);
    } else {
      return new TensorDims(size, stride, this);
    }
  }

  public TensorDims by(int size) {
    if (!isDefined()) {
      return of(size);
    } else if (size == 2 && this == d2()) {
      return d2x2();
    } else if (size == 3 && this == d3()) {
      return d3x3();
    } else if (size == 4 && this == d4()) {
      return d4x4();
    } else {
      return new TensorDims(size, this.size * this.stride, this);
    }
  }

  public TensorDims flattened() {
    TensorDims dim = this;
    int size = 1;
    do {
      if (dim.stride == (dim.next != null ? dim.next.size * dim.next.stride : 1)) {
        size *= dim.size;
      } else {
        throw new DimensionException("flattened sparse dimensions");
      }
      dim = dim.next;
    } while (dim != null);
    return of(size);
  }

  public int[] toSizeArray(int[] sizes) {
    TensorDims dim = this;
    int i = 0;
    do {
      sizes[i] = dim.size;
      dim = dim.next;
      i += 1;
    } while (dim != null);
    return sizes;
  }

  public int[] toSizeArray() {
    final int[] sizes = new int[rank()];
    return toSizeArray(sizes);
  }

  public int[] toStrideArray(int[] strides) {
    TensorDims dim = this;
    int i = 0;
    do {
      strides[i] = dim.stride;
      dim = dim.next;
      i += 1;
    } while (dim != null);
    return strides;
  }

  public int[] toStrideArray() {
    final int[] strides = new int[rank()];
    return toStrideArray(strides);
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  public boolean conforms(TensorDims that) {
    return conforms(this, that);
  }
  private static boolean conforms(TensorDims these, TensorDims those) {
    do {
      if (these.size != those.size) {
        return false;
      }
      these = these.next;
      those = those.next;
    } while (these != null && those != null);
    return these == null && those == null;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TensorDims) {
      return equals(this, (TensorDims) other);
    }
    return false;
  }
  static boolean equals(TensorDims these, TensorDims those) {
    do {
      if (these.size != those.size || these.stride != those.stride) {
        return false;
      }
      these = these.next;
      those = those.next;
    } while (these != null && those != null);
    return these == null && those == null;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(TensorDims.class);
    }
    return Murmur3.mash(hash(hashSeed, this));
  }
  static int hash(int code, TensorDims dim) {
    do {
      code = Murmur3.mix(Murmur3.mix(code, dim.size), dim.stride);
      dim = dim.next;
    } while (dim != null);
    return code;
  }

  @Override
  public void debug(Output<?> output) {
    if (this.next != null) {
      output = output.debug(this.next).write('.').write("by").write('(').debug(this.size);
      if (!isPacked()) {
        output = output.write(", ").debug(this.stride);
      }
      output = output.write(')');
    } else {
      output = output.write("TensorDims").write('.').write("of").write('(').debug(this.size);
      if (!isPacked()) {
        output = output.write(", ").debug(this.stride);
      }
      output = output.write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static TensorDims undefined;
  private static TensorDims d1;
  private static TensorDims d2;
  private static TensorDims d3;
  private static TensorDims d4;
  private static TensorDims d2x2;
  private static TensorDims d3x3;
  private static TensorDims d4x4;

  private static Form<TensorDims> form;

  public static TensorDims undefined() {
    if (undefined == null) {
      undefined = new TensorDims(0, 0, null);
    }
    return undefined;
  }

  public static TensorDims d1() {
    if (d1 == null) {
      d1 = new TensorDims(1, 1, null);
    }
    return d1;
  }

  public static TensorDims d2() {
    if (d2 == null) {
      d2 = new TensorDims(2, 1, null);
    }
    return d2;
  }

  public static TensorDims d3() {
    if (d3 == null) {
      d3 = new TensorDims(3, 1, null);
    }
    return d3;
  }

  public static TensorDims d4() {
    if (d4 == null) {
      d4 = new TensorDims(4, 1, null);
    }
    return d4;
  }

  public static TensorDims d2x2() {
    if (d2x2 == null) {
      d2x2 = new TensorDims(2, 2, d2());
    }
    return d2x2;
  }

  public static TensorDims d3x3() {
    if (d3x3 == null) {
      d3x3 = new TensorDims(3, 3, d3());
    }
    return d3x3;
  }

  public static TensorDims d4x4() {
    if (d4x4 == null) {
      d4x4 = new TensorDims(4, 4, d4());
    }
    return d4x4;
  }

  public static TensorDims of(int size, int stride) {
    if (size == 0 && stride == 0) {
      return undefined();
    } else if (stride == 1) {
      return of(size);
    } else {
      return new TensorDims(size, stride, null);
    }
  }

  public static TensorDims of(int size) {
    if (size == 0) {
      return undefined();
    } else if (size == 1) {
      return d1();
    } else if (size == 2) {
      return d2();
    } else if (size == 3) {
      return d3();
    } else if (size == 4) {
      return d4();
    } else {
      return new TensorDims(size, 1, null);
    }
  }

  @Kind
  public static Form<TensorDims> form() {
    if (form == null) {
      form = new TensorDimsForm();
    }
    return form;
  }
}
