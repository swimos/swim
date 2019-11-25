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

package swim.runtime.downlink;

import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.runtime.DownlinkRelay;
import swim.runtime.Push;
import swim.runtime.warp.SupplyDownlinkModem;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.EventMessage;

public class EventDownlinkModel extends SupplyDownlinkModem<EventDownlinkView<?>> {
  public EventDownlinkModel(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                            float prio, float rate, Value body) {
    super(meshUri, hostUri, nodeUri, laneUri, prio, rate, body);
  }

  @Override
  protected void pushDownEvent(Push<EventMessage> push) {
    final EventMessage message = push.message();
    onEvent(message);
    new EventDownlinkRelayOnEvent(this, message, push.cont()).run();
  }

  public void command(Value body) {
    pushUp(body);
  }
}

final class EventDownlinkRelayOnEvent extends DownlinkRelay<EventDownlinkModel, EventDownlinkView<?>> {
  final EventMessage message;
  final Cont<EventMessage> cont;
  Form<Object> valueForm;
  Object object;

  EventDownlinkRelayOnEvent(EventDownlinkModel model, EventMessage message, Cont<EventMessage> cont) {
    super(model, 3);
    this.message = message;
    this.cont = cont;
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(EventDownlinkView<?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillReceive(this.message);
      }
      return view.dispatchWillReceive(this.message.body(), preemptive);
    } else if (phase == 1) {
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.object = valueForm.cast(message.body());
        if (this.object == null) {
          this.object = valueForm.unit();
        }
      }
      if (preemptive) {
        ((EventDownlinkView<Object>) view).downlinkOnEvent(this.object);
      }
      return ((EventDownlinkView<Object>) view).dispatchOnEvent(this.object, preemptive);
    } else if (phase == 2) {
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
    this.model.cueDown();
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Conts.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
    }
  }
}
