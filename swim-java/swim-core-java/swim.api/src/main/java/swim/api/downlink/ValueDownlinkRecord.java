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

package swim.api.downlink;

import java.util.Iterator;
import swim.observable.function.DidSet;
import swim.structure.Field;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Cursor;

public class ValueDownlinkRecord extends DownlinkRecord implements DidSet<Value> {
  protected final ValueDownlink<Value> downlink;

  public ValueDownlinkRecord(ValueDownlink<Value> downlink) {
    this.downlink = downlink;
    this.downlink.observe(this);
  }

  @Override
  public ValueDownlink<Value> downlink() {
    return this.downlink;
  }

  @Override
  public boolean isEmpty() {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).isEmpty();
    } else {
      return !value.isDefined();
    }
  }

  @Override
  public boolean isArray() {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).isArray();
    } else {
      return true;
    }
  }

  @Override
  public boolean isObject() {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).isObject();
    } else {
      return !value.isDefined();
    }
  }

  @Override
  public int size() {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).size();
    } else if (value.isDefined()) {
      return 1;
    } else {
      return 0;
    }
  }

  @Override
  public boolean containsKey(Value key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).containsKey(key);
    } else {
      return false;
    }
  }

  @Override
  public boolean containsKey(String key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).containsKey(key);
    } else {
      return false;
    }
  }

  @Override
  public Value get(Value key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).get(key);
    } else {
      return Value.absent();
    }
  }

  @Override
  public Value get(String key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).get(key);
    } else {
      return Value.absent();
    }
  }

  @Override
  public Value getAttr(Text key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).getAttr(key);
    } else {
      return Value.absent();
    }
  }

  @Override
  public Value getAttr(String key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).getAttr(key);
    } else {
      return Value.absent();
    }
  }

  @Override
  public Value getSlot(Value key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).getSlot(key);
    } else {
      return Value.absent();
    }
  }

  @Override
  public Value getSlot(String key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).getSlot(key);
    } else {
      return Value.absent();
    }
  }

  @Override
  public Field getField(Value key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).getField(key);
    } else {
      return null;
    }
  }

  @Override
  public Field getField(String key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).getField(key);
    } else {
      return null;
    }
  }

  @Override
  public Item get(int index) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).getItem(index);
    } else {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
  }

  @Override
  public Item getItem(int index) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).getItem(index);
    } else if (index == 0) {
      return value;
    } else {
      return Item.absent();
    }
  }

  @Override
  public Value put(Value key, Value newValue) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).put(key, newValue);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public Value put(String key, Value newValue) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).put(key, newValue);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public Value putAttr(Text key, Value newValue) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).putAttr(key, newValue);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public Value putAttr(String key, Value newValue) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).putAttr(key, newValue);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public Value putSlot(Value key, Value newValue) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).putSlot(key, newValue);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public Value putSlot(String key, Value newValue) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).putSlot(key, newValue);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public Item setItem(int index, Item newItem) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).setItem(index, newItem);
    } else if (index == 0) {
      return this.downlink.set(newItem.toValue());
    } else {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
  }

  @Override
  public boolean add(Item item) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).add(item);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public void add(int index, Item item) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      ((Record) value).add(index, item);
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public Item remove(int index) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).remove(index);
    } else {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
  }

  @Override
  public boolean removeKey(Value key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).removeKey(key);
    } else {
      return false;
    }
  }

  @Override
  public boolean removeKey(String key) {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).removeKey(key);
    } else {
      return false;
    }
  }

  @Override
  public void clear() {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      ((Record) value).clear();
    } else {
      throw new UnsupportedOperationException();
    }
  }

  @Override
  public Iterator<Value> keyIterator() {
    final Value value = this.downlink.get();
    if (value instanceof Record) {
      return ((Record) value).keyIterator();
    } else {
      return Cursor.empty();
    }
  }

  @Override
  public void didSet(Value newValue, Value oldValue) {
    this.invalidateInput();
    this.reconcileInput(0); // TODO: debounce
  }
}
