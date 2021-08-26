// Copyright 2015-2021 Swim Inc.
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
public class HeadTail<T> {

  public final T head;
  public final HeadTail<T> tail;

  public HeadTail(T head, HeadTail<T> tail) {
    this.head = head;
    this.tail = tail;
  }

  HeadTail() {
    // Form.cast constructor
    this.head = null;
    this.tail = null;
  }

  @Override
  public boolean equals(Object other) {
    if (other instanceof HeadTail<?>) {
      final HeadTail<?> that = (HeadTail<?>) other;
      return (this.head == null ? that.head == null : this.head.equals(that.head))
          && (this.tail == null ? that.tail == null : this.tail.equals(that.tail));
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.hash(this.head), Murmur3.hash(this.tail)));
  }

  @Override
  public String toString() {
    return "HeadTail(" + this.head + ", " + this.tail + ")";
  }

}
