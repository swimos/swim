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

final class Z3BoxForm extends Z3Form<Z3Box> {

  @Override
  public String tag() {
    return "box";
  }

  @Override
  public Class<?> type() {
    return Z3Box.class;
  }

  @Override
  public long getXMin(Z3Box box) {
    return box.xMin;
  }

  @Override
  public long getYMin(Z3Box box) {
    return box.yMin;
  }

  @Override
  public long getZMin(Z3Box box) {
    return box.zMin;
  }

  @Override
  public long getXMax(Z3Box box) {
    return box.xMax;
  }

  @Override
  public long getYMax(Z3Box box) {
    return box.yMax;
  }

  @Override
  public long getZMax(Z3Box box) {
    return box.zMax;
  }

  @Override
  public boolean contains(Z3Box outer, Z3Box inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(Z3Box s, Z3Box t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(Z3Box box) {
    if (box != null) {
      return Record.create(1).attr(this.tag(), Record.create(6).item(box.xMin).item(box.yMin).item(box.zMin)
                                                               .item(box.xMax).item(box.yMax).item(box.zMax));
    } else {
      return Item.extant();
    }
  }

  @Override
  public Z3Box cast(Item item) {
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      final long xMin = header.getItem(0).longValue(0L);
      final long yMin = header.getItem(1).longValue(0L);
      final long zMin = header.getItem(2).longValue(0L);
      final long xMax = header.getItem(3).longValue(0L);
      final long yMax = header.getItem(4).longValue(0L);
      final long zMax = header.getItem(5).longValue(0L);
      return new Z3Box(xMin, yMin, zMin, xMax, yMax, zMax);
    } else {
      return null;
    }
  }

}
