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

package swim.dataflow;

import java.util.Iterator;
import swim.collections.HashTrieMap;
import swim.streamlet.KeyEffect;
import swim.streamlet.MapOutlet;
import swim.streamlet.Outlet;
import swim.streamlet.StreamletScope;
import swim.structure.Field;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;
import swim.structure.func.MathModule;

public class RecordModel extends AbstractRecordOutlet {
  protected Record state;
  protected HashTrieMap<Value, RecordFieldUpdater> fieldUpdaters;

  public RecordModel(Record state) {
    this.state = state;
    this.fieldUpdaters = HashTrieMap.empty();
  }

  public RecordModel() {
    this(Record.create());
  }

  @Override
  public boolean isEmpty() {
    return this.state.isEmpty();
  }

  @Override
  public boolean isArray() {
    return this.state.isArray();
  }

  @Override
  public boolean isObject() {
    return this.state.isObject();
  }

  @Override
  public int size() {
    return this.state.size();
  }

  @Override
  public int fieldCount() {
    return this.state.fieldCount();
  }

  @Override
  public int valueCount() {
    return this.state.valueCount();
  }

  @Override
  public boolean containsKey(Value key) {
    if (this.state.containsKey(key)) {
      return true;
    } else {
      final StreamletScope<? extends Value> scope = streamletScope();
      return scope instanceof Record ? ((Record) scope).containsKey(key) : false;
    }
  }

  @Override
  public boolean containsOwnKey(Value key) {
    return this.state.containsKey(key);
  }

  @Override
  public int indexOf(Object item) {
    return this.state.indexOf(item);
  }

  @Override
  public int lastIndexOf(Object item) {
    return this.state.lastIndexOf(item);
  }

  @Override
  public Value get(Value key) {
    Value value = this.state.get(key);
    if (!value.isDefined()) {
      final StreamletScope<? extends Value> scope = streamletScope();
      if (scope instanceof Record) {
        value = ((Record) scope).get(key);
      }
    }
    return value;
  }

  @Override
  public Value getAttr(Text key) {
    Value value = this.state.getAttr(key);
    if (!value.isDefined()) {
      final StreamletScope<? extends Value> scope = streamletScope();
      if (scope instanceof Record) {
        value = ((Record) scope).getAttr(key);
      }
    }
    return value;
  }

  @Override
  public Value getSlot(Value key) {
    Value value = this.state.getSlot(key);
    if (!value.isDefined()) {
      final StreamletScope<? extends Value> scope = streamletScope();
      if (scope instanceof Record) {
        value = ((Record) scope).getSlot(key);
      }
    }
    return value;
  }

  @Override
  public Field getField(Value key) {
    Field field = this.state.getField(key);
    if (field == null) {
      final StreamletScope<? extends Value> scope = streamletScope();
      if (scope instanceof Record) {
        field = ((Record) scope).getField(key);
      }
    }
    return field;
  }

  @Override
  public Item get(int index) {
    return this.state.get(index);
  }

  @Override
  public Item getItem(int index) {
    return this.state.getItem(index);
  }

  public void bindValue(Value key, Value expr) {
    final RecordFieldUpdater fieldUpdater = new RecordFieldUpdater(this, key);
    final Outlet<? extends Value> valueInput = Dataflow.compile(expr, this);
    fieldUpdater.bindInput(valueInput);
    // TODO: clean up existing field updater
    this.fieldUpdaters = this.fieldUpdaters.updated(key, fieldUpdater);
  }

  @Override
  public Value put(Value key, Value newValue) {
    final Value oldValue;
    if (!this.state.containsKey(key)) {
      final StreamletScope<? extends Value> scope = streamletScope();
      if (scope instanceof Record && ((Record) scope).containsKey(key)) {
        oldValue = ((Record) scope).put(key, newValue);
      } else {
        oldValue = this.state.put(key, newValue);
      }
    } else {
      oldValue = this.state.put(key, newValue);
    }
    invalidateInputKey(key, KeyEffect.UPDATE);
    return oldValue;
  }

  @Override
  public Value put(String key, Value newValue) {
    return put(Text.from(key), newValue);
  }

