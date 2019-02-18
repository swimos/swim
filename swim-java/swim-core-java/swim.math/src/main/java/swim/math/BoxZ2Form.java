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

final class BoxZ2Form extends Z2Form<BoxZ2> {
  @Override
  public String tag() {
    return "box";
  }

  @Override
  public Class<?> type() {
    return BoxZ2.class;
  }

  @Override
  public long getXMin(BoxZ2 box) {
    return box.xMin;
  }

  @Override
  public long getYMin(BoxZ2 box) {
    return box.yMin;
  }

  @Override
  public long getXMax(BoxZ2 box) {
    return box.xMax;
  }

  @Override
  public long getYMax(BoxZ2 box) {
    return box.yMax;
  }

  @Override
  public boolean contains(BoxZ2 outer, BoxZ2 inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(BoxZ2 s, BoxZ2 t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(BoxZ2 box) {
    if (box != null) {
      return Record.create(1).attr(tag(), Record.create(4)
          .item(box.xMin).item(box.yMin)
          .item(box.xMax).item(box.yMax));
    } else {
      return Item.extant();
    }
  }

  @Override
  public BoxZ2 cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final long xMin = header.getItem(0).longValue(0L);
      final long yMin = header.getItem(1).longValue(0L);
      final long xMax = header.getItem(2).longValue(0L);
      final long yMax = header.getItem(3).longValue(0L);
      return new BoxZ2(xMin, yMin, xMax, yMax);
    } else {
      return null;
    }
  }
}
