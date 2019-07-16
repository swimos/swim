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

import java.util.Arrays;

@SuppressWarnings("checkstyle:VisibilityModifier")
public class GenericArray<T> {
  public T[] array;
  public GenericArray(T[] array) {
    this.array = array;
  }
  public GenericArray() {
    // Form.cast constructor
  }
  @Override
  public boolean equals(Object other) {
    if (other instanceof GenericArray<?>) {
      final GenericArray<?> that = (GenericArray<?>) other;
      return this.array == null ? that.array == null : Arrays.equals(this.array, that.array);
    }
    return false;
  }
  @Override
  public int hashCode() {
    return Arrays.hashCode(this.array);
  }
  @Override
  public String toString() {
    return "GenericArray(" + this.array + ")";
  }
}
