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

import swim.annotations.Nullable;

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
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HashedInteger that) {
      return this.value == that.value;
    }
    return false;
  }

  @Override
  public int hashCode() {
    // Murmur3 finalization
    int code = this.value;
    code ^= code >>> 16;
    code *= 0x85EBCA6B;
    code ^= code >>> 13;
    code *= 0xC2B2AE35;
    code ^= code >>> 16;
    return code;
  }

  @Override
  public String toString() {
    return Integer.toString(this.value);
  }

  public static HashedInteger valueOf(int value) {
    return new HashedInteger(value);
  }

}
