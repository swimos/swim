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

package swim.dataflow.graph.windows;

import swim.dataflow.graph.Require;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

/**
 * A fixed length window that slides with the data that is added to it, having no fixed beginning and end.
 */
public class SlidingInterval implements IntervalWindow {

  /**
   * The length of the window in ms.
   */
  private final long len;

  public SlidingInterval(final long windowLen) {
    Require.that(windowLen > 0, "The length of the window must be positive.");
    len = windowLen;
  }

  @Override
  public long length() {
    return len;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(TimeInterval.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.hash(len), hashSeed));
  }

  private static int hashSeed;

  @Override
  public boolean equals(final Object obj) {
    if (this == obj) {
      return true;
    } else if (obj instanceof SlidingInterval) {
      final SlidingInterval other = (SlidingInterval) obj;
      return len == other.len;
    } else {
      return false;
    }
  }

  public static final Form<SlidingInterval> FORM = new Form<SlidingInterval>() {
    @Override
    public Class<?> type() {
      return SlidingInterval.class;
    }

    @Override
    public String tag() {
      return "slidingInterval";
    }

    @Override
    public Item mold(final SlidingInterval interval) {
      if (interval != null) {
        return Record.create(1).attr(tag(), Record.create(1)
            .item(interval.len));
      } else {
        return Item.absent();
      }
    }

    @Override
    public SlidingInterval cast(final Item item) {
      final Value header = item.toValue().header(tag());
      if (header.isDefined()) {
        final long len = header.getItem(0).longValue();
        return new SlidingInterval(len);
      } else {
        return null;
      }
    }
  };
}
