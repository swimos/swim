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

import swim.structure.Value;

public class TreeContext extends PageContext {
  public TreeDelegate treeDelegate() {
    return null;
  }

  public void setTreeDelegate(TreeDelegate treeDelegate) {
    throw new UnsupportedOperationException();
  }

  public void treeDidChange(Tree newTree, Tree oldTree) {
    // nop
  }

  public void treeDidCommit(Tree newTree, Tree oldTree) {
    // nop
  }

  public void treeDidClear(Tree newTree, Tree oldTree) {
    // nop
  }

  public void btreeDidUpdate(BTree newTree, BTree oldTree, Value key, Value newValue, Value oldValue) {
    // nop
  }

  public void btreeDidRemove(BTree newTree, BTree oldTree, Value key, Value oldValue) {
    // nop
  }

  public void btreeDidDrop(BTree newTree, BTree oldTree, long lower) {
    // nop
  }

  public void btreeDidTake(BTree newTree, BTree oldTree, long upper) {
    // nop
  }

  public void qtreeDidUpdate(QTree newTree, QTree oldTree, Value key, long x, long y, Value newValue, Value oldValue) {
    // nop
  }

  public void qtreeDidMove(QTree newTree, QTree oldTree, Value key, long newX, long newY, Value newValue, long oldX, long oldY, Value oldValue) {
    // nop
  }

  public void qtreeDidRemove(QTree newTree, QTree oldTree, Value key, long x, long y, Value oldValue) {
    // nop
  }

  public void streeDidUpdate(STree newTree, STree oldTree, long index, Value key, Value newValue, Value oldValue) {
    // nop
  }

  public void streeDidInsert(STree newTree, STree oldTree, long index, Value key, Value newValue) {
    // nop
  }

  public void streeDidRemove(STree newTree, STree oldTree, long index, Value key, Value oldValue) {
    // nop
  }

  public void streeDidMove(STree newTree, STree oldTree, long fromIndex, long toIndex, Value key, Value value) {
    // nop
  }

  public void streeDidDrop(STree newTree, STree oldTree, long lower) {
    // nop
  }

  public void streeDidTake(STree newTree, STree oldTree, long upper) {
    // nop
  }

  public void utreeDidUpdate(UTree newTree, UTree oldTree, Value newValue, Value oldValue) {
    // nop
  }
}
