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

public abstract class Distribution {
  public abstract double density(double x);

  public abstract double sample();

  public MutableTensor sample(TensorDims dims, Precision prec) {
    if (prec.isDouble()) {
      final double[] us = new double[dims.size * dims.stride];
      sample(dims, us, 0);
      return new MutableTensor(dims, us);
    } else if (prec.isSingle()) {
      final float[] us = new float[dims.size * dims.stride];
      sample(dims, us, 0);
      return new MutableTensor(dims, us);
    } else {
      throw new IllegalArgumentException(prec.toString());
    }
  }

  void sample(TensorDims ud, double[] us, int ui) {
    final int un = ui + ud.size * ud.stride;
    if (ud.next != null) {
      while (ui < un) {
        sample(ud.next, us, ui);
        ui += ud.stride;
      }
    } else {
      while (ui < un) {
        us[ui] = sample();
        ui += ud.stride;
      }
    }
  }

  void sample(TensorDims ud, float[] us, int ui) {
    final int un = ui + ud.size * ud.stride;
    if (ud.next != null) {
      while (ui < un) {
        sample(ud.next, us, ui);
        ui += ud.stride;
      }
    } else {
      while (ui < un) {
        us[ui] = (float) sample();
        ui += ud.stride;
      }
    }
  }

  public static Distribution sigmoidUniform(Random random, double fanIn, double fanOut) {
    final double r = 4.0 * Math.sqrt(6.0 / (fanIn + fanOut));
    return new UniformDistribution(-r, r);
  }

  public static Distribution sigmoidUniform(double fanIn, double fanOut) {
    return sigmoidUniform(Random.get(), fanIn, fanOut);
  }

  public static Distribution reluUniform(Random random, double fanIn, double fanOut) {
    final double u = Math.sqrt(6.0 / fanIn);
    return new UniformDistribution(-u, u);
  }

  public static Distribution reluUniform(double fanIn, double fanOut) {
    return reluUniform(Random.get(), fanIn, fanOut);
  }
}
