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

package swim.dataflow;

import java.util.Map;
import swim.streamlet.AbstractStreamlet;
import swim.streamlet.GenericStreamlet;
import swim.streamlet.In;
import swim.streamlet.Inlet;
import swim.streamlet.Inout;
import swim.streamlet.Inoutlet;
import swim.streamlet.Outlet;
import swim.streamlet.Streamlet;
import swim.streamlet.StreamletContext;
import swim.streamlet.StreamletInlet;
import swim.streamlet.StreamletInoutlet;
import swim.streamlet.StreamletOutlet;
import swim.streamlet.StreamletScope;
import swim.structure.Field;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;

public abstract class AbstractRecordStreamlet<I extends Value, O extends Value> extends RecordStreamlet<I, O> implements GenericStreamlet<I, O> {

  protected StreamletScope<? extends O> scope;
  protected StreamletContext context;
  protected int version;

  public AbstractRecordStreamlet(StreamletScope<? extends O> scope) {
    this.scope = scope;
    this.version = -1;
  }

  public AbstractRecordStreamlet() {
    this(null);
  }

  @Override
  public StreamletScope<? extends O> streamletScope() {
    return this.scope;
  }

  @Override
  public void setStreamletScope(StreamletScope<? extends O> scope) {
    this.scope = scope;
  }

  @Override
  public StreamletContext streamletContext() {
    if (this.context != null) {
      return this.context;
    }
    final StreamletScope<? extends O> scope = this.streamletScope();
    if (scope != null) {
      return scope.streamletContext();
    }
    return null;
  }

  @Override
  public void setStreamletContext(StreamletContext context) {
    this.context = context;
  }

  @Override
  public boolean isEmpty() {
    return this.size() != 0;
  }

  @Override
  public int size() {
    return AbstractStreamlet.reflectOutletCount(this.getClass());
  }

  @Override
  public boolean containsKey(Value key) {
    if (!(key instanceof Text)) {
      return false;
    }
    final Outlet<O> outlet = this.outlet(((Text) key).stringValue());
    return outlet != null;
  }

  @Override
  public boolean containsKey(String key) {
    final Outlet<O> outlet = this.outlet(key);
    return outlet != null;
  }

  @Override
  public Value get(Value key) {
    if (!(key instanceof Text)) {
      return Value.absent();
    }
    final Outlet<O> outlet = this.outlet(((Text) key).stringValue());
    if (outlet != null) {
      final Value output = outlet.get();
      if (output != null) {
        return output;
      }
    }
    return Value.absent();
  }

  @Override
  public Value get(String key) {
    final Outlet<O> outlet = this.outlet(key);
    if (outlet != null) {
      final Value output = outlet.get();
      if (output != null) {
        return output;
      }
    }
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
    return this.get(key);
  }

  @Override
  public Value getSlot(String key) {
    return this.get(key);
  }

  @Override
  public Field getField(Value key) {
    final Value value = this.get(key);
    if (value.isDefined()) {
      return Slot.of(key, value);
    }
    return null;
  }

  @Override
  public Field getField(String key) {
    final Value value = this.get(key);
    if (value.isDefined()) {
      return Slot.of(key, value);
    }
    return null;
  }

  @Override
  public Item get(int index) {
    final Map.Entry<String, Outlet<O>> entry = AbstractStreamlet.reflectOutletIndex(index, this, this.getClass());
    if (entry != null) {
      final String name = entry.getKey();
      final Value output = entry.getValue().get();
      if (output != null) {
        return Slot.of(name, output);
      }
    }
    throw new IndexOutOfBoundsException(Integer.toString(index));
  }

