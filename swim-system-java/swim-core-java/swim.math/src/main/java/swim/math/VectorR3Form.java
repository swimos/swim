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
import swim.structure.Record;
import swim.structure.Value;

final class VectorR3Form extends TensorForm<VectorR3> {
  @Override
  public String tag() {
    return "vector";
  }

  @Override
  public VectorR3 unit() {
    return VectorR3.zero();
  }

  @Override
  public Class<?> type() {
    return VectorR3.class;
  }

  @Override
  public Item mold(VectorR3 vector) {
    if (vector != null) {
      return Record.create(1).attr(tag(), Record.create(3)
          .item(vector.x).item(vector.y).item(vector.z));
    } else {
      return Item.extant();
    }
  }

  @Override
  public VectorR3 cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final double x = header.getItem(0).doubleValue(0.0);
      final double y = header.getItem(1).doubleValue(0.0);
      final double z = header.getItem(2).doubleValue(0.0);
      return new VectorR3(x, y, z);
    } else {
      return null;
    }
  }

  @Override
  public VectorR3 fromTensor(TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    final double x = (double) tensor[offset];
    offset += dim.stride;
    final double y = (double) tensor[offset];
    offset += dim.stride;
    final double z = (double) tensor[offset];
    return new VectorR3(x, y, z);
  }

  @Override
  public VectorR3 fromTensor(TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    final double x = tensor[offset];
    offset += dim.stride;
    final double y = tensor[offset];
    offset += dim.stride;
    final double z = tensor[offset];
    return new VectorR3(x, y, z);
  }

  public void toTensor(VectorR3 vector, TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    tensor[offset] = (float) vector.x;
    offset += dim.stride;
    tensor[offset] = (float) vector.y;
    offset += dim.stride;
    tensor[offset] = (float) vector.z;
  }

  public void toTensor(VectorR3 vector, TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    tensor[offset] = vector.x;
    offset += dim.stride;
    tensor[offset] = vector.y;
    offset += dim.stride;
    tensor[offset] = vector.z;
  }

  @Override
  public Item moldTensor(TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    final Record header = Record.create(3);
    header.item(tensor[offset]);
    offset += dim.stride;
    header.item(tensor[offset]);
    offset += dim.stride;
    header.item(tensor[offset]);
    return Record.create(1).attr(tag(), header);
  }

  @Override
  public Item moldTensor(TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    final Record header = Record.create(3);
    header.item(tensor[offset]);
    offset += dim.stride;
    header.item(tensor[offset]);
    offset += dim.stride;
    header.item(tensor[offset]);
    return Record.create(1).attr(tag(), header);
  }

  @Override
  public void castTensor(Item item, TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      tensor[offset] = header.getItem(0).floatValue(0.0f);
      offset += dim.stride;
      tensor[offset] = header.getItem(1).floatValue(0.0f);
      offset += dim.stride;
      tensor[offset] = header.getItem(2).floatValue(0.0f);
    }
  }

  @Override
  public void castTensor(Item item, TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      tensor[offset] = header.getItem(0).doubleValue(0.0);
      offset += dim.stride;
      tensor[offset] = header.getItem(1).doubleValue(0.0);
      offset += dim.stride;
      tensor[offset] = header.getItem(2).doubleValue(0.0);
    }
  }
}
