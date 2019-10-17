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

public class WarpLanePulse extends LanePulse {
  protected final long laneCount;
  protected final WarpDownlinkPulse downlinkPulse;
  protected final WarpUplinkPulse uplinkPulse;

  public WarpLanePulse(long laneCount, WarpDownlinkPulse downlinkPulse, WarpUplinkPulse uplinkPulse) {
    this.laneCount = laneCount;
    this.downlinkPulse = downlinkPulse;
    this.uplinkPulse = uplinkPulse;
  }

  @Override
  public boolean isDefined() {
    return this.laneCount != 0L || this.downlinkPulse.isDefined() || this.uplinkPulse.isDefined();
  }

  @Override
  public final long laneCount() {
    return this.laneCount;
  }

  public final WarpDownlinkPulse downlinkPulse() {
    return this.downlinkPulse;
  }

  public final WarpUplinkPulse uplinkPulse() {
    return this.uplinkPulse;
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  private static Form<WarpLanePulse> form;

  @Kind
  public static Form<WarpLanePulse> form() {
    if (form == null) {
      form = new WarpLanePulseForm();
    }
    return form;
  }
}

final class WarpLanePulseForm extends Form<WarpLanePulse> {
  @Override
  public Class<?> type() {
    return WarpLanePulse.class;
  }

  @Override
  public Item mold(WarpLanePulse pulse) {
    if (pulse != null) {
      final Record record = Record.create(3);
      if (pulse.laneCount > 0L) {
        record.slot("laneCount", pulse.laneCount);
      }
      if (pulse.downlinkPulse.isDefined()) {
        record.slot("downlink", pulse.downlinkPulse.toValue());
      }
      if (pulse.uplinkPulse.isDefined()) {
        record.slot("uplink", pulse.uplinkPulse.toValue());
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public WarpLanePulse cast(Item item) {
    final Value value = item.toValue();
    final long laneCount = value.get("laneCount").longValue(0L);
    final WarpDownlinkPulse downlinkPulse = value.get("downlink").coerce(WarpDownlinkPulse.form());
    final WarpUplinkPulse uplinkPulse = value.get("uplink").coerce(WarpUplinkPulse.form());
    return new WarpLanePulse(laneCount, downlinkPulse, uplinkPulse);
  }
}
