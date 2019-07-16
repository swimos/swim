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

import java.util.Collection;
import swim.util.Builder;

final class ValueBuilder implements Builder<Item, Value> {
  Record record = null;
  Value value = null;

  @Override
  public boolean add(Item item) {
    if (item instanceof Field) {
      return addField((Field) item);
    } else if (item instanceof Value) {
      return addValue((Value) item);
    } else {
      throw new AssertionError(item);
    }
  }

  @Override
  public boolean addAll(Collection<? extends Item> items) {
    for (Item item : items) {
      add(item);
    }
    return true;
  }

  boolean addField(Field item) {
    if (this.record == null) {
      this.record = Record.create();
      if (this.value != null) {
        this.record.add(this.value);
        this.value = null;
      }
    }
    this.record.add(item);
    return true;
  }

  boolean addValue(Value item) {
    if (this.record != null) {
      this.record.add(item);
    } else if (this.value == null) {
      this.value = item;
    } else {
      this.record = Record.create();
      this.record.add(this.value);
      this.value = null;
      this.record.add(item);
    }
    return true;
  }

  @Override
  public Value bind() {
    if (this.record != null) {
      return this.record;
    } else if (this.value != null) {
      return this.value;
    } else {
      return Value.absent();
    }
  }
}
