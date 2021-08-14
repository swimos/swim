// Copyright 2015-2021 Swim inc.
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
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class RNVector implements Debug {

  final double[] array;

  public RNVector(double... array) {
    this.array = array;
  }

  public final int dimension() {
    return this.array.length;
  }

  public final double get(int i) {
    return this.array[i];
  }

  public final RNVector plus(RNVector that) {
    final double[] us = this.array;
    final double[] vs = that.array;
    final int n = us.length;
    if (n != vs.length) {
      throw new DimensionException();
    }
    final double[] ws = new double[n];
    for (int i = 0; i < n; i += 1) {
      ws[i] = us[i] + vs[i];
    }
    return new RNVector(ws);
  }

  public final RNVector opposite() {
    final double[] us = this.array;
    final int n = us.length;
    final double[] ws = new double[n];
    for (int i = 0; i < n; i += 1) {
      ws[i] = -us[i];
    }
    return new RNVector(ws);
  }

  public final RNVector minus(RNVector that) {
    final double[] us = this.array;
    final double[] vs = that.array;
    final int n = us.length;
    if (n != vs.length) {
      throw new DimensionException();
    }
    final double[] ws = new double[n];
    for (int i = 0; i < n; i += 1) {
      ws[i] = us[i] - vs[i];
    }
    return new RNVector(ws);
  }

  public final RNVector times(double scalar) {
    final double[] us = this.array;
    final int n = us.length;
    final double[] ws = new double[n];
    for (int i = 0; i < n; i += 1) {
      ws[i] = us[i] * scalar;
    }
    return new RNVector(ws);
  }

  public Value toValue() {
    final double[] us = this.array;
    final int n = us.length;
    final Record header = Record.create(n);
    for (int i = 0; i < n; i += 1) {
      header.item(us[i]);
    }
    return Record.create(1).attr("vector", header);
  }

  protected boolean canEqual(RNVector that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof RNVector) {
      final RNVector that = (RNVector) other;
      if (that.canEqual(this)) {
        final double[] us = this.array;
        final double[] vs = that.array;
        final int n = us.length;
        if (n == vs.length) {
          for (int i = 0; i < n; i += 1) {
            if (us[i] != vs[i]) {
              return false;
            }
          }
          return true;
        }
      }
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (RNVector.hashSeed == 0) {
      RNVector.hashSeed = Murmur3.seed(RNVector.class);
    }
    int code = RNVector.hashSeed;
    final double[] us = this.array;
    final int n = us.length;
    for (int i = 0; i < n; i += 1) {
      code = Murmur3.mix(code, Murmur3.hash(us[i]));
    }
    return Murmur3.mash(code);
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("RNVector").write('.').write("create").write('(');
    final double[] us = this.array;
    final int n = us.length;
    if (n > 0) {
      output = output.debug(us[0]);
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(us[i]);
      }
    }
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static RNVector of(double... array) {
    return new RNVector(array);
  }

  private static TensorForm<RNVector> form;

  @Kind
  public static TensorForm<RNVector> form() {
    if (RNVector.form == null) {
      RNVector.form = new RNVectorForm();
    }
    return RNVector.form;
  }

}
