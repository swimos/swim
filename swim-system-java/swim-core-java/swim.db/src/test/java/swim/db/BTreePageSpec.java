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

import org.testng.annotations.Test;
import swim.structure.Num;
import static org.testng.Assert.assertEquals;

public class BTreePageSpec {
  @Test
  public void testUpdate() {
    final PageContext pageContext = new PageContext() {
      @Override
      public boolean pageShouldSplit(Page page) {
        return page.arity() >= 1024;
      }
      @Override
      public boolean pageShouldMerge(Page page) {
        return page.arity() < 512;
      }
    };
    final int stem = 0;
    long version = 0L;
    BTreePage page = BTreePage.empty(pageContext, stem, version);
    final int n = 1 << 18;
    for (int i = 0; i < n; i += 1) {
      if (i % 1024 == 0) {
        version += 1L;
      }
      page = page.updated(Num.from((i & 1) != 0 ? i : -i), Num.from(i), version).balanced(version);
      if (((i & 1) != 0 ? i : -i) < 0) {
        assertEquals(page.getIndex(0).getValue(), Num.from(i));
      } else {
        assertEquals(page.getIndex(i).getValue(), Num.from(i));
      }
      if (i < 4096 || i == n - 1) {
        for (int j = 0; j <= i; j += 1) {
          assertEquals(page.get(Num.from((j & 1) != 0 ? j : -j)), Num.from(j));
        }
      }
    }
  }

  @Test
  public void testRemove() {
    final PageContext pageContext = new PageContext() {
      @Override
      public boolean pageShouldSplit(Page page) {
        return page.arity() >= 1024;
      }
      @Override
      public boolean pageShouldMerge(Page page) {
        return page.arity() < 512;
      }
    };
    final int stem = 0;
    long version = 0L;
    BTreePage page = BTreePage.empty(pageContext, stem, version);
    final int n = 1 << 18;
    for (int i = 0; i < n; i += 1) {
      page = page.updated(Num.from((i & 1) != 0 ? i : -i), Num.from(i), version).balanced(version);
    }
    for (int i = 0; i < n; i += 1) {
      if (i % 1024 == 0) {
        version += 1L;
      }
      page = page.removed(Num.from((i & 1) != 0 ? i : -i), version).balanced(version);
      if ((n - i) < 4096 || i == n - 1) {
        for (int j = i + 1; j < n; j += 1) {
          assertEquals(page.get(Num.from((j & 1) != 0 ? j : -j)), Num.from(j));
        }
      }
    }
  }

  @Test
  public void testDrop() {
    for (int n = 4; n <= 4096; n *= 2) {
      System.out.println("Dropping prefixes of " + n + " slots ...");
      for (int i = 0; i < n; i += 1) {
        testDrop(i, n);
      }
    }
  }
  void testDrop(int k, int n) {
    final PageContext pageContext = new PageContext() {
      @Override
      public boolean pageShouldSplit(Page page) {
        return page.arity() >= 16;
      }
      @Override
      public boolean pageShouldMerge(Page page) {
        return page.arity() < 8;
      }
    };
    final int stem = 0;
    final long version = 0L;
    BTreePage page = BTreePage.empty(pageContext, stem, version);
    for (int i = 0; i < n; i += 1) {
      page = page.updated(Num.from(i), Num.from(i), version).balanced(version);
    }
    page = page.drop(k, version).balanced(version);
    assertEquals(page.span(), n - k);
    for (int i = k; i < n; i += 1) {
      assertEquals(page.get(Num.from(i)), Num.from(i));
    }
  }

  @Test
  public void testTake() {
    for (int n = 4; n <= 4096; n *= 2) {
      System.out.println("Taking prefixes of " + n + " slots ...");
      for (int i = 0; i < n; i += 1) {
        testTake(i, n);
      }
    }
  }
  void testTake(int k, int n) {
    final PageContext pageContext = new PageContext() {
      @Override
      public boolean pageShouldSplit(Page page) {
        return page.arity() >= 16;
      }
      @Override
      public boolean pageShouldMerge(Page page) {
        return page.arity() < 8;
      }
    };
    final int stem = 0;
    final long version = 0L;
    BTreePage page = BTreePage.empty(pageContext, stem, version);
    for (int i = 0; i < n; i += 1) {
      page = page.updated(Num.from(i), Num.from(i), version).balanced(version);
    }
    page = page.take(k, version).balanced(version);
    assertEquals(page.span(), k);
    for (int i = 0; i < k; i += 1) {
      assertEquals(page.get(Num.from(i)), Num.from(i));
    }
  }
}
