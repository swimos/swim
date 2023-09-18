// Copyright 2015-2023 Nstream, inc.
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

final class R3PointForm extends R3Form<R3Point> {

  @Override
  public String tag() {
    return "point";
  }

  @Override
  public R3Point unit() {
    return R3Point.origin();
  }

  @Override
  public Class<?> type() {
    return R3Point.class;
  }

  @Override
  public double getXMin(R3Point point) {
    return point.x;
  }

  @Override
  public double getYMin(R3Point point) {
    return point.y;
  }

  @Override
  public double getZMin(R3Point point) {
    return point.z;
  }

  @Override
  public double getXMax(R3Point point) {
    return point.x;
  }

  @Override
  public double getYMax(R3Point point) {
    return point.y;
  }

  @Override
  public double getZMax(R3Point point) {
    return point.z;
  }

  @Override
  public boolean contains(R3Point outer, R3Point inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(R3Point s, R3Point t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(R3Point point) {
    if (point != null) {
      return Record.create(1).attr(this.tag(), Record.create(3).item(point.x).item(point.y).item(point.z));
    } else {
      return Item.extant();
    }
  }

  @Override
  public R3Point cast(Item item) {
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      final double x = header.getItem(0).doubleValue(0.0);
      final double y = header.getItem(1).doubleValue(0.0);
      final double z = header.getItem(2).doubleValue(0.0);
      return new R3Point(x, y, z);
    } else {
      return null;
    }
  }

}
