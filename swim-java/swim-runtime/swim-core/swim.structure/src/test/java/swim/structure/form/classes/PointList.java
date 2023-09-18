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

package swim.structure.form.classes;

import java.util.List;
import swim.util.Murmur3;

@SuppressWarnings("checkstyle:VisibilityModifier")
public class PointList {

  public List<Point2D> list;

  public PointList(List<Point2D> list) {
    this.list = list;
  }

  public PointList() {
    // Form.cast constructor
  }

  @Override
  public boolean equals(Object other) {
    if (other instanceof PointList) {
      final PointList that = (PointList) other;
      return this.list == null ? that.list == null : this.list.equals(that.list);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.hash(this.list);
  }

  @Override
  public String toString() {
    return "PointList(" + this.list + ")";
  }

}
