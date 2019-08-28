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
import swim.util.Cursor;

public abstract class STreePage extends Page {
  @Override
  public boolean isSTreePage() {
    return true;
  }

  @Override
  public abstract STreePageRef pageRef();

  public abstract boolean contains(Value value);

  @Override
  public abstract STreePageRef getChildRef(int index);

  @Override
  public abstract STreePage getChild(int index);

  public abstract Slot getSlot(int x);

  public abstract Value get(long index);

  public abstract Slot getEntry(long index);

  public abstract STreePage updated(long index, Value newValue, long newVersion);

  public abstract STreePage inserted(long index, Value key, Value newValue, long newVersion);

  public STreePage appended(Value key, Value newValue, long newVersion) {
    return inserted(span(), key, newValue, newVersion);
  }

  public STreePage prepended(Value key, Value newValue, long newVersion) {
    return inserted(0L, key, newValue, newVersion);
  }

  public abstract STreePage removed(long index, long newVersion);

  public abstract STreePage removed(Object object, long newVersion);

  public abstract STreePage drop(long lower, long newVersion);

  public abstract STreePage take(long upper, long newVersion);

  public abstract long indexOf(Object object);

  public abstract long lastIndexOf(Object object);

  public abstract void copyToArray(Object[] array, int offset);

  public abstract STreePage balanced(long newVersion);

  public abstract STreeNode split(int x, long newVersion);

  public abstract STreePage splitLeft(int x, long newVersion);

  public abstract STreePage splitRight(int x, long newVersion);

  public abstract STreePage reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                                    CombinerFunction<Value, Value> combiner, long newVersion);

  @Override
  public abstract STreePage evacuated(int post, long version);

  @Override
  public abstract STreePage committed(int zone, long base, long version);

  @Override
  public abstract STreePage uncommitted(long version);

  abstract void memoizeSize(STreePageRef pageRef);

  @Override
  public abstract Cursor<Slot> cursor();

  public abstract Cursor<Slot> depthCursor(int maxDepth);

  public abstract Cursor<Slot> deltaCursor(long sinceVersion);

  public static STreePage empty(PageContext context, int stem, long version) {
    return STreeLeaf.empty(context, stem, version);
  }

  public static STreePage fromValue(STreePageRef pageRef, Value value) {
    switch (pageRef.pageType()) {
      case LEAF: return STreeLeaf.fromValue(pageRef, value);
      case NODE: return STreeNode.fromValue(pageRef, value);
      default: throw new IllegalArgumentException(pageRef.toString());
    }
  }
}
