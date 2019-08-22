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

package swim.spatial;

import java.util.Random;
import org.testng.annotations.Test;
import swim.math.Z2Shape;
import static org.testng.Assert.fail;

public class QTreeSpec {
  @Test(groups = {"benchmark"})
  public void benchmarkInserts() {
    final long duration = 5 * 1000L;
    final Random random = new Random();
    final QTree<Long, Z2Shape, Object> tree = QTree.empty(Z2Shape.shapeForm());
    QTreePage<Long, Z2Shape, Object> page = tree.root;

    System.out.println("Warming up ...");
    final long t0 = System.currentTimeMillis();
    long t1 = 0L;
    long t = 0L;
    long i = 0L;
    do {
      final long x = random.nextInt() & 0xffffffffL;
      final long y = random.nextInt() & 0xffffffffL;
      page = page.updated(i, null, x, y, null, tree).balanced(tree);
      i += 1L;
      t = System.currentTimeMillis();
      if (t1 == 0L && t - t0 > duration) {
        page = QTreePage.empty();
        System.out.println("Benchmarking ...");
        t1 = t;
      }
    } while (t - t0 < 2 * duration);

    final long t2 = System.currentTimeMillis();
    final long dt = t2 - t1;
    final long insertRate = (1000L * i) / dt;
    System.out.println("Inserted " + i + " points in " + dt + " milliseconds (" + insertRate + " inserts/second)");
  }

  @Test(groups = {"benchmark"})
  public void benchmarkUpdates() {
    final int n = 500000;
    final QTree<Integer, Z2Shape, Integer> tree = QTree.empty(Z2Shape.shapeForm());

    QTreePage<Integer, Z2Shape, Integer> page = tree.root;
    Random random = new Random(0L);
    for (int i = 0; i < n; i += 1) {
      final long x = random.nextInt() & 0xffffffffL;
      final long y = random.nextInt() & 0xffffffffL;
      page = page.updated(i, null, x, y, i, tree).balanced(tree);
    }
    final QTreePage<Integer, Z2Shape, Integer> basePage = page;

    System.out.println("Warming up ...");
    page = basePage;
    random = new Random(0L);
    for (int i = 0; i < n; i += 1) {
      final long x = random.nextInt() & 0xffffffffL;
      final long y = random.nextInt() & 0xffffffffL;
      page = page.updated(i, null, x, y, -i, tree).balanced(tree);
    }

    System.out.println("Benchmarking ...");
    page = basePage;
    random = new Random(0L);
    final long t0 = System.currentTimeMillis();
    for (int i = 0; i < n; i += 1) {
      final long x = random.nextInt() & 0xffffffffL;
      final long y = random.nextInt() & 0xffffffffL;
      page = page.updated(i, null, x, y, i, tree).balanced(tree);
    }

    final long t1 = System.currentTimeMillis();
    final long dt = t1 - t0;
    final long updateRate = (1000L * n) / dt;
    System.out.println("Updated " + n + " points in " + dt + " milliseconds (" + updateRate + " updates/second)");
  }

  @Test(groups = {"benchmark"})
  public void benchmarkSearches() {
    final int n = 500000;
    final QTree<Integer, Z2Shape, Integer> tree = QTree.empty(Z2Shape.shapeForm());

    QTreePage<Integer, Z2Shape, Integer> page = tree.root;
    Random random = new Random(0L);
    for (int i = 0; i < n; i += 1) {
      final long x = random.nextInt() & 0xffffffffL;
      final long y = random.nextInt() & 0xffffffffL;
      page = page.updated(i, null, x, y, i, tree).balanced(tree);
    }

    System.out.println("Warming up ...");
    random = new Random(0L);
    for (int i = 0; i < n; i += 1) {
      final long x = BitInterval.from(8, random.nextInt() & 0xffffffffL);
      final long y = BitInterval.from(8, random.nextInt() & 0xffffffffL);
      if (!page.cursor(x, y).hasNext()) {
        fail();
      }
    }

    System.out.println("Benchmarking ...");
    random = new Random(0L);
    final long t0 = System.currentTimeMillis();
    for (int i = 0; i < n; i += 1) {
      final long x = BitInterval.from(8, random.nextInt() & 0xffffffffL);
      final long y = BitInterval.from(8, random.nextInt() & 0xffffffffL);
      if (!page.cursor(x, y).hasNext()) {
        fail();
      }
    }

    final long t1 = System.currentTimeMillis();
    final long dt = t1 - t0;
    final long searchRate = (1000L * n) / dt;
    System.out.println("Searched " + n + " areas in " + dt + " milliseconds (" + searchRate + " searches/second)");
  }
}
