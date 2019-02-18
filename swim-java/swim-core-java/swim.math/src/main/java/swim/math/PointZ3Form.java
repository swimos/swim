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

final class PointZ3Form extends Z3Form<PointZ3> {
  @Override
  public String tag() {
    return "point";
  }

  @Override
  public PointZ3 unit() {
    return PointZ3.origin();
  }

  @Override
  public Class<?> type() {
    return PointZ3.class;
  }

  @Override
  public long getXMin(PointZ3 point) {
    return point.x;
  }

  @Override
  public long getYMin(PointZ3 point) {
    return point.y;
  }

  @Override
  public long getZMin(PointZ3 point) {
    return point.z;
  }

  @Override
  public long getXMax(PointZ3 point) {
    return point.x;
  }

  @Override
  public long getYMax(PointZ3 point) {
    return point.y;
  }

  @Override
  public long getZMax(PointZ3 point) {
    return point.z;
  }

  @Override
  public boolean contains(PointZ3 outer, PointZ3 inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(PointZ3 s, PointZ3 t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(PointZ3 point) {
    if (point != null) {
      return Record.create(1).attr(tag(), Record.create(3)
          .item(point.x).item(point.y).item(point.z));
    } else {
      return Item.extant();
    }
  }

  @Override
  public PointZ3 cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final long x = header.getItem(0).longValue(0L);
      final long y = header.getItem(1).longValue(0L);
      final long z = header.getItem(2).longValue(0L);
      return new PointZ3(x, y, z);
    } else {
      return null;
    }
  }
}
