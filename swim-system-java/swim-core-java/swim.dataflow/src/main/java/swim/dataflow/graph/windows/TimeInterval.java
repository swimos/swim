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

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;
import swim.util.Require;

/**
 * Window representing a fixed time interval.
 */
public class TimeInterval implements IntervalWindow {

  private final long start, end;

  /**
   * @param startTime The start of the interval in epoch ms (inclusive).
   * @param endTime   The end of the interval in epoch ms (exclusive).
   */
  public TimeInterval(final long startTime, final long endTime) {
    Require.that(endTime > startTime, String.format("End time %d is not after start time %d.", startTime, endTime));
    start = startTime;
    end = endTime;
  }

  /**
   * @return The start of the interval in epoch ms (inclusive).
   */
  public long getStart() {
    return start;
  }

  /**
   * @return The end of the interval in epoch ms (exclusive).
   */
  public long getEnd() {
    return end;
  }

  @Override
  public long length() {
    return end - start;
  }

  /**
   * Determine if this interval contains a time stamp.
   *
   * @param t The time stamp in epoch ms.
   * @return Whether the timestamp is in the interval.
   */
  public boolean contains(final long t) {
    return t >= start && t < end;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(TimeInterval.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.hash(end), Murmur3.mix(Murmur3.hash(start), hashSeed)));
  }

  private static int hashSeed;

  @Override
  public boolean equals(final Object obj) {
    if (this == obj) {
      return true;
    } else if (obj instanceof TimeInterval) {
      final TimeInterval other = (TimeInterval) obj;
      return start == other.start && end == other.end;
    } else {
      return false;
    }
  }

  @Kind
  public static final Form<TimeInterval> FORM = new Form<TimeInterval>() {
    @Override
    public Class<?> type() {
      return TimeInterval.class;
    }

    @Override
    public String tag() {
      return "timeInterval";
    }

    @Override
    public Item mold(final TimeInterval interval) {
      if (interval != null) {
        return Record.create(1).attr(tag(), Record.create(2)
                .item(interval.start).item(interval.end));
      } else {
        return Item.absent();
      }
    }

    @Override
    public TimeInterval cast(final Item item) {
      final Value header = item.toValue().header(tag());
      if (header.isDefined()) {
        final long start = header.getItem(0).longValue();
        final long end = header.getItem(1).longValue();
        return new TimeInterval(start, end);
      } else {
        return null;
      }
    }
  };
}
