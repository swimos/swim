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

final class PointR2Form extends R2Form<PointR2> {
  @Override
  public String tag() {
    return "point";
  }

  @Override
  public PointR2 unit() {
    return PointR2.origin();
  }

  @Override
  public Class<?> type() {
    return PointR2.class;
  }

  @Override
  public double getXMin(PointR2 point) {
    return point.x;
  }

  @Override
  public double getYMin(PointR2 point) {
    return point.y;
  }

  @Override
  public double getXMax(PointR2 point) {
    return point.x;
  }

  @Override
  public double getYMax(PointR2 point) {
    return point.y;
  }

  @Override
  public boolean contains(PointR2 outer, PointR2 inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(PointR2 s, PointR2 t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(PointR2 point) {
    if (point != null) {
      return Record.create(1).attr(tag(), Record.create(2)
          .item(point.x).item(point.y));
    } else {
      return Item.extant();
    }
  }

  @Override
  public PointR2 cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final double x = header.getItem(0).doubleValue(0.0);
      final double y = header.getItem(1).doubleValue(0.0);
      return new PointR2(x, y);
    } else {
      return null;
    }
  }
}
