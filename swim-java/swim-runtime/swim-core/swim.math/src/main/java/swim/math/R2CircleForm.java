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

final class R2CircleForm extends R2Form<R2Circle> {

  @Override
  public String tag() {
    return "circle";
  }

  @Override
  public Class<?> type() {
    return R2Circle.class;
  }

  @Override
  public double getXMin(R2Circle circle) {
    return circle.xMin();
  }

  @Override
  public double getYMin(R2Circle circle) {
    return circle.yMin();
  }

  @Override
  public double getXMax(R2Circle circle) {
    return circle.xMax();
  }

  @Override
  public double getYMax(R2Circle circle) {
    return circle.yMax();
  }

  @Override
  public boolean contains(R2Circle outer, R2Circle inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(R2Circle s, R2Circle t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(R2Circle circle) {
    if (circle != null) {
      return Record.create(1).attr(this.tag(), Record.create(3).item(circle.cx).item(circle.cy).item(circle.r));
    } else {
      return Item.absent();
    }
  }

  @Override
  public R2Circle cast(Item item) {
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      final double cx = header.getItem(0).doubleValue(0.0);
      final double cy = header.getItem(1).doubleValue(0.0);
      final double r = header.getItem(2).doubleValue(0.0);
      return new R2Circle(cx, cy, r);
    } else {
      return null;
    }
  }

}
