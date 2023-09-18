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

package swim.system.reflect;

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;

public class PartPulse extends Pulse {

  protected final int hostCount;
  protected final long nodeCount;
  protected final AgentPulse agents;
  protected final WarpDownlinkPulse downlinks;
  protected final WarpUplinkPulse uplinks;
  protected final SystemPulse system;

  public PartPulse(int hostCount, long nodeCount, AgentPulse agents,
                   WarpDownlinkPulse downlinks, WarpUplinkPulse uplinks, SystemPulse system) {
    this.hostCount = hostCount;
    this.nodeCount = nodeCount;
    this.agents = agents;
    this.downlinks = downlinks;
    this.uplinks = uplinks;
    this.system = system;
  }

  @Override
  public boolean isDefined() {
    return this.hostCount != 0 || this.nodeCount != 0L || this.agents.isDefined()
        || this.downlinks.isDefined() || this.uplinks.isDefined() || this.system.isDefined();
  }

  public final int hostCount() {
    return this.hostCount;
  }

  public final long nodeCount() {
    return this.nodeCount;
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

  public SystemPulse system() {
    return this.system;
  }

  @Override
  public Value toValue() {
    return PartPulse.form().mold(this).toValue();
  }

  private static Form<PartPulse> form;

  @Kind
  public static Form<PartPulse> form() {
    if (PartPulse.form == null) {
      PartPulse.form = new PartPulseForm();
    }
    return PartPulse.form;
  }

}

final class PartPulseForm extends Form<PartPulse> {

  @Override
  public Class<?> type() {
    return PartPulse.class;
  }

  @Override
  public Item mold(PartPulse pulse) {
    if (pulse != null) {
      final Record record = Record.create(6);
      if (pulse.hostCount > 0) {
        record.slot("hostCount", pulse.hostCount);
      }
      if (pulse.nodeCount > 0L) {
        record.slot("nodeCount", pulse.nodeCount);
      }
      if (pulse.agents.isDefined()) {
        record.slot("agents", pulse.agents.toValue());
      }
      if (pulse.downlinks.isDefined()) {
        record.slot("downlinks", pulse.downlinks.toValue());
      }
      if (pulse.uplinks.isDefined()) {
        record.slot("uplinks", pulse.uplinks.toValue());
      }
      if (pulse.system != null && pulse.system.isDefined()) {
        record.slot("system", pulse.system.toValue());
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public PartPulse cast(Item item) {
    final Value value = item.toValue();
    final int hostCount = value.get("hostCount").intValue(0);
    final long nodeCount = value.get("nodeCount").longValue(0L);
    final AgentPulse agents = value.get("agents").coerce(AgentPulse.form());
    final WarpDownlinkPulse downlinks = value.get("downlinks").coerce(WarpDownlinkPulse.form());
    final WarpUplinkPulse uplinks = value.get("uplinks").coerce(WarpUplinkPulse.form());
    final SystemPulse system = value.get("system").coerce(SystemPulse.form());
    return new PartPulse(hostCount, nodeCount, agents, downlinks, uplinks, system);
  }

}
