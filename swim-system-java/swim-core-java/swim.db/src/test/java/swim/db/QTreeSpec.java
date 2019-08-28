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

import java.util.Random;
import org.testng.annotations.Test;
import swim.spatial.BitInterval;
import swim.structure.Num;
import swim.structure.Value;
import static org.testng.Assert.fail;

public class QTreeSpec {
  @Test
  public void benchmarkInserts() {
    final long duration = 5 * 1000L;
    final Random random = new Random();
    final PageContext pageContext = new PageContext() {
      @Override
      public boolean pageShouldSplit(Page page) {
        return page.arity() > 64;
      }
    };
    QTreePage page = QTreePage.empty(pageContext, 0, 0L);

    System.out.println("Warming up ...");
    final long t0 = System.currentTimeMillis();
    long t1 = 0L;
    long t = 0L;
    long i = 0L;
    do {
      final Value key = Num.from(i);
      final long x = random.nextInt() & 0xffffffffL;
      final long y = random.nextInt() & 0xffffffffL;
      page = page.updated(key, x, y, Value.extant(), 1L).balanced(1L);
      i += 1L;
      t = System.currentTimeMillis();
      if (t1 == 0L && t - t0 > duration) {
        page = QTreePage.empty(pageContext, 0, 0L);
        System.out.println("Benchmarking ...");
        t1 = t;
      }
    } while (t - t0 < 2 * duration);

    final long t2 = System.currentTimeMillis();
    final long dt = t2 - t1;
    final long insertRate = (1000L * i) / dt;
    System.out.println("Inserted " + i + " points in " + dt + " milliseconds (" + insertRate + " inserts/second)");
  }

  @Test
  public void benchmarkUpdates() {
    final int n = 500000;
    final PageContext pageContext = new PageContext() {
      @Override
      public boolean pageShouldSplit(Page page) {
        return page.arity() > 64;
      }
    };

    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    Random random = new Random(0L);
    for (int i = 0; i < n; i += 1) {
      final Value key = Num.from(i);
      final long x = random.nextInt() & 0xffffffffL;
      final long y = random.nextInt() & 0xffffffffL;
      page = page.updated(key, x, y, Value.extant(), 1L).balanced(1L);
    }
    final QTreePage basePage = page;

    System.out.println("Warming up ...");
    page = basePage;
    random = new Random(0L);
    for (int i = 0; i < n; i += 1) {
      final Value key = Num.from(-i);
      final long x = random.nextInt() & 0xffffffffL;
      final long y = random.nextInt() & 0xffffffffL;
      page = page.updated(key, x, y, key, 1L).balanced(1L);
    }

    System.out.println("Benchmarking ...");
    page = basePage;
    random = new Random(0L);
    final long t0 = System.currentTimeMillis();
    for (int i = 0; i < n; i += 1) {
      final Value key = Num.from(i);
      final long x = random.nextInt() & 0xffffffffL;
      final long y = random.nextInt() & 0xffffffffL;
      page = page.updated(key, x, y, key, 1L).balanced(1L);
    }

    final long t1 = System.currentTimeMillis();
    final long dt = t1 - t0;
    final long updateRate = (1000L * n) / dt;
    System.out.println("Updated " + n + " points in " + dt + " milliseconds (" + updateRate + " updates/second)");
  }

  @Test
  public void benchmarkSearches() {
    final int n = 500000;
    final PageContext pageContext = new PageContext() {
      @Override
      public boolean pageShouldSplit(Page page) {
        return page.arity() > 64;
      }
    };

    QTreePage page = QTreePage.empty(pageContext, 0, 0L);
    Random random = new Random(0L);
    for (int i = 0; i < n; i += 1) {
      final Value key = Num.from(i);
      final long x = random.nextInt() & 0xffffffffL;
      final long y = random.nextInt() & 0xffffffffL;
      page = page.updated(key, x, y, Value.extant(), 1L).balanced(1L);
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
