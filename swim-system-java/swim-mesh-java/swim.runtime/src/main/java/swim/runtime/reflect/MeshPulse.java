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

public class MeshPulse extends Pulse {
  protected final int partCount;
  protected final int hostCount;
  protected final long nodeCount;
  protected final AgentPulse agents;
  protected final WarpDownlinkPulse downlinks;
  protected final WarpUplinkPulse uplinks;

  public MeshPulse(int partCount, int hostCount, long nodeCount, AgentPulse agents,
                   WarpDownlinkPulse downlinks, WarpUplinkPulse uplinks) {
    this.partCount = partCount;
    this.hostCount = hostCount;
    this.nodeCount = nodeCount;
    this.agents = agents;
    this.downlinks = downlinks;
    this.uplinks = uplinks;
  }

  @Override
  public boolean isDefined() {
    return this.partCount != 0 || this.hostCount != 0 || this.nodeCount != 0L
        || this.agents.isDefined() || this.downlinks.isDefined() || this.uplinks.isDefined();
  }

  public final int partCount() {
    return this.partCount;
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

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  private static Form<MeshPulse> form;

  @Kind
  public static Form<MeshPulse> form() {
    if (form == null) {
      form = new MeshPulseForm();
    }
    return form;
  }
}

final class MeshPulseForm extends Form<MeshPulse> {
  @Override
  public Class<?> type() {
    return MeshPulse.class;
  }

  @Override
  public Item mold(MeshPulse pulse) {
    if (pulse != null) {
      final Record record = Record.create(6);
      if (pulse.partCount > 0) {
        record.slot("partCount", pulse.partCount);
      }
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
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public MeshPulse cast(Item item) {
    final Value value = item.toValue();
    final int partCount = value.get("partCount").intValue(0);
    final int hostCount = value.get("hostCount").intValue(0);
    final long nodeCount = value.get("nodeCount").longValue(0L);
    final AgentPulse agents = value.get("agents").coerce(AgentPulse.form());
    final WarpDownlinkPulse downlinks = value.get("downlinks").coerce(WarpDownlinkPulse.form());
    final WarpUplinkPulse uplinks = value.get("uplinks").coerce(WarpUplinkPulse.form());
    return new MeshPulse(partCount, hostCount, nodeCount, agents, downlinks, uplinks);
  }
}
