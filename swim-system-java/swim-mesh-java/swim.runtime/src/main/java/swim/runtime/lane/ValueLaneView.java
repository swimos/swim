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

package swim.runtime.lane;

import java.util.AbstractMap;
import java.util.Iterator;
import java.util.Map;
import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.lane.ValueLane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.concurrent.Conts;
import swim.observable.function.DidSet;
import swim.observable.function.WillSet;
import swim.runtime.warp.WarpLaneView;
import swim.streamlet.Inlet;
import swim.streamlet.Outlet;
import swim.structure.Form;
import swim.util.Cursor;

public class ValueLaneView<V> extends WarpLaneView implements ValueLane<V> {
  protected final AgentContext agentContext;
  protected Form<V> valueForm;

  protected int flags;
  protected ValueLaneModel laneBinding;

  protected Outlet<? extends V> input;
  protected Inlet<? super V>[] outputs; // TODO: unify with observers
  protected int version;

  ValueLaneView(AgentContext agentContext, Form<V> valueForm, int flags, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.valueForm = valueForm;
    this.flags = flags;

    this.input = null;
    this.outputs = null;
    this.version = -1;
  }

  public ValueLaneView(AgentContext agentContext, Form<V> valueForm) {
    this(agentContext, valueForm, 0, null);
  }

  @Override
  public AgentContext agentContext() {
    return this.agentContext;
  }

  @Override
  public ValueLaneModel laneBinding() {
    return this.laneBinding;
  }

