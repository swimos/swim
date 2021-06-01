// Copyright 2015-2021 Swim inc.
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

import {Spec, Test, Exam} from "@swim/unit";
import {BTree} from "@swim/collections";

export class BTreeSpec extends Spec {
  @Test
  testSetAndGet(exam: Exam): void {
    const tree = new BTree();
    const n = 1 << 18;
    for (let i = 0; i < n; i += 1) {
      tree.set((i & 1) !== 0 ? i : -i, i);
      if (((i & 1) !== 0 ? i : -i) < 0) {
        if (tree.getEntry(0)![1] !== i) {
          exam.equal(tree.getEntry(0)![1], i);
        }
      } else {
        if (tree.getEntry(i)![1] !== i) {
          exam.equal(tree.getEntry(i)![1], i);
        }
      }
      if (i < 4096 || i === n - 1) {
        for (let j = 0; j <= i; j += 1) {
          if (tree.get((j & 1) !== 0 ? j : -j) !== j) {
            exam.fail("j: " + j + "; i: " + i + "; n: " + n);
            break;
          }
        }
      }
    }
  }

  @Test
  testDelete(exam: Exam): void {
    const tree = new BTree();
    const n = 1 << 18;
    for (let i = 0; i < n; i += 1) {
      tree.set((i & 1) !== 0 ? i : -i, i);
    }
    for (let i = 0; i < n; i += 1) {
      tree.delete((i & 1) !== 0 ? i : -i);
      if (n - i < 4096 || i === n - 1) {
        for (let j = i + 1; j < n; j += 1) {
          if (tree.get((j & 1) !== 0 ? j : -j) !== j) {
            exam.fail("j: " + j + "; i: " + i + "; n: " + n);
            break;
          }
        }
      }
    }
  }

  @Test
  testDrop(exam: Exam): void {
    for (let n = 4; n <= 512; n *= 2) {
      for (let k = 0; k <= n; k += 1) {
        const tree = new BTree();
        tree.pageSplitSize = 8;
        for (let i = 0; i < n; i += 1) {
          tree.set(i, i);
        }
        tree.drop(k);
        if (tree.size !== n - k) {
          //exam.comment("k: " + k + "; n: " + n);
          exam.equal(tree.size, n - k);
          break;
        }
        for (let i = k; i < n; i += 1) {
          if (tree.get(i) !== i) {
            //exam.comment("k: " + k + "; i: " + i + "; n: " + n);
            exam.equal(tree.get(i), i);
            break;
          }
        }
      }
      //exam.pass("drop prefixes of " + n + " items");
    }
  }

  @Test
  testTake(exam: Exam): void {
    for (let n = 4; n <= 512; n *= 2) {
      for (let k = 0; k <= n; k += 1) {
        const tree = new BTree();
        tree.pageSplitSize = 8;
        for (let i = 0; i < n; i += 1) {
          tree.set(i, i);
        }
        tree.take(k);
        if (tree.size !== k) {
          //exam.comment("k: " + k + "; n: " + n);
          exam.equal(tree.size, k);
          break;
        }
        for (let i = 0; i < k; i += 1) {
          if (tree.get(i) !== i) {
            //exam.comment("k: " + k + "; i: " + i + "; n: " + n);
            exam.equal(tree.get(i), i);
            break;
          }
        }
      }
      //exam.pass("take prefixes of " + n + " items");
    }
  }

  @Test
  testAdjacentEntries(exam: Exam): void {
    const tree = new BTree<number, number>();
    const n = 1 << 18;
    function equal(x: [number, number], y: [number, number]): boolean {
      return x[0] === y[0] && x[1] === y[1];
    }
    for (let i = 0; i < n; i += 1) {
      if (tree.nextEntry(2 * i - 2) !== void 0) {
        exam.equal(tree.nextEntry(i - 2), void 0);
      }
      if (tree.nextEntry(2 * i - 1) !== void 0) {
        exam.equal(tree.nextEntry(i - 1), void 0);
      }
      tree.set(2 * i, i);
      if (!equal(tree.nextEntry(2 * i - 2)!, [2 * i, i])) {
        exam.equal(tree.nextEntry(2 * i - 2), [2 * i, i]);
      }
      if (!equal(tree.nextEntry(2 * i - 1)!, [2 * i, i])) {
        exam.equal(tree.nextEntry(2 * i - 1), [2 * i, i]);
      }
      if (!equal(tree.previousEntry(2 * i + 1)!, [2 * i, i])) {
        exam.equal(tree.previousEntry(2 * i + 1), [2 * i, i]);
      }
      if (!equal(tree.previousEntry(2 * i + 2)!, [2 * i, i])) {
        exam.equal(tree.previousEntry(2 * i + 2), [2 * i, i]);
      }
    }
    for (let i = 0; i < n; i += 1) {
      if (i > 0 && !equal(tree.previousEntry(2 * i)!, [2 * (i - 1), i - 1])) {
        exam.equal(tree.previousEntry(2 * i), [2 * (i - 1), i - 1]);
      }
      if (i > 0 && !equal(tree.previousEntry(2 * i - 1)!, [2 * (i - 1), i - 1])) {
        exam.equal(tree.previousEntry(2 * i - 1), [2 * (i - 1), i - 1]);
      }
      if (i < n - 2 && !equal(tree.nextEntry(2 * i)!, [2 * (i + 1), i + 1])) {
        exam.equal(tree.nextEntry(2 * i), [2 * (i + 1), i + 1]);
      }
      if (i < n - 2 && !equal(tree.nextEntry(2 * i + 1)!, [2 * (i + 1), i + 1])) {
        exam.equal(tree.nextEntry(2 * i + 1), [2 * (i + 1), i + 1]);
      }
    }
  }
}
