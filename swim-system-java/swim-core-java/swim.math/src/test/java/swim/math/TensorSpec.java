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

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;

public class TensorSpec {
  @Test
  public void testMatrixMultiplRowByCol() {
    final int m = 1;
    final int n = 3;
    final int p = 1;
    final TensorDims ud = TensorDims.of(m).by(n);
    final TensorDims vd = TensorDims.of(n).by(p);
    final TensorDims wd = TensorDims.of(m).by(p);
    final Tensor u = new Tensor(ud, new double[] {1, 2, 3});
    final Tensor v = new Tensor(vd, new double[] {4, 5, 6});
    final MutableTensor w = MutableTensor.zero(wd, Precision.f64());
    Tensor.multiplyMatrix(u.dims, u.array, 0, false,
                          v.dims, v.array, 0, false,
                          w.dims, w.array, 0, false);
    assertEquals(w, new Tensor(wd, new double[] {32}));
  }

  @Test
  public void testMatrixMultiplColByRow() {
    final int m = 3;
    final int n = 1;
    final int p = 3;
    final TensorDims ud = TensorDims.of(m).by(n);
    final TensorDims vd = TensorDims.of(n).by(p);
    final TensorDims wd = TensorDims.of(m).by(p);
    final Tensor u = new Tensor(ud, new double[] {1, 2, 3});
    final Tensor v = new Tensor(vd, new double[] {4, 5, 6});
    final MutableTensor w = MutableTensor.zero(wd, Precision.f64());
    Tensor.multiplyMatrix(u.dims, u.array, 0, false,
                          v.dims, v.array, 0, false,
                          w.dims, w.array, 0, false);
    assertEquals(w, new Tensor(wd, new double[] {4, 10, 18, 4, 10, 18, 4, 10, 18}));
  }
}