  @Override
  public Value putAttr(Text key, Value newValue) {
    final Value oldValue;
    if (!this.state.containsKey(key)) {
      final StreamletScope<? extends Value> scope = streamletScope();
      if (scope instanceof Record && ((Record) scope).containsKey(key)) {
        oldValue = ((Record) scope).putAttr(key, newValue);
      } else {
        oldValue = this.state.putAttr(key, newValue);
      }
    } else {
      oldValue = this.state.putAttr(key, newValue);
    }
    invalidateInputKey(key, KeyEffect.UPDATE);
    return oldValue;
  }

  @Override
  public Value putAttr(String key, Value newValue) {
    return putAttr(Text.from(key), newValue);
  }

  @Override
  public Value putSlot(Value key, Value newValue) {
    final Value oldValue;
    if (!this.state.containsKey(key)) {
      final StreamletScope<? extends Value> scope = streamletScope();
      if (scope instanceof Record && ((Record) scope).containsKey(key)) {
        oldValue = ((Record) scope).putSlot(key, newValue);
      } else {
        oldValue = this.state.putSlot(key, newValue);
      }
    } else {
      oldValue = this.state.putSlot(key, newValue);
    }
    invalidateInputKey(key, KeyEffect.UPDATE);
    return oldValue;
  }

  @Override
  public Value putSlot(String key, Value newValue) {
    return putSlot(Text.from(key), newValue);
  }

  @Override
  public Item setItem(int index, Item newItem) {
    final Item oldItem = this.state.setItem(index, newItem);
    if (oldItem instanceof Field && newItem instanceof Field) {
      if (oldItem.key().equals(newItem.key())) {
        invalidateInputKey(oldItem.key(), KeyEffect.UPDATE);
      } else {
        invalidateInputKey(oldItem.key(), KeyEffect.REMOVE);
        invalidateInputKey(newItem.key(), KeyEffect.UPDATE);
      }
    } else if (oldItem instanceof Field) {
      invalidateInputKey(oldItem.key(), KeyEffect.REMOVE);
    } else if (newItem instanceof Field) {
      invalidateInputKey(newItem.key(), KeyEffect.UPDATE);
    } else {
      invalidateInput();
    }
    return oldItem;
  }

  @Override
  public boolean add(Item item) {
    this.state.add(item);
    if (item instanceof Field) {
      invalidateInputKey(item.key(), KeyEffect.UPDATE);
    }
    return true;
  }

