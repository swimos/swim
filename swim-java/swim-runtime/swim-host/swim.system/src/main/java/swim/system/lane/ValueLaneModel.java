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

package swim.system.lane;

import java.util.Map;
import swim.api.Link;
import swim.api.data.ValueData;
import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.structure.Form;
import swim.structure.Value;
import swim.system.LaneModel;
import swim.system.LaneRelay;
import swim.system.LaneView;
import swim.system.Push;
import swim.system.WarpBinding;
import swim.system.warp.WarpLaneModel;
import swim.warp.CommandMessage;

public class ValueLaneModel extends WarpLaneModel<ValueLaneView<?>, ValueLaneUplink> {

  protected int flags;
  protected ValueData<Value> data;

  ValueLaneModel(int flags) {
    this.flags = flags;
    this.data = null;
  }

  public ValueLaneModel() {
    this(0);
  }

  @Override
  public String laneType() {
    return "value";
  }

  @Override
  protected ValueLaneUplink createWarpUplink(WarpBinding link) {
    return new ValueLaneUplink(this, link, createUplinkAddress(link));
  }

  @Override
  protected void didOpenLaneView(ValueLaneView<?> view) {
    view.setLaneBinding(this);
  }

  @Override
  public void onCommand(Push<CommandMessage> push) {
    this.awaitStart();
    final CommandMessage message = push.message();
    final Value value = message.body();
    new ValueLaneRelaySet(this, message, push.cont(), value).run();
  }

  public final boolean isResident() {
    return (this.flags & ValueLaneModel.RESIDENT) != 0;
  }

  public ValueLaneModel isResident(boolean isResident) {
    if (this.data != null) {
      this.data.isResident(isResident);
    }

    if (isResident) {
      this.flags |= ValueLaneModel.RESIDENT;
    } else {
      this.flags &= ~ValueLaneModel.RESIDENT;
    }

    final Object views = LaneModel.VIEWS.get(this);
    if (views instanceof ValueLaneView<?>) {
      ((ValueLaneView<?>) views).didSetResident(isResident);
    } else if (views instanceof LaneView[]) {
      for (LaneView aViewArray : (LaneView[]) views) {
        ((ValueLaneView<?>) aViewArray).didSetResident(isResident);
      }
    }

    return this;
  }

  public final boolean isTransient() {
    return (this.flags & ValueLaneModel.TRANSIENT) != 0;
  }

  public ValueLaneModel isTransient(boolean isTransient) {
    if (this.data != null) {
      this.data.isTransient(isTransient);
    }
    if (isTransient) {
      this.flags |= ValueLaneModel.TRANSIENT;
    } else {
      this.flags &= ~ValueLaneModel.TRANSIENT;
    }

    final Object views = LaneModel.VIEWS.get(this);
    if (views instanceof ValueLaneView<?>) {
      ((ValueLaneView<?>) views).didSetTransient(isTransient);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((ValueLaneView<?>) viewArray[i]).didSetTransient(isTransient);
      }
    }

    return this;
  }

  public Value get() {
    return this.data.get();
  }

  @SuppressWarnings("unchecked")
  public <V> V set(ValueLaneView<V> view, V newObject) {
    final Form<V> valueForm = view.valueForm;
    final Value newValue = valueForm.mold(newObject).toValue();
    final ValueLaneRelaySet relay = new ValueLaneRelaySet(this, this.stage(), newValue);
    relay.valueForm = (Form<Object>) valueForm;
    relay.oldObject = newObject;
    relay.newObject = newObject;
    relay.run();

    if (relay.valueForm != valueForm && valueForm != null) {
      relay.oldObject = valueForm.cast(relay.oldValue);
      if (relay.oldObject == null) {
        relay.oldObject = valueForm.unit();
      }
    }

    return (V) relay.oldObject;
  }

  protected void openStore() {
    this.data = this.laneContext.store().valueData(this.laneUri().toString())
                                        .isTransient(this.isTransient())
                                        .isResident(this.isResident());
  }

  @Override
  protected void willLoad() {
    this.openStore();
    super.willLoad();
  }

  static final int RESIDENT = 1 << 0;
  static final int TRANSIENT = 1 << 1;

}

final class ValueLaneRelaySet extends LaneRelay<ValueLaneModel, ValueLaneView<?>> {

  final Link link;
  final CommandMessage message;
  final Cont<CommandMessage> cont;
  Form<Object> valueForm;
  Value oldValue;
  Object oldObject;
  Value newValue;
  Object newObject;

  ValueLaneRelaySet(ValueLaneModel model, CommandMessage message, Cont<CommandMessage> cont, Value newValue) {
    super(model, 4);
    this.link = null;
    this.message = message;
    this.cont = cont;
    this.newValue = newValue;
  }

  ValueLaneRelaySet(ValueLaneModel model, Link link, Value newValue) {
    super(model, 1, 3, null);
    this.link = link;
    this.message = null;
    this.cont = null;
    this.newValue = newValue;
  }

  ValueLaneRelaySet(ValueLaneModel model, Stage stage, Value newValue) {
    super(model, 1, 3, stage);
    this.link = null;
    this.message = null;
    this.cont = null;
    this.newValue = newValue;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      this.oldValue = this.model.data.set(this.newValue);
      if (this.valueForm != null) {
        this.oldObject = this.valueForm.cast(this.oldValue);
        if (this.oldObject == null) {
          this.oldObject = this.valueForm.unit();
        }
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(ValueLaneView<?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.oldObject = valueForm.cast(this.newValue);
        if (this.oldObject == null) {
          this.oldObject = valueForm.unit();
        }
      }
      if (preemptive) {
        this.newObject = ((ValueLaneView<Object>) view).laneWillSet(this.oldObject);
      }
      final Map.Entry<Boolean, Object> result = ((ValueLaneView<Object>) view).dispatchWillSet(this.link, this.oldObject, preemptive);
      this.newObject = result.getValue();
      if (this.oldObject != this.newObject) {
        this.newValue = valueForm.mold(this.newObject).toValue();
      }
      return result.getKey();
    } else if (phase == 2) {
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
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
        ((ValueLaneView<Object>) view).laneDidSet(this.newObject, this.oldObject);
      }
      return ((ValueLaneView<Object>) view).dispatchDidSet(this.link, this.newObject, this.oldObject, preemptive);
    } else if (phase == 3) {
      if (preemptive) {
        view.laneDidCommand(this.message);
      }
      return view.dispatchDidCommand(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    this.model.cueDown();
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
