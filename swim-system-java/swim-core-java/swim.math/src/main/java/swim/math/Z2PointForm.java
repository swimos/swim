// Copyright 2015-2021 Swim inc.
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

final class Z2PointForm extends Z2Form<Z2Point> {

  @Override
  public String tag() {
    return "point";
  }

  @Override
  public Z2Point unit() {
    return Z2Point.origin();
  }

  @Override
  public Class<?> type() {
    return Z2Point.class;
  }

  @Override
  public long getXMin(Z2Point point) {
    return point.x;
  }

  @Override
  public long getYMin(Z2Point point) {
    return point.y;
  }

  @Override
  public long getXMax(Z2Point point) {
    return point.x;
  }

  @Override
  public long getYMax(Z2Point point) {
    return point.y;
  }

  @Override
  public boolean contains(Z2Point outer, Z2Point inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(Z2Point s, Z2Point t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(Z2Point point) {
    if (point != null) {
      return Record.create(1).attr(this.tag(), Record.create(2).item(point.x).item(point.y));
    } else {
      return Item.absent();
    }
  }

  @Override
  public Z2Point cast(Item item) {
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      final long x = header.getItem(0).longValue(0L);
      final long y = header.getItem(1).longValue(0L);
      return new Z2Point(x, y);
    } else {
      return null;
    }
  }

}
