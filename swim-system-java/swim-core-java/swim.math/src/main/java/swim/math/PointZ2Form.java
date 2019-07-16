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

final class PointZ2Form extends Z2Form<PointZ2> {
  @Override
  public String tag() {
    return "point";
  }

  @Override
  public PointZ2 unit() {
    return PointZ2.origin();
  }

  @Override
  public Class<?> type() {
    return PointZ2.class;
  }

  @Override
  public long getXMin(PointZ2 point) {
    return point.x;
  }

  @Override
  public long getYMin(PointZ2 point) {
    return point.y;
  }

  @Override
  public long getXMax(PointZ2 point) {
    return point.x;
  }

  @Override
  public long getYMax(PointZ2 point) {
    return point.y;
  }

  @Override
  public boolean contains(PointZ2 outer, PointZ2 inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(PointZ2 s, PointZ2 t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(PointZ2 point) {
    if (point != null) {
      return Record.create(1).attr(tag(), Record.create(2)
          .item(point.x).item(point.y));
    } else {
      return Item.absent();
    }
  }

  @Override
  public PointZ2 cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final long x = header.getItem(0).longValue(0L);
      final long y = header.getItem(1).longValue(0L);
      return new PointZ2(x, y);
    } else {
      return null;
    }
  }
}
