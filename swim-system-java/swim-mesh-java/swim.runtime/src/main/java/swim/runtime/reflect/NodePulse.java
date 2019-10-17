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

package swim.runtime.reflect;

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;

public class NodePulse extends Pulse {
  protected final AgentPulse agents;
  protected final WarpDownlinkPulse downlinks;
  protected final WarpUplinkPulse uplinks;

  public NodePulse(AgentPulse agents, WarpDownlinkPulse downlinks, WarpUplinkPulse uplinks) {
    this.agents = agents;
    this.downlinks = downlinks;
    this.uplinks = uplinks;
  }

  @Override
  public boolean isDefined() {
    return this.agents.isDefined() || this.downlinks.isDefined() || this.uplinks.isDefined();
  }

  public final AgentPulse agents() {
    return this.agents;
  }

  public final WarpDownlinkPulse downlinks() {
    return this.downlinks;
  }

  public final WarpUplinkPulse uplinks() {
    return this.uplinks;
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  private static Form<NodePulse> form;

  @Kind
  public static Form<NodePulse> form() {
    if (form == null) {
      form = new NodePulseForm();
    }
    return form;
  }
}

final class NodePulseForm extends Form<NodePulse> {
  @Override
  public Class<?> type() {
    return NodePulse.class;
  }

  @Override
  public Item mold(NodePulse pulse) {
    if (pulse != null) {
      final Record record = Record.create(3);
      if (pulse.agents.isDefined()) {
        record.slot("agents", pulse.agents.toValue());
      }
      if (pulse.downlinks.isDefined()) {
        record.slot("downlinks", pulse.downlinks.toValue());
      }
      if (pulse.uplinks.isDefined()) {
        record.slot("uplinks", pulse.uplinks.toValue());
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public NodePulse cast(Item item) {
    final Value value = item.toValue();
    final AgentPulse agents = value.get("agents").coerce(AgentPulse.form());
    final WarpDownlinkPulse downlinks = value.get("downlinks").coerce(WarpDownlinkPulse.form());
    final WarpUplinkPulse uplinks = value.get("uplinks").coerce(WarpUplinkPulse.form());
    return new NodePulse(agents, downlinks, uplinks);
  }
}
