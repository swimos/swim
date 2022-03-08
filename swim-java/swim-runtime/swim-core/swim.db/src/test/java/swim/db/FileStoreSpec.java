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

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.Random;
import org.testng.annotations.Test;
import swim.concurrent.Theater;
import swim.math.R2Point;
import swim.math.R2Shape;
import swim.spatial.GeoProjection;
import swim.spatial.SpatialMap;
import swim.structure.Data;
import swim.structure.Form;
import swim.structure.Text;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNotNull;

public class FileStoreSpec {

  final File testOutputDir = new File("build/test-output");

  final StoreSettings storeSettings = StoreSettings.standard().deleteDelay(0);

  @Test
  public void testOpenStore() throws InterruptedException {
    final File storePath = new File(this.testOutputDir, "store.swimdb");
    final Theater stage = new Theater();
    final FileStore store = new FileStore(storePath, stage);
    try {
      stage.start();
      store.open();
      assertNotNull(store.zone());
      store.close();
      store.delete();
    } finally {
      stage.stop();
    }
  }

  @Test
  public void testOpenDatabase() throws InterruptedException {
    final File storePath = new File(this.testOutputDir, "database.swimdb");
    final Theater stage = new Theater();
    final FileStore store = new FileStore(storePath, stage);
    try {
      stage.start();
      store.open();
      final Database database = store.openDatabase();
      assertNotNull(database);
      store.close();
      store.delete();
    } finally {
      stage.stop();
    }
  }

  @Test
  public void testLoadTree() throws InterruptedException {
    final File storePath = new File(this.testOutputDir, "load.swimdb");
    final Theater stage = new Theater();
    final FileStore store = new FileStore(storePath, stage);
    try {
      stage.start();
      store.open();
      final Database database = store.openDatabase();
      final Map<String, Integer> map = database.openBTreeMap("test").load()
                                               .keyForm(Form.forString())
                                               .valueForm(Form.forInteger());
      assertNotNull(map);
      store.close();
      store.delete();
    } finally {
      stage.stop();
    }
  }

  @Test
  public void testBTreeMap() throws InterruptedException {
    final File storePath = new File(this.testOutputDir, "btree-map.swimdb");
    final Theater stage = new Theater();
    final StoreContext storeContext = new StoreContext(this.storeSettings) {
      @Override
      public boolean pageShouldSplit(Store store, Database database, Page page) {
        return page.arity() > 3;
      }

      @Override
      public boolean pageShouldMerge(Store store, Database database, Page page) {
        return page.arity() < 2;
      }

      @Override
      public Commit databaseWillCommit(Store store, Database database, Commit commit) {
        return commit; // Override auto shift behavior.
      }
    };
    final FileStore store = new FileStore(storeContext, storePath, stage);
    store.open();
    try {
      stage.start();
      final Database database = store.openDatabase();
      final Map<String, Integer> map = database.openBTreeMap("test").load()
                                               .keyForm(Form.forString())
                                               .valueForm(Form.forInteger());

      map.put("a", 1);
      map.put("b", 2);
      map.put("c", 3);
      database.commit(Commit.forced());

      map.put("d", 4);
      map.put("e", 5);
      map.put("f", 6);
      database.commit(Commit.forced());

      map.put("a", 0);
      map.put("g", 7);
      database.commit(Commit.forced());

      map.put("h", 8);
      map.put("i", 9);
      database.commit(Commit.forced());

      map.put("j", 10);
      database.commitAsync(Commit.forced());

      map.put("a", 1);
      database.commit(Commit.forced());

      map.remove("a");
      map.remove("b");
      map.remove("c");
      map.remove("d");
      map.remove("e");
      map.remove("f");
      map.remove("g");
      map.remove("h");
      map.remove("i");
      map.remove("j");
      database.commit(Commit.forced());

      map.put("a", 1);
      map.put("b", 2);
      map.put("c", 3);
      map.put("d", 4);
      map.put("e", 5);
      map.put("f", 6);
      map.put("g", 7);
      map.put("h", 8);
      map.put("i", 9);
      map.put("j", 10);

      store.close();
      store.delete();
    } finally {
      stage.stop();
    }
  }