  @Override
  public Item getItem(int index) {
    final Map.Entry<String, Outlet<O>> entry = AbstractStreamlet.reflectOutletIndex(index, this, this.getClass());
    if (entry != null) {
      final String name = entry.getKey();
      Value output = entry.getValue().get();
      if (output == null) {
        output = Value.extant();
      }
      return Slot.of(name, output);
    }
    return Item.absent();
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
  public Item setItem(int index, Item item) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean add(Item item) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void add(int index, Item item) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Item remove(int index) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeKey(Value key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeKey(String key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Inlet<I> inlet(String key) {
    return AbstractStreamlet.reflectInletKey(key, this, this.getClass());
  }

  protected <I2 extends I> Inlet<I2> inlet() {
    return new StreamletInlet<I2>(this);
  }

  @Override
  public void bindInput(String key, Outlet<? extends I> input) {
    final Inlet<I> inlet = this.inlet(key);
    if (inlet == null) {
      throw new IllegalArgumentException(key.toString());
    }
    inlet.bindInput(input);
  }

  @Override
  public void unbindInput(String key) {
    final Inlet<I> inlet = this.inlet(key);
    if (inlet == null) {
      throw new IllegalArgumentException(key.toString());
    }
    inlet.unbindInput();
  }

  @Override
  public Outlet<O> outlet(String key) {
    return AbstractStreamlet.reflectOutletKey(key, this, this.getClass());
  }

  @SuppressWarnings("unchecked")
  protected <O2 extends Value> Outlet<O2> outlet() {
    return new StreamletOutlet<O2>((Streamlet<I, ? extends O2>) this);
  }

  @SuppressWarnings("unchecked")
  protected <I2 extends I, O2> Inoutlet<I2, O2> inoutlet() {
    return new StreamletInoutlet<I2, O2>((Streamlet<? super I2, ? extends O2>) this);
  }

  @Override
  public void decohere() {
    if (this.version >= 0) {
      this.willDecohere();
      this.version = -1;
      this.onDecohere();
      this.onDecohereOutlets();
      this.didDecohere();
    }
  }

  @Override
  public void recohere(int version) {
    if (this.version < 0) {
      this.willRecohere(version);
      this.version = version;
      this.onRecohereInlets(version);
      this.onRecohere(version);
      this.onRecohereOutlets(version);
      this.didRecohere(version);
    }
  }

  public <I2 extends I> I2 getInput(Inlet<I2> inlet) {
    final Outlet<? extends I2> input = inlet.input();
    if (input != null) {
      return input.get();
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  public <I2 extends I> I2 getInput(String key) {
    final Inlet<I2> inlet = (Inlet<I2>) this.inlet(key);
    if (inlet != null) {
      return this.getInput(inlet);
    }
    return null;
  }

  public <I2 extends I> I2 getInput(Inlet<I2> inlet, I2 orElse) {
    I2 input = this.getInput(inlet);
    if (input == null) {
      input = orElse;
    }
    return input;
  }

  public <I2 extends I> I2 getInput(String key, I2 orElse) {
    I2 input = this.getInput(key);
    if (input == null) {
      input = orElse;
    }
    return input;
  }

  public <T> T castInput(Inlet<? extends I> inlet, Form<T> form) {
    final I input = this.getInput(inlet);
    T object = null;
    if (input != null) {
      object = form.cast(input);
    }
    return object;
  }

  public <T> T castInput(String key, Form<T> form) {
    final I input = this.getInput(key);
    T object = null;
    if (input != null) {
      object = form.cast(input);
    }
    return object;
  }

  public <T> T castInput(Inlet<? extends I> inlet, Form<T> form, T orElse) {
    final I input = this.getInput(inlet);
    T object = null;
    if (input != null) {
      object = form.cast(input);
    }
    if (object == null) {
      object = orElse;
    }
    return object;
  }

  public <T> T castInput(String key, Form<T> form, T orElse) {
    final I input = this.getInput(key);
    T object = null;
    if (input != null) {
      object = form.cast(input);
    }
    if (object == null) {
      object = orElse;
    }
    return object;
  }

  public <T> T coerceInput(Inlet<? extends I> inlet, Form<T> form) {
    final I input = this.getInput(inlet);
    T object = null;
    if (input != null) {
      object = form.cast(input);
    }
    if (object == null) {
      object = form.unit();
    }
    return object;
  }

  public <T> T coerceInput(String key, Form<T> form) {
    final I input = this.getInput(key);
    T object = null;
    if (input != null) {
      object = form.cast(input);
    }
    if (object == null) {
      object = form.unit();
    }
    return object;
  }

  public <T> T coerceInput(Inlet<? extends I> inlet, Form<T> form, T orElse) {
    final I input = this.getInput(inlet);
    T object = null;
    if (input != null) {
      object = form.cast(input);
    }
    if (object == null) {
      object = form.unit();
    }
    if (object == null) {
      object = orElse;
    }
    return object;
  }

  public <T> T coerceInput(String key, Form<T> form, T orElse) {
    final I input = this.getInput(key);
    T object = null;
    if (input != null) {
      object = form.cast(input);
    }
    if (object == null) {
      object = form.unit();
    }
    if (object == null) {
      object = orElse;
    }
    return object;
  }

  @Override
  public O getOutput(Outlet<? super O> outlet) {
    return null;
  }

  public O getOutput(String key) {
    final Outlet<O> outlet = this.outlet(key);
    if (outlet != null) {
      return this.getOutput(outlet);
    }
    return null;
  }

  @Override
  public void disconnectInputs() {
    AbstractStreamlet.disconnectInputs(this, this.getClass());
  }

  @Override
  public void disconnectOutputs() {
    AbstractStreamlet.disconnectOutputs(this, this.getClass());
  }

  @Override
  public void willDecohereInlet(Inlet<? extends I> inlet) {
    // hook
  }

  @Override
  public void didDecohereInlet(Inlet<? extends I> inlet) {
    this.decohere();
  }

  @Override
  public void willRecohereInlet(Inlet<? extends I> inlet, int version) {
    // hook
  }

  @Override
  public void didRecohereInlet(Inlet<? extends I> inlet, int version) {
    this.recohere(version);
  }

  @Override
  public void willDecohereOutlet(Outlet<? super O> outlet) {
    // hook
  }

  @Override
  public void didDecohereOutlet(Outlet<? super O> outlet) {
    // hook
  }

  @Override
  public void willRecohereOutlet(Outlet<? super O> outlet, int version) {
    // hook
  }

  @Override
  public void didRecohereOutlet(Outlet<? super O> outlet, int version) {
    // hook
  }

  protected void willDecohere() {
    // hook
  }

  protected void onDecohere() {
    // hook
  }

  protected void onDecohereOutlets() {
    AbstractStreamlet.decohereOutlets(this, this.getClass());
  }

  protected void didDecohere() {
    // hook
  }

  protected void willRecohere(int version) {
    // hook
  }

  protected void onRecohereInlets(int version) {
    AbstractStreamlet.recohereInlets(version, this, this.getClass());
  }

  protected void onRecohere(int version) {
    // hook
  }

  protected void onRecohereOutlets(int version) {
    AbstractStreamlet.recohereOutlets(version, this, this.getClass());
  }

  protected void didRecohere(int version) {
    // hook
  }

  public static <I extends Value, O extends Value> void compileInlets(Class<?> streamletClass, RecordStreamlet<I, O> streamlet) {
    while (streamletClass != null) {
      final java.lang.reflect.Field[] fields = streamletClass.getDeclaredFields();
      for (java.lang.reflect.Field field : fields) {
        if (Inlet.class.isAssignableFrom(field.getType())) {
          final In in = field.getAnnotation(In.class);
          if (in != null) {
            String name = in.value();
            if (name.isEmpty()) {
              name = field.getName();
            }
            final Inlet<I> inlet = AbstractStreamlet.reflectInletField(streamlet, field);
            streamlet.compileInlet(inlet, name);
            continue;
          }
          final Inout inout = field.getAnnotation(Inout.class);
          if (inout != null) {
            String name = inout.value();
            if (name.isEmpty()) {
              name = field.getName();
            }
            final Inoutlet<I, O> inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, field);
            streamlet.compileInlet(inoutlet, name);
            continue;
          }
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
  }

}
