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

final class R3ShapeForm extends R3Form<R3Shape> {
  @Override
  public Class<?> type() {
    return R3Shape.class;
  }

  @Override
  public double getXMin(R3Shape shape) {
    return shape.xMin();
  }

  @Override
  public double getYMin(R3Shape shape) {
    return shape.yMin();
  }

  @Override
  public double getZMin(R3Shape shape) {
    return shape.zMin();
  }

  @Override
  public double getXMax(R3Shape shape) {
    return shape.xMax();
  }

  @Override
  public double getYMax(R3Shape shape) {
    return shape.yMax();
  }

  @Override
  public double getZMax(R3Shape shape) {
    return shape.zMax();
  }

  @Override
  public boolean contains(R3Shape outer, R3Shape inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(R3Shape s, R3Shape t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(R3Shape shape) {
    if (shape != null) {
      return shape.toValue();
    } else {
      return Item.extant();
    }
  }

  @Override
  public R3Shape cast(Item item) {
    final Value value = item.toValue();
    final String tag = value.tag();
    if ("point".equals(tag)) {
      return PointR3.form().cast(value);
    } else if ("box".equals(tag)) {
      return BoxR3.form().cast(value);
    } else if ("sphere".equals(tag)) {
      return SphereR3.form().cast(value);
    }
    return null;
  }
}