  @Test
  public void testSTreeList() throws InterruptedException {
    final File storePath = new File(this.testOutputDir, "stree-list.swimdb");
    final Theater stage = new Theater();
    final StoreContext storeContext = new StoreContext(this.storeSettings) {
      @Override
      public boolean pageShouldSplit(Store store, Database database, Page page) {
        return page.arity() > 3;
      }

      @Override
      public boolean pageShouldMerge(Store store, Database database, Page page) {
        return page.arity() < 2;
      }

      @Override
      public Commit databaseWillCommit(Store store, Database database, Commit commit) {
        return commit; // Override auto shift behavior.
      }
    };
    final FileStore store = new FileStore(storeContext, storePath, stage);
    store.open();
    try {
      stage.start();
      final Database database = store.openDatabase();
      final List<String> list = database.openSTreeList("test").load()
                                        .valueForm(Form.forString());

      list.add("a");
      list.add("b");
      list.add("c");
      database.commit(Commit.forced());

      list.add("d");
      list.add("e");
      list.add("f");
      database.commit(Commit.forced());

      list.remove(0);
      list.add("g");
      database.commit(Commit.forced());

      list.add("h");
      list.add("i");
      database.commit(Commit.forced());

      list.add("j");
      database.commitAsync(Commit.forced());

      list.add(0, "a");
      database.commit(Commit.forced());

      list.clear();
      database.commit(Commit.forced());

      list.add("a");
      list.add("b");
      list.add("c");
      list.add("d");
      list.add("e");
      list.add("f");
      list.add("g");
      list.add("h");
      list.add("i");
      list.add("j");

      store.close();
      store.delete();
    } finally {
      stage.stop();
    }
  }

  @Test
  public void testUTreeValue() throws InterruptedException {
    final File storePath = new File(this.testOutputDir, "utree-value.swimdb");
    final Theater stage = new Theater();
    final StoreContext storeContext = new StoreContext(this.storeSettings) {
      @Override
      public Commit databaseWillCommit(Store store, Database database, Commit commit) {
        return commit; // Override auto shift behavior.
      }
    };
    final FileStore store = new FileStore(storeContext, storePath, stage);
    store.open();
    try {
      stage.start();
      final Database database = store.openDatabase();
      final UTreeValue value = database.openUTreeValue("test").load();

      value.set(Text.from("a"));
      assertEquals(value.get(), Text.from("a"));
      value.set(Text.from("b"));
      assertEquals(value.get(), Text.from("b"));
      value.set(Text.from("c"));
      assertEquals(value.get(), Text.from("c"));
      database.commit(Commit.forced());

      value.set(Text.from("d"));
      assertEquals(value.get(), Text.from("d"));
      value.set(Text.from("e"));
      assertEquals(value.get(), Text.from("e"));
      value.set(Text.from("f"));
      assertEquals(value.get(), Text.from("f"));
      database.commit(Commit.forced());

      store.close();
      store.delete();
    } finally {
      stage.stop();
    }
  }

  @Test
  public void benchmarkLargeWrites() throws InterruptedException {
    final File storePath = new File(this.testOutputDir, "large-writes.swimdb");
    final Theater stage = new Theater();
    final StoreContext storeContext = new StoreContext(this.storeSettings) {
      @Override
      public Commit databaseWillCommit(Store store, Database database, Commit commit) {
        return commit; // Override auto shift behavior.
      }
    };
    final FileStore store = new FileStore(storeContext, storePath, stage);
    store.open();
    final long duration = 5 * 1000L;
    try {
      stage.start();
      final Database database = store.openDatabase();
      final BTreeMap map = database.openBTreeMap("test");
      final Data blob = Data.wrap(new byte[50 * 1024 * 3 / 4]).commit();

      System.out.println("Benchmarking ...");
      final long t0 = System.currentTimeMillis();
      long i = 0L;
      while (System.currentTimeMillis() - t0 < duration) {
        map.put(Text.from("blob-" + i), blob);
        i += 1L;
        if (i % 10L == 0L) {
          map.commit(Commit.forced());
        }
      }
      final long size = database.treeSize();
      map.commit(Commit.forced());
      store.close();
      store.delete();

      final long t1 = System.currentTimeMillis();
      final long dt = t1 - t0;

      final long recordRate = (1000L * i) / dt;
      System.out.println("Wrote " + i + " 50KiB records in " + dt + " milliseconds (" + recordRate + " records/second)");

      final long dataRate = (1000L * size) / (dt * (1 << 20));
      System.out.println("Wrote " + (size / (1 << 20)) + " MiB (" + dataRate + " MiB/second)");

      System.out.println("Page cache hit ratio: " + (int) (store.pageCache().hitRatio() * 100) + "%");
    } finally {
      stage.stop();
    }
  }

