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

final class VectorZ3Form extends TensorForm<VectorZ3> {
  @Override
  public String tag() {
    return "vector";
  }

  @Override
  public VectorZ3 unit() {
    return VectorZ3.zero();
  }

  @Override
  public Class<?> type() {
    return VectorZ3.class;
  }

  @Override
  public Item mold(VectorZ3 vector) {
    if (vector != null) {
      return Record.create(1).attr(tag(), Record.create(3)
          .item(vector.x).item(vector.y).item(vector.z));
    } else {
      return Item.extant();
    }
  }

  @Override
  public VectorZ3 cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final long x = header.getItem(0).longValue(0L);
      final long y = header.getItem(1).longValue(0L);
      final long z = header.getItem(2).longValue(0L);
      return new VectorZ3(x, y, z);
    } else {
      return null;
    }
  }

  @Override
  public VectorZ3 fromTensor(TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    final long x = (long) Math.round(tensor[offset]);
    offset += dim.stride;
    final long y = (long) Math.round(tensor[offset]);
    offset += dim.stride;
    final long z = (long) Math.round(tensor[offset]);
    return new VectorZ3(x, y, z);
  }

  @Override
  public VectorZ3 fromTensor(TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    final long x = Math.round(tensor[offset]);
    offset += dim.stride;
    final long y = Math.round(tensor[offset]);
    offset += dim.stride;
    final long z = Math.round(tensor[offset]);
    return new VectorZ3(x, y, z);
  }

  public void toTensor(VectorZ3 vector, TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    tensor[offset] = (float) vector.x;
    offset += dim.stride;
    tensor[offset] = (float) vector.y;
    offset += dim.stride;
    tensor[offset] = (float) vector.z;
  }

  public void toTensor(VectorZ3 vector, TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    tensor[offset] = (double) vector.x;
    offset += dim.stride;
    tensor[offset] = (double) vector.y;
    offset += dim.stride;
    tensor[offset] = (double) vector.z;
  }

  @Override
  public Item moldTensor(TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    final Record header = Record.create(3);
    header.item(Math.round(tensor[offset]));
    offset += dim.stride;
    header.item(Math.round(tensor[offset]));
    offset += dim.stride;
    header.item(Math.round(tensor[offset]));
    return Record.create(1).attr(tag(), header);
  }

  @Override
  public Item moldTensor(TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 3 || dim.next != null) {
      throw new DimensionException();
    }
    final Record header = Record.create(3);
    header.item(Math.round(tensor[offset]));
    offset += dim.stride;
    header.item(Math.round(tensor[offset]));
    offset += dim.stride;
    header.item(Math.round(tensor[offset]));
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
