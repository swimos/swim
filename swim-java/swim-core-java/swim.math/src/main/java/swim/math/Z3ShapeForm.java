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
import swim.structure.Value;

final class Z3ShapeForm extends Z3Form<Z3Shape> {
  @Override
  public Class<?> type() {
    return Z3Shape.class;
  }

  @Override
  public long getXMin(Z3Shape shape) {
    return shape.xMin();
  }

  @Override
  public long getYMin(Z3Shape shape) {
    return shape.yMin();
  }

  @Override
  public long getZMin(Z3Shape shape) {
    return shape.zMin();
  }

  @Override
  public long getXMax(Z3Shape shape) {
    return shape.xMax();
  }

  @Override
  public long getYMax(Z3Shape shape) {
    return shape.yMax();
  }

  @Override
  public long getZMax(Z3Shape shape) {
    return shape.zMax();
  }

  @Override
  public boolean contains(Z3Shape outer, Z3Shape inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(Z3Shape s, Z3Shape t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(Z3Shape shape) {
    if (shape != null) {
      return shape.toValue();
    } else {
      return Item.extant();
    }
  }

  @Override
  public Z3Shape cast(Item item) {
    final Value value = item.toValue();
    final String tag = value.tag();
    if ("point".equals(tag)) {
      return PointZ3.form().cast(value);
    } else if ("box".equals(tag)) {
      return BoxZ3.form().cast(value);
    }
    return null;
  }
}
