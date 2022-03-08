// Copyright 2015-2022 Swim.inc
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

final class R2PointForm extends R2Form<R2Point> {

  @Override
  public String tag() {
    return "point";
  }

  @Override
  public R2Point unit() {
    return R2Point.origin();
  }

  @Override
  public Class<?> type() {
    return R2Point.class;
  }

  @Override
  public double getXMin(R2Point point) {
    return point.x;
  }

  @Override
  public double getYMin(R2Point point) {
    return point.y;
  }

  @Override
  public double getXMax(R2Point point) {
    return point.x;
  }

  @Override
  public double getYMax(R2Point point) {
    return point.y;
  }

  @Override
  public boolean contains(R2Point outer, R2Point inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(R2Point s, R2Point t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(R2Point point) {
    if (point != null) {
      return Record.create(1).attr(this.tag(), Record.create(2).item(point.x).item(point.y));
    } else {
      return Item.extant();
    }
  }

  @Override
  public R2Point cast(Item item) {
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      final double x = header.getItem(0).doubleValue(0.0);
      final double y = header.getItem(1).doubleValue(0.0);
      return new R2Point(x, y);
    } else {
      return null;
    }
  }

}
