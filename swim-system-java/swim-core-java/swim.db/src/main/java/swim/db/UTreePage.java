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
import swim.util.Cursor;

public abstract class UTreePage extends Page {
  @Override
  public boolean isUTreePage() {
    return true;
  }

  @Override
  public abstract UTreePageRef pageRef();

  @Override
  public abstract UTreePageRef getChildRef(int index);

  @Override
  public abstract UTreePage getChild(int index);

  public abstract Value get();

  public abstract UTreePage updated(Value newValue, long newVersion);

  @Override
  public abstract UTreePage evacuated(int post, long version);

  @Override
  public abstract UTreePage committed(int zone, long base, long version);

  @Override
  public abstract UTreePage uncommitted(long version);

  abstract void memoizeSize(UTreePageRef pageRef);

  @Override
  public abstract Cursor<Value> cursor();

  public static UTreePage empty(PageContext context, int stem, long version) {
    return UTreeLeaf.empty(context, stem, version);
  }

  public static UTreePage fromValue(UTreePageRef pageRef, Value value) {
    switch (pageRef.pageType()) {
      case LEAF: return UTreeLeaf.fromValue(pageRef, value);
      default: throw new IllegalArgumentException(pageRef.toString());
    }
  }
}
