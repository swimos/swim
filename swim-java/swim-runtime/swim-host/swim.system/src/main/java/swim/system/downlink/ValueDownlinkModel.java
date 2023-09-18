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

package swim.system.downlink;

import java.util.Map;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.structure.Form;
import swim.structure.Value;
import swim.system.DownlinkModel;
import swim.system.DownlinkRelay;
import swim.system.DownlinkView;
import swim.system.Push;
import swim.system.warp.DemandDownlinkModem;
import swim.uri.Uri;
import swim.warp.CommandMessage;
import swim.warp.EventMessage;

public class ValueDownlinkModel extends DemandDownlinkModem<ValueDownlinkView<?>> {

  protected volatile Value state;
  protected int flags;

  public ValueDownlinkModel(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                            float prio, float rate, Value body) {
    super(meshUri, hostUri, nodeUri, laneUri, prio, rate, body);
    this.state = Value.absent();
    this.flags = 0;
  }

  public final boolean isStateful() {
    return (this.flags & ValueDownlinkModel.STATEFUL) != 0;
  }

  public ValueDownlinkModel isStateful(boolean isStateful) {
    if (isStateful) {
      this.flags |= ValueDownlinkModel.STATEFUL;
    } else {
      this.flags &= ~ValueDownlinkModel.STATEFUL;
    }
    final Object views = DownlinkModel.VIEWS.get(this);
    if (views instanceof DownlinkView) {
      ((ValueDownlinkView<?>) views).didSetStateful(isStateful);
    } else if (views instanceof DownlinkView[]) {
      final DownlinkView[] viewArray = (DownlinkView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((ValueDownlinkView<?>) viewArray[i]).didSetStateful(isStateful);
      }
    }
    return this;
  }

  @Override
  protected void pushDownEvent(Push<EventMessage> push) {
    final EventMessage message = push.message();
    final Value value = message.body();
    new ValueDownlinkRelaySet(this, message, push.cont(), value).run();
  }

  @Override
  protected Push<CommandMessage> nextUpCue() {
    final Uri hostUri = hostUri();
    final Uri nodeUri = nodeUri();
    final Uri laneUri = laneUri();
    final float prio = prio();
    final Value body = ValueDownlinkModel.STATE.get(this);
    final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
    return new Push<CommandMessage>(Uri.empty(), hostUri, nodeUri, laneUri,
                                    prio, null, message, null);
  }

  @Override
  protected void didAddDownlink(ValueDownlinkView<?> view) {
    super.didAddDownlink(view);
    if (DownlinkModel.VIEWS.get(this) instanceof DownlinkView) {
      this.isStateful(((ValueDownlinkView<?>) view).isStateful());
    }
  }

  public Value get() {
    return ValueDownlinkModel.STATE.get(this);
  }

  @SuppressWarnings("unchecked")
  public <V> V set(ValueDownlinkView<V> view, V newObject) {
    final Form<V> valueForm = view.valueForm;
    final Value newValue = valueForm.mold(newObject).toValue();
    final ValueDownlinkRelaySet relay = new ValueDownlinkRelaySet(this, view.stage(), newValue);
    relay.valueForm = (Form<Object>) valueForm;
    relay.oldObject = newObject;
    relay.newObject = newObject;
    relay.run();
    if (relay.isDone()) {
      if (relay.valueForm != valueForm && valueForm != null) {
        relay.oldObject = valueForm.cast(relay.oldValue);
        if (relay.oldObject == null) {
          relay.oldObject = valueForm.unit();
        }
      }
      return (V) relay.oldObject;
    } else {
      return null;
    }
  }

  public Value setValue(Value newValue) {
    final ValueDownlinkRelaySet relay = new ValueDownlinkRelaySet(this, newValue);
    relay.run();
    if (relay.isDone()) {
      return relay.oldValue;
    } else {
      return Value.absent();
    }
  }

  protected Value willSet(Value newValue) {
    return newValue;
  }

  protected void didSet(Value newValue, Value oldValue) {
    // hook
  }

