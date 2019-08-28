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
  protected final int autoCommitInterval;
  protected final long autoCommitSize;
  protected final long minCompactSize;
  protected final long maxZoneSize;
  protected final double minZoneFill;
  protected final double minTreeFill;
  protected final int maxRetries;
  protected final int deleteDelay;

  protected final int storeOpenTimeout;
  protected final int storeCloseTimeout;

  protected final int zoneOpenTimeout;
  protected final int zoneCloseTimeout;

  protected final int databaseOpenTimeout;
  protected final int databaseCloseTimeout;
  protected final int databaseCommitTimeout;
  protected final int databaseCompactTimeout;

  protected final int pageLoadTimeout;
  protected final int treeLoadTimeout;

  public StoreSettings(int pageSplitSize, int pageCacheSize, int autoCommitInterval,
                       long autoCommitSize, long minCompactSize, long maxZoneSize,
                       double minZoneFill, double minTreeFill, int maxRetries,
                       int deleteDelay, int storeOpenTimeout, int storeCloseTimeout,
                       int zoneOpenTimeout, int zoneCloseTimeout,
                       int databaseOpenTimeout, int databaseCloseTimeout,
                       int databaseCommitTimeout, int databaseCompactTimeout,
                       int pageLoadTimeout, int treeLoadTimeout) {
    this.pageSplitSize = pageSplitSize;
    this.pageCacheSize = pageCacheSize;
    this.autoCommitInterval = autoCommitInterval;
    this.autoCommitSize = autoCommitSize;
    this.minCompactSize = minCompactSize;
    this.maxZoneSize = maxZoneSize;
    this.minZoneFill = minZoneFill;
    this.minTreeFill = minTreeFill;
    this.maxRetries = maxRetries;
    this.deleteDelay = deleteDelay;

    this.storeOpenTimeout = storeOpenTimeout;
    this.storeCloseTimeout = storeCloseTimeout;

    this.zoneOpenTimeout = zoneOpenTimeout;
    this.zoneCloseTimeout = zoneCloseTimeout;

    this.databaseOpenTimeout = databaseOpenTimeout;
    this.databaseCloseTimeout = databaseCloseTimeout;
    this.databaseCommitTimeout = databaseCommitTimeout;
    this.databaseCompactTimeout = databaseCompactTimeout;

    this.pageLoadTimeout = pageLoadTimeout;
    this.treeLoadTimeout = treeLoadTimeout;
  }

  public final int pageSplitSize() {
    return this.pageSplitSize;
  }

  public StoreSettings pageSplitSize(int pageSplitSize) {
    return copy(pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int pageCacheSize() {
    return this.pageCacheSize;
  }

  public StoreSettings pageCacheSize(int pageCacheSize) {
    return copy(this.pageSplitSize, pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int autoCommitInterval() {
    return this.autoCommitInterval;
  }

  public StoreSettings autoCommitInterval(int autoCommitInterval) {
    return copy(this.pageSplitSize, this.pageCacheSize, autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final long autoCommitSize() {
    return this.autoCommitSize;
  }

  public StoreSettings autoCommitSize(long autoCommitSize) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final long minCompactSize() {
    return this.minCompactSize;
  }

  public StoreSettings minCompactSize(long minCompactSize) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final long maxZoneSize() {
    return this.maxZoneSize;
  }

  public StoreSettings maxZoneSize(long maxZoneSize) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final double minZoneFill() {
    return this.minZoneFill;
  }

  public StoreSettings minZoneFill(double minZoneFill) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final double minTreeFill() {
    return this.minTreeFill;
  }

  public StoreSettings minTreeFill(double minTreeFill) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int maxRetries() {
    return this.maxRetries;
  }

  public StoreSettings maxRetries(int maxRetries) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int deleteDelay() {
    return this.deleteDelay;
  }

  public StoreSettings deleteDelay(int deleteDelay) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int storeOpenTimeout() {
    return this.storeOpenTimeout;
  }

  public StoreSettings storeOpenTimeout(int storeOpenTimeout) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int storeCloseTimeout() {
    return this.storeCloseTimeout;
  }

  public StoreSettings storeCloseTimeout(int storeCloseTimeout) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int zoneOpenTimeout() {
    return this.zoneOpenTimeout;
  }

  public StoreSettings zoneOpenTimeout(int zoneOpenTimeout) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int zoneCloseTimeout() {
    return this.zoneCloseTimeout;
  }

  public StoreSettings zoneCloseTimeout(int zoneCloseTimeout) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int databaseOpenTimeout() {
    return this.databaseOpenTimeout;
  }

  public StoreSettings databaseOpenTimeout(int databaseOpenTimeout) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int databaseCloseTimeout() {
    return this.databaseCloseTimeout;
  }

  public StoreSettings databaseCloseTimeout(int databaseCloseTimeout) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int databaseCommitTimeout() {
    return this.databaseCommitTimeout;
  }

  public StoreSettings databaseCommitTimeout(int databaseCommitTimeout) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int databaseCompactTimeout() {
    return this.databaseCompactTimeout;
  }

  public StoreSettings databaseCompactTimeout(int databaseCompactTimeout) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, databaseCompactTimeout,
                this.pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int pageLoadTimeout() {
    return this.pageLoadTimeout;
  }

  public StoreSettings pageLoadTimeout(int pageLoadTimeout) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                pageLoadTimeout, this.treeLoadTimeout);
  }

  public final int treeLoadTimeout() {
    return this.treeLoadTimeout;
  }

  public StoreSettings treeLoadTimeout(int treeLoadTimeout) {
    return copy(this.pageSplitSize, this.pageCacheSize, this.autoCommitInterval,
                this.autoCommitSize, this.minCompactSize, this.maxZoneSize,
                this.minZoneFill, this.minTreeFill, this.maxRetries,
                this.deleteDelay, this.storeOpenTimeout, this.storeCloseTimeout,
                this.zoneOpenTimeout, this.zoneCloseTimeout,
                this.databaseOpenTimeout, this.databaseCloseTimeout,
                this.databaseCommitTimeout, this.databaseCompactTimeout,
                this.pageLoadTimeout, treeLoadTimeout);
  }

  protected StoreSettings copy(int pageSplitSize, int pageCacheSize, int autoCommitInterval,
                               long autoCommitSize, long minCompactSize, long maxZoneSize,
                               double minZoneFill, double minTreeFill, int maxRetries,
                               int deleteDelay, int storeOpenTimeout, int storeCloseTimeout,
                               int zoneOpenTimeout, int zoneCloseTimeout,
                               int databaseOpenTimeout, int databaseCloseTimeout,
                               int databaseCommitTimeout, int databaseCompactTimeout,
                               int pageLoadTimeout, int treeLoadTimeout) {
    return new StoreSettings(pageSplitSize, pageCacheSize, autoCommitInterval,
                             autoCommitSize, minCompactSize, maxZoneSize,
                             minZoneFill, minTreeFill, maxRetries,
                             deleteDelay, storeOpenTimeout, storeCloseTimeout,
                             zoneOpenTimeout, zoneCloseTimeout,
                             databaseOpenTimeout, databaseCloseTimeout,
                             databaseCommitTimeout, databaseCompactTimeout,
                             pageLoadTimeout, treeLoadTimeout);
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
          && this.autoCommitInterval == that.autoCommitInterval
          && this.autoCommitSize == that.autoCommitSize
          && this.minCompactSize == that.minCompactSize
          && this.maxZoneSize == that.maxZoneSize
          && this.minZoneFill == that.minZoneFill
          && this.minTreeFill == that.minTreeFill
          && this.maxRetries == that.maxRetries
          && this.deleteDelay == that.deleteDelay
          && this.storeOpenTimeout == that.storeOpenTimeout
          && this.storeCloseTimeout == that.storeCloseTimeout
          && this.zoneOpenTimeout == that.zoneOpenTimeout
          && this.zoneCloseTimeout == that.zoneCloseTimeout
          && this.databaseOpenTimeout == that.databaseOpenTimeout
          && this.databaseCloseTimeout == that.databaseCloseTimeout
          && this.databaseCommitTimeout == that.databaseCommitTimeout
          && this.databaseCompactTimeout == that.databaseCompactTimeout
          && this.pageLoadTimeout == that.pageLoadTimeout
          && this.treeLoadTimeout == that.treeLoadTimeout;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(StoreSettings.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        hashSeed, this.pageSplitSize), this.pageCacheSize), this.autoCommitInterval),
        Murmur3.hash(this.autoCommitSize)), Murmur3.hash(this.minCompactSize)),
        Murmur3.hash(this.maxZoneSize)), Murmur3.hash(this.minZoneFill)),
        Murmur3.hash(this.minTreeFill)), this.maxRetries), this.deleteDelay),
        this.storeOpenTimeout), this.storeCloseTimeout), this.zoneOpenTimeout),
        this.zoneCloseTimeout), this.databaseOpenTimeout), this.databaseCloseTimeout),
        this.databaseCommitTimeout), this.databaseCompactTimeout),
        this.pageLoadTimeout), this.treeLoadTimeout));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("StoreSettings").write('.').write("standard").write('(').write(')')
        .write('.').write("pageSplitSize").write('(').debug(this.pageSplitSize).write(')')
        .write('.').write("pageCacheSize").write('(').debug(this.pageCacheSize).write(')')
        .write('.').write("autoCommitInterval").write('(').debug(this.autoCommitInterval).write(')')
        .write('.').write("autoCommitSize").write('(').debug(this.autoCommitSize).write(')')
        .write('.').write("minCompactSize").write('(').debug(this.minCompactSize).write(')')
        .write('.').write("maxZoneSize").write('(').debug(this.maxZoneSize).write(')')
        .write('.').write("minZoneFill").write('(').debug(this.minZoneFill).write(')')
        .write('.').write("minTreeFill").write('(').debug(this.minTreeFill).write(')')
        .write('.').write("maxRetries").write('(').debug(this.maxRetries).write(')')
        .write('.').write("deleteDelay").write('(').debug(this.deleteDelay).write(')')
        .write('.').write("storeOpenTimeout").write('(').debug(this.storeOpenTimeout).write(')')
        .write('.').write("storeCloseTimeout").write('(').debug(this.storeCloseTimeout).write(')')
        .write('.').write("zoneOpenTimeout").write('(').debug(this.zoneOpenTimeout).write(')')
        .write('.').write("zoneCloseTimeout").write('(').debug(this.zoneCloseTimeout).write(')')
        .write('.').write("databaseOpenTimeout").write('(').debug(this.databaseOpenTimeout).write(')')
        .write('.').write("databaseCloseTimeout").write('(').debug(this.databaseCloseTimeout).write(')')
        .write('.').write("databaseCommitTimeout").write('(').debug(this.databaseCommitTimeout).write(')')
        .write('.').write("databaseCompactTimeout").write('(').debug(this.databaseCompactTimeout).write(')')
        .write('.').write("pageLoadTimeout").write('(').debug(this.pageLoadTimeout).write(')')
        .write('.').write("treeLoadTimeout").write('(').debug(this.treeLoadTimeout).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static StoreSettings standard;

  private static Form<StoreSettings> form;

  public static StoreSettings standard() {
    if (standard == null) {
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

      int autoCommitInterval;
      try {
        autoCommitInterval = Integer.parseInt(System.getProperty("swim.db.auto.commit.interval"));
      } catch (NumberFormatException e) {
        autoCommitInterval = 10 * 1000;
      }

      long autoCommitSize;
      try {
        autoCommitSize = Long.parseLong(System.getProperty("swim.db.auto.commit.size"));
      } catch (NumberFormatException e) {
        autoCommitSize = 512 * 1024;
      }

      long minCompactSize;
      try {
        minCompactSize = Long.parseLong(System.getProperty("swim.db.min.compact.size"));
      } catch (NumberFormatException e) {
        minCompactSize = 1024 * 1024;
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
        deleteDelay = 45 * 1000;
      }

      int storeOpenTimeout;
      try {
        storeOpenTimeout = Integer.parseInt(System.getProperty("swim.db.store.open.timeout"));
      } catch (NumberFormatException e) {
        storeOpenTimeout = 30 * 1000;
      }

      int storeCloseTimeout;
      try {
        storeCloseTimeout = Integer.parseInt(System.getProperty("swim.db.store.close.timeout"));
      } catch (NumberFormatException e) {
        storeCloseTimeout = 60 * 1000;
      }

      int zoneOpenTimeout;
      try {
        zoneOpenTimeout = Integer.parseInt(System.getProperty("swim.db.zone.open.timeout"));
      } catch (NumberFormatException e) {
        zoneOpenTimeout = 30 * 1000;
      }

      int zoneCloseTimeout;
      try {
        zoneCloseTimeout = Integer.parseInt(System.getProperty("swim.db.zone.close.timeout"));
      } catch (NumberFormatException e) {
        zoneCloseTimeout = 60 * 1000;
      }

      int databaseOpenTimeout;
      try {
        databaseOpenTimeout = Integer.parseInt(System.getProperty("swim.db.database.open.timeout"));
      } catch (NumberFormatException e) {
        databaseOpenTimeout = 30 * 1000;
      }

      int databaseCloseTimeout;
      try {
        databaseCloseTimeout = Integer.parseInt(System.getProperty("swim.db.database.close.timeout"));
      } catch (NumberFormatException e) {
        databaseCloseTimeout = 60 * 1000;
      }

      int databaseCommitTimeout;
      try {
        databaseCommitTimeout = Integer.parseInt(System.getProperty("swim.db.database.commit.timeout"));
      } catch (NumberFormatException e) {
        databaseCommitTimeout = 60 * 1000;
      }

      int databaseCompactTimeout;
      try {
        databaseCompactTimeout = Integer.parseInt(System.getProperty("swim.db.database.commit.timeout"));
      } catch (NumberFormatException e) {
        databaseCompactTimeout = 15 * 60 * 1000;
      }

      int pageLoadTimeout;
      try {
        pageLoadTimeout = Integer.parseInt(System.getProperty("swim.db.page.load.timeout"));
      } catch (NumberFormatException e) {
        pageLoadTimeout = 30 * 1000;
      }

      int treeLoadTimeout;
      try {
        treeLoadTimeout = Integer.parseInt(System.getProperty("swim.db.tree.load.timeout"));
      } catch (NumberFormatException e) {
        treeLoadTimeout = 30 * 1000;
      }

      standard = new StoreSettings(pageSplitSize, pageCacheSize, autoCommitInterval,
                                   autoCommitSize, minCompactSize, maxZoneSize,
                                   minZoneFill, minTreeFill, maxRetries,
                                   deleteDelay, storeOpenTimeout, storeCloseTimeout,
                                   zoneOpenTimeout, zoneCloseTimeout,
                                   databaseOpenTimeout, databaseCloseTimeout,
                                   databaseCommitTimeout, databaseCompactTimeout,
                                   pageLoadTimeout, treeLoadTimeout);
    }
    return standard;
  }

  @Kind
  public static Form<StoreSettings> form() {
    if (form == null) {
      form = new StoreSettingsForm();
    }
    return form;
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
      final Record record = Record.create(20).attr(tag());

      if (settings.pageSplitSize != standard.pageSplitSize) {
        record.slot("pageSplitSize", settings.pageSplitSize);
      }
      if (settings.pageCacheSize != standard.pageCacheSize) {
        record.slot("pageCacheSize", settings.pageCacheSize);
      }
      if (settings.autoCommitInterval != standard.autoCommitInterval) {
        record.slot("autoCommitInterval", settings.autoCommitInterval);
      }
      if (settings.autoCommitSize != standard.autoCommitSize) {
        record.slot("autoCommitSize", settings.autoCommitSize);
      }
      if (settings.minCompactSize != standard.minCompactSize) {
        record.slot("minCompactSize", settings.minCompactSize);
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

      if (settings.storeOpenTimeout != standard.storeOpenTimeout) {
        record.slot("storeOpenTimeout", settings.storeOpenTimeout);
      }
      if (settings.storeCloseTimeout != standard.storeCloseTimeout) {
        record.slot("storeCloseTimeout", settings.storeCloseTimeout);
      }

      if (settings.zoneOpenTimeout != standard.zoneOpenTimeout) {
        record.slot("zoneOpenTimeout", settings.zoneOpenTimeout);
      }
      if (settings.zoneCloseTimeout != standard.zoneCloseTimeout) {
        record.slot("zoneCloseTimeout", settings.zoneCloseTimeout);
      }

      if (settings.databaseOpenTimeout != standard.databaseOpenTimeout) {
        record.slot("databaseOpenTimeout", settings.databaseOpenTimeout);
      }
      if (settings.databaseCloseTimeout != standard.databaseCloseTimeout) {
        record.slot("databaseCloseTimeout", settings.databaseCloseTimeout);
      }
      if (settings.databaseCommitTimeout != standard.databaseCommitTimeout) {
        record.slot("databaseCommitTimeout", settings.databaseCommitTimeout);
      }
      if (settings.databaseCompactTimeout != standard.databaseCompactTimeout) {
        record.slot("databaseCompactTimeout", settings.databaseCompactTimeout);
      }

      if (settings.pageLoadTimeout != standard.pageLoadTimeout) {
        record.slot("pageLoadTimeout", settings.pageLoadTimeout);
      }
      if (settings.treeLoadTimeout != standard.treeLoadTimeout) {
        record.slot("treeLoadTimeout", settings.treeLoadTimeout);
      }

      return record;
    } else {
      return Item.extant();
    }
  }

  @Override
  public StoreSettings cast(Item item) {
    final Value value = item.toValue();
    if (value.getAttr(tag()).isDefined()) {
      final StoreSettings standard = StoreSettings.standard();
      final int pageSplitSize = value.get("pageSplitSize").intValue(standard.pageSplitSize);
      final int pageCacheSize = value.get("pageCacheSize").intValue(standard.pageCacheSize);
      final int autoCommitInterval = value.get("autoCommitInterval").intValue(standard.autoCommitInterval);
      final long autoCommitSize = value.get("autoCommitSize").longValue(standard.autoCommitSize);
      final long minCompactSize = value.get("minCompactSize").longValue(standard.minCompactSize);
      final long maxZoneSize = value.get("maxZoneSize").longValue(standard.maxZoneSize);
      final double minZoneFill = value.get("minZoneFill").doubleValue(standard.minZoneFill);
      final double minTreeFill = value.get("minTreeFill").doubleValue(standard.minTreeFill);
      final int maxRetries = value.get("maxRetries").intValue(standard.maxRetries);
      final int deleteDelay = value.get("deleteDelay").intValue(standard.deleteDelay);
      final int storeOpenTimeout = value.get("storeOpenTimeout").intValue(standard.storeOpenTimeout);
      final int storeCloseTimeout = value.get("storeCloseTimeout").intValue(standard.storeCloseTimeout);
      final int zoneOpenTimeout = value.get("zoneOpenTimeout").intValue(standard.zoneOpenTimeout);
      final int zoneCloseTimeout = value.get("zoneCloseTimeout").intValue(standard.zoneCloseTimeout);
      final int databaseOpenTimeout = value.get("databaseOpenTimeout").intValue(standard.databaseOpenTimeout);
      final int databaseCloseTimeout = value.get("databaseCloseTimeout").intValue(standard.databaseCloseTimeout);
      final int databaseCommitTimeout = value.get("databaseCommitTimeout").intValue(standard.databaseCommitTimeout);
      final int databaseCompactTimeout = value.get("databaseCompactTimeout").intValue(standard.databaseCompactTimeout);
      final int pageLoadTimeout = value.get("pageLoadTimeout").intValue(standard.pageLoadTimeout);
      final int treeLoadTimeout = value.get("treeLoadTimeout").intValue(standard.treeLoadTimeout);
      return new StoreSettings(pageSplitSize, pageCacheSize, autoCommitInterval,
                               autoCommitSize, minCompactSize, maxZoneSize,
                               minZoneFill, minTreeFill, maxRetries,
                               deleteDelay, storeOpenTimeout, storeCloseTimeout,
                               zoneOpenTimeout, zoneCloseTimeout,
                               databaseOpenTimeout, databaseCloseTimeout,
                               databaseCommitTimeout, databaseCompactTimeout,
                               pageLoadTimeout, treeLoadTimeout);
    }
    return null;
  }
}
