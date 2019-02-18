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
import swim.structure.Item;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Cursor;

public class ListDownlinkRecord extends DownlinkRecord {
  protected final ListDownlink<Value> downlink;

  public ListDownlinkRecord(ListDownlink<Value> downlink) {
    this.downlink = downlink;
  }

  @Override
  public ListDownlink<Value> downlink() {
    return this.downlink;
  }

  @Override
  public boolean isEmpty() {
    return this.downlink.isEmpty();
  }

  @Override
  public boolean isArray() {
    return true;
  }

  @Override
  public boolean isObject() {
    return this.downlink.isEmpty();
  }

  @Override
  public int size() {
    return this.downlink.size();
  }

  @Override
  public boolean containsKey(Value key) {
    return false;
  }

  @Override
  public boolean containsKey(String key) {
    return false;
  }

  @Override
  public Value get(Value key) {
    return Value.absent();
  }

  @Override
  public Value get(String key) {
    return Value.absent();
  }

  @Override
  public Value getAttr(Text key) {
    return Value.absent();
  }

  @Override
  public Value getAttr(String key) {
    return Value.absent();
  }

  @Override
  public Value getSlot(Value key) {
    return Value.absent();
  }

  @Override
  public Value getSlot(String key) {
    return Value.absent();
  }

  @Override
  public Item get(int index) {
    if (0 <= index && index < this.downlink.size()) {
      return this.downlink.get(index);
    }
    return Item.absent();
  }

  @Override
  public Item getItem(int index) {
    return this.downlink.get(index);
  }

  @Override
  public Value put(Value key, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value put(String key, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value putAttr(Text key, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value putAttr(String key, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value putSlot(Value key, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value putSlot(String key, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Item setItem(int index, Item newItem) {
    return this.downlink.set(index, newItem.toValue());
  }

  @Override
  public boolean add(Item item) {
    return this.downlink.add(item.toValue());
  }

  @Override
  public void add(int index, Item item) {
    this.downlink.add(index, item.toValue());
  }

  @Override
  public Item remove(int index) {
    return this.downlink.remove(index);
  }

  @Override
  public boolean removeKey(Value key) {
    return false;
  }

  @Override
  public boolean removeKey(String key) {
    return false;
  }

  @Override
  public void clear() {
    this.downlink.clear();
  }

  @Override
  public Iterator<Value> keyIterator() {
    return Cursor.empty();
  }
}
