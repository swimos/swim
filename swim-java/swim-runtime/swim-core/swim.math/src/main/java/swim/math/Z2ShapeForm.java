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
import swim.structure.Value;

final class Z2ShapeForm extends Z2Form<Z2Shape> {

  @Override
  public Class<?> type() {
    return Z2Shape.class;
  }

  @Override
  public long getXMin(Z2Shape shape) {
    return shape.xMin();
  }

  @Override
  public long getYMin(Z2Shape shape) {
    return shape.yMin();
  }

  @Override
  public long getXMax(Z2Shape shape) {
    return shape.xMax();
  }

  @Override
  public long getYMax(Z2Shape shape) {
    return shape.yMax();
  }

  @Override
  public boolean contains(Z2Shape outer, Z2Shape inner) {
    return outer.contains(inner);
  }

  @Override
  public boolean intersects(Z2Shape s, Z2Shape t) {
    return s.intersects(t);
  }

  @Override
  public Item mold(Z2Shape shape) {
    if (shape != null) {
      return shape.toValue();
    } else {
      return Item.extant();
    }
  }

  @Override
  public Z2Shape cast(Item item) {
    final Value value = item.toValue();
    final String tag = value.tag();
    if ("point".equals(tag)) {
      return Z2Point.form().cast(value);
    } else if ("box".equals(tag)) {
      return Z2Box.form().cast(value);
    }
    return null;
  }

}
