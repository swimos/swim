// Copyright 2015-2023 Swim.inc
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
    if (!this.isDefined()) {
      return TensorDims.of(size, stride);
    } else if (stride == this.size * this.stride) {
      return this.by(size);
    } else {
      return new TensorDims(size, stride, this);
    }
  }

  public TensorDims by(int size) {
    if (!this.isDefined()) {
      return TensorDims.of(size);
    } else if (size == 2 && this == d2()) {
      return TensorDims.d2x2();
    } else if (size == 3 && this == d3()) {
      return TensorDims.d3x3();
    } else if (size == 4 && this == d4()) {
      return TensorDims.d4x4();
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
    return TensorDims.of(size);
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
    final int[] sizes = new int[this.rank()];
    return this.toSizeArray(sizes);
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
    final int[] strides = new int[this.rank()];
    return this.toStrideArray(strides);
  }

  public Value toValue() {
    return TensorDims.form().mold(this).toValue();
  }

  public boolean conforms(TensorDims that) {
    return TensorDims.conforms(this, that);
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
      return TensorDims.equals(this, (TensorDims) other);
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (TensorDims.hashSeed == 0) {
      TensorDims.hashSeed = Murmur3.seed(TensorDims.class);
    }
    return Murmur3.mash(TensorDims.hash(TensorDims.hashSeed, this));
  }

  static int hash(int code, TensorDims dim) {
    do {
      code = Murmur3.mix(Murmur3.mix(code, dim.size), dim.stride);
      dim = dim.next;
    } while (dim != null);
    return code;
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    if (this.next != null) {
      output = output.debug(this.next).write('.').write("by").write('(').debug(this.size);
      if (!this.isPacked()) {
        output = output.write(", ").debug(this.stride);
      }
      output = output.write(')');
    } else {
      output = output.write("TensorDims").write('.').write("of").write('(').debug(this.size);
      if (!this.isPacked()) {
        output = output.write(", ").debug(this.stride);
      }
      output = output.write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static TensorDims undefined;

  public static TensorDims undefined() {
    if (TensorDims.undefined == null) {
      TensorDims.undefined = new TensorDims(0, 0, null);
    }
    return TensorDims.undefined;
  }

  private static TensorDims d1;

  public static TensorDims d1() {
    if (TensorDims.d1 == null) {
      TensorDims.d1 = new TensorDims(1, 1, null);
    }
    return TensorDims.d1;
  }

  private static TensorDims d2;

  public static TensorDims d2() {
    if (TensorDims.d2 == null) {
      TensorDims.d2 = new TensorDims(2, 1, null);
    }
    return TensorDims.d2;
  }

  private static TensorDims d3;

  public static TensorDims d3() {
    if (TensorDims.d3 == null) {
      TensorDims.d3 = new TensorDims(3, 1, null);
    }
    return TensorDims.d3;
  }

  private static TensorDims d4;

  public static TensorDims d4() {
    if (TensorDims.d4 == null) {
      TensorDims.d4 = new TensorDims(4, 1, null);
    }
    return TensorDims.d4;
  }

  private static TensorDims d2x2;

  public static TensorDims d2x2() {
    if (TensorDims.d2x2 == null) {
      TensorDims.d2x2 = new TensorDims(2, 2, TensorDims.d2());
    }
    return TensorDims.d2x2;
  }

  private static TensorDims d3x3;

  public static TensorDims d3x3() {
    if (TensorDims.d3x3 == null) {
      TensorDims.d3x3 = new TensorDims(3, 3, TensorDims.d3());
    }
    return TensorDims.d3x3;
  }

  private static TensorDims d4x4;

  public static TensorDims d4x4() {
    if (TensorDims.d4x4 == null) {
      TensorDims.d4x4 = new TensorDims(4, 4, TensorDims.d4());
    }
    return TensorDims.d4x4;
  }

  public static TensorDims of(int size, int stride) {
    if (size == 0 && stride == 0) {
      return TensorDims.undefined();
    } else if (stride == 1) {
      return TensorDims.of(size);
    } else {
      return new TensorDims(size, stride, null);
    }
  }

  public static TensorDims of(int size) {
    if (size == 0) {
      return TensorDims.undefined();
    } else if (size == 1) {
      return TensorDims.d1();
    } else if (size == 2) {
      return TensorDims.d2();
    } else if (size == 3) {
      return TensorDims.d3();
    } else if (size == 4) {
      return TensorDims.d4();
    } else {
      return new TensorDims(size, 1, null);
    }
  }

  private static Form<TensorDims> form;

  @Kind
  public static Form<TensorDims> form() {
    if (TensorDims.form == null) {
      TensorDims.form = new TensorDimsForm();
    }
    return TensorDims.form;
  }

}