  protected static final int STATEFUL = 1 << 0;

  static final AtomicReferenceFieldUpdater<ValueDownlinkModel, Value> STATE =
      AtomicReferenceFieldUpdater.newUpdater(ValueDownlinkModel.class, Value.class, "state");

}

final class ValueDownlinkRelaySet extends DownlinkRelay<ValueDownlinkModel, ValueDownlinkView<?>> {

  final EventMessage message;
  final Cont<EventMessage> cont;
  Form<Object> valueForm;
  Value oldValue;
  Value newValue;
  Object oldObject;
  Object newObject;

  ValueDownlinkRelaySet(ValueDownlinkModel model, EventMessage message, Cont<EventMessage> cont, Value newValue) {
    super(model, 4);
    this.message = message;
    this.cont = cont;
    this.oldValue = newValue;
    this.newValue = newValue;
  }

  ValueDownlinkRelaySet(ValueDownlinkModel model, Stage stage, Value newValue) {
    super(model, 1, 3, stage);
    this.message = null;
    this.cont = null;
    this.oldValue = newValue;
    this.newValue = newValue;
  }

  ValueDownlinkRelaySet(ValueDownlinkModel model, Value newValue) {
    super(model, 1, 3, null);
    this.message = null;
    this.cont = null;
    this.oldValue = newValue;
    this.newValue = newValue;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 1) {
      this.newValue = this.model.willSet(this.newValue);
    } else if (phase == 2) {
      if (this.model.isStateful()) {
        do {
          this.oldValue = ValueDownlinkModel.STATE.get(this.model);
        } while (this.oldValue != this.newValue && !ValueDownlinkModel.STATE.compareAndSet(this.model, this.oldValue, this.newValue));
      }
      this.model.didSet(this.newValue, this.oldValue);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(ValueDownlinkView<?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillReceive(this.message);
      }
      return view.dispatchWillReceive(this.message.body(), preemptive);
    } else if (phase == 1) {
      this.newValue = view.downlinkWillSetValue(this.newValue);
      final Form<Object> valueForm = (Form<Object>) view.valueForm();
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.oldObject = valueForm.cast(this.newValue);
        if (this.oldObject == null) {
          this.oldObject = valueForm.unit();
        }
        this.newObject = valueForm.cast(this.newValue);
      }
      if (preemptive) {
        this.newObject = ((ValueDownlinkView<Object>) view).downlinkWillSet(this.newObject);
      }
      final Map.Entry<Boolean, Object> result = ((ValueDownlinkView<Object>) view).dispatchWillSet(this.oldObject, preemptive);
      this.newObject = result.getValue();
      if (this.oldObject != result.getValue()) {
        this.oldObject = this.newObject; //FIXME: Is this right?
        this.newObject = result.getValue();
        this.newValue = valueForm.mold(this.newObject).toValue();
      }
      return result.getKey();
    } else if (phase == 2) {
      view.downlinkDidSetValue(this.newValue, this.oldValue);
      final Form<Object> valueForm = (Form<Object>) view.valueForm();
      if (valueForm != null) {
        this.valueForm = valueForm;
        this.oldObject = valueForm.cast(this.oldValue);
        if (this.oldObject == null) {
          this.oldObject = valueForm.unit();
        }
        this.newObject = valueForm.cast(this.newValue);
        if (this.newObject == null) {
          this.newObject = valueForm.unit();
        }
      }
      if (preemptive) {
        ((ValueDownlinkView<Object>) view).downlinkDidSet(this.newObject, this.oldObject);
      }
      return ((ValueDownlinkView<Object>) view).dispatchDidSet(this.newObject, this.oldObject, preemptive);
    } else if (phase == 3) {
      if (preemptive) {
        view.downlinkDidReceive(this.message);
      }
      return view.dispatchDidReceive(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    if (this.message != null) {
      this.model.cueDown();
    } else {
      this.model.cueUp();
    }
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Cont.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
    }
  }

}
