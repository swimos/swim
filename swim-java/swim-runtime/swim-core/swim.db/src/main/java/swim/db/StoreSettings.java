// Copyright 2015-2022 Swim.inc
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

package swim.db;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class StoreSettings implements Debug {

  protected final int pageSplitSize;
  protected final int pageCacheSize;
  protected final long minCommitSize;
  protected final long maxCommitSize;
  protected final long minCommitInterval;
  protected final long maxCommitTime;
  protected final long minCompactSize;
  protected final long maxCompactSize;
  protected final long maxCompactTime;
  protected final long maxZoneSize;
  protected final double minZoneFill;
  protected final double minTreeFill;
  protected final int maxRetries;
  protected final int deleteDelay;

  public StoreSettings(int pageSplitSize, int pageCacheSize,
                       long minCommitSize, long maxCommitSize,
                       long minCommitInterval, long maxCommitTime,
                       long minCompactSize, long maxCompactSize,
                       long maxCompactTime, long maxZoneSize,
                       double minZoneFill, double minTreeFill,
                       int maxRetries, int deleteDelay) {
    this.pageSplitSize = pageSplitSize;
    this.pageCacheSize = pageCacheSize;
    this.minCommitSize = minCommitSize;
    this.maxCommitSize = maxCommitSize;
    this.minCommitInterval = minCommitInterval;
    this.maxCommitTime = maxCommitTime;
    this.minCompactSize = minCompactSize;
    this.maxCompactSize = maxCompactSize;
    this.maxCompactTime = maxCompactTime;
    this.maxZoneSize = maxZoneSize;
    this.minZoneFill = minZoneFill;
    this.minTreeFill = minTreeFill;
    this.maxRetries = maxRetries;
    this.deleteDelay = deleteDelay;
  }

  public final int pageSplitSize() {
    return this.pageSplitSize;
  }

  public StoreSettings pageSplitSize(int pageSplitSize) {
    return this.copy(pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final int pageCacheSize() {
    return this.pageCacheSize;
  }

  public StoreSettings pageCacheSize(int pageCacheSize) {
    return this.copy(this.pageSplitSize, pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final long minCommitSize() {
    return this.minCommitSize;
  }

  public StoreSettings minCommitSize(long minCommitSize) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final long maxCommitSize() {
    return this.maxCommitSize;
  }

  public StoreSettings maxCommitSize(long maxCommitSize) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final long minCommitInterval() {
    return this.minCommitInterval;
  }

  public StoreSettings minCommitInterval(long minCommitInterval) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final long maxCommitTime() {
    return this.maxCommitTime;
  }

  public StoreSettings maxCommitTime(long maxCommitTime) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final long minCompactSize() {
    return this.minCompactSize;
  }

  public StoreSettings minCompactSize(long minCompactSize) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final long maxCompactSize() {
    return this.maxCompactSize;
  }

  public StoreSettings maxCompactSize(long maxCompactSize) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final long maxCompactTime() {
    return this.maxCompactTime;
  }

  public StoreSettings maxCompactTime(long maxCompactTime) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final long maxZoneSize() {
    return this.maxZoneSize;
  }

  public StoreSettings maxZoneSize(long maxZoneSize) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final double minZoneFill() {
    return this.minZoneFill;
  }

  public StoreSettings minZoneFill(double minZoneFill) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     minZoneFill, this.minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final double minTreeFill() {
    return this.minTreeFill;
  }

  public StoreSettings minTreeFill(double minTreeFill) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, minTreeFill,
                     this.maxRetries, this.deleteDelay);
  }

  public final int maxRetries() {
    return this.maxRetries;
  }

  public StoreSettings maxRetries(int maxRetries) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     maxRetries, this.deleteDelay);
  }

  public final int deleteDelay() {
    return this.deleteDelay;
  }

  public StoreSettings deleteDelay(int deleteDelay) {
    return this.copy(this.pageSplitSize, this.pageCacheSize,
                     this.minCommitSize, this.maxCommitSize,
                     this.minCommitInterval, this.maxCommitTime,
                     this.minCompactSize, this.maxCompactSize,
                     this.maxCompactTime, this.maxZoneSize,
                     this.minZoneFill, this.minTreeFill,
                     this.maxRetries, deleteDelay);
  }

  protected StoreSettings copy(int pageSplitSize, int pageCacheSize,
                               long minCommitSize, long maxCommitSize,
                               long minCommitInterval, long maxCommitTime,
                               long minCompactSize, long maxCompactSize,
                               long maxCompactTime, long maxZoneSize,
                               double minZoneFill, double minTreeFill,
                               int maxRetries, int deleteDelay) {
    return new StoreSettings(pageSplitSize, pageCacheSize,
                             minCommitSize, maxCommitSize,
                             minCommitInterval, maxCommitTime,
                             minCompactSize, maxCompactSize,
                             maxCompactTime, maxZoneSize,
                             minZoneFill, minTreeFill,
                             maxRetries, deleteDelay);
  }

  protected boolean canEqual(Object other) {
    return other instanceof StoreSettings;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof StoreSettings) {
      final StoreSettings that = (StoreSettings) other;
      return that.canEqual(this) && this.pageSplitSize == that.pageSplitSize
          && this.pageCacheSize == that.pageCacheSize
          && this.minCommitSize == that.minCommitSize
          && this.maxCommitSize == that.maxCommitSize
          && this.minCommitInterval == that.minCommitInterval
          && this.maxCommitTime == that.maxCommitTime
          && this.minCompactSize == that.minCompactSize
          && this.maxCompactSize == that.maxCompactSize
          && this.maxCompactTime == that.maxCompactTime
          && this.maxZoneSize == that.maxZoneSize
          && this.minZoneFill == that.minZoneFill
          && this.minTreeFill == that.minTreeFill
          && this.maxRetries == that.maxRetries
          && this.deleteDelay == that.deleteDelay;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (StoreSettings.hashSeed == 0) {
      StoreSettings.hashSeed = Murmur3.seed(StoreSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        StoreSettings.hashSeed, this.pageSplitSize), this.pageCacheSize),
        Murmur3.hash(this.minCommitSize)), Murmur3.hash(this.maxCommitSize)),
        Murmur3.hash(this.minCommitInterval)), Murmur3.hash(this.maxCommitTime)),
        Murmur3.hash(this.minCompactSize)), Murmur3.hash(this.maxCompactSize)),
        Murmur3.hash(this.maxCompactTime)), Murmur3.hash(this.maxZoneSize)),
        Murmur3.hash(this.minZoneFill)), Murmur3.hash(this.minTreeFill)),
        this.maxRetries), this.deleteDelay));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("StoreSettings").write('.').write("standard").write('(').write(')')
                   .write('.').write("pageSplitSize").write('(').debug(this.pageSplitSize).write(')')
                   .write('.').write("pageCacheSize").write('(').debug(this.pageCacheSize).write(')')
                   .write('.').write("minCommitSize").write('(').debug(this.minCommitSize).write(')')
                   .write('.').write("maxCommitSize").write('(').debug(this.maxCommitSize).write(')')
                   .write('.').write("minCommitInterval").write('(').debug(this.minCommitInterval).write(')')
                   .write('.').write("maxCommitTime").write('(').debug(this.maxCommitTime).write(')')
                   .write('.').write("minCompactSize").write('(').debug(this.minCompactSize).write(')')
                   .write('.').write("maxCompactSize").write('(').debug(this.maxCompactSize).write(')')
                   .write('.').write("maxCompactTime").write('(').debug(this.maxCompactTime).write(')')
                   .write('.').write("maxZoneSize").write('(').debug(this.maxZoneSize).write(')')
                   .write('.').write("minZoneFill").write('(').debug(this.minZoneFill).write(')')
                   .write('.').write("minTreeFill").write('(').debug(this.minTreeFill).write(')')
                   .write('.').write("maxRetries").write('(').debug(this.maxRetries).write(')')
                   .write('.').write("deleteDelay").write('(').debug(this.deleteDelay).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static StoreSettings standard;

  public static StoreSettings standard() {
    if (StoreSettings.standard == null) {
      int pageSplitSize;
      try {
        pageSplitSize = Integer.parseInt(System.getProperty("swim.db.page.split.size"));
      } catch (NumberFormatException e) {
        pageSplitSize = 16 * 1024;
      }

      int pageCacheSize;
      try {
        pageCacheSize = Integer.parseInt(System.getProperty("swim.db.page.cache.size"));
      } catch (NumberFormatException e) {
        pageCacheSize = 4096;
      }

      long minCommitSize;
      try {
        minCommitSize = Long.parseLong(System.getProperty("swim.db.min.commit.size"));
      } catch (NumberFormatException e) {
        minCommitSize = 4 * 1024 * 1024;
      }

      long maxCommitSize;
      try {
        maxCommitSize = Long.parseLong(System.getProperty("swim.db.max.commit.size"));
      } catch (NumberFormatException e) {
        maxCommitSize = 16 * 1024 * 1024;
      }

      long minCommitInterval;
      try {
        minCommitInterval = Integer.parseInt(System.getProperty("swim.db.min.commit.interval"));
      } catch (NumberFormatException e) {
        minCommitInterval = 60 * 1000;
      }

      long maxCommitTime;
      try {
        maxCommitTime = Integer.parseInt(System.getProperty("swim.db.max.commit.time"));
      } catch (NumberFormatException e) {
        maxCommitTime = 5 * 1000;
      }

      long minCompactSize;
      try {
        minCompactSize = Long.parseLong(System.getProperty("swim.db.min.compact.size"));
      } catch (NumberFormatException e) {
        minCompactSize = 4 * 1024 * 1024;
      }

      long maxCompactSize;
      try {
        maxCompactSize = Long.parseLong(System.getProperty("swim.db.max.compact.size"));
      } catch (NumberFormatException e) {
        maxCompactSize = 16 * 1024 * 1024;
      }

      long maxCompactTime;
      try {
        maxCompactTime = Long.parseLong(System.getProperty("swim.db.max.compact.time"));
      } catch (NumberFormatException e) {
        maxCompactTime = 5 * 1000;
      }

      long maxZoneSize;
      try {
        maxZoneSize = Long.parseLong(System.getProperty("swim.db.max.zone.size"));
      } catch (NumberFormatException e) {
        maxZoneSize = 512 * 1024 * 1024;
      }

      double minZoneFill;
      try {
        minZoneFill = Double.parseDouble(System.getProperty("swim.db.min.zone.fill"));
      } catch (NumberFormatException | NullPointerException e) {
        minZoneFill = 0.5;
      }

      double minTreeFill;
      try {
        minTreeFill = Double.parseDouble(System.getProperty("swim.db.min.tree.fill"));
      } catch (NumberFormatException | NullPointerException e) {
        minTreeFill = 0.2;
      }

      int maxRetries;
      try {
        maxRetries = Integer.parseInt(System.getProperty("swim.db.max.retries"));
      } catch (NumberFormatException e) {
        maxRetries = 2;
      }

      int deleteDelay;
      try {
        deleteDelay = Integer.parseInt(System.getProperty("swim.db.delete.delay"));
      } catch (NumberFormatException e) {
        deleteDelay = 15 * 1000;
      }

      StoreSettings.standard = new StoreSettings(pageSplitSize, pageCacheSize,
                                                 minCommitSize, maxCommitSize,
                                                 minCommitInterval, maxCommitTime,
                                                 minCompactSize, maxCompactSize,
                                                 maxCompactTime, maxZoneSize,
                                                 minZoneFill, minTreeFill,
                                                 maxRetries, deleteDelay);
    }
    return StoreSettings.standard;
  }

  private static Form<StoreSettings> form;

  @Kind
  public static Form<StoreSettings> form() {
    if (StoreSettings.form == null) {
      StoreSettings.form = new StoreSettingsForm();
    }
    return StoreSettings.form;
  }

}

