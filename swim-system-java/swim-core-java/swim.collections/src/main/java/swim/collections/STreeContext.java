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

import java.util.concurrent.ThreadLocalRandom;

public abstract class STreeContext<T> {
  @SuppressWarnings("unchecked")
  protected Object identify(T value) {
    final byte[] bytes = new byte[6];
    ThreadLocalRandom.current().nextBytes(bytes);
    return bytes;
  }

  @SuppressWarnings("unchecked")
  protected int compare(Object x, Object y) {
    return ((Comparable<Object>) x).compareTo(y);
  }

  protected int pageSplitSize() {
    return 32;
  }

  protected boolean pageShouldSplit(STreePage<T> page) {
    return page.arity() > pageSplitSize();
  }

  protected boolean pageShouldMerge(STreePage<T> page) {
    return page.arity() < pageSplitSize() >>> 1;
  }
}
