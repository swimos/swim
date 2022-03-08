// Copyright 2015-2022 Swim.inc
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

package swim.streamlet;

import java.lang.reflect.Field;
import java.util.AbstractMap;
import java.util.Map;

public abstract class AbstractStreamlet<I, O> implements GenericStreamlet<I, O> {

  protected StreamletScope<? extends O> scope;
  protected StreamletContext context;
  protected int version;

  public AbstractStreamlet(StreamletScope<? extends O> scope) {
    this.scope = scope;
    this.version = -1;
  }

  public AbstractStreamlet() {
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
  public Inlet<I> inlet(String key) {
    return AbstractStreamlet.reflectInletKey(key, this, getClass());
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
    return AbstractStreamlet.reflectOutletKey(key, this, getClass());
  }

  @SuppressWarnings("unchecked")
  protected <O2> Outlet<O2> outlet() {
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

  public static <I, O> void disconnectInputs(Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Inlet.class.isAssignableFrom(field.getType())) {
          AbstractStreamlet.disconnectInputField(streamlet, field);
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
  }

  private static <I, O> void disconnectInputField(Streamlet<I, O> streamlet, Field field) {
    if (field.getAnnotation(Out.class) != null) {
      final Inlet<I> inlet = AbstractStreamlet.reflectInletField(streamlet, field);
      inlet.disconnectInputs();
    } else if (field.getAnnotation(Inout.class) != null) {
      final Inoutlet<I, O> inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, field);
      inoutlet.disconnectInputs();
    }
  }

  public static <I, O> void disconnectOutputs(Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Outlet.class.isAssignableFrom(field.getType())) {
          AbstractStreamlet.disconnectOutputField(streamlet, field);
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
  }

  private static <I, O> void disconnectOutputField(Streamlet<I, O> streamlet, Field field) {
    if (field.getAnnotation(Out.class) != null) {
      final Outlet<O> outlet = AbstractStreamlet.reflectOutletField(streamlet, field);
      outlet.disconnectOutputs();
    } else if (field.getAnnotation(Inout.class) != null) {
      final Inoutlet<I, O> inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, field);
      inoutlet.disconnectOutputs();
    }
  }

  public static <I, O> void decohereOutlets(Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Outlet.class.isAssignableFrom(field.getType())) {
          AbstractStreamlet.decohereOutletField(streamlet, field);
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
  }

