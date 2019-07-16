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

final class SphereR3Form extends R3Form<SphereR3> {
  @Override
  public String tag() {
    return "sphere";
  }

  @Override
  public Class<?> type() {
    return SphereR3.class;
  }

  @Override
  public double getXMin(SphereR3 sphere) {
    return sphere.xMin();
  }

  @Override
  public double getYMin(SphereR3 sphere) {
    return sphere.yMin();
  }

  @Override
  public double getZMin(SphereR3 sphere) {
    return sphere.zMin();
  }

  @Override
  public double getXMax(SphereR3 sphere) {
    return sphere.xMax();
  }

  @Override
  public double getYMax(SphereR3 sphere) {
    return sphere.yMax();
  }

  @Override
  public double getZMax(SphereR3 sphere) {
    return sphere.zMax();
  }

  @Override
  public boolean contains(SphereR3 outer, SphereR3 inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(SphereR3 s, SphereR3 t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(SphereR3 sphere) {
    if (sphere != null) {
      return Record.create(1).attr(tag(), Record.create(4)
          .item(sphere.cx).item(sphere.cy).item(sphere.cz).item(sphere.r));
    } else {
      return Item.extant();
    }
  }

  @Override
  public SphereR3 cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final double cx = header.getItem(0).doubleValue(0.0);
      final double cy = header.getItem(1).doubleValue(0.0);
      final double cz = header.getItem(2).doubleValue(0.0);
      final double r = header.getItem(3).doubleValue(0.0);
      return new SphereR3(cx, cy, cz, r);
    } else {
      return null;
    }
  }
}
