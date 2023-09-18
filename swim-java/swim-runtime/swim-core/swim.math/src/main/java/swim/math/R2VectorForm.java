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

import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

final class R2VectorForm extends TensorForm<R2Vector> {

  @Override
  public String tag() {
    return "vector";
  }

  @Override
  public R2Vector unit() {
    return R2Vector.zero();
  }

  @Override
  public Class<?> type() {
    return R2Vector.class;
  }

  @Override
  public Item mold(R2Vector vector) {
    if (vector != null) {
      return Record.create(1).attr(this.tag(), Record.create(2).item(vector.x).item(vector.y));
    } else {
      return Item.extant();
    }
  }

  @Override
  public R2Vector cast(Item item) {
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      final double x = header.getItem(0).doubleValue(0.0);
      final double y = header.getItem(1).doubleValue(0.0);
      return new R2Vector(x, y);
    } else {
      return null;
    }
  }

  @Override
  public R2Vector fromTensor(TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    final double x = (double) tensor[offset];
    offset += dim.stride;
    final double y = (double) tensor[offset];
    return new R2Vector(x, y);
  }

  @Override
  public R2Vector fromTensor(TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    final double x = tensor[offset];
    offset += dim.stride;
    final double y = tensor[offset];
    return new R2Vector(x, y);
  }

  public void toTensor(R2Vector vector, TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    tensor[offset] = (float) vector.x;
    offset += dim.stride;
    tensor[offset] = (float) vector.y;
  }

  public void toTensor(R2Vector vector, TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    tensor[offset] = vector.x;
    offset += dim.stride;
    tensor[offset] = vector.y;
  }

  @Override
  public Item moldTensor(TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    final Record header = Record.create(2);
    header.item(tensor[offset]);
    offset += dim.stride;
    header.item(tensor[offset]);
    return Record.create(1).attr(this.tag(), header);
  }

  @Override
  public Item moldTensor(TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    final Record header = Record.create(2);
    header.item(tensor[offset]);
    offset += dim.stride;
    header.item(tensor[offset]);
    return Record.create(1).attr(this.tag(), header);
  }

  @Override
  public void castTensor(Item item, TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      tensor[offset] = header.getItem(0).floatValue(0.0f);
      offset += dim.stride;
      tensor[offset] = header.getItem(1).floatValue(0.0f);
    }
  }

  @Override
  public void castTensor(Item item, TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      tensor[offset] = header.getItem(0).doubleValue(0.0);
      offset += dim.stride;
      tensor[offset] = header.getItem(1).doubleValue(0.0);
    }
  }

}
