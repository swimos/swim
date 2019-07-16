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

import swim.structure.Item;

final class TensorObjectForm extends TensorForm<Tensor> {
  final TensorDims dims;
  final Precision prec;

  TensorObjectForm(TensorDims dims, Precision prec) {
    this.dims = dims;
    this.prec = prec;
  }

  @Override
  public String tag() {
    return "tensor";
  }

  @Override
  public Tensor unit() {
    return Tensor.zero(this.dims);
  }

  @Override
  public Class<?> type() {
    return Tensor.class;
  }

  @Override
  public Item mold(Tensor tensor) {
    if (tensor != null) {
      return Tensor.mold(tag(), tensor);
    } else {
      return Item.extant();
    }
  }

  @Override
  public Tensor cast(Item item) {
    return Tensor.cast(tag(), item.toValue(), this.dims, this.prec);
  }

  @Override
  public Tensor fromTensor(TensorDims ud, float[] us, int ui) {
    if (this.prec.isDouble()) {
      final double[] ws = new double[this.dims.size * this.dims.stride];
      Tensor.copy(ud, us, ui, dims, ws, 0);
      return new Tensor(this.dims, us);
    } else if (this.prec.isSingle()) {
      final float[] ws = new float[this.dims.size * this.dims.stride];
      Tensor.copy(ud, us, ui, dims, ws, 0);
      return new Tensor(this.dims, us);
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Tensor fromTensor(TensorDims ud, double[] us, int ui) {
    if (this.prec.isDouble()) {
      final double[] ws = new double[this.dims.size * this.dims.stride];
      Tensor.copy(ud, us, ui, this.dims, ws, 0);
      return new Tensor(this.dims, us);
    } else if (this.prec.isSingle()) {
      final float[] ws = new float[this.dims.size * this.dims.stride];
      Tensor.copy(ud, us, ui, this.dims, ws, 0);
      return new Tensor(this.dims, us);
    } else {
      throw new AssertionError();
    }
  }

  public void toTensor(Tensor u, TensorDims wd, float[] ws, int wi) {
    final Object us = u.array;
    if (us instanceof double[]) {
      Tensor.copy(u.dims, (double[]) us, 0, wd, ws, wi);
    } else if (us instanceof float[]) {
      Tensor.copy(u.dims, (float[]) us, 0, wd, ws, wi);
    } else {
      throw new AssertionError();
    }
  }

  public void toTensor(Tensor u, TensorDims wd, double[] ws, int wi) {
    final Object us = u.array;
    if (us instanceof double[]) {
      Tensor.copy(u.dims, (double[]) us, 0, wd, ws, wi);
    } else if (us instanceof float[]) {
      Tensor.copy(u.dims, (float[]) us, 0, wd, ws, wi);
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Item moldTensor(TensorDims ud, float[] us, int ui) {
    return Tensor.mold(tag(), ud, us, ui);
  }

  @Override
  public Item moldTensor(TensorDims ud, double[] us, int ui) {
    return Tensor.mold(tag(), ud, us, ui);
  }

  @Override
  public void castTensor(Item item, TensorDims wd, float[] ws, int wi) {
    Tensor.cast(tag(), item.toValue(), wd, ws, wi);
  }

  @Override
  public void castTensor(Item item, TensorDims wd, double[] ws, int wi) {
    Tensor.cast(tag(), item.toValue(), wd, ws, wi);
  }
}
