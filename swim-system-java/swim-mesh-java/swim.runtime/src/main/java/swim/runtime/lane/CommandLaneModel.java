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

import swim.api.Link;
import swim.runtime.LaneRelay;
import swim.runtime.WarpBinding;
import swim.runtime.warp.WarpLaneModel;
import swim.structure.Form;
import swim.warp.CommandMessage;

public class CommandLaneModel extends WarpLaneModel<CommandLaneView<?>, CommandLaneUplink> {
  @Override
  public String laneType() {
    return "command";
  }

  @Override
  protected CommandLaneUplink createWarpUplink(WarpBinding link) {
    return new CommandLaneUplink(this, link, createUplinkAddress(link));
  }

  @Override
  protected void didOpenLaneView(CommandLaneView<?> view) {
    view.setLaneBinding(this);
  }

  @Override
  public void onCommand(CommandMessage message) {
    new CommandLaneRelayCommand(this, null, message).run();
  }
}

final class CommandLaneRelayCommand extends LaneRelay<CommandLaneModel, CommandLaneView<?>> {
  final Link link;
  final CommandMessage message;
  Form<?> valueForm;
  Object object;

  CommandLaneRelayCommand(CommandLaneModel model, Link link, CommandMessage message) {
    super(model, 3);
    this.link = link;
    this.message = message;
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
  }
}
