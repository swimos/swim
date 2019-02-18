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
public class PrivatePerson {
  private String first;
  private String last;
  public PrivatePerson(String first, String last) {
    this.first = first;
    this.last = last;
  }
  private PrivatePerson() {
    // Form.cast constructor
  }
  @Override
  public boolean equals(Object other) {
    if (other instanceof PrivatePerson) {
      final PrivatePerson that = (PrivatePerson) other;
      return this.first.equals(that.first) && this.last.equals(that.last);
    }
    return false;
  }
  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(this.first.hashCode(), this.last.hashCode()));
  }
  @Override
  public String toString() {
    return "PrivatePerson(" + this.first + ", " + this.last + ")";
  }
}
