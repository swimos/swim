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
    final StreamletScope<? extends O> scope = streamletScope();
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
    return reflectInletKey(key, this, getClass());
  }

  protected <I2 extends I> Inlet<I2> inlet() {
    return new StreamletInlet<I2>(this);
  }

  @Override
  public void bindInput(String key, Outlet<? extends I> input) {
    final Inlet<I> inlet = inlet(key);
    if (inlet == null) {
      throw new IllegalArgumentException(key.toString());
    }
    inlet.bindInput(input);
  }

  @Override
  public void unbindInput(String key) {
    final Inlet<I> inlet = inlet(key);
    if (inlet == null) {
      throw new IllegalArgumentException(key.toString());
    }
    inlet.unbindInput();
  }

  @Override
  public Outlet<O> outlet(String key) {
    return reflectOutletKey(key, this, getClass());
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
  public void invalidate() {
    if (this.version >= 0) {
      willInvalidate();
      this.version = -1;
      onInvalidate();
      onInvalidateOutlets();
      didInvalidate();
    }
  }

  @Override
  public void reconcile(int version) {
    if (this.version < 0) {
      willReconcile(version);
      this.version = version;
      onReconcileInlets(version);
      onReconcile(version);
      onReconcileOutlets(version);
      didReconcile(version);
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
    final Inlet<I2> inlet = (Inlet<I2>) inlet(key);
    if (inlet != null) {
      return getInput(inlet);
    }
    return null;
  }

  public <I2 extends I> I2 getInput(Inlet<I2> inlet, I2 orElse) {
    I2 input = getInput(inlet);
    if (input == null) {
      input = orElse;
    }
    return input;
  }

  public <I2 extends I> I2 getInput(String key, I2 orElse) {
    I2 input = getInput(key);
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
    final Outlet<O> outlet = outlet(key);
    if (outlet != null) {
      return getOutput(outlet);
    }
    return null;
  }

  @Override
  public void disconnectInputs() {
    disconnectInputs(this, getClass());
  }

  public static <I, O> void disconnectInputs(Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Inlet.class.isAssignableFrom(field.getType())) {
          disconnectInputField(streamlet, field);
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
  }

  private static <I, O> void disconnectInputField(Streamlet<I, O> streamlet, Field field) {
    if (field.getAnnotation(Out.class) != null) {
      final Inlet<I> inlet = reflectInletField(streamlet, field);
      inlet.disconnectInputs();
    } else if (field.getAnnotation(Inout.class) != null) {
      final Inoutlet<I, O> inoutlet = reflectInoutletField(streamlet, field);
      inoutlet.disconnectInputs();
    }
  }

  @Override
  public void disconnectOutputs() {
    disconnectOutputs(this, getClass());
  }

  public static <I, O> void disconnectOutputs(Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Outlet.class.isAssignableFrom(field.getType())) {
          disconnectOutputField(streamlet, field);
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
  }

  private static <I, O> void disconnectOutputField(Streamlet<I, O> streamlet, Field field) {
    if (field.getAnnotation(Out.class) != null) {
      final Outlet<O> outlet = reflectOutletField(streamlet, field);
      outlet.disconnectOutputs();
    } else if (field.getAnnotation(Inout.class) != null) {
      final Inoutlet<I, O> inoutlet = reflectInoutletField(streamlet, field);
      inoutlet.disconnectOutputs();
    }
  }

  @Override
  public void willInvalidateInlet(Inlet<? extends I> inlet) {
    // stub
  }

  @Override
  public void didInvalidateInlet(Inlet<? extends I> inlet) {
    invalidate();
  }

  @Override
  public void willReconcileInlet(Inlet<? extends I> inlet, int version) {
    // stub
  }

  @Override
  public void didReconcileInlet(Inlet<? extends I> inlet, int version) {
    reconcile(version);
  }

  @Override
  public void willInvalidateOutlet(Outlet<? super O> outlet) {
    // stub
  }

  @Override
  public void didInvalidateOutlet(Outlet<? super O> outlet) {
    // stub
  }

  @Override
  public void willReconcileOutlet(Outlet<? super O> outlet, int version) {
    // stub
  }

  @Override
  public void didReconcileOutlet(Outlet<? super O> outlet, int version) {
    // stub
  }

  protected void willInvalidate() {
    // stub
  }

  protected void onInvalidate() {
    // stub
  }

  protected void onInvalidateOutlets() {
    invalidateOutlets(this, getClass());
  }

  public static <I, O> void invalidateOutlets(Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Outlet.class.isAssignableFrom(field.getType())) {
          invalidateOutletField(streamlet, field);
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
  }

  private static <I, O> void invalidateOutletField(Streamlet<I, O> streamlet, Field field) {
    if (field.getAnnotation(Out.class) != null) {
      final Outlet<O> outlet = reflectOutletField(streamlet, field);
      outlet.invalidateInput();
    } else if (field.getAnnotation(Inout.class) != null) {
      final Inoutlet<I, O> inoutlet = reflectInoutletField(streamlet, field);
      inoutlet.invalidateInput();
    }
  }

  protected void didInvalidate() {
    // stub
  }

  protected void willReconcile(int version) {
    // stub
  }

  protected void onReconcileInlets(int version) {
    reconcileInlets(version, this, getClass());
  }

  public static <I, O> void reconcileInlets(int version, Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Inlet.class.isAssignableFrom(field.getType())) {
          reconcileInletField(version, streamlet, field);
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
  }

  private static <I, O> void reconcileInletField(int version, Streamlet<I, O> streamlet, Field field) {
    if (field.getAnnotation(In.class) != null) {
      final Inlet<I> inlet = reflectInletField(streamlet, field);
      inlet.reconcileOutput(version);
    } else if (field.getAnnotation(Inout.class) != null) {
      final Inoutlet<I, O> inoutlet = reflectInoutletField(streamlet, field);
      inoutlet.reconcileOutput(version);
    }
  }

  protected void onReconcile(int version) {
    // stub
  }

  protected void onReconcileOutlets(int version) {
    reconcileOutlets(version, this, getClass());
  }

  public static <I, O> void reconcileOutlets(int version, Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Outlet.class.isAssignableFrom(field.getType())) {
          reconcileOutletField(version, streamlet, field);
        }
      }
      streamletClass = streamletClass.getSuperclass();
    }
  }

  private static <I, O> void reconcileOutletField(int version, Streamlet<I, O> streamlet, Field field) {
    if (field.getAnnotation(Out.class) != null) {
      final Outlet<O> outlet = reflectOutletField(streamlet, field);
      outlet.reconcileInput(version);
    } else if (field.getAnnotation(Inout.class) != null) {
      final Inoutlet<I, O> inoutlet = reflectInoutletField(streamlet, field);
      inoutlet.reconcileInput(version);
    }
  }

  protected void didReconcile(int version) {
    // stub
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
              return new AbstractMap.SimpleImmutableEntry<String, Inlet<I>>(field.getName(), reflectInletField(streamlet, field));
            }
            index -= 1;
            continue;
          }
          final Inout inout = field.getAnnotation(Inout.class);
          if (inout != null) {
            if (index == 0) {
              return new AbstractMap.SimpleImmutableEntry<String, Inlet<I>>(field.getName(), reflectInoutletField(streamlet, field));
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
              return new AbstractMap.SimpleImmutableEntry<String, Outlet<O>>(field.getName(), reflectOutletField(streamlet, field));
            }
            index -= 1;
            continue;
          }
          final Inout inout = field.getAnnotation(Inout.class);
          if (inout != null) {
            if (index == 0) {
              return new AbstractMap.SimpleImmutableEntry<String, Outlet<O>>(field.getName(), reflectInoutletField(streamlet, field));
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
          final Inlet<I> inlet = reflectInletKeyField(key, streamlet, field);
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
        return reflectInletField(streamlet, field);
      }
    }
    final Inout inout = field.getAnnotation(Inout.class);
    if (inout != null) {
      final String name = inout.value();
      if (name.equals(key) || name.isEmpty() && field.getName().equals(key)) {
        return reflectInoutletField(streamlet, field);
      }
    }
    return null;
  }

  public static <I, O> Outlet<O> reflectOutletKey(String key, Streamlet<I, O> streamlet, Class<?> streamletClass) {
    while (streamletClass != null) {
      final Field[] fields = streamletClass.getDeclaredFields();
      for (Field field : fields) {
        if (Outlet.class.isAssignableFrom(field.getType())) {
          final Outlet<O> outlet = reflectOutletKeyField(key, streamlet, field);
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
        return reflectOutletField(streamlet, field);
      }
    }
    final Inout inout = field.getAnnotation(Inout.class);
    if (inout != null) {
      final String name = inout.value();
      if (name.equals(key) || name.isEmpty() && field.getName().equals(key)) {
        return reflectInoutletField(streamlet, field);
      }
    }
    return null;
  }

  public static <I, O> Inlet<I> reflectInletField(Streamlet<I, O> streamlet, Field field) {
    field.setAccessible(true);
    if (MapInlet.class.isAssignableFrom(field.getType())) {
      return reflectMapInletField(streamlet, field);
    } else {
      return reflectValueInletField(streamlet, field);
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
      return reflectMapOutletField(streamlet, field);
    } else {
      return reflectValueOutletField(streamlet, field);
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
      return reflectMapInoutletField(streamlet, field);
    } else {
      return reflectValueInoutletField(streamlet, field);
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
