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

final class R3SphereForm extends R3Form<R3Sphere> {

  @Override
  public String tag() {
    return "sphere";
  }

  @Override
  public Class<?> type() {
    return R3Sphere.class;
  }

  @Override
  public double getXMin(R3Sphere sphere) {
    return sphere.xMin();
  }

  @Override
  public double getYMin(R3Sphere sphere) {
    return sphere.yMin();
  }

  @Override
  public double getZMin(R3Sphere sphere) {
    return sphere.zMin();
  }

  @Override
  public double getXMax(R3Sphere sphere) {
    return sphere.xMax();
  }

  @Override
  public double getYMax(R3Sphere sphere) {
    return sphere.yMax();
  }

  @Override
  public double getZMax(R3Sphere sphere) {
    return sphere.zMax();
  }

  @Override
  public boolean contains(R3Sphere outer, R3Sphere inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(R3Sphere s, R3Sphere t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(R3Sphere sphere) {
    if (sphere != null) {
      return Record.create(1).attr(this.tag(), Record.create(4).item(sphere.cx).item(sphere.cy)
                                                               .item(sphere.cz).item(sphere.r));
    } else {
      return Item.extant();
    }
  }

  @Override
  public R3Sphere cast(Item item) {
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      final double cx = header.getItem(0).doubleValue(0.0);
      final double cy = header.getItem(1).doubleValue(0.0);
      final double cz = header.getItem(2).doubleValue(0.0);
      final double r = header.getItem(3).doubleValue(0.0);
      return new R3Sphere(cx, cy, cz, r);
    } else {
      return null;
    }
  }

}
