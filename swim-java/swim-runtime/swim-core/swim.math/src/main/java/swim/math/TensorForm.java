// Copyright 2015-2023 Nstream, inc.
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

import swim.structure.Form;
import swim.structure.Item;

public abstract class TensorForm<T> extends Form<T> {

  public TensorForm() {
    // nop
  }

  public abstract T fromTensor(TensorDims dims, float[] tensor, int offset);

  public abstract T fromTensor(TensorDims dims, double[] tensor, int offset);

  public abstract void toTensor(T object, TensorDims dims, float[] tensor, int offset);

  public abstract void toTensor(T object, TensorDims dims, double[] tensor, int offset);

  public Item moldTensor(TensorDims dims, float[] tensor, int offset) {
    return this.mold(this.fromTensor(dims, tensor, offset));
  }

  public Item moldTensor(TensorDims dims, double[] tensor, int offset) {
    return this.mold(this.fromTensor(dims, tensor, offset));
  }

  public void castTensor(Item item, TensorDims dims, float[] tensor, int offset) {
    this.toTensor(cast(item), dims, tensor, offset);
  }

  public void castTensor(Item item, TensorDims dims, double[] tensor, int offset) {
    this.toTensor(cast(item), dims, tensor, offset);
  }

}
