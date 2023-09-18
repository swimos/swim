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

import swim.api.Link;
import swim.concurrent.Cont;
import swim.structure.Form;
import swim.system.LaneRelay;
import swim.system.Push;
import swim.system.WarpBinding;
import swim.system.warp.WarpLaneModel;
import swim.warp.CommandMessage;

public class CommandLaneModel extends WarpLaneModel<CommandLaneView<?>, CommandLaneUplink> {

  public CommandLaneModel() {
    // nop
  }

  @Override
  public String laneType() {
    return "command";
  }

  @Override
  protected CommandLaneUplink createWarpUplink(WarpBinding link) {
    return new CommandLaneUplink(this, link, this.createUplinkAddress(link));
  }

  @Override
  protected void didOpenLaneView(CommandLaneView<?> view) {
    view.setLaneBinding(this);
  }

  @Override
  public void onCommand(Push<CommandMessage> push) {
    this.awaitStart();
    final CommandMessage message = push.message();
    new CommandLaneRelayCommand(this, null, message, push.cont()).run();
  }

}

final class CommandLaneRelayCommand extends LaneRelay<CommandLaneModel, CommandLaneView<?>> {

  final Link link;
  final CommandMessage message;
  final Cont<CommandMessage> cont;
  Form<?> valueForm;
  Object object;

  CommandLaneRelayCommand(CommandLaneModel model, Link link, CommandMessage message, Cont<CommandMessage> cont) {
    super(model, 3);
    this.link = link;
    this.message = message;
    this.cont = cont;
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(CommandLaneView<?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      final Form<?> valueForm = view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.object = valueForm.cast(this.message.body());
        if (this.object == null) {
          this.object = valueForm.unit();
        }
      }
      if (preemptive) {
        ((CommandLaneView<Object>) view).laneOnCommand(this.object);
      }
      return ((CommandLaneView<Object>) view).dispatchOnCommand(this.link, this.object, preemptive);
    } else if (phase == 2) {
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
    this.model.sendDown(this.message.body());
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
