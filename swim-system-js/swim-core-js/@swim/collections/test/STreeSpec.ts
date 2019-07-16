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

import {Spec, Test, Exam} from "@swim/unit";
import {STree} from "@swim/collections";

export class STreeSpec extends Spec {
  @Test
  testSetAndGet(exam: Exam): void {
    const tree = new STree<number>();
    const n = 1 << 18;
    for (let i = 0; i < n; i += 1) {
      tree.push((i & 1) !== 0 ? i : -i);
      if (tree.get(i) !== ((i & 1) !== 0 ? i : -i)) {
        exam.equal(tree.get(i), ((i & 1) !== 0 ? i : -i));
      }
      if (i < 4096 || i === n - 1) {
        for (let j = 0; j <= i; j += 1) {
          if (tree.get(j) !== ((j & 1) !== 0 ? j : -j)) {
            exam.fail("j: " + j + "; i: " + i + "; n: " + n);
            break;
          }
        }
      }
    }
  }

  @Test
  testRemove(exam: Exam): void {
    const tree = new STree<number>();
    const n = 1 << 18;
    for (let i = 0; i < n; i += 1) {
      tree.push((i & 1) !== 0 ? i : -i);
    }
    for (let i = 0; i < n; i += 1) {
      tree.remove(0);
      if (n - i < 4096 || i === n - 1) {
        for (let j = i + 1; j < n; j += 1) {
          if (tree.get(j - i - 1) !== ((j & 1) !== 0 ? j : -j)) {
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
        const tree = new STree<number>();
        tree.pageSplitSize = 8;
        for (let i = 0; i < n; i += 1) {
          tree.push(i);
        }
        tree.drop(k);
        if (tree.length !== n - k) {
          //exam.comment("k: " + k + "; n: " + n);
          exam.equal(tree.length, n - k);
          break;
        }
        for (let i = k; i < n; i += 1) {
          if (tree.get(i - k) !== i) {
            //exam.comment("k: " + k + "; i: " + i + "; n: " + n);
            exam.equal(tree.get(i - k), i);
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
        const tree = new STree<number>();
        tree.pageSplitSize = 8;
        for (let i = 0; i < n; i += 1) {
          tree.push(i);
        }
        tree.take(k);
        if (tree.length !== k) {
          //exam.comment("k: " + k + "; n: " + n);
          exam.equal(tree.length, k);
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
}
