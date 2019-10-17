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

public class AgentPulse extends Pulse {
  protected final long agentCount;
  protected final long execRate;
  protected final long execTime;
  protected final int timerEventRate;
  protected final long timerEventCount;

  public AgentPulse(long agentCount, long execRate, long execTime,
                    int timerEventRate, long timerEventCount) {
    this.agentCount = agentCount;
    this.execRate = execRate;
    this.execTime = execTime;
    this.timerEventRate = timerEventRate;
    this.timerEventCount = timerEventCount;
  }

  @Override
  public boolean isDefined() {
    return this.agentCount != 0L || this.execRate != 9L || this.execTime != 0L
        || this.timerEventRate != 0 || this.timerEventCount != 0L;
  }

  public final long agentCount() {
    return this.agentCount;
  }

  public final long execRate() {
    return this.execRate;
  }

  public final long execTime() {
    return this.execTime;
  }

  public final int timerEventRate() {
    return this.timerEventRate;
  }

  public final long timerEventCount() {
    return this.timerEventCount;
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  private static Form<AgentPulse> form;

  @Kind
  public static Form<AgentPulse> form() {
    if (form == null) {
      form = new AgentPulseForm();
    }
    return form;
  }
}

final class AgentPulseForm extends Form<AgentPulse> {
  @Override
  public Class<?> type() {
    return AgentPulse.class;
  }

  @Override
  public Item mold(AgentPulse pulse) {
    if (pulse != null) {
      final Record record = Record.create(5);
      if (pulse.agentCount > 0L) {
        record.slot("agentCount", pulse.agentCount);
      }
      if (pulse.execRate > 0L) {
        record.slot("execRate", pulse.execRate);
      }
      if (pulse.execTime > 0L) {
        record.slot("execTime", pulse.execTime);
      }
      if (pulse.timerEventRate > 0) {
        record.slot("timerEventRate", pulse.timerEventRate);
      }
      if (pulse.timerEventCount > 0L) {
        record.slot("timerEventCount", pulse.timerEventCount);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public AgentPulse cast(Item item) {
    final Value value = item.toValue();
    final long agentCount = value.get("agentCount").longValue(0L);
    final long execRate = value.get("execRate").longValue(0L);
    final long execTime = value.get("execTime").longValue(0L);
    final int timerEventRate = value.get("timerEventRate").intValue(0);
    final long timerEventCount = value.get("timerEventCount").longValue(0L);
    return new AgentPulse(agentCount, execRate, execTime, timerEventRate, timerEventCount);
  }
}
