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

final class VectorRNForm extends TensorForm<VectorRN> {
  @Override
  public String tag() {
    return "vector";
  }

  @Override
  public Class<?> type() {
    return VectorRN.class;
  }

  @Override
  public Item mold(VectorRN vector) {
    if (vector != null) {
      final double[] us = vector.array;
      final int n = us.length;
      final Record header = Record.create(n);
      for (int i = 0; i < n; i += 1) {
        header.item(us[i]);
      }
      return Record.create(1).attr(tag(), header);
    } else {
      return Item.extant();
    }
  }

  @Override
  public VectorRN cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final int n = header.length();
      final double[] us = new double[n];
      for (int i = 0; i < n; i += 1) {
        us[i] = header.getItem(i).doubleValue(0.0);
      }
      return new VectorRN(us);
    } else {
      return null;
    }
  }

  @Override
  public VectorRN fromTensor(TensorDims dim, float[] tensor, int offset) {
    final int n = dim.size;
    final double[] us = new double[n];
    for (int i = 0; i < n; i += 1) {
      us[i] = (double) tensor[offset];
      offset += dim.stride;
    }
    return new VectorRN(us);
  }

  @Override
  public VectorRN fromTensor(TensorDims dim, double[] tensor, int offset) {
    final int n = dim.size;
    final double[] us = new double[n];
    if (dim.stride == 1) {
      System.arraycopy(tensor, offset, us, 0, n);
    } else {
      for (int i = 0; i < n; i += 1) {
        us[i] = tensor[offset];
        offset += dim.stride;
      }
    }
    return new VectorRN(us);
  }

  public void toTensor(VectorRN vector, TensorDims dim, float[] tensor, int offset) {
    final double[] us = vector.array;
    final int n = us.length;
    if (n != dim.size || dim.next != null) {
      throw new DimensionException();
    }
    for (int i = 0; i < n; i += 1) {
      tensor[offset] = (float) us[i];
      offset += dim.stride;
    }
  }

  public void toTensor(VectorRN vector, TensorDims dim, double[] tensor, int offset) {
    final double[] us = vector.array;
    final int n = us.length;
    if (n != dim.size || dim.next != null) {
      throw new DimensionException();
    }
    for (int i = 0; i < n; i += 1) {
      tensor[offset] = us[i];
      offset += dim.stride;
    }
  }

  @Override
  public Item moldTensor(TensorDims dim, float[] tensor, int offset) {
    final int n = dim.size;
    final Record header = Record.create(n);
    for (int i = 0; i < n; i += 1) {
      header.item(tensor[offset]);
      offset += dim.stride;
    }
    return Record.create(1).attr(tag(), header);
  }

  @Override
  public Item moldTensor(TensorDims dim, double[] tensor, int offset) {
    final int n = dim.size;
    final Record header = Record.create(n);
    for (int i = 0; i < n; i += 1) {
      header.item(tensor[offset]);
      offset += dim.stride;
    }
    return Record.create(1).attr(tag(), header);
  }

  @Override
  public void castTensor(Item item, TensorDims dim, float[] tensor, int offset) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final int n = header.length();
      if (n != dim.size || dim.next != null) {
        throw new DimensionException();
      }
      for (int i = 0; i < n; i += 1) {
        tensor[offset] = header.getItem(i).floatValue(0.0f);
        offset += dim.stride;
      }
    }
  }

  @Override
  public void castTensor(Item item, TensorDims dim, double[] tensor, int offset) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final int n = header.length();
      if (n != dim.size || dim.next != null) {
        throw new DimensionException();
      }
      for (int i = 0; i < n; i += 1) {
        tensor[offset] = header.getItem(i).doubleValue(0.0);
        offset += dim.stride;
      }
    }
  }
}
