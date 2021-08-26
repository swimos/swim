// Copyright 2015-2021 Swim Inc.
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

import java.util.Arrays;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class Tensor implements Debug {

  public final TensorDims dims;
  public final Object array;
  public final int offset;

  protected Tensor(TensorDims dims, Object array, int offset) {
    this.dims = dims;
    this.array = array;
    this.offset = offset;
  }

  public Tensor(TensorDims dims, double[] array, int offset) {
    this.dims = dims;
    this.array = array;
    this.offset = offset;
  }

  public Tensor(TensorDims dims, float[] array, int offset) {
    this.dims = dims;
    this.array = array;
    this.offset = offset;
  }

  public Tensor(TensorDims dims, double... array) {
    this.dims = dims;
    this.array = array;
    this.offset = 0;
  }

  public Tensor(TensorDims dims, float... array) {
    this.dims = dims;
    this.array = array;
    this.offset = 0;
  }

  public final TensorDims dimensions() {
    return this.dims;
  }

  public final Precision precision() {
    if (this.array instanceof double[]) {
      return Precision.f64();
    } else if (this.array instanceof float[]) {
      return Precision.f32();
    } else {
      throw new AssertionError();
    }
  }

  public final double getDouble(int... coords) {
    final Object us = this.array;
    if (us instanceof double[]) {
      return ((double[]) us)[Tensor.getOffset(this.dims, coords, 0)];
    } else if (us instanceof float[]) {
      return (double) ((float[]) us)[Tensor.getOffset(this.dims, coords, 0)];
    } else {
      throw new AssertionError();
    }
  }

  public final float getFloat(int... coords) {
    final Object us = this.array;
    if (us instanceof float[]) {
      return ((float[]) us)[Tensor.getOffset(this.dims, coords, 0)];
    } else if (us instanceof double[]) {
      return (float) ((double[]) us)[Tensor.getOffset(this.dims, coords, 0)];
    } else {
      throw new AssertionError();
    }
  }

  protected static int getOffset(TensorDims dim, int[] coords, int offset) {
    int i = 0;
    do {
      final int k = coords[i];
      if (k < 0 || k >= dim.size) {
        throw new IndexOutOfBoundsException(Arrays.toString(coords));
      }
      offset += k * dim.stride;
      dim = dim.next;
      i += 1;
    } while (dim != null);
    return offset;
  }

  public final Tensor plus(Tensor that) {
    return Tensor.add(this, that);
  }

  public static Tensor add(Tensor u, Tensor v) {
    return Tensor.add(u, v, u.dims, u.precision().max(v.precision()));
  }

  public static void add(Tensor u, Tensor v, MutableTensor w) {
    Tensor.add(u.dims, u.array, u.offset, v.dims, v.array, v.offset, w.dims, w.array, w.offset);
  }

  public static Tensor add(Tensor u, Tensor v, TensorDims wd, Precision wp) {
    final Object ws;
    if (wp.isDouble()) {
      ws = new double[wd.size * wd.stride];
    } else if (wp.isSingle()) {
      ws = new float[wd.size * wd.stride];
    } else {
      throw new AssertionError();
    }
    Tensor.add(u.dims, u.array, u.offset, v.dims, v.array, v.offset, wd, ws, 0);
    return new Tensor(wd, ws, 0);
  }

  public static void add(TensorDims ud, Object us, int ui,
                         TensorDims vd, Object vs, int vi,
                         TensorDims wd, Object ws, int wi) {
    if (us instanceof double[]) {
      if (vs instanceof double[]) {
        if (ws instanceof double[]) {
          Tensor.add(ud, (double[]) us, ui, vd, (double[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.add(ud, (double[]) us, ui, vd, (double[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else if (vs instanceof float[]) {
        if (ws instanceof double[]) {
          Tensor.add(ud, (double[]) us, ui, vd, (float[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.add(ud, (double[]) us, ui, vd, (float[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else {
        throw new AssertionError();
      }
    } else if (us instanceof float[]) {
      if (vs instanceof double[]) {
        if (ws instanceof double[]) {
          Tensor.add(ud, (float[]) us, ui, vd, (double[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.add(ud, (float[]) us, ui, vd, (double[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else if (vs instanceof float[]) {
        if (ws instanceof double[]) {
          Tensor.add(ud, (float[]) us, ui, vd, (float[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.add(ud, (float[]) us, ui, vd, (float[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else {
        throw new AssertionError();
      }
    } else {
      throw new AssertionError();
    }
  }

  public static void add(TensorDims ud, double[] us, int ui,
                         TensorDims vd, double[] vs, int vi,
                         TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.add(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = us[ui] + vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void add(TensorDims ud, double[] us, int ui,
                         TensorDims vd, double[] vs, int vi,
                         TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.add(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (us[ui] + vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void add(TensorDims ud, double[] us, int ui,
                         TensorDims vd, float[] vs, int vi,
                         TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.add(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = us[ui] + (double) vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void add(TensorDims ud, double[] us, int ui,
                         TensorDims vd, float[] vs, int vi,
                         TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.add(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (us[ui] + (double) vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void add(TensorDims ud, float[] us, int ui,
                         TensorDims vd, double[] vs, int vi,
                         TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.add(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (double) us[ui] + vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void add(TensorDims ud, float[] us, int ui,
                         TensorDims vd, double[] vs, int vi,
                         TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.add(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) ((double) us[ui] + vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void add(TensorDims ud, float[] us, int ui,
                         TensorDims vd, float[] vs, int vi,
                         TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.add(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (double) us[ui] + (double) vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void add(TensorDims ud, float[] us, int ui,
                         TensorDims vd, float[] vs, int vi,
                         TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.add(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) ((double) us[ui] + (double) vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public final Tensor opposite() {
    return Tensor.opposite(this);
  }

  public static Tensor opposite(Tensor u) {
    return Tensor.opposite(u, u.dims, u.precision());
  }

  public static void opposite(Tensor u, MutableTensor w) {
    Tensor.opposite(u.dims, u.array, u.offset, w.dims, w.array, w.offset);
  }

  public static Tensor opposite(Tensor u, TensorDims wd, Precision wp) {
    final Object ws;
    if (wp.isDouble()) {
      ws = new double[wd.size * wd.stride];
    } else if (wp.isSingle()) {
      ws = new float[wd.size * wd.stride];
    } else {
      throw new AssertionError();
    }
    Tensor.opposite(u.dims, u.array, u.offset, wd, ws, 0);
    return new Tensor(wd, ws, 0);
  }

  public static void opposite(TensorDims ud, Object us, int ui,
                              TensorDims wd, Object ws, int wi) {
    if (us instanceof double[]) {
      if (ws instanceof double[]) {
        Tensor.opposite(ud, (double[]) us, ui, wd, (double[]) ws, wi);
      } else if (ws instanceof float[]) {
        Tensor.opposite(ud, (double[]) us, ui, wd, (float[]) ws, wi);
      } else {
        throw new AssertionError();
      }
    } else if (us instanceof float[]) {
      if (ws instanceof double[]) {
        Tensor.opposite(ud, (float[]) us, ui, wd, (double[]) ws, wi);
      } else if (ws instanceof float[]) {
        Tensor.opposite(ud, (float[]) us, ui, wd, (float[]) ws, wi);
      } else {
        throw new AssertionError();
      }
    } else {
      throw new AssertionError();
    }
  }

  public static void opposite(TensorDims ud, double[] us, int ui,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.opposite(ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = -us[ui];
        ui += ud.stride;
        wi += wd.stride;
      }
    }
  }

  public static void opposite(TensorDims ud, double[] us, int ui,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.opposite(ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) -us[ui];
        ui += ud.stride;
        wi += wd.stride;
      }
    }
  }

  public static void opposite(TensorDims ud, float[] us, int ui,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.opposite(ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = -((double) us[ui]);
        ui += ud.stride;
        wi += wd.stride;
      }
    }
  }

  public static void opposite(TensorDims ud, float[] us, int ui,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.opposite(ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = -us[ui];
        ui += ud.stride;
        wi += wd.stride;
      }
    }
  }

  public final Tensor minus(Tensor that) {
    return Tensor.subtract(this, that);
  }

  public static Tensor subtract(Tensor u, Tensor v) {
    return Tensor.subtract(u, v, u.dims, u.precision().max(v.precision()));
  }

  public static void subtract(Tensor u, Tensor v, MutableTensor w) {
    Tensor.subtract(u.dims, u.array, u.offset, v.dims, v.array, v.offset, w.dims, w.array, w.offset);
  }

  public static Tensor subtract(Tensor u, Tensor v, TensorDims wd, Precision wp) {
    final Object ws;
    if (wp.isDouble()) {
      ws = new double[wd.size * wd.stride];
    } else if (wp.isSingle()) {
      ws = new float[wd.size * wd.stride];
    } else {
      throw new AssertionError();
    }
    Tensor.subtract(u.dims, u.array, u.offset, v.dims, v.array, v.offset, wd, ws, 0);
    return new Tensor(wd, ws, 0);
  }

  public static void subtract(TensorDims ud, Object us, int ui,
                              TensorDims vd, Object vs, int vi,
                              TensorDims wd, Object ws, int wi) {
    if (us instanceof double[]) {
      if (vs instanceof double[]) {
        if (ws instanceof double[]) {
          Tensor.subtract(ud, (double[]) us, ui, vd, (double[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.subtract(ud, (double[]) us, ui, vd, (double[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else if (vs instanceof float[]) {
        if (ws instanceof double[]) {
          Tensor.subtract(ud, (double[]) us, ui, vd, (float[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.subtract(ud, (double[]) us, ui, vd, (float[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else {
        throw new AssertionError();
      }
    } else if (us instanceof float[]) {
      if (vs instanceof double[]) {
        if (ws instanceof double[]) {
          Tensor.subtract(ud, (float[]) us, ui, vd, (double[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.subtract(ud, (float[]) us, ui, vd, (double[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else if (vs instanceof float[]) {
        if (ws instanceof double[]) {
          Tensor.subtract(ud, (float[]) us, ui, vd, (float[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.subtract(ud, (float[]) us, ui, vd, (float[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else {
        throw new AssertionError();
      }
    } else {
      throw new AssertionError();
    }
  }

  public static void subtract(TensorDims ud, double[] us, int ui,
                              TensorDims vd, double[] vs, int vi,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.subtract(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = us[ui] - vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void subtract(TensorDims ud, double[] us, int ui,
                              TensorDims vd, double[] vs, int vi,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.subtract(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (us[ui] - vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void subtract(TensorDims ud, double[] us, int ui,
                              TensorDims vd, float[] vs, int vi,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.subtract(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = us[ui] - (double) vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void subtract(TensorDims ud, double[] us, int ui,
                              TensorDims vd, float[] vs, int vi,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.subtract(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (us[ui] - (double) vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void subtract(TensorDims ud, float[] us, int ui,
                              TensorDims vd, double[] vs, int vi,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.subtract(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (double) us[ui] - vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void subtract(TensorDims ud, float[] us, int ui,
                              TensorDims vd, double[] vs, int vi,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.subtract(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) ((double) us[ui] - vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void subtract(TensorDims ud, float[] us, int ui,
                              TensorDims vd, float[] vs, int vi,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.subtract(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (double) us[ui] - (double) vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void subtract(TensorDims ud, float[] us, int ui,
                              TensorDims vd, float[] vs, int vi,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.subtract(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) ((double) us[ui] - (double) vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public final Tensor times(double scalar) {
    return Tensor.multiply(scalar, this);
  }

  public static Tensor multiply(double a, Tensor u) {
    return Tensor.multiply(a, u, u.dims, u.precision());
  }

  public static void multiply(double a, Tensor u, MutableTensor w) {
    Tensor.multiply(a, u.dims, u.array, u.offset, w.dims, w.array, w.offset);
  }

  public static Tensor multiply(double a, Tensor u, TensorDims wd, Precision wp) {
    final Object ws;
    if (wp.isDouble()) {
      ws = new double[wd.size * wd.stride];
    } else if (wp.isSingle()) {
      ws = new float[wd.size * wd.stride];
    } else {
      throw new AssertionError();
    }
    Tensor.multiply(a, u.dims, u.array, u.offset, wd, ws, 0);
    return new Tensor(wd, ws, 0);
  }

  public static void multiply(double a, TensorDims ud, Object us, int ui,
                              TensorDims wd, Object ws, int wi) {
    if (us instanceof double[]) {
      if (ws instanceof double[]) {
        Tensor.multiply(a, ud, (double[]) us, ui, wd, (double[]) ws, wi);
      } else if (ws instanceof float[]) {
        Tensor.multiply(a, ud, (double[]) us, ui, wd, (float[]) ws, wi);
      } else {
        throw new AssertionError();
      }
    } else if (us instanceof float[]) {
      if (ws instanceof double[]) {
        Tensor.multiply(a, ud, (float[]) us, ui, wd, (double[]) ws, wi);
      } else if (ws instanceof float[]) {
        Tensor.multiply(a, ud, (float[]) us, ui, wd, (float[]) ws, wi);
      } else {
        throw new AssertionError();
      }
    } else {
      throw new AssertionError();
    }
  }

  public static void multiply(double a, TensorDims ud, double[] us, int ui,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(a, ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = a * us[ui];
        ui += ud.stride;
        wi += wd.stride;
      }
    }
  }

  public static void multiply(double a, TensorDims ud, double[] us, int ui,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(a, ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (a * us[ui]);
        ui += ud.stride;
        wi += wd.stride;
      }
    }
  }

  public static void multiply(double a, TensorDims ud, float[] us, int ui,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(a, ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (a * (double) us[ui]);
        ui += ud.stride;
        wi += wd.stride;
      }
    }
  }

  public static void multiply(double a, TensorDims ud, float[] us, int ui,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(a, ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (a * (double) us[ui]);
        ui += ud.stride;
        wi += wd.stride;
      }
    }
  }

  public final Tensor times(Tensor that) {
    return Tensor.multiply(this, that);
  }

  public static Tensor multiply(Tensor u, Tensor v) {
    return Tensor.multiply(u, v, u.dims, u.precision().max(v.precision()));
  }

  public static void multiply(Tensor u, Tensor v, MutableTensor w) {
    Tensor.multiply(u.dims, u.array, u.offset, v.dims, v.array, v.offset, w.dims, w.array, w.offset);
  }

  public static Tensor multiply(Tensor u, Tensor v, TensorDims wd, Precision wp) {
    final Object ws;
    if (wp.isDouble()) {
      ws = new double[wd.size * wd.stride];
    } else if (wp.isSingle()) {
      ws = new float[wd.size * wd.stride];
    } else {
      throw new AssertionError();
    }
    Tensor.multiply(u.dims, u.array, u.offset, v.dims, v.array, v.offset, wd, ws, 0);
    return new Tensor(wd, ws, 0);
  }

  public static void multiply(TensorDims ud, Object us, int ui,
                              TensorDims vd, Object vs, int vi,
                              TensorDims wd, Object ws, int wi) {
    if (us instanceof double[]) {
      if (vs instanceof double[]) {
        if (ws instanceof double[]) {
          Tensor.multiply(ud, (double[]) us, ui, vd, (double[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.multiply(ud, (double[]) us, ui, vd, (double[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else if (vs instanceof float[]) {
        if (ws instanceof double[]) {
          Tensor.multiply(ud, (double[]) us, ui, vd, (float[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.multiply(ud, (double[]) us, ui, vd, (float[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else {
        throw new AssertionError();
      }
    } else if (us instanceof float[]) {
      if (vs instanceof double[]) {
        if (ws instanceof double[]) {
          Tensor.multiply(ud, (float[]) us, ui, vd, (double[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.multiply(ud, (float[]) us, ui, vd, (double[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else if (vs instanceof float[]) {
        if (ws instanceof double[]) {
          Tensor.multiply(ud, (float[]) us, ui, vd, (float[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.multiply(ud, (float[]) us, ui, vd, (float[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else {
        throw new AssertionError();
      }
    } else {
      throw new AssertionError();
    }
  }

  public static void multiply(TensorDims ud, double[] us, int ui,
                              TensorDims vd, double[] vs, int vi,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = us[ui] * vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void multiply(TensorDims ud, double[] us, int ui,
                              TensorDims vd, double[] vs, int vi,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (us[ui] * vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void multiply(TensorDims ud, double[] us, int ui,
                              TensorDims vd, float[] vs, int vi,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = us[ui] * (double) vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void multiply(TensorDims ud, double[] us, int ui,
                              TensorDims vd, float[] vs, int vi,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (us[ui] * (double) vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void multiply(TensorDims ud, float[] us, int ui,
                              TensorDims vd, double[] vs, int vi,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (double) us[ui] * vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void multiply(TensorDims ud, float[] us, int ui,
                              TensorDims vd, double[] vs, int vi,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) ((double) us[ui] * vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void multiply(TensorDims ud, float[] us, int ui,
                              TensorDims vd, float[] vs, int vi,
                              TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (double) us[ui] * (double) vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public static void multiply(TensorDims ud, float[] us, int ui,
                              TensorDims vd, float[] vs, int vi,
                              TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.multiply(ud.next, us, ui, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) ((double) us[ui] * (double) vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += wd.stride;
      }
    }
  }

  public final Tensor timesMatrix(Tensor that) {
    return Tensor.multiplyMatrix(this, that);
  }

  public static Tensor multiplyMatrix(Tensor u, Tensor v) {
    return Tensor.multiplyMatrix(u, v, u.dims, u.precision().max(v.precision()));
  }

  public static Tensor multiplyMatrix(Tensor u, Tensor v, TensorDims wd, Precision wp) {
    return Tensor.multiplyMatrix(u, false, v, false, wd, wp, false);
  }

  public static void multiplyMatrix(Tensor u, boolean ut, Tensor v, boolean vt, MutableTensor w, boolean wt) {
    Tensor.multiplyMatrix(u.dims, u.array, u.offset, ut, v.dims, v.array, v.offset, vt, w.dims, w.array, w.offset, wt);
  }

  public static Tensor multiplyMatrix(Tensor u, boolean ut, Tensor v, boolean vt, TensorDims wd, Precision wp, boolean wt) {
    final Object ws;
    if (wp.isDouble()) {
      ws = new double[wd.size * wd.stride];
    } else if (wp.isSingle()) {
      ws = new float[wd.size * wd.stride];
    } else {
      throw new AssertionError();
    }
    Tensor.multiplyMatrix(u.dims, u.array, u.offset, ut, v.dims, v.array, v.offset, vt, wd, ws, 0, wt);
    return new Tensor(wd, ws, 0);
  }

  public static void multiplyMatrix(TensorDims ud, Object us, int ui, boolean ut,
                                    TensorDims vd, Object vs, int vi, boolean vt,
                                    TensorDims wd, Object ws, int wi, boolean wt) {
    if (us instanceof double[]) {
      if (vs instanceof double[]) {
        if (ws instanceof double[]) {
          Tensor.multiplyMatrix(ud, (double[]) us, ui, ut, vd, (double[]) vs, vi, vt, wd, (double[]) ws, wi, wt);
        } else if (ws instanceof float[]) {
          Tensor.multiplyMatrix(ud, (double[]) us, ui, ut, vd, (double[]) vs, vi, vt, wd, (float[]) ws, wi, wt);
        } else {
          throw new AssertionError();
        }
      } else if (vs instanceof float[]) {
        if (ws instanceof double[]) {
          Tensor.multiplyMatrix(ud, (double[]) us, ui, ut, vd, (float[]) vs, vi, vt, wd, (double[]) ws, wi, wt);
        } else if (ws instanceof float[]) {
          Tensor.multiplyMatrix(ud, (double[]) us, ui, ut, vd, (float[]) vs, vi, vt, wd, (float[]) ws, wi, wt);
        } else {
          throw new AssertionError();
        }
      } else {
        throw new AssertionError();
      }
    } else if (us instanceof float[]) {
      if (vs instanceof double[]) {
        if (ws instanceof double[]) {
          Tensor.multiplyMatrix(ud, (float[]) us, ui, ut, vd, (double[]) vs, vi, vt, wd, (double[]) ws, wi, wt);
        } else if (ws instanceof float[]) {
          Tensor.multiplyMatrix(ud, (float[]) us, ui, ut, vd, (double[]) vs, vi, vt, wd, (float[]) ws, wi, wt);
        } else {
          throw new AssertionError();
        }
      } else if (vs instanceof float[]) {
        if (ws instanceof double[]) {
          Tensor.multiplyMatrix(ud, (float[]) us, ui, ut, vd, (float[]) vs, vi, vt, wd, (double[]) ws, wi, wt);
        } else if (ws instanceof float[]) {
          Tensor.multiplyMatrix(ud, (float[]) us, ui, ut, vd, (float[]) vs, vi, vt, wd, (float[]) ws, wi, wt);
        } else {
          throw new AssertionError();
        }
      } else {
        throw new AssertionError();
      }
    } else {
      throw new AssertionError();
    }
  }

  public static void multiplyMatrix(TensorDims ud, double[] us, int ui, boolean ut,
                                    TensorDims vd, double[] vs, int vi, boolean vt,
                                    TensorDims wd, double[] ws, int wi, boolean wt) {
    if (ud.rank() != 2 || vd.rank() != 2 || wd.rank() != 2) {
      throw new DimensionException();
    }
    final int m = ut ? ud.size : ud.next.size;
    final int n = ut ? ud.next.size : ud.size;
    final int p = vt ? vd.next.size : vd.size;
    if ((vt ? vd.size : vd.next.size) != n
        || (wt ? wd.next.size : wd.size) != m
        || (wt ? wd.next.size : wd.size) != p) {
      throw new DimensionException();
    }
    final int uc = ut ? ud.next.stride : ud.stride;
    final int ur = ut ? ud.stride : ud.next.stride;
    final int vc = vt ? vd.next.stride : vd.stride;
    final int vr = vt ? vd.stride : vd.next.stride;
    final int wc = wt ? wd.next.stride : wd.stride;
    final int wr = wt ? wd.stride : wd.next.stride;
    final int ui0 = ui;
    final int vi0 = vi;
    final int wi0 = wi;
    for (int i = 0; i < m; i += 1) {
      wi = wi0 + wr * i;
      for (int j = 0; j < p; j += 1) {
        ui = ui0 + ur * i;
        vi = vi0 + vc * i;
        double dp = 0.0;
        for (int d = 0; d < n; d += 1) {
          dp += us[ui] * vs[vi];
          ui += uc;
          vi += vr;
        }
        ws[wi] = dp;
        wi += wc;
      }
    }
  }

  public static void multiplyMatrix(TensorDims ud, double[] us, int ui, boolean ut,
                                    TensorDims vd, double[] vs, int vi, boolean vt,
                                    TensorDims wd, float[] ws, int wi, boolean wt) {
    if (ud.rank() != 2 || vd.rank() != 2 || wd.rank() != 2) {
      throw new DimensionException();
    }
    final int m = ut ? ud.size : ud.next.size;
    final int n = ut ? ud.next.size : ud.size;
    final int p = vt ? vd.next.size : vd.size;
    if ((vt ? vd.size : vd.next.size) != n
        || (wt ? wd.next.size : wd.size) != m
        || (wt ? wd.next.size : wd.size) != p) {
      throw new DimensionException();
    }
    final int uc = ut ? ud.next.stride : ud.stride;
    final int ur = ut ? ud.stride : ud.next.stride;
    final int vc = vt ? vd.next.stride : vd.stride;
    final int vr = vt ? vd.stride : vd.next.stride;
    final int wc = wt ? wd.next.stride : wd.stride;
    final int wr = wt ? wd.stride : wd.next.stride;
    final int ui0 = ui;
    final int vi0 = vi;
    final int wi0 = wi;
    for (int i = 0; i < m; i += 1) {
      wi = wi0 + wr * i;
      for (int j = 0; j < p; j += 1) {
        ui = ui0 + ur * i;
        vi = vi0 + vc * i;
        double dp = 0.0;
        for (int d = 0; d < n; d += 1) {
          dp += us[ui] * vs[vi];
          ui += uc;
          vi += vr;
        }
        ws[wi] = (float) dp;
        wi += wc;
      }
    }
  }

  public static void multiplyMatrix(TensorDims ud, double[] us, int ui, boolean ut,
                                    TensorDims vd, float[] vs, int vi, boolean vt,
                                    TensorDims wd, double[] ws, int wi, boolean wt) {
    if (ud.rank() != 2 || vd.rank() != 2 || wd.rank() != 2) {
      throw new DimensionException();
    }
    final int m = ut ? ud.size : ud.next.size;
    final int n = ut ? ud.next.size : ud.size;
    final int p = vt ? vd.next.size : vd.size;
    if ((vt ? vd.size : vd.next.size) != n
        || (wt ? wd.next.size : wd.size) != m
        || (wt ? wd.next.size : wd.size) != p) {
      throw new DimensionException();
    }
    final int uc = ut ? ud.next.stride : ud.stride;
    final int ur = ut ? ud.stride : ud.next.stride;
    final int vc = vt ? vd.next.stride : vd.stride;
    final int vr = vt ? vd.stride : vd.next.stride;
    final int wc = wt ? wd.next.stride : wd.stride;
    final int wr = wt ? wd.stride : wd.next.stride;
    final int ui0 = ui;
    final int vi0 = vi;
    final int wi0 = wi;
    for (int i = 0; i < m; i += 1) {
      wi = wi0 + wr * i;
      for (int j = 0; j < p; j += 1) {
        ui = ui0 + ur * i;
        vi = vi0 + vc * i;
        double dp = 0.0;
        for (int d = 0; d < n; d += 1) {
          dp += us[ui] * (double) vs[vi];
          ui += uc;
          vi += vr;
        }
        ws[wi] = dp;
        wi += wc;
      }
    }
  }

  public static void multiplyMatrix(TensorDims ud, double[] us, int ui, boolean ut,
                                    TensorDims vd, float[] vs, int vi, boolean vt,
                                    TensorDims wd, float[] ws, int wi, boolean wt) {
    if (ud.rank() != 2 || vd.rank() != 2 || wd.rank() != 2) {
      throw new DimensionException();
    }
    final int m = ut ? ud.size : ud.next.size;
    final int n = ut ? ud.next.size : ud.size;
    final int p = vt ? vd.next.size : vd.size;
    if ((vt ? vd.size : vd.next.size) != n
        || (wt ? wd.next.size : wd.size) != m
        || (wt ? wd.next.size : wd.size) != p) {
      throw new DimensionException();
    }
    final int uc = ut ? ud.next.stride : ud.stride;
    final int ur = ut ? ud.stride : ud.next.stride;
    final int vc = vt ? vd.next.stride : vd.stride;
    final int vr = vt ? vd.stride : vd.next.stride;
    final int wc = wt ? wd.next.stride : wd.stride;
    final int wr = wt ? wd.stride : wd.next.stride;
    final int ui0 = ui;
    final int vi0 = vi;
    final int wi0 = wi;
    for (int i = 0; i < m; i += 1) {
      wi = wi0 + wr * i;
      for (int j = 0; j < p; j += 1) {
        ui = ui0 + ur * i;
        vi = vi0 + vc * i;
        double dp = 0.0;
        for (int d = 0; d < n; d += 1) {
          dp += us[ui] * (double) vs[vi];
          ui += uc;
          vi += vr;
        }
        ws[wi] = (float) dp;
        wi += wc;
      }
    }
  }

  public static void multiplyMatrix(TensorDims ud, float[] us, int ui, boolean ut,
                                    TensorDims vd, double[] vs, int vi, boolean vt,
                                    TensorDims wd, double[] ws, int wi, boolean wt) {
    if (ud.rank() != 2 || vd.rank() != 2 || wd.rank() != 2) {
      throw new DimensionException();
    }
    final int m = ut ? ud.size : ud.next.size;
    final int n = ut ? ud.next.size : ud.size;
    final int p = vt ? vd.next.size : vd.size;
    if ((vt ? vd.size : vd.next.size) != n
        || (wt ? wd.next.size : wd.size) != m
        || (wt ? wd.next.size : wd.size) != p) {
      throw new DimensionException();
    }
    final int uc = ut ? ud.next.stride : ud.stride;
    final int ur = ut ? ud.stride : ud.next.stride;
    final int vc = vt ? vd.next.stride : vd.stride;
    final int vr = vt ? vd.stride : vd.next.stride;
    final int wc = wt ? wd.next.stride : wd.stride;
    final int wr = wt ? wd.stride : wd.next.stride;
    final int ui0 = ui;
    final int vi0 = vi;
    final int wi0 = wi;
    for (int i = 0; i < m; i += 1) {
      wi = wi0 + wr * i;
      for (int j = 0; j < p; j += 1) {
        ui = ui0 + ur * i;
        vi = vi0 + vc * i;
        double dp = 0.0;
        for (int d = 0; d < n; d += 1) {
          dp += (double) us[ui] * vs[vi];
          ui += uc;
          vi += vr;
        }
        ws[wi] = dp;
        wi += wc;
      }
    }
  }

  public static void multiplyMatrix(TensorDims ud, float[] us, int ui, boolean ut,
                                    TensorDims vd, double[] vs, int vi, boolean vt,
                                    TensorDims wd, float[] ws, int wi, boolean wt) {
    if (ud.rank() != 2 || vd.rank() != 2 || wd.rank() != 2) {
      throw new DimensionException();
    }
    final int m = ut ? ud.size : ud.next.size;
    final int n = ut ? ud.next.size : ud.size;
    final int p = vt ? vd.next.size : vd.size;
    if ((vt ? vd.size : vd.next.size) != n
        || (wt ? wd.next.size : wd.size) != m
        || (wt ? wd.next.size : wd.size) != p) {
      throw new DimensionException();
    }
    final int uc = ut ? ud.next.stride : ud.stride;
    final int ur = ut ? ud.stride : ud.next.stride;
    final int vc = vt ? vd.next.stride : vd.stride;
    final int vr = vt ? vd.stride : vd.next.stride;
    final int wc = wt ? wd.next.stride : wd.stride;
    final int wr = wt ? wd.stride : wd.next.stride;
    final int ui0 = ui;
    final int vi0 = vi;
    final int wi0 = wi;
    for (int i = 0; i < m; i += 1) {
      wi = wi0 + wr * i;
      for (int j = 0; j < p; j += 1) {
        ui = ui0 + ur * i;
        vi = vi0 + vc * i;
        double dp = 0.0;
        for (int d = 0; d < n; d += 1) {
          dp += (double) us[ui] * vs[vi];
          ui += uc;
          vi += vr;
        }
        ws[wi] = (float) dp;
        wi += wc;
      }
    }
  }

  public static void multiplyMatrix(TensorDims ud, float[] us, int ui, boolean ut,
                                    TensorDims vd, float[] vs, int vi, boolean vt,
                                    TensorDims wd, double[] ws, int wi, boolean wt) {
    if (ud.rank() != 2 || vd.rank() != 2 || wd.rank() != 2) {
      throw new DimensionException();
    }
    final int m = ut ? ud.size : ud.next.size;
    final int n = ut ? ud.next.size : ud.size;
    final int p = vt ? vd.next.size : vd.size;
    if ((vt ? vd.size : vd.next.size) != n
        || (wt ? wd.next.size : wd.size) != m
        || (wt ? wd.next.size : wd.size) != p) {
      throw new DimensionException();
    }
    final int uc = ut ? ud.next.stride : ud.stride;
    final int ur = ut ? ud.stride : ud.next.stride;
    final int vc = vt ? vd.next.stride : vd.stride;
    final int vr = vt ? vd.stride : vd.next.stride;
    final int wc = wt ? wd.next.stride : wd.stride;
    final int wr = wt ? wd.stride : wd.next.stride;
    final int ui0 = ui;
    final int vi0 = vi;
    final int wi0 = wi;
    for (int i = 0; i < m; i += 1) {
      wi = wi0 + wr * i;
      for (int j = 0; j < p; j += 1) {
        ui = ui0 + ur * i;
        vi = vi0 + vc * i;
        double dp = 0.0;
        for (int d = 0; d < n; d += 1) {
          dp += (double) us[ui] * (double) vs[vi];
          ui += uc;
          vi += vr;
        }
        ws[wi] = dp;
        wi += wc;
      }
    }
  }

  public static void multiplyMatrix(TensorDims ud, float[] us, int ui, boolean ut,
                                    TensorDims vd, float[] vs, int vi, boolean vt,
                                    TensorDims wd, float[] ws, int wi, boolean wt) {
    if (ud.rank() != 2 || vd.rank() != 2 || wd.rank() != 2) {
      throw new DimensionException();
    }
    final int m = ut ? ud.size : ud.next.size;
    final int n = ut ? ud.next.size : ud.size;
    final int p = vt ? vd.next.size : vd.size;
    if ((vt ? vd.size : vd.next.size) != n
        || (wt ? wd.next.size : wd.size) != m
        || (wt ? wd.next.size : wd.size) != p) {
      throw new DimensionException();
    }
    final int uc = ut ? ud.next.stride : ud.stride;
    final int ur = ut ? ud.stride : ud.next.stride;
    final int vc = vt ? vd.next.stride : vd.stride;
    final int vr = vt ? vd.stride : vd.next.stride;
    final int wc = wt ? wd.next.stride : wd.stride;
    final int wr = wt ? wd.stride : wd.next.stride;
    final int ui0 = ui;
    final int vi0 = vi;
    final int wi0 = wi;
    for (int i = 0; i < m; i += 1) {
      wi = wi0 + wr * i;
      for (int j = 0; j < p; j += 1) {
        ui = ui0 + ur * i;
        vi = vi0 + vc * j;
        double dp = 0.0;
        for (int d = 0; d < n; d += 1) {
          dp += (double) us[ui] * (double) vs[vi];
          ui += uc;
          vi += vr;
        }
        ws[wi] = (float) dp;
        wi += wc;
      }
    }
  }

  public static Tensor combine(double a, Tensor u, double b, Tensor v) {
    return Tensor.combine(a, u, b, v, u.dims, u.precision().max(v.precision()));
  }

  public static void combine(double a, Tensor u, double b, Tensor v, MutableTensor w) {
    Tensor.combine(a, u.dims, u.array, u.offset, b, v.dims, v.array, v.offset, w.dims, w.array, w.offset);
  }

  public static Tensor combine(double a, Tensor u, double b, Tensor v, TensorDims wd, Precision wp) {
    final Object ws;
    if (wp.isDouble()) {
      ws = new double[wd.size * wd.stride];
    } else if (wp.isSingle()) {
      ws = new float[wd.size * wd.stride];
    } else {
      throw new AssertionError();
    }
    Tensor.combine(a, u.dims, u.array, u.offset, b, v.dims, v.array, v.offset, wd, ws, 0);
    return new Tensor(wd, ws, 0);
  }

  public static void combine(double a, TensorDims ud, Object us, int ui,
                             double b, TensorDims vd, Object vs, int vi,
                             TensorDims wd, Object ws, int wi) {
    if (us instanceof double[]) {
      if (vs instanceof double[]) {
        if (ws instanceof double[]) {
          Tensor.combine(a, ud, (double[]) us, ui, b, vd, (double[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.combine(a, ud, (double[]) us, ui, b, vd, (double[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else if (vs instanceof float[]) {
        if (ws instanceof double[]) {
          Tensor.combine(a, ud, (double[]) us, ui, b, vd, (float[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.combine(a, ud, (double[]) us, ui, b, vd, (float[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else {
        throw new AssertionError();
      }
    } else if (us instanceof float[]) {
      if (vs instanceof double[]) {
        if (ws instanceof double[]) {
          Tensor.combine(a, ud, (float[]) us, ui, b, vd, (double[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.combine(a, ud, (float[]) us, ui, b, vd, (double[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else if (vs instanceof float[]) {
        if (ws instanceof double[]) {
          Tensor.combine(a, ud, (float[]) us, ui, b, vd, (float[]) vs, vi, wd, (double[]) ws, wi);
        } else if (ws instanceof float[]) {
          Tensor.combine(a, ud, (float[]) us, ui, b, vd, (float[]) vs, vi, wd, (float[]) ws, wi);
        } else {
          throw new AssertionError();
        }
      } else {
        throw new AssertionError();
      }
    } else {
      throw new AssertionError();
    }
  }

  public static void combine(double a, TensorDims ud, double[] us, int ui,
                             double b, TensorDims vd, double[] vs, int vi,
                             TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.combine(a, ud.next, us, ui, b, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = a * us[ui] + b * vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    }
  }

  public static void combine(double a, TensorDims ud, double[] us, int ui,
                             double b, TensorDims vd, double[] vs, int vi,
                             TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.combine(a, ud.next, us, ui, b, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (a * us[ui] + b * vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    }
  }

  public static void combine(double a, TensorDims ud, double[] us, int ui,
                             double b, TensorDims vd, float[] vs, int vi,
                             TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.combine(a, ud.next, us, ui, b, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = a * us[ui] + b * (double) vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    }
  }

  public static void combine(double a, TensorDims ud, double[] us, int ui,
                             double b, TensorDims vd, float[] vs, int vi,
                             TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.combine(a, ud.next, us, ui, b, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (a * us[ui] + b * (double) vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    }
  }

  public static void combine(double a, TensorDims ud, float[] us, int ui,
                             double b, TensorDims vd, double[] vs, int vi,
                             TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.combine(a, ud.next, us, ui, b, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = a * (double) us[ui] + b * vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    }
  }

  public static void combine(double a, TensorDims ud, float[] us, int ui,
                             double b, TensorDims vd, double[] vs, int vi,
                             TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.combine(a, ud.next, us, ui, b, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (a * (double) us[ui] + b * vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    }
  }

  public static void combine(double a, TensorDims ud, float[] us, int ui,
                             double b, TensorDims vd, float[] vs, int vi,
                             TensorDims wd, double[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.combine(a, ud.next, us, ui, b, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = a * (double) us[ui] + b * (double) vs[vi];
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    }
  }

  public static void combine(double a, TensorDims ud, float[] us, int ui,
                             double b, TensorDims vd, float[] vs, int vi,
                             TensorDims wd, float[] ws, int wi) {
    if (ud.size != vd.size || ud.size != wd.size || vd.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (wd.next != null) {
      if (ud.next == null || vd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.combine(a, ud.next, us, ui, b, vd.next, vs, vi, wd.next, ws, wi);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    } else {
      if (ud.next != null || vd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) (a * (double) us[ui] + b * (double) vs[vi]);
        ui += ud.stride;
        vi += vd.stride;
        wi += ud.stride;
      }
    }
  }

  public final double[] getDoubleArray() {
    if (this.array instanceof double[]) {
      return (double[]) this.array;
    } else {
      return null;
    }
  }

  public final float[] getFloatArray() {
    if (this.array instanceof float[]) {
      return (float[]) this.array;
    } else {
      return null;
    }
  }

  public final int getArrayOffset() {
    return this.offset;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Tensor) {
      final Tensor that = (Tensor) other;
      final Object us = this.array;
      final Object vs = that.array;
      if (us instanceof double[] && vs instanceof double[]) {
        return Tensor.equals(this.dims, (double[]) us, this.offset, that.dims, (double[]) vs, that.offset);
      } else if (us instanceof float[] && vs instanceof float[]) {
        return Tensor.equals(this.dims, (float[]) us, this.offset, that.dims, (float[]) vs, that.offset);
      }
    }
    return false;
  }

  static boolean equals(TensorDims ud, double[] us, int ui,
                        TensorDims vd, double[] vs, int vi) {
    if (ud.size != vd.size) {
      return false;
    }
    final int un = ui + ud.size * ud.stride;
    if (ud.next != null) {
      if (vd == null) {
        return false;
      }
      while (ui < un) {
        if (!Tensor.equals(ud.next, us, ui, vd.next, vs, vi)) {
          return false;
        }
        ui += ud.stride;
        vi += vd.stride;
      }
    } else {
      if (vd.next != null) {
        return false;
      }
      while (ui < un) {
        if (us[ui] != vs[vi]) {
          return false;
        }
        ui += ud.stride;
        vi += vd.stride;
      }
    }
    return true;
  }

  static boolean equals(TensorDims ud, float[] us, int ui,
                        TensorDims vd, float[] vs, int vi) {
    if (ud.size != vd.size) {
      return false;
    }
    final int un = ui + ud.size * ud.stride;
    if (ud.next != null) {
      if (vd == null) {
        return false;
      }
      while (ui < un) {
        if (!Tensor.equals(ud.next, us, ui, vd.next, vs, vi)) {
          return false;
        }
        ui += ud.stride;
        vi += vd.stride;
      }
    } else {
      if (vd.next != null) {
        return false;
      }
      while (ui < un) {
        if (us[ui] != vs[vi]) {
          return false;
        }
        ui += ud.stride;
        vi += vd.stride;
      }
    }
    return true;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Tensor.hashSeed == 0) {
      Tensor.hashSeed = Murmur3.seed(Tensor.class);
    }
    int code = Tensor.hashSeed;
    final Object us = this.array;
    if (us instanceof double[]) {
      code = Tensor.hash(code, this.dims, (double[]) us, this.offset);
    } else if (us instanceof float[]) {
      code = Tensor.hash(code, this.dims, (float[]) us, this.offset);
    } else {
      throw new AssertionError();
    }
    return Murmur3.mash(code);
  }

  static int hash(int code, TensorDims ud, double[] us, int ui) {
    final int limit = ui + ud.size * ud.stride;
    if (ud.next != null) {
      while (ui < limit) {
        Tensor.hash(code, ud.next, us, ui);
        ui += ud.stride;
      }
    } else {
      while (ui < limit) {
        code = Murmur3.mix(code, Murmur3.hash(us[ui]));
        ui += ud.stride;
      }
    }
    return code;
  }

  static int hash(int code, TensorDims ud, float[] us, int ui) {
    final int limit = ui + ud.size * ud.stride;
    if (ud.next != null) {
      while (ui < limit) {
        Tensor.hash(code, ud.next, us, ui);
        ui += ud.stride;
      }
    } else {
      while (ui < limit) {
        code = Murmur3.mix(code, Murmur3.hash(us[ui]));
        ui += ud.stride;
      }
    }
    return code;
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Tensor").write('.').write("of").write('(')
                   .debug(this.dims).write(", ").debug(this.offset);
    final Object us = this.array;
    if (us instanceof double[]) {
      output = Tensor.debug(output, (double[]) us);
    } else if (us instanceof float[]) {
      output = Tensor.debug(output, (float[]) us);
    } else {
      throw new AssertionError();
    }
    output = output.write(')');
    return output;
  }

  static <T> Output<T> debug(Output<T> output, double[] us) {
    for (int i = 0, n = us.length; i < n; i += 1) {
      output = output.write(", ").debug(us[i]);
    }
    return output;
  }

  static <T> Output<T> debug(Output<T> output, float[] us) {
    for (int i = 0, n = us.length; i < n; i += 1) {
      output = output.write(", ").debug(us[i]);
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static Tensor zero(TensorDims dims) {
    return new Tensor(dims, new float[dims.size * dims.stride]);
  }

  public static Tensor of(TensorDims dims, int offset, double... array) {
    return new Tensor(dims, array, offset);
  }

  public static Tensor of(TensorDims dims, int offset, float... array) {
    return new Tensor(dims, array, offset);
  }

  public static TensorSpace<Tensor, Double> space(TensorSpace<Tensor, Double> next, TensorDims dims) {
    return new TensorObjectSpace(next, dims);
  }

  public static TensorSpace<Tensor, Double> space(TensorSpace<Tensor, Double> next, int n) {
    return new TensorObjectSpace(next, next.dimensions().by(n));
  }

  public static TensorSpace<Tensor, Double> space(TensorDims dims) {
    if (dims.next != null) {
      throw new DimensionException();
    }
    return new TensorObjectSpace(null, dims);
  }

  public static TensorSpace<Tensor, Double> space(int n) {
    return new TensorObjectSpace(null, TensorDims.of(n));
  }

  public static TensorForm<Tensor> form(TensorDims dims, Precision prec) {
    return new TensorObjectForm(dims, prec);
  }

  public static TensorForm<Tensor> form(TensorDims dims) {
    return new TensorObjectForm(dims, Precision.f64());
  }

  public static Item mold(String tag, Tensor u) {
    final Object us = u.array;
    if (us instanceof double[]) {
      return Tensor.mold(tag, u.dims, (double[]) us, u.offset);
    } else if (us instanceof float[]) {
      return Tensor.mold(tag, u.dims, (float[]) us, u.offset);
    } else {
      throw new AssertionError();
    }
  }

  public static Item mold(String tag, TensorDims ud, double[] us, int ui) {
    final int un = ui + ud.size * ud.stride;
    final Record header = Record.create(ud.size);
    if (ud.next != null) {
      while (ui < un) {
        header.item(Tensor.mold(tag, ud.next, us, ui));
        ui += ud.stride;
      }
    } else {
      while (ui < un) {
        header.item(us[ui]);
        ui += ud.stride;
      }
    }
    return Record.create(1).attr(tag, header);
  }

  public static Item mold(String tag, TensorDims ud, float[] us, int ui) {
    final int un = ui + ud.size * ud.stride;
    final Record header = Record.create(ud.size);
    if (ud.next != null) {
      while (ui < un) {
        header.item(Tensor.mold(tag, ud.next, us, ui));
        ui += ud.stride;
      }
    } else {
      while (ui < un) {
        header.item(us[ui]);
        ui += ud.stride;
      }
    }
    return Record.create(1).attr(tag, header);
  }

  public static Tensor cast(String tag, Item item, TensorDims wd, Precision wp) {
    if (wp.isDouble()) {
      final double[] ws = new double[wd.size * wd.stride];
      Tensor.cast(tag, item, wd, ws, 0);
      return new Tensor(wd, ws);
    } else if (wp.isSingle()) {
      final float[] ws = new float[wd.size * wd.stride];
      Tensor.cast(tag, item, wd, ws, 0);
      return new Tensor(wd, ws);
    } else {
      throw new AssertionError();
    }
  }

  public static void cast(String tag, Item item, TensorDims wd, double[] ws, int wi) {
    final Value header = item.toValue().header(tag);
    if (!header.isDefined()) {
      return;
    }
    if (wd.next != null) {
      for (int i = 0; i < wd.size; i += 1) {
        Tensor.cast(tag, header.getItem(i), wd.next, ws, wi);
        wi += wd.stride;
      }
    } else {
      for (int i = 0; i < wd.size; i += 1) {
        ws[wi] = header.getItem(i).doubleValue(0.0);
        wi += wd.stride;
      }
    }
  }

  public static void cast(String tag, Item item, TensorDims wd, float[] ws, int wi) {
    final Value header = item.toValue().header(tag);
    if (!header.isDefined()) {
      return;
    }
    if (wd.next != null) {
      for (int i = 0; i < wd.size; i += 1) {
        Tensor.cast(tag, header.getItem(i), wd.next, ws, wi);
        wi += wd.stride;
      }
    } else {
      for (int i = 0; i < wd.size; i += 1) {
        ws[wi] = header.getItem(i).floatValue(0.0f);
        wi += wd.stride;
      }
    }
  }

  public static void copy(TensorDims ud, double[] us, int ui,
                          TensorDims wd, double[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn;
    if (ud.next != null) {
      if (wd.next == null) {
        throw new DimensionException();
      }
      wn = wi + wd.size * wd.stride;
      while (wi < wn) {
        Tensor.copy(ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (wd.next != null) {
        throw new DimensionException();
      }
      if (ud.stride == 1 && wd.stride == 1) {
        System.arraycopy(us, ui, ws, wi, ud.size);
      } else {
        wn = wi + wd.size * wd.stride;
        while (wi < wn) {
          ws[wi] = us[ui];
          ui += ud.stride;
          wi += wd.stride;
        }
      }
    }
  }

  public static void copy(TensorDims ud, double[] us, int ui,
                          TensorDims wd, float[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (ud.next != null) {
      if (wd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.copy(ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (wd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (float) us[ui];
        ui += ud.stride;
        wi += wd.stride;
      }
    }
  }

  public static void copy(TensorDims ud, float[] us, int ui,
                          TensorDims wd, double[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn = wi + wd.size * wd.stride;
    if (ud.next != null) {
      if (wd.next == null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        Tensor.copy(ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (wd.next != null) {
        throw new DimensionException();
      }
      while (wi < wn) {
        ws[wi] = (double) us[ui];
        ui += ud.stride;
        wi += wd.stride;
      }
    }
  }

  public static void copy(TensorDims ud, float[] us, int ui,
                          TensorDims wd, float[] ws, int wi) {
    if (ud.size != wd.size) {
      throw new DimensionException();
    }
    final int wn;
    if (ud.next != null) {
      if (wd.next == null) {
        throw new DimensionException();
      }
      wn = wi + wd.size * wd.stride;
      while (wi < wn) {
        Tensor.copy(ud.next, us, ui, wd.next, ws, wi);
        ui += ud.stride;
        wi += wd.stride;
      }
    } else {
      if (wd.next != null) {
        throw new DimensionException();
      }
      if (ud.stride == 1 && wd.stride == 1) {
        System.arraycopy(us, ui, ws, wi, ud.size);
      } else {
        wn = wi + wd.size * wd.stride;
        while (wi < wn) {
          ws[wi] = us[ui];
          ui += ud.stride;
          wi += wd.stride;
        }
      }
    }
  }

}
