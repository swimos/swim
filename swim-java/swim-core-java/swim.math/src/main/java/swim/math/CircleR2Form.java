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

final class CircleR2Form extends R2Form<CircleR2> {
  @Override
  public String tag() {
    return "circle";
  }

  @Override
  public Class<?> type() {
    return CircleR2.class;
  }

  @Override
  public double getXMin(CircleR2 circle) {
    return circle.xMin();
  }

  @Override
  public double getYMin(CircleR2 circle) {
    return circle.yMin();
  }

  @Override
  public double getXMax(CircleR2 circle) {
    return circle.xMax();
  }

  @Override
  public double getYMax(CircleR2 circle) {
    return circle.yMax();
  }

  @Override
  public boolean contains(CircleR2 outer, CircleR2 inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(CircleR2 s, CircleR2 t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(CircleR2 circle) {
    if (circle != null) {
      return Record.create(1).attr(tag(), Record.create(3)
          .item(circle.cx).item(circle.cy).item(circle.r));
    } else {
      return Item.absent();
    }
  }

  @Override
  public CircleR2 cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final double cx = header.getItem(0).doubleValue(0.0);
      final double cy = header.getItem(1).doubleValue(0.0);
      final double r = header.getItem(2).doubleValue(0.0);
      return new CircleR2(cx, cy, r);
    } else {
      return null;
    }
  }
}
