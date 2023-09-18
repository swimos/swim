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

package swim.structure;

import java.util.Iterator;
import java.util.NoSuchElementException;

final class ItemIterator implements Iterator<Item> {

  Item item;

  ItemIterator(Item item) {
    this.item = item;
  }

  @Override
  public boolean hasNext() {
    return this.item != null;
  }

  @Override
  public Item next() {
    final Item item = this.item;
    if (item == null) {
      throw new NoSuchElementException();
    }
    this.item = null;
    return item;
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }

}
