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

final class VectorZ2Form extends TensorForm<VectorZ2> {
  @Override
  public String tag() {
    return "vector";
  }

  @Override
  public VectorZ2 unit() {
    return VectorZ2.zero();
  }

  @Override
  public Class<?> type() {
    return VectorZ2.class;
  }

  @Override
  public Item mold(VectorZ2 vector) {
    if (vector != null) {
      return Record.create(1).attr(tag(), Record.create(2)
          .item(vector.x).item(vector.y));
    } else {
      return Item.extant();
    }
  }

  @Override
  public VectorZ2 cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final long x = header.getItem(0).longValue(0L);
      final long y = header.getItem(1).longValue(0L);
      return new VectorZ2(x, y);
    } else {
      return null;
    }
  }

  @Override
  public VectorZ2 fromTensor(TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    final long x = (long) Math.round(tensor[offset]);
    offset += dim.stride;
    final long y = (long) Math.round(tensor[offset]);
    return new VectorZ2(x, y);
  }

  @Override
  public VectorZ2 fromTensor(TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    final long x = Math.round(tensor[offset]);
    offset += dim.stride;
    final long y = Math.round(tensor[offset]);
    return new VectorZ2(x, y);
  }

  public void toTensor(VectorZ2 vector, TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    tensor[offset] = (float) vector.x;
    offset += dim.stride;
    tensor[offset] = (float) vector.y;
  }

  public void toTensor(VectorZ2 vector, TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    tensor[offset] = (double) vector.x;
    offset += dim.stride;
    tensor[offset] = (double) vector.y;
  }

  @Override
  public Value moldTensor(TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    final Record header = Record.create(2);
    header.item(Math.round(tensor[offset]));
    offset += dim.stride;
    header.item(Math.round(tensor[offset]));
    return Record.create(1).attr(tag(), header);
  }

  @Override
  public Value moldTensor(TensorDims dim, double[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    final Record header = Record.create(2);
    header.item(Math.round(tensor[offset]));
    offset += dim.stride;
    header.item(Math.round(tensor[offset]));
    return Record.create(1).attr(tag(), header);
  }

  @Override
  public void castTensor(Item item, TensorDims dim, float[] tensor, int offset) {
    if (dim.size != 2 || dim.next != null) {
      throw new DimensionException();
    }
    final Value header = item.toValue().header(tag());
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
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      tensor[offset] = header.getItem(0).doubleValue(0.0);
      offset += dim.stride;
      tensor[offset] = header.getItem(1).doubleValue(0.0);
    }
  }
}
