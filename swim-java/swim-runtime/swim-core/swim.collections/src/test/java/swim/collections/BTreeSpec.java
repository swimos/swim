// Copyright 2015-2023 Nstream, inc.
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

public class BTreeSpec {

  @Test
  public void testUpdatedAndGet() {
    BTree<Integer, Integer> tree = BTree.empty();
    final int n = 1 << 18;
    for (int i = 0; i < n; i += 1) {
      tree = tree.updated((i & 1) != 0 ? i : -i, i);
      if (((i & 1) != 0 ? i : -i) < 0) {
        if (tree.getIndex(0).getValue() != i) {
          assertEquals((int) tree.getIndex(0).getValue(), i);
        }
      } else {
        if (tree.getIndex(i).getValue() != i) {
          assertEquals((int) tree.getIndex(i).getValue(), i);
        }
      }
      if (i < 4096 || i == n - 1) {
        for (int j = 0; j <= i; j += 1) {
          if ((int) tree.get((j & 1) != 0 ? j : -j) != j) {
            fail("j: " + j + "; i: " + i + "; n: " + n);
            break;
          }
        }
      }
    }
  }

  @Test
  public void testRemoved() {
    BTree<Integer, Integer> tree = BTree.empty();
    final int n = 1 << 18;
    for (int i = 0; i < n; i += 1) {
      tree = tree.updated((i & 1) != 0 ? i : -i, i);
    }
    for (int i = 0; i < n; i += 1) {
      tree = tree.removed((i & 1) != 0 ? i : -i);
      if (n - i < 4096 || i == n - 1) {
        for (int j = i + 1; j < n; j += 1) {
          if ((int) tree.get((j & 1) != 0 ? j : -j) != j) {
            fail("j: " + j + "; i: " + i + "; n: " + n);
            break;
          }
        }
      }
    }
  }

}
