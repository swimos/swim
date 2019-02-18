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

package swim.collections;

import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.fail;

public class STreeSpec {
  @Test
  public void testAddAndGet() {
    final STree<Integer> tree = new STree<Integer>();
    final int n = 1 << 18;
    for (int i = 0; i < n; i += 1) {
      tree.add((i & 1) != 0 ? i : -i);
      if ((int) tree.get(i) != ((i & 1) != 0 ? i : -i)) {
        assertEquals((int) tree.get(i), ((i & 1) != 0 ? i : -i));
      }
      if (i < 4096 || i == n - 1) {
        for (int j = 0; j <= i; j += 1) {
          if ((int) tree.get(j) != ((j & 1) != 0 ? j : -j)) {
            fail("j: " + j + "; i: " + i + "; n: " + n);
            break;
          }
        }
      }
    }
  }

  @Test
  public void testRemove() {
    final STree<Integer> tree = new STree<Integer>();
    final int n = 1 << 18;
    for (int i = 0; i < n; i += 1) {
      tree.add((i & 1) != 0 ? i : -i);
    }
    for (int i = 0; i < n; i += 1) {
      tree.remove(0);
      if (n - i < 4096 || i == n - 1) {
        for (int j = i + 1; j < n; j += 1) {
          if ((int) tree.get(j - i - 1) != ((j & 1) != 0 ? j : -j)) {
            fail("j: " + j + "; i: " + i + "; n: " + n);
            break;
          }
        }
      }
    }
  }

  @Test
  public void testDrop() {
    for (int n = 4; n <= 512; n *= 2) {
      for (int k = 0; k <= n; k += 1) {
        final STree<Integer> tree = new STree<Integer>() {
          @Override
          protected int pageSplitSize() {
            return 8;
          }
        };
        for (int i = 0; i < n; i += 1) {
          tree.add(i);
        }
        tree.drop(k);
        if (tree.size() != n - k) {
          //System.out.println("k: " + k + "; n: " + n);
          assertEquals(tree.size(), n - k);
          break;
        }
        for (int i = k; i < n; i += 1) {
          if ((int) tree.get(i - k) != i) {
            //System.out.println("k: " + k + "; i: " + i + "; n: " + n);
            assertEquals((int) tree.get(i - k), i);
            break;
          }
        }
      }
      System.out.println("drop prefixes of " + n + " items");
    }
  }

  @Test
  public void testTake() {
    for (int n = 4; n <= 512; n *= 2) {
      for (int k = 0; k <= n; k += 1) {
        final STree<Integer> tree = new STree<Integer>() {
          @Override
          protected int pageSplitSize() {
            return 8;
          }
        };
        for (int i = 0; i < n; i += 1) {
          tree.add(i);
        }
        tree.take(k);
        if (tree.size() != k) {
          //System.out.println("k: " + k + "; n: " + n);
          assertEquals(tree.size(), k);
          break;
        }
        for (int i = 0; i < k; i += 1) {
          if ((int) tree.get(i) != i) {
            //System.out.println("k: " + k + "; i: " + i + "; n: " + n);
            assertEquals((int) tree.get(i), i);
            break;
          }
        }
      }
      System.out.println("take prefixes of " + n + " items");
    }
  }
}
