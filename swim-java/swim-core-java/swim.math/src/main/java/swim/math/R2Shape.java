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

import swim.structure.Kind;

public abstract class R2Shape implements Shape {
  public abstract double xMin();

  public abstract double yMin();

  public abstract double xMax();

  public abstract double yMax();

  @Override
  public boolean contains(Shape shape) {
    if (shape instanceof R2Shape) {
      return contains((R2Shape) shape);
    } else {
      return false;
    }
  }

  @Override
  public boolean intersects(Shape shape) {
    if (shape instanceof R2Shape) {
      return intersects((R2Shape) shape);
    } else {
      return false;
    }
  }

  public abstract boolean contains(R2Shape shape);

  public abstract boolean intersects(R2Shape shape);

  public abstract Z2Shape transform(R2ToZ2Function f);

  private static R2Form<R2Shape> shapeForm;

  @Kind
  public static R2Form<R2Shape> shapeForm() {
    if (shapeForm == null) {
      shapeForm = new R2ShapeForm();
    }
    return shapeForm;
  }
}
