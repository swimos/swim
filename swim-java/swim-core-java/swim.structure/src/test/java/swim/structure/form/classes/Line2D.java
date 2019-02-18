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
public class Line2D {
  public Point2D p0;
  public Point2D p1;
  public Line2D(Point2D p0, Point2D p1) {
    this.p0 = p0;
    this.p1 = p1;
  }
  public Line2D() {
    // Form.cast constructor
  }
  @Override
  public boolean equals(Object other) {
    if (other instanceof Line2D) {
      final Line2D that = (Line2D) other;
      return this.p0.equals(that.p0) && this.p1.equals(that.p1);
    }
    return false;
  }
  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(this.p0.hashCode(), this.p1.hashCode()));
  }
  @Override
  public String toString() {
    return "Line2D(" + this.p0 + ", " + this.p1 + ")";
  }
}
