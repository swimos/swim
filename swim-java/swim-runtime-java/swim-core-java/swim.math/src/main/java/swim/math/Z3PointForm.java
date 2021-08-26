// Copyright 2015-2021 Swim Inc.
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

final class Z3PointForm extends Z3Form<Z3Point> {

  @Override
  public String tag() {
    return "point";
  }

  @Override
  public Z3Point unit() {
    return Z3Point.origin();
  }

  @Override
  public Class<?> type() {
    return Z3Point.class;
  }

  @Override
  public long getXMin(Z3Point point) {
    return point.x;
  }

  @Override
  public long getYMin(Z3Point point) {
    return point.y;
  }

  @Override
  public long getZMin(Z3Point point) {
    return point.z;
  }

  @Override
  public long getXMax(Z3Point point) {
    return point.x;
  }

  @Override
  public long getYMax(Z3Point point) {
    return point.y;
  }

  @Override
  public long getZMax(Z3Point point) {
    return point.z;
  }

  @Override
  public boolean contains(Z3Point outer, Z3Point inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(Z3Point s, Z3Point t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(Z3Point point) {
    if (point != null) {
      return Record.create(1).attr(this.tag(), Record.create(3).item(point.x).item(point.y).item(point.z));
    } else {
      return Item.extant();
    }
  }

  @Override
  public Z3Point cast(Item item) {
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      final long x = header.getItem(0).longValue(0L);
      final long y = header.getItem(1).longValue(0L);
      final long z = header.getItem(2).longValue(0L);
      return new Z3Point(x, y, z);
    } else {
      return null;
    }
  }

}