  @Override
  public void add(int index, Item item) {
    this.state.add(index, item);
    if (item instanceof Field) {
      invalidateInputKey(item.key(), KeyEffect.UPDATE);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Item remove(int index) {
    final Item oldItem = this.state.remove(index);
    if (oldItem instanceof Field) {
      invalidateInputKey(oldItem.key(), KeyEffect.REMOVE);
    }
    return oldItem;
  }

  @Override
  public void clear() {
    final Record oldState = this.state.branch();
    this.state.clear();
    for (Item oldItem : oldState) {
      if (oldItem instanceof Field) {
        invalidateInputKey(oldItem.key(), KeyEffect.REMOVE);
      }
    }
  }

  @Override
  public Record subList(int fromIndex, int toIndex) {
    return this.state.subList(fromIndex, toIndex);
  }

  @Override
  public final Iterator<Value> keyIterator() {
    return this.state.keyIterator();
  }

  @Override
  public void disconnectInputs() {
    final HashTrieMap<Value, RecordFieldUpdater> fieldUpdaters = this.fieldUpdaters;
    if (!fieldUpdaters.isEmpty()) {
      this.fieldUpdaters = HashTrieMap.empty();
      final Iterator<RecordFieldUpdater> inlets = fieldUpdaters.valueIterator();
      while (inlets.hasNext()) {
        final RecordFieldUpdater inlet = inlets.next();
        inlet.disconnectInputs();
      }
    }
  }

  @Override
  public MapOutlet<Value, Value, Record> memoize() {
    return this;
  }

  public void materialize(Record record) {
    for (Item item : record) {
      materializeItem(item);
    }
  }

  public void materializeItem(Item item) {
    if (item instanceof Field) {
      materializeField((Field) item);
    } else {
      materializeValue((Value) item);
    }
  }

  @SuppressWarnings("unchecked")
  public void materializeField(Field field) {
    final Value value = field.value();
    if (value instanceof RecordStreamlet<?, ?>) {
      ((RecordStreamlet<? super Value, ? super Value>) value).setStreamletScope(this);
      this.state.add(field);
    } else if (value instanceof Record) {
      // Add recursively materialized nested scope.
      final RecordScope child = new RecordScope(this);
      child.materialize((Record) value);
      this.state.add(field.updatedValue(child));
    } else {
      this.state.add(field);
    }
  }

  @SuppressWarnings("unchecked")
  public void materializeValue(Value value) {
    if (value instanceof RecordStreamlet<?, ?>) {
      ((RecordStreamlet<? super Value, ? super Value>) value).setStreamletScope(this);
      this.state.add(value);
    } else if (value instanceof Record) {
      // Add recursively materialized nested scope.
      final RecordScope child = new RecordScope(this);
      child.materialize((Record) value);
      this.state.add(child);
    } else {
      this.state.add(value);
    }
  }

  public void compile(Record record) {
    int index = 0;
    for (Item item : record) {
      compileItem(item, index);
      index += 1;
    }
  }

  public void compileItem(Item item, int index) {
    if (item instanceof Field) {
      compileField((Field) item, index);
    } else {
      compileValue((Value) item, index);
    }
  }

  public void compileField(Field field, int index) {
    final Value key = field.key();
    final Value value = field.value();
    if (!key.isConstant()) {
      // TODO: Add dynamic key updater.
    } else if (!value.isConstant()) {
      if (value instanceof RecordStreamlet) {
        // Lexically bind nested streamlet.
        ((RecordStreamlet) value).compile();
        // Invalidate nested scope key.
        invalidateInputKey(key, KeyEffect.UPDATE);
      } else if (value instanceof Record) {
        // Recursively compile nested scope.
        ((RecordModel) this.state.getItem(index).toValue()).compile((Record) value);
        // Invalidate nested scope key.
        invalidateInputKey(key, KeyEffect.UPDATE);
      } else {
        // Set placeholder value.
        field.setValue(Value.extant());
        // Bind dynamic value updater.
        bindValue(key, value);
      }
    } else {
      // Invalidate constant key.
      invalidateInputKey(key, KeyEffect.UPDATE);
    }
  }

  public void compileValue(Value value, int index) {
    if (value instanceof RecordStreamlet) {
      ((RecordStreamlet) value).compile();
    } else if (value instanceof Record) {
      // Recursively compile nested scope.
      ((RecordModel) this.state.getItem(index)).compile((Record) value);
    } else if (!value.isConstant()) {
      // TODO: Bind dynamic item updater.
    } else {
      // TODO: Fold constant expressions.
    }
  }

  public void transmute(Transmuter transmuter) {
    int index = 0;
    for (Item oldItem : this) {
      final Item newItem = transmuteItem(oldItem, transmuter);
      if (oldItem != newItem) {
        setItem(index, newItem);
      }
      index += 1;
    }
  }

  public void transmute() {
    transmute(Transmuter.system());
  }

  public Item transmuteItem(Item item, Transmuter transmuter) {
    if (item instanceof Field) {
      return transmuteField((Field) item, transmuter);
    } else {
      return transmuteValue((Value) item, transmuter);
    }
  }

  public Field transmuteField(Field field, Transmuter transmuter) {
    final Value oldValue = field.value();
    final Value newValue = transmuteValue(oldValue, transmuter);
    if (oldValue != newValue) {
      return field.updatedValue(newValue);
    } else {
      return field;
    }
  }

  public Value transmuteValue(Value oldValue, Transmuter transmuter) {
    if (oldValue instanceof RecordModel) {
      Record newValue = this.transmuteModel((RecordModel) oldValue);
      if (oldValue == newValue && transmuter != null) {
        newValue = transmuter.transmute((RecordModel) oldValue);
      }
      return newValue;
    } else {
      return oldValue;
    }
  }

  public Record transmuteModel(RecordModel model) {
    final StreamletScope<? extends Value> scope = streamletScope();
    if (scope instanceof RecordModel) {
      return ((RecordModel) scope).transmuteModel(model);
    } else {
      return model;
    }
  }

  public static RecordModel from(Record record) {
    final RecordModel model = new RecordModel();
    model.materialize(record);
    model.compile(record);
    return model;
  }

  public static RecordModel of() {
    return new RecordModel();
  }

  public static RecordModel of(Object object) {
    return from(Record.of(object));
  }

  public static RecordModel of(Object... objects) {
    return from(Record.of(objects));
  }

  public static RecordModel globalScope() {
    final RecordModel model = new RecordModel();
    model.materializeField(Slot.of("math", MathModule.scope().branch()));
    return model;
  }
}
