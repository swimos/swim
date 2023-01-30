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

import com.sun.management.OperatingSystemMXBean;
import java.io.IOException;
import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.nio.file.FileStore;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.atomic.AtomicLong;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.system.Metric;

public class SystemPulse extends Pulse {

  protected final int cpuUsage;
  protected final int cpuTotal;
  protected final long memUsage;
  protected final long memTotal;
  protected final long diskUsage;
  protected final long diskTotal;
  protected final long startTime;

  private static final OperatingSystemMXBean OS_MX_BEAN =
      (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
  private static final RuntimeMXBean RT_MX_BEAN = ManagementFactory.getRuntimeMXBean();

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

  private static SystemPulse latestPulse;
  private static AtomicLong lastReportTime = new AtomicLong(0L);

  public static SystemPulse latest() {
    do {
      final long newReportTime = System.currentTimeMillis();
      final long oldReportTime = lastReportTime.get();
      final long dt = newReportTime - oldReportTime;
      if (dt >= Metric.REPORT_INTERVAL) {
        if (lastReportTime.compareAndSet(oldReportTime, newReportTime)) {
          try {
            latestPulse = latestPulse();
          } catch (Throwable error) {
            throw error;
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
    return latestPulse;
  }

  private static SystemPulse latestPulse() {
    final int cpuTotal = 100 * OS_MX_BEAN.getAvailableProcessors();
    final int cpuUsage = (int) Math.round(OS_MX_BEAN.getProcessCpuLoad() * cpuTotal);

    final long memTotal = OS_MX_BEAN.getTotalPhysicalMemorySize();
    final long memUsage = memTotal - OS_MX_BEAN.getFreePhysicalMemorySize();

    long diskTotal = 0L;
    long diskFree = 0L;
    try {
      for (Path root : FileSystems.getDefault().getRootDirectories()) {
        final FileStore store = Files.getFileStore(root);
        diskTotal += store.getTotalSpace();
        diskFree += store.getUsableSpace();
      }
    } catch (IOException swallow) {
      // nop
    }
    final long diskUsage = diskTotal - diskFree;
    final long startTime = RT_MX_BEAN.getStartTime();
    return new SystemPulse(cpuUsage, cpuTotal, memUsage, memTotal, diskUsage, diskTotal, startTime);
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
