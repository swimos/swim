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

package swim.streaming.timestamps;

import java.util.function.Function;
import java.util.function.LongSupplier;
import java.util.function.ToLongFunction;

/**
 * Assignment of timestamps to records. This can either be based on the content of values of the type or drawn from
 * an external clock.
 * @param <T> The type of the records.
 */
public interface TimestampAssigner<T> extends ToLongFunction<T> {

  /**
   * Distinguish between record based timestamp assignment and clock based.
   * @param fromData Function to call for record timestamps.
   * @param fromClock Function to call for clock timestamps.
   * @param <U> The output type.
   * @return The result.
   */
  <U> U match(Function<ToLongFunction<T>, U> fromData, Function<LongSupplier, U> fromClock);

  /**
   * Record based time stamps.
   * @param ts The timestamp assignment function.
   * @param <T> The type of the records.
   * @return The timestamp assigner.
   */
  static <T> TimestampAssigner<T> fromData(final ToLongFunction<T> ts) {
    return new DataTimestampAssigner<>(ts);
  }

  /**
   * Clock based time stamps.
   * @param <T> The type of the records.
   * @return The clock.
   */
  static <T> TimestampAssigner<T> fromClock() {
    return SystemClockAssigner.instance();
  }
}

final class DataTimestampAssigner<T> implements TimestampAssigner<T> {

  private final ToLongFunction<T> ts;

  DataTimestampAssigner(final ToLongFunction<T> ts) {
    this.ts = ts;
  }

  @Override
  public long applyAsLong(final T value) {
    return ts.applyAsLong(value);
  }

  @Override
  public <U> U match(final Function<ToLongFunction<T>, U> fromData, final Function<LongSupplier, U> fromClock) {
    return fromData.apply(ts);
  }
}

final class SystemClockAssigner<T> implements TimestampAssigner<T>, LongSupplier {

  private SystemClockAssigner() { }

  private static final SystemClockAssigner<Object> INSTANCE = new SystemClockAssigner<>();

  @SuppressWarnings("unchecked")
  static <T> SystemClockAssigner<T> instance() {
    return (SystemClockAssigner<T>) INSTANCE;
  }

  @Override
  public long getAsLong() {
    return System.currentTimeMillis();
  }

  @Override
  public long applyAsLong(final T value) {
    return getAsLong();
  }

  @Override
  public <U> U match(final Function<ToLongFunction<T>, U> fromData, final Function<LongSupplier, U> fromClock) {
    return fromClock.apply(this);
  }
}
