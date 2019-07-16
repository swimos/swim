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

package swim.structure;

import java.util.Iterator;
import java.util.NoSuchElementException;

final class RecordFieldIterator implements Iterator<Field> {
  final Iterator<Item> iterator;
  Field next;

  RecordFieldIterator(Iterator<Item> iterator) {
    this.iterator = iterator;
  }

  @Override
  public boolean hasNext() {
    do {
      Item next = this.next;
      if (next != null) {
        return true;
      } else if (this.iterator.hasNext()) {
        next = this.iterator.next();
        if (next instanceof Field) {
          this.next = (Field) next;
          return true;
        }
      } else {
        return false;
      }
    } while (true);
  }

  @Override
  public Field next() {
    do {
      Item next = this.next;
      if (next != null) {
        this.next = null;
        return (Field) next;
      } else if (this.iterator.hasNext()) {
        next = this.iterator.next();
        if (next instanceof Field) {
          return (Field) next;
        }
      } else {
        throw new NoSuchElementException();
      }
    } while (true);
  }

  @Override
  public void remove() {
    this.iterator.remove();
  }
}