final class StoreSettingsForm extends Form<StoreSettings> {

  @Override
  public String tag() {
    return "store";
  }

  @Override
  public StoreSettings unit() {
    return StoreSettings.standard();
  }

  @Override
  public Class<?> type() {
    return StoreSettings.class;
  }

  @Override
  public Item mold(StoreSettings settings) {
    if (settings != null) {
      final StoreSettings standard = StoreSettings.standard();
      final Record record = Record.create().attr(this.tag());

      if (settings.pageSplitSize != standard.pageSplitSize) {
        record.slot("pageSplitSize", settings.pageSplitSize);
      }
      if (settings.pageCacheSize != standard.pageCacheSize) {
        record.slot("pageCacheSize", settings.pageCacheSize);
      }
      if (settings.minCommitSize != standard.minCommitSize) {
        record.slot("minCommitSize", settings.minCommitSize);
      }
      if (settings.maxCommitSize != standard.maxCommitSize) {
        record.slot("maxCommitSize", settings.maxCommitSize);
      }
      if (settings.minCommitInterval != standard.minCommitInterval) {
        record.slot("minCommitInterval", settings.minCommitInterval);
      }
      if (settings.maxCommitTime != standard.maxCommitTime) {
        record.slot("maxCommitTime", settings.maxCommitTime);
      }
      if (settings.minCompactSize != standard.minCompactSize) {
        record.slot("minCompactSize", settings.minCompactSize);
      }
      if (settings.maxCompactSize != standard.maxCompactSize) {
        record.slot("maxCompactSize", settings.maxCompactSize);
      }
      if (settings.maxCompactTime != standard.maxCompactTime) {
        record.slot("maxCompactTime", settings.maxCompactTime);
      }
      if (settings.maxZoneSize != standard.maxZoneSize) {
        record.slot("maxZoneSize", settings.maxZoneSize);
      }
      if (settings.minZoneFill != standard.minZoneFill) {
        record.slot("minZoneFill", settings.minZoneFill);
      }
      if (settings.minTreeFill != standard.minTreeFill) {
        record.slot("minTreeFill", settings.minTreeFill);
      }
      if (settings.maxRetries != standard.maxRetries) {
        record.slot("maxRetries", settings.maxRetries);
      }
      if (settings.deleteDelay != standard.deleteDelay) {
        record.slot("deleteDelay", settings.deleteDelay);
      }

      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public StoreSettings cast(Item item) {
    final Value value = item.toValue();
    if (value.getAttr(this.tag()).isDefined()) {
      final StoreSettings standard = StoreSettings.standard();
      final int pageSplitSize = value.get("pageSplitSize").intValue(standard.pageSplitSize);
      final int pageCacheSize = value.get("pageCacheSize").intValue(standard.pageCacheSize);
      final long minCommitSize = value.get("minCommitSize").longValue(standard.minCommitSize);
      final long maxCommitSize = value.get("maxCommitSize").longValue(standard.maxCommitSize);
      final long minCommitInterval = value.get("minCommitInterval").longValue(standard.minCommitInterval);
      final long maxCommitTime = value.get("maxCommitTime").longValue(standard.maxCommitTime);
      final long minCompactSize = value.get("minCompactSize").longValue(standard.minCompactSize);
      final long maxCompactSize = value.get("maxCompactSize").longValue(standard.maxCompactSize);
      final long maxCompactTime = value.get("maxCompactTime").longValue(standard.maxCompactTime);
      final long maxZoneSize = value.get("maxZoneSize").longValue(standard.maxZoneSize);
      final double minZoneFill = value.get("minZoneFill").doubleValue(standard.minZoneFill);
      final double minTreeFill = value.get("minTreeFill").doubleValue(standard.minTreeFill);
      final int maxRetries = value.get("maxRetries").intValue(standard.maxRetries);
      final int deleteDelay = value.get("deleteDelay").intValue(standard.deleteDelay);
      return new StoreSettings(pageSplitSize, pageCacheSize,
                               minCommitSize, maxCommitSize,
                               minCommitInterval, maxCommitTime,
                               minCompactSize, maxCompactSize,
                               maxCompactTime, maxZoneSize,
                               minZoneFill, minTreeFill,
                               maxRetries, deleteDelay);
    }
    return null;
  }

}
