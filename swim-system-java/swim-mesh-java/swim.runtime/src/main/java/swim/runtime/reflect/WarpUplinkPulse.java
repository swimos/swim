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

public class WarpUplinkPulse extends UplinkPulse implements WarpPulse {
  protected final long linkCount;
  protected final int eventRate;
  protected final long eventCount;
  protected final int commandRate;
  protected final long commandCount;

  public WarpUplinkPulse(long linkCount, int eventRate, long eventCount,
                         int commandRate, long commandCount) {
    this.linkCount = linkCount;
    this.eventRate = eventRate;
    this.eventCount = eventCount;
    this.commandRate = commandRate;
    this.commandCount = commandCount;
  }

  @Override
  public boolean isDefined() {
    return this.linkCount != 0L || this.eventRate != 0 || this.eventCount != 0L
        || this.commandRate != 0 || this.commandCount != 0L;
  }

  @Override
  public final long linkCount() {
    return this.linkCount;
  }

  @Override
  public final int eventRate() {
    return this.eventRate;
  }

  @Override
  public final long eventCount() {
    return this.eventCount;
  }

  @Override
  public final int commandRate() {
    return this.commandRate;
  }

  @Override
  public final long commandCount() {
    return this.commandCount;
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  private static Form<WarpUplinkPulse> form;

  @Kind
  public static Form<WarpUplinkPulse> form() {
    if (form == null) {
      form = new WarpUplinkPulseForm();
    }
    return form;
  }
}

final class WarpUplinkPulseForm extends Form<WarpUplinkPulse> {
  @Override
  public Class<?> type() {
    return WarpUplinkPulse.class;
  }

  @Override
  public Item mold(WarpUplinkPulse pulse) {
    if (pulse != null) {
      final Record record = Record.create(5);
      if (pulse.linkCount > 0L) {
        record.slot("linkCount", pulse.linkCount);
      }
      if (pulse.eventRate > 0) {
        record.slot("eventRate", pulse.eventRate);
      }
      if (pulse.eventCount > 0L) {
        record.slot("eventCount", pulse.eventCount);
      }
      if (pulse.commandRate > 0) {
        record.slot("commandRate", pulse.commandRate);
      }
      if (pulse.commandCount > 0L) {
        record.slot("commandCount", pulse.commandCount);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public WarpUplinkPulse cast(Item item) {
    final Value value = item.toValue();
    final long linkCount = value.get("linkCount").longValue(0L);
    final int eventRate = value.get("eventRate").intValue(0);
    final long eventCount = value.get("eventCount").longValue(0L);
    final int commandRate = value.get("commandRate").intValue(0);
    final long commandCount = value.get("commandCount").longValue(0L);
    return new WarpUplinkPulse(linkCount, eventRate, eventCount, commandRate, commandCount);
  }
}
