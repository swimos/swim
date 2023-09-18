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

package swim.collections;

import swim.util.Murmur3;

public final class HashedInteger {

  private final int value;

  public HashedInteger(int value) {
    this.value = value;
  }

  public int intValue() {
    return this.value;
  }

  public long longValue() {
    return (long) this.value;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HashedInteger) {
      final HashedInteger that = (HashedInteger) other;
      return this.value == that.value;
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.mash(this.value);
  }

  @Override
  public String toString() {
    return Integer.toString(this.value);
  }

  public static HashedInteger valueOf(int value) {
    return new HashedInteger(value);
  }

}
