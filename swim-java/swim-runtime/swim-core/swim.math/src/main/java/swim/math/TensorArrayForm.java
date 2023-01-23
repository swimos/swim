// Copyright 2015-2023 Swim.inc
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

import java.lang.reflect.Array;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

public abstract class TensorArrayForm<T, V> extends TensorForm<T> {

  public TensorArrayForm() {
    // nop
  }

  public abstract TensorForm<V> next();

  public abstract T fromArray(Object... array);

  public abstract Object[] toArray(T tensor);

  protected Object[] newArray(int length) {
    return (Object[]) Array.newInstance(this.next().type(), length);
  }

  @Override
  public String tag() {
    return "tensor";
  }

  @SuppressWarnings("unchecked")
  @Override
  public Item mold(T tensor) {
    if (tensor != null) {
      final Object[] us = this.toArray(tensor);
      final Record header = Record.create(us.length);
      final TensorForm<V> next = this.next();
      for (int i = 0; i < us.length; i += 1) {
        header.item(next.mold((V) us[i]));
      }
      return Record.create(1).attr(this.tag(), header);
    } else {
      return Item.extant();
    }
  }

  @Override
  public T cast(Item item) {
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      final int n = header.length();
      final Object[] us = this.newArray(n);
      final TensorForm<V> next = this.next();
      for (int i = 0; i < n; i += 1) {
        V u = next.cast(header.getItem(i));
        if (u == null) {
          u = next.unit();
        }
        us[i] = u;
      }
      return this.fromArray(us);
    } else {
      return null;
    }
  }

  @Override
  public T fromTensor(TensorDims vd, float[] vs, int vi) {
    final Object[] us = this.newArray(vd.size);
    final TensorForm<V> next = this.next();
    for (int i = 0; i < vd.size; i += 1) {
      V u = next.fromTensor(vd.next, vs, vi);
      if (u == null) {
        u = next.unit();
      }
      us[i] = u;
      vi += vd.stride;
    }
    return this.fromArray(us);
  }

  @Override
  public T fromTensor(TensorDims vd, double[] vs, int vi) {
    final Object[] us = this.newArray(vd.size);
    final TensorForm<V> next = this.next();
    for (int i = 0; i < vd.size; i += 1) {
      V u = next.fromTensor(vd.next, vs, vi);
      if (u == null) {
        u = next.unit();
      }
      us[i] = u;
      vi += vd.stride;
    }
    return this.fromArray(us);
  }

  @SuppressWarnings("unchecked")
  @Override
  public void toTensor(T u, TensorDims vd, float[] vs, int vi) {
    final Object[] us = this.toArray(u);
    if (us.length != vd.size) {
      throw new DimensionException();
    }
    final TensorForm<V> next = this.next();
    for (int i = 0; i < vd.size; i += 1) {
      next.toTensor((V) us[i], vd.next, vs, vi);
      vi += vd.stride;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void toTensor(T u, TensorDims vd, double[] vs, int vi) {
    final Object[] us = this.toArray(u);
    if (us.length != vd.size) {
      throw new DimensionException();
    }
    final TensorForm<V> next = this.next();
    for (int i = 0; i < vd.size; i += 1) {
      next.toTensor((V) us[i], vd.next, vs, vi);
      vi += vd.stride;
    }
  }

  @Override
  public Item moldTensor(TensorDims vd, float[] vs, int vi) {
    final Record header = Record.create(vd.size);
    final TensorForm<V> next = this.next();
    for (int i = 0; i < vd.size; i += 1) {
      header.item(next.moldTensor(vd.next, vs, vi));
      vi += vd.stride;
    }
    return Record.create(1).attr(this.tag(), header);
  }

  @Override
  public Item moldTensor(TensorDims vd, double[] vs, int vi) {
    final Record header = Record.create(vd.size);
    final TensorForm<V> next = this.next();
    for (int i = 0; i < vd.size; i += 1) {
      header.item(next.moldTensor(vd.next, vs, vi));
      vi += vd.stride;
    }
    return Record.create(1).attr(this.tag(), header);
  }

  @Override
  public void castTensor(Item item, TensorDims vd, float[] vs, int vi) {
    final Value header = item.toValue().header(this.tag());
    if (!header.isDefined() || header.length() != vd.size) {
      throw new DimensionException();
    }
    final TensorForm<V> next = this.next();
    for (int i = 0; i < vd.size; i += 1) {
      next.castTensor(header.getItem(i), vd.next, vs, vi);
      vi += vd.stride;
    }
  }

  @Override
  public void castTensor(Item item, TensorDims vd, double[] vs, int vi) {
    final Value header = item.toValue().header(this.tag());
    if (!header.isDefined() || header.length() != vd.size) {
      throw new DimensionException();
    }
    final TensorForm<V> next = this.next();
    for (int i = 0; i < vd.size; i += 1) {
      next.castTensor(header.getItem(i), vd.next, vs, vi);
      vi += vd.stride;
    }
  }

  public static <V> TensorArrayForm<V[], V> create(TensorForm<V> next) {
    return new TensorArrayIdentityForm<V>(next);
  }

}
