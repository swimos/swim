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

package swim.structure.form.classes;

import swim.util.Murmur3;

@SuppressWarnings("checkstyle:VisibilityModifier")
public class Point2D {
  public double x;
  public double y;
  public Point2D(double x, double y) {
    this.x = x;
    this.y = y;
  }
  public Point2D() {
    // Form.cast constructor
  }
  @Override
  public boolean equals(Object other) {
    if (other instanceof Point2D) {
      final Point2D that = (Point2D) other;
      return this.x == that.x && this.y == that.y;
    }
    return false;
  }
  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.hash(this.x), Murmur3.hash(this.y)));
  }
  @Override
  public String toString() {
    return "Point2D(" + this.x + ", " + this.y + ")";
  }
}
