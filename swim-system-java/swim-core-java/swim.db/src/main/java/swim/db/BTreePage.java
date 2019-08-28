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

import swim.structure.Slot;
import swim.structure.Value;
import swim.util.CombinerFunction;
import swim.util.OrderedMapCursor;

public abstract class BTreePage extends Page {
  @Override
  public boolean isBTreePage() {
    return true;
  }

  @Override
  public abstract BTreePageRef pageRef();

  public abstract boolean containsKey(Value key);

  public abstract boolean containsValue(Value value);

  public abstract long indexOf(Value key);

  @Override
  public abstract BTreePageRef getChildRef(int index);

  @Override
  public abstract BTreePage getChild(int index);

  public abstract Slot getSlot(int x);

  public abstract Value getKey(int x);

  public abstract Value minKey();

  public abstract Value maxKey();

  public abstract Value get(Value key);

  public abstract Slot getEntry(Value key);

  public abstract Slot getIndex(long index);

  public abstract Slot firstEntry(Value key);

  public abstract Slot firstEntry();

  public abstract Slot lastEntry();

  public abstract Slot nextEntry(Value key);

  public abstract Slot previousEntry(Value key);

  public abstract BTreePage updated(Value key, Value newValue, long newVersion);

  public abstract BTreePage removed(Value key, long newVersion);

  public abstract BTreePage drop(long lower, long newVersion);

  public abstract BTreePage take(long upper, long newVersion);

  public abstract BTreePage balanced(long newVersion);

  public abstract BTreeNode split(int x, long newVersion);

  public abstract BTreePage splitLeft(int x, long newVersion);

  public abstract BTreePage splitRight(int x, long newVersion);

  public abstract BTreePage reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                                    CombinerFunction<Value, Value> combiner, long newVersion);

  @Override
  public abstract BTreePage evacuated(int post, long version);

  @Override
  public abstract BTreePage committed(int zone, long base, long version);

  @Override
  public abstract BTreePage uncommitted(long version);

  abstract void memoizeSize(BTreePageRef pageRef);

  @Override
  public abstract OrderedMapCursor<Value, Value> cursor();

  public abstract OrderedMapCursor<Value, Value> depthCursor(int maxDepth);

  public abstract OrderedMapCursor<Value, Value> deltaCursor(long sinceVersion);

  public static BTreePage empty(PageContext context, int stem, long version) {
    return BTreeLeaf.empty(context, stem, version);
  }

  public static BTreePage fromValue(BTreePageRef pageRef, Value value) {
    switch (pageRef.pageType()) {
      case LEAF: return BTreeLeaf.fromValue(pageRef, value);
      case NODE: return BTreeNode.fromValue(pageRef, value);
      default: throw new IllegalArgumentException(pageRef.toString());
    }
  }
}
