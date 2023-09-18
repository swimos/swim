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

public abstract class Z2Shape implements Shape {

  public Z2Shape() {
    // nop
  }

  public abstract long xMin();

  public abstract long yMin();

  public abstract long xMax();

  public abstract long yMax();

  @Override
  public boolean contains(Shape shape) {
    if (shape instanceof Z2Shape) {
      return this.contains((Z2Shape) shape);
    } else {
      return false;
    }
  }

  @Override
  public boolean intersects(Shape shape) {
    if (shape instanceof Z2Shape) {
      return this.intersects((Z2Shape) shape);
    } else {
      return false;
    }
  }

  public abstract boolean contains(Z2Shape shape);

  public abstract boolean intersects(Z2Shape shape);

  public abstract R2Shape transform(Z2ToR2Function f);

  private static Z2Form<Z2Shape> shapeForm;

  public static Z2Form<Z2Shape> shapeForm() {
    if (Z2Shape.shapeForm == null) {
      Z2Shape.shapeForm = new Z2ShapeForm();
    }
    return Z2Shape.shapeForm;
  }

}
