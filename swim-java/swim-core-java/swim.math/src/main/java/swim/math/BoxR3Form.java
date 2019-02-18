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

final class BoxR3Form extends R3Form<BoxR3> {
  @Override
  public String tag() {
    return "box";
  }

  @Override
  public Class<?> type() {
    return BoxR3.class;
  }

  @Override
  public double getXMin(BoxR3 box) {
    return box.xMin;
  }

  @Override
  public double getYMin(BoxR3 box) {
    return box.yMin;
  }

  @Override
  public double getZMin(BoxR3 box) {
    return box.zMin;
  }

  @Override
  public double getXMax(BoxR3 box) {
    return box.xMax;
  }

  @Override
  public double getYMax(BoxR3 box) {
    return box.yMax;
  }

  @Override
  public double getZMax(BoxR3 box) {
    return box.zMax;
  }

  @Override
  public boolean contains(BoxR3 outer, BoxR3 inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(BoxR3 s, BoxR3 t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(BoxR3 box) {
    if (box != null) {
      return Record.create(1).attr(tag(), Record.create(6)
          .item(box.xMin).item(box.yMin).item(box.zMin)
          .item(box.xMax).item(box.yMax).item(box.zMax));
    } else {
      return Item.extant();
    }
  }

  @Override
  public BoxR3 cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final double xMin = header.getItem(0).doubleValue(0.0);
      final double yMin = header.getItem(1).doubleValue(0.0);
      final double zMin = header.getItem(2).doubleValue(0.0);
      final double xMax = header.getItem(3).doubleValue(0.0);
      final double yMax = header.getItem(4).doubleValue(0.0);
      final double zMax = header.getItem(5).doubleValue(0.0);
      return new BoxR3(xMin, yMin, zMin, xMax, yMax, zMax);
    } else {
      return null;
    }
  }
}