  @Test
  public void benchmarkSmallWrites() throws InterruptedException {
    final File storePath = new File(this.testOutputDir, "small-writes.swimdb");
    final Theater stage = new Theater();
    final StoreContext storeContext = new StoreContext(this.storeSettings) {
      @Override
      public Commit databaseWillCommit(Store store, Database database, Commit commit) {
        return commit; // Override auto shift behavior.
      }
    };
    final FileStore store = new FileStore(storeContext, storePath, stage);
    store.open();
    final long duration = 5 * 1000L;
    try {
      stage.start();
      final Database database = store.openDatabase();
      final BTreeMap map = database.openBTreeMap("test");
      final Value blob = Text.from("test").commit();

      System.out.println("Benchmarking ...");
      final long t0 = System.currentTimeMillis();
      long i = 0L;
      while (System.currentTimeMillis() - t0 < duration) {
        map.put(Text.from("blob-" + i), blob);
        i += 1L;
        if (i % 10000L == 0L) {
          map.commit(Commit.forced());
        }
      }
      final long size = database.treeSize();
      map.commit(Commit.forced());
      store.close();
      store.delete();

      final long t1 = System.currentTimeMillis();
      final long dt = t1 - t0;

      final long recordRate = (1000L * i) / dt;
      System.out.println("Wrote " + i + " small records in " + dt + " milliseconds (" + recordRate + " records/second)");

      final long dataRate = (1000L * size) / (dt * (1 << 10));
      System.out.println("Wrote " + (size / (1 << 10)) + " KiB (" + dataRate + " KiB/second)");

      System.out.println("Page cache hit ratio: " + (int) (store.pageCache().hitRatio() * 100) + "%");
    } finally {
      stage.stop();
    }
  }

  @Test
  public void benchmarkStateChanges() throws InterruptedException {
    final File storePath = new File(this.testOutputDir, "state-changes.swimdb");
    final Theater stage = new Theater();
    final StoreContext storeContext = new StoreContext(this.storeSettings) {
      @Override
      public Commit databaseWillCommit(Store store, Database database, Commit commit) {
        return commit; // Override auto shift behavior.
      }
    };
    final FileStore store = new FileStore(storeContext, storePath, stage);
    store.open();
    final long duration = 5 * 1000L;
    try {
      stage.start();
      final Database database = store.openDatabase();
      final Map<String, Long> map = database.openBTreeMap("test").load()
                                            .keyForm(Form.forString())
                                            .valueForm(Form.forLong());

      System.out.println("Benchmarking ...");
      final long t0 = System.currentTimeMillis();
      long i = 0L;
      while (System.currentTimeMillis() - t0 < duration) {
        map.put("state", i);
        i += 1L;
      }
      database.commit(Commit.forced());
      store.close();
      store.delete();

      final long t1 = System.currentTimeMillis();
      final long dt = t1 - t0;
      final long changeRate = (1000L * i) / dt;
      System.out.println("Applied " + i + " state changes in " + dt + " milliseconds (" + changeRate + " changes/second)");

      System.out.println("Page cache hit ratio: " + (int) (store.pageCache().hitRatio() * 100) + "%");
    } finally {
      stage.stop();
    }
  }

  @Test
  public void benchmarkQTreeUpdates() throws InterruptedException {
    final File storePath = new File(this.testOutputDir, "qtree-updates.swimdb");
    final Theater stage = new Theater();
    final StoreContext storeContext = new StoreContext(this.storeSettings) {
      @Override
      public Commit databaseWillCommit(Store store, Database database, Commit commit) {
        return commit; // Override auto shift behavior.
      }
    };
    final FileStore store = new FileStore(storeContext, storePath, stage);
    store.open();
    final long duration = 5 * 1000L;
    try {
      stage.start();
      final Database database = store.openDatabase();
      final SpatialMap<Long, R2Shape, Long> map = database.openQTreeMap("test", GeoProjection.wgs84Form()).load()
                                                          .keyForm(Form.forLong())
                                                          .valueForm(Form.forLong());

      System.out.println("Benchmarking ...");
      final Random random = new Random(0L);
      final long t0 = System.currentTimeMillis();
      long i = 0L;
      while (System.currentTimeMillis() - t0 < duration) {
        final double lng = random.nextDouble() * 180.0;
        final double lat = random.nextDouble() * 80.0;
        map.put(i, new R2Point(lng, lat), -i);
        i += 1L;
      }
      database.commit(Commit.forced());
      store.close();
      store.delete();

      final long t1 = System.currentTimeMillis();
      final long dt = t1 - t0;
      final long changeRate = (1000L * i) / dt;
      System.out.println("Updated " + i + " tiles in " + dt + " milliseconds (" + changeRate + " updates/second)");

      System.out.println("Page cache hit ratio: " + (int) (store.pageCache().hitRatio() * 100) + "%");
    } finally {
      stage.stop();
    }
  }

}