  private static <I, O> void decohereOutletField(Streamlet<I, O> streamlet, Field field) {
    if (field.getAnnotation(Out.class) != null) {
      final Outlet<O> outlet = AbstractStreamlet.reflectOutletField(streamlet, field);
      outlet.decohereInput();
    } else if (field.getAnnotation(Inout.class) != null) {
      final Inoutlet<I, O> inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, field);
      inoutlet.decohereInput();
    }
  }

  public static <I, O> void recohereInlets(int version, Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Inlet.class.isAssignableFrom(field.getType())) {
          AbstractStreamlet.recohereInletField(version, streamlet, field);
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
  }

  private static <I, O> void recohereInletField(int version, Streamlet<I, O> streamlet, Field field) {
    if (field.getAnnotation(In.class) != null) {
      final Inlet<I> inlet = AbstractStreamlet.reflectInletField(streamlet, field);
      inlet.recohereOutput(version);
    } else if (field.getAnnotation(Inout.class) != null) {
      final Inoutlet<I, O> inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, field);
      inoutlet.recohereOutput(version);
    }
  }

  public static <I, O> void recohereOutlets(int version, Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Outlet.class.isAssignableFrom(field.getType())) {
          AbstractStreamlet.recohereOutletField(version, streamlet, field);
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
  }

  private static <I, O> void recohereOutletField(int version, Streamlet<I, O> streamlet, Field field) {
    if (field.getAnnotation(Out.class) != null) {
      final Outlet<O> outlet = AbstractStreamlet.reflectOutletField(streamlet, field);
      outlet.recohereInput(version);
    } else if (field.getAnnotation(Inout.class) != null) {
      final Inoutlet<I, O> inoutlet = AbstractStreamlet.reflectInoutletField(streamlet, field);
      inoutlet.recohereInput(version);
    }
  }

  public static <I, O> int reflectInletCount(Class<?> streamletClass) {
    int count = 0;
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Inlet.class.isAssignableFrom(field.getType())) {
          final In in = field.getAnnotation(In.class);
          if (in != null) {
            count += 1;
            continue;
          }
          final Inout inout = field.getAnnotation(Inout.class);
          if (inout != null) {
            count += 1;
            continue;
          }
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
    return count;
  }

  public static <I, O> int reflectOutletCount(Class<?> streamletClass) {
    int count = 0;
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Outlet.class.isAssignableFrom(field.getType())) {
          final Out out = field.getAnnotation(Out.class);
          if (out != null) {
            count += 1;
            continue;
          }
          final Inout inout = field.getAnnotation(Inout.class);
          if (inout != null) {
            count += 1;
            continue;
          }
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
    return count;
  }

  public static <I, O> Map.Entry<String, Inlet<I>> reflectInletIndex(int index, Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Inlet.class.isAssignableFrom(field.getType())) {
          final In in = field.getAnnotation(In.class);
          if (in != null) {
            if (index == 0) {
              return new AbstractMap.SimpleImmutableEntry<String, Inlet<I>>(field.getName(), AbstractStreamlet.reflectInletField(streamlet, field));
            }
            index -= 1;
            continue;
          }
          final Inout inout = field.getAnnotation(Inout.class);
          if (inout != null) {
            if (index == 0) {
              return new AbstractMap.SimpleImmutableEntry<String, Inlet<I>>(field.getName(), AbstractStreamlet.reflectInoutletField(streamlet, field));
            }
            index -= 1;
            continue;
          }
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
    return null;
  }

  public static <I, O> Map.Entry<String, Outlet<O>> reflectOutletIndex(int index, Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Outlet.class.isAssignableFrom(field.getType())) {
          final Out out = field.getAnnotation(Out.class);
          if (out != null) {
            if (index == 0) {
              return new AbstractMap.SimpleImmutableEntry<String, Outlet<O>>(field.getName(), AbstractStreamlet.reflectOutletField(streamlet, field));
            }
            index -= 1;
            continue;
          }
          final Inout inout = field.getAnnotation(Inout.class);
          if (inout != null) {
            if (index == 0) {
              return new AbstractMap.SimpleImmutableEntry<String, Outlet<O>>(field.getName(), AbstractStreamlet.reflectInoutletField(streamlet, field));
            }
            index -= 1;
            continue;
          }
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
    return null;
  }

  public static <I, O> Inlet<I> reflectInletKey(String key, Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Inlet.class.isAssignableFrom(field.getType())) {
          final Inlet<I> inlet = AbstractStreamlet.reflectInletKeyField(key, streamlet, field);
          if (inlet != null) {
            return inlet;
          }
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
    return null;
  }

  private static <I, O> Inlet<I> reflectInletKeyField(String key, Streamlet<I, O> streamlet, Field field) {
    final In in = field.getAnnotation(In.class);
    if (in != null) {
      final String name = in.value();
      if (name.equals(key) || name.isEmpty() && field.getName().equals(key)) {
        return AbstractStreamlet.reflectInletField(streamlet, field);
      }
    }
    final Inout inout = field.getAnnotation(Inout.class);
    if (inout != null) {
      final String name = inout.value();
      if (name.equals(key) || name.isEmpty() && field.getName().equals(key)) {
        return AbstractStreamlet.reflectInoutletField(streamlet, field);
      }
    }
    return null;
  }

  public static <I, O> Outlet<O> reflectOutletKey(String key, Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Outlet.class.isAssignableFrom(field.getType())) {
          final Outlet<O> outlet = AbstractStreamlet.reflectOutletKeyField(key, streamlet, field);
          if (outlet != null) {
            return outlet;
          }
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  private static <I, O> Outlet<O> reflectOutletKeyField(String key, Streamlet<I, O> streamlet, Field field) {
    final Out out = field.getAnnotation(Out.class);
    if (out != null) {
      final String name = out.value();
      if (name.equals(key) || name.isEmpty() && field.getName().equals(key)) {
        return AbstractStreamlet.reflectOutletField(streamlet, field);
      }
    }
    final Inout inout = field.getAnnotation(Inout.class);
    if (inout != null) {
      final String name = inout.value();
      if (name.equals(key) || name.isEmpty() && field.getName().equals(key)) {
        return AbstractStreamlet.reflectInoutletField(streamlet, field);
      }
    }
    return null;
  }

  public static <I, O> Inlet<I> reflectInletField(Streamlet<I, O> streamlet, Field field) {
    field.setAccessible(true);
    if (MapInlet.class.isAssignableFrom(field.getType())) {
      return AbstractStreamlet.reflectMapInletField(streamlet, field);
    } else {
      return AbstractStreamlet.reflectValueInletField(streamlet, field);
    }
  }

  @SuppressWarnings("unchecked")
  private static <I, O> Inlet<I> reflectValueInletField(Streamlet<I, O> streamlet, Field field) {
    try {
      Inlet<I> inlet = (Inlet<I>) field.get(streamlet);
      if (inlet == null) {
        if (streamlet instanceof AbstractStreamlet<?, ?>) {
          inlet = ((AbstractStreamlet<I, O>) streamlet).inlet();
        } else {
          inlet = new StreamletInlet<I>(streamlet);
        }
        field.set(streamlet, inlet);
      }
      return inlet;
    } catch (IllegalAccessException cause) {
      throw new StreamletException(cause);
    }
  }

  private static <I, O> Inlet<I> reflectMapInletField(Streamlet<I, O> streamlet, Field field) {
    return null; // TODO
  }

  public static <I, O> Outlet<O> reflectOutletField(Streamlet<I, O> streamlet, Field field) {
    field.setAccessible(true);
    if (MapOutlet.class.isAssignableFrom(field.getType())) {
      return AbstractStreamlet.reflectMapOutletField(streamlet, field);
    } else {
      return AbstractStreamlet.reflectValueOutletField(streamlet, field);
    }
  }

  @SuppressWarnings("unchecked")
  private static <I, O> Outlet<O> reflectValueOutletField(Streamlet<I, O> streamlet, Field field) {
    try {
      Outlet<O> outlet = (Outlet<O>) field.get(streamlet);
      if (outlet == null) {
        if (streamlet instanceof AbstractStreamlet<?, ?>) {
          outlet = ((AbstractStreamlet<I, O>) streamlet).outlet();
        } else {
          outlet = new StreamletOutlet<O>(streamlet);
        }
        field.set(streamlet, outlet);
      }
      return outlet;
    } catch (IllegalAccessException cause) {
      throw new StreamletException(cause);
    }
  }

  private static <I, O> Outlet<O> reflectMapOutletField(Streamlet<I, O> streamlet, Field field) {
    return null; // TODO
  }

  public static <I, O> Inoutlet<I, O> reflectInoutletField(Streamlet<I, O> streamlet, Field field) {
    field.setAccessible(true);
    if (MapInoutlet.class.isAssignableFrom(field.getType())) {
      return AbstractStreamlet.reflectMapInoutletField(streamlet, field);
    } else {
      return AbstractStreamlet.reflectValueInoutletField(streamlet, field);
    }
  }

  @SuppressWarnings("unchecked")
  private static <I, O> Inoutlet<I, O> reflectValueInoutletField(Streamlet<I, O> streamlet, Field field) {
    try {
      Inoutlet<I, O> inoutlet = (Inoutlet<I, O>) field.get(streamlet);
      if (inoutlet == null) {
        if (streamlet instanceof AbstractStreamlet<?, ?>) {
          inoutlet = ((AbstractStreamlet<I, O>) streamlet).inoutlet();
        } else {
          inoutlet = new StreamletInoutlet<I, O>(streamlet);
        }
        field.set(streamlet, inoutlet);
      }
      return inoutlet;
    } catch (IllegalAccessException cause) {
      throw new StreamletException(cause);
    }
  }

  private static <I, O> Inoutlet<I, O> reflectMapInoutletField(Streamlet<I, O> streamlet, Field field) {
    return null; // TODO
  }

}
