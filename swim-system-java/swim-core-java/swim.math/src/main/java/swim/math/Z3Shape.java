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

public abstract class Z3Shape implements Shape {
  public abstract long xMin();

  public abstract long yMin();

  public abstract long zMin();

  public abstract long xMax();

  public abstract long yMax();

  public abstract long zMax();

  @Override
  public boolean contains(Shape shape) {
    if (shape instanceof Z3Shape) {
      return contains((Z3Shape) shape);
    } else {
      return false;
    }
  }

  @Override
  public boolean intersects(Shape shape) {
    if (shape instanceof Z3Shape) {
      return intersects((Z3Shape) shape);
    } else {
      return false;
    }
  }

  public abstract boolean contains(Z3Shape shape);

  public abstract boolean intersects(Z3Shape shape);

  public abstract R3Shape transform(Z3ToR3Function f);

  private static Z3Form<Z3Shape> shapeForm;

  @Kind
  public static Z3Form<Z3Shape> shapeForm() {
    if (shapeForm == null) {
      shapeForm = new Z3ShapeForm();
    }
    return shapeForm;
  }
}