  void setLaneBinding(ValueLaneModel laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public ValueLaneModel createLaneBinding() {
    return new ValueLaneModel(this.flags);
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> ValueLaneView<V2> valueForm(Form<V2> valueForm) {
    return new ValueLaneView<V2>(this.agentContext, valueForm, this.flags,
                                 typesafeObservers(this.observers));
  }

  @Override
  public <V2> ValueLaneView<V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out WillSet, DidSet
    return observers;
  }

  @Override
  public final boolean isResident() {
    return (this.flags & RESIDENT) != 0;
  }

  @Override
  public ValueLaneView<V> isResident(boolean isResident) {
    didSetResident(isResident);

    // note: marked final given access of concurrently accessed volatile objects
    final ValueLaneModel laneBinding = this.laneBinding;

    if (laneBinding != null) {
      laneBinding.isResident(isResident);
    }

    return this;
  }

  void didSetResident(boolean isResident) {
    if (isResident) {
      this.flags |= RESIDENT;
    } else {
      this.flags &= ~RESIDENT;
    }
  }

  @Override
  public final boolean isTransient() {
    return (this.flags & TRANSIENT) != 0;
  }

  @Override
  public ValueLaneView<V> isTransient(boolean isTransient) {
    didSetTransient(isTransient);

    // note: marked final given access of concurrently accessed volatile objects
    final ValueLaneModel laneBinding = this.laneBinding;

    if (laneBinding != null) {
      laneBinding.isTransient(isTransient);
    }

    return this;
  }

  void didSetTransient(boolean isTransient) {
    if (isTransient) {
      this.flags |= TRANSIENT;
    } else {
      this.flags &= ~TRANSIENT;
    }
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @Override
  public ValueLaneView<V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public ValueLaneView<V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public ValueLaneView<V> willSet(WillSet<V> willSet) {
    return observe(willSet);
  }

  @Override
  public ValueLaneView<V> didSet(DidSet<V> didSet) {
    return observe(didSet);
  }

  @Override
  public ValueLaneView<V> willCommand(WillCommand willCommand) {
    return observe(willCommand);
  }

  @Override
  public ValueLaneView<V> didCommand(DidCommand didCommand) {
    return observe(didCommand);
  }

  @Override
  public ValueLaneView<V> willUplink(WillUplink willUplink) {
    return observe(willUplink);
  }

  @Override
  public ValueLaneView<V> didUplink(DidUplink didUplink) {
    return observe(didUplink);
  }

  @Override
  public ValueLaneView<V> willEnter(WillEnter willEnter) {
    return observe(willEnter);
  }

  @Override
  public ValueLaneView<V> didEnter(DidEnter didEnter) {
    return observe(didEnter);
  }

  @Override
  public ValueLaneView<V> willLeave(WillLeave willLeave) {
    return observe(willLeave);
  }

  @Override
  public ValueLaneView<V> didLeave(DidLeave didLeave) {
    return observe(didLeave);
  }

  @SuppressWarnings("unchecked")
  public Map.Entry<Boolean, V> dispatchWillSet(Link link, V newValue, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillSet<?>) {
        if (((WillSet<?>) observers).isPreemptive() == preemptive) {
          try {
            newValue = ((WillSet<V>) observers).willSet(newValue);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              laneDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof WillSet<?>) {
            if (((WillSet<?>) observer).isPreemptive() == preemptive) {
              try {
                newValue = ((WillSet<V>) observer).willSet(newValue);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  laneDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return new AbstractMap.SimpleImmutableEntry<Boolean, V>(complete, newValue);
    } finally {
      SwimContext.setLink(oldLink);
      SwimContext.setLane(oldLane);
    }
  }

  @SuppressWarnings("unchecked")
  public boolean dispatchDidSet(Link link, V newValue, V oldValue, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidSet<?>) {
        if (((DidSet<?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidSet<V>) observers).didSet(newValue, oldValue);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              laneDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DidSet<?>) {
            if (((DidSet<?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidSet<V>) observer).didSet(newValue, oldValue);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  laneDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
      SwimContext.setLane(oldLane);
    }
  }

  public V laneWillSet(V newValue) {
    return newValue;
  }

  public void laneDidSet(V newValue, V oldValue) {
    invalidate();
    reconcile(0); // TODO: debounce and track version
  }

  @Override
  public V get() {
    V state = this.valueForm.cast(this.laneBinding.get());
    if (state == null) {
      state = this.valueForm.unit();
    }
    return state;
  }

  @Override
  public V set(V newValue) {
    return this.laneBinding.set(this, newValue);
  }

  @Override
  public Outlet<? extends V> input() {
    return this.input;
  }

  @Override
  public void bindInput(Outlet<? extends V> input) {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = input;
    if (this.input != null) {
      this.input.bindOutput(this);
    }
  }

  @Override
  public void unbindInput() {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = null;
  }

  @Override
  public void disconnectInputs() {
    final Outlet<? extends V> input = this.input;
    if (input != null) {
      input.unbindOutput(this);
      this.input = null;
      input.disconnectInputs();
    }
  }

  @Override
  public Iterator<Inlet<? super V>> outputIterator() {
    return this.outputs != null ? Cursor.array(this.outputs) : Cursor.empty();
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindOutput(Inlet<? super V> output) {
    final Inlet<? super V>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    final Inlet<? super V>[] newOutputs = (Inlet<? super V>[]) new Inlet<?>[n + 1];
    if (n > 0) {
      System.arraycopy(oldOutputs, 0, newOutputs, 0, n);
    }
    newOutputs[n] = output;
    this.outputs = newOutputs;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void unbindOutput(Inlet<? super V> output) {
    final Inlet<? super V>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    for (int i = 0; i < n; i += 1) {
      if (oldOutputs[i] == output) {
        if (n > 1) {
          final Inlet<? super V>[] newOutputs = (Inlet<? super V>[]) new Inlet<?>[n - 1];
          System.arraycopy(oldOutputs, 0, newOutputs, 0, i);
          System.arraycopy(oldOutputs, i + 1, newOutputs, i, (n - 1) - i);
          this.outputs = newOutputs;
        } else {
          this.outputs = null;
        }
        break;
      }
    }
  }

  @Override
  public void unbindOutputs() {
    final Inlet<? super V>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super V> output = outputs[i];
        output.unbindInput();
      }
    }
  }

  @Override
  public void disconnectOutputs() {
    final Inlet<? super V>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super V> output = outputs[i];
        output.unbindInput();
        output.disconnectOutputs();
      }
    }
  }

  @Override
  public void invalidateOutput() {
    invalidate();
  }

  @Override
  public void invalidateInput() {
    invalidate();
  }

  public void invalidate() {
    if (this.version >= 0) {
      willInvalidate();
      this.version = -1;
      onInvalidate();
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        this.outputs[i].invalidateOutput();
      }
      didInvalidate();
    }
  }

  @Override
  public void reconcileOutput(int version) {
    reconcile(version);
  }

  @Override
  public void reconcileInput(int version) {
    reconcile(version);
  }

  public void reconcile(int version) {
    if (this.version < 0) {
      willReconcile(version);
      this.version = version;
      if (this.input != null) {
        this.input.reconcileInput(version);
      }
      onReconcile(version);
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        this.outputs[i].reconcileOutput(version);
      }
      didReconcile(version);
    }
  }

  protected void willInvalidate() {
    // stub
  }

  protected void onInvalidate() {
    // stub
  }

  protected void didInvalidate() {
    // stub
  }

  protected void willReconcile(int version) {
    // stub
  }

  protected void onReconcile(int version) {
    if (this.input != null) {
      final V value = this.input.get();
      set(value);
    }
  }

  protected void didReconcile(int version) {
    // stub
  }

  static final int RESIDENT = 1 << 0;
  static final int TRANSIENT = 1 << 1;
  static final int SIGNED = 1 << 2;
}
