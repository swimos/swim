// Copyright 2015-2023 Swim.inc
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

public class SystemPulse extends Pulse {

  protected final int cpuUsage;
  protected final int cpuTotal;
  protected final long memUsage;
  protected final long memTotal;
  protected final long diskUsage;
  protected final long diskTotal;
  protected final long startTime;

  public SystemPulse(int cpuUsage, int cpuTotal, long memUsage, long memTotal,
                     long diskUsage, long diskTotal, long startTime) {
    this.cpuUsage = cpuUsage;
    this.cpuTotal = cpuTotal;
    this.memUsage = memUsage;
    this.memTotal = memTotal;
    this.diskUsage = diskUsage;
    this.diskTotal = diskTotal;
    this.startTime = startTime;
  }

  @Override
  public boolean isDefined() {
    return this.cpuUsage != 0L || this.cpuTotal != 0 || this.memTotal != 0L
        || this.memTotal != 0 || this.diskUsage != 0L || this.diskTotal != 0L
        || this.startTime != 0;
  }

  public int cpuUsage() {
    return this.cpuUsage;
  }

  public int cpuTotal() {
    return this.cpuTotal;
  }

  public long memUsage() {
    return this.memUsage;
  }

  public long memTotal() {
    return this.memTotal;
  }

  public long diskUsage() {
    return this.diskUsage;
  }

  public long diskTotal() {
    return this.diskTotal;
  }

  public long startTime() {
    return this.startTime;
  }

  @Override
  public Value toValue() {
    return SystemPulse.form().mold(this).toValue();
  }

  private static Form<SystemPulse> form;

  @Kind
  public static Form<SystemPulse> form() {
    if (SystemPulse.form == null) {
      SystemPulse.form = new SystemPulseForm();
    }
    return SystemPulse.form;
  }

  private static SystemPulse empty;

  public static SystemPulse empty() {
    if (SystemPulse.empty != null) {
      SystemPulse.empty = new SystemPulse(0, 0, 0L, 0L, 0L, 0L, 0L);
    }
    return SystemPulse.empty;
  }

}

final class SystemPulseForm extends Form<SystemPulse> {

  @Override
  public Class<?> type() {
    return SystemPulse.class;
  }

  @Override
  public Item mold(SystemPulse pulse) {
    if (pulse != null) {
      final Record record = Record.create(7);
      if (pulse.cpuUsage > 0L) {
        record.slot("cpuUsage", pulse.cpuUsage);
      }
      if (pulse.cpuTotal > 0) {
        record.slot("cpuTotal", pulse.cpuTotal);
      }
      if (pulse.memUsage > 0L) {
        record.slot("memUsage", pulse.memUsage);
      }
      if (pulse.memTotal > 0) {
        record.slot("memTotal", pulse.memTotal);
      }
      if (pulse.diskUsage > 0L) {
        record.slot("diskUsage", pulse.diskUsage);
      }
      if (pulse.diskTotal > 0L) {
        record.slot("diskTotal", pulse.diskTotal);
      }
      if (pulse.startTime > 0L) {
        record.slot("startTime", pulse.startTime);
      }
      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public SystemPulse cast(Item item) {
    final Value value = item.toValue();
    final int cpuUsage = value.get("cpuUsage").intValue(0);
    final int cpuTotal = value.get("cpuUsage").intValue(0);
    final long memUsage = value.get("memUsage").longValue(0L);
    final long memTotal = value.get("memTotal").longValue(0L);
    final long diskUsage = value.get("diskUsage").longValue(0L);
    final long diskTotal = value.get("diskTotal").longValue(0L);
    final long startTime = value.get("startTime").longValue(0L);
    return new SystemPulse(cpuUsage, cpuTotal, memUsage, memTotal, diskUsage, diskTotal, startTime);
  }

}
