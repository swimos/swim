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

package swim.dataflow.windows;

import java.util.function.Function;
import java.util.function.LongSupplier;
import java.util.function.ToLongFunction;
import swim.streaming.timestamps.TimestampAssigner;
import swim.util.Pair;

/**
 * A fake clock that can be incremented at will.
 */
final class FakeClock implements TimestampAssigner<Pair<Long, Integer>>, LongSupplier {

  @Override
  public <U> U match(final Function<ToLongFunction<Pair<Long, Integer>>, U> fromData, final Function<LongSupplier, U> fromClock) {
    return fromClock.apply(this);
  }

  @Override
  public long applyAsLong(final Pair<Long, Integer> value) {
    return getAsLong();
  }

  /**
   * The current time according to the clock.
   */
  private long ts = 1000L;

  void advance(final long time) {
    if (time < ts) {
      throw new IllegalArgumentException("Time must increase monotonically.");
    }
    ts = time;
  }

  @Override
  public long getAsLong() {
    return ts;
  }
}
