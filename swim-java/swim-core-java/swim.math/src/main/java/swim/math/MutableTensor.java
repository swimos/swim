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

import swim.codec.Output;

public class MutableTensor extends Tensor {
  protected MutableTensor(TensorDims dims, Object array, int offset) {
    super(dims, array, offset);
  }

  public MutableTensor(TensorDims dims, double[] array, int offset) {
    super(dims, array, offset);
  }

  public MutableTensor(TensorDims dims, float[] array, int offset) {
    super(dims, array, offset);
  }

  public MutableTensor(TensorDims dims, double... array) {
    super(dims, array);
  }

  public MutableTensor(TensorDims dims, float... array) {
    super(dims, array);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MutableTensor").write('.').write("of").write('(')
        .debug(this.dims).write(", ").debug(this.offset);
    final Object us = this.array;
    if (us instanceof double[]) {
      Tensor.debug(output, (double[]) us);
    } else if (us instanceof float[]) {
      Tensor.debug(output, (float[]) us);
    } else {
      throw new AssertionError();
    }
    output = output.write(')');
  }

  public static MutableTensor zero(TensorDims dims, Precision prec) {
    if (prec.isDouble()) {
      return new MutableTensor(dims, new double[dims.size * dims.stride]);
    } else if (prec.isSingle()) {
      return new MutableTensor(dims, new float[dims.size * dims.stride]);
    } else {
      throw new AssertionError();
    }
  }

  public static MutableTensor zero(TensorDims dims) {
    return zero(dims, Precision.f32());
  }

  public static MutableTensor of(TensorDims dims, int offset, double... array) {
    return new MutableTensor(dims, array, offset);
  }

  public static MutableTensor of(TensorDims dims, int offset, float... array) {
    return new MutableTensor(dims, array, offset);
  }
}
