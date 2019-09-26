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

package swim.streaming.statistics;

import java.util.function.ToDoubleFunction;
import java.util.function.ToIntFunction;
import java.util.function.ToLongFunction;
import swim.streaming.MapSwimStream;
import swim.streaming.MapWindowedSwimStream;
import swim.streaming.SwimStream;
import swim.streaming.WindowedSwimStream;
import swim.streaming.sampling.Sampling;
import swim.streaming.windows.KeyedWindowFoldFunction;
import swim.structure.Form;

/**
 * Simple statistical transforms for streams.
 */
public final class StreamStatistics {

  private StreamStatistics() {
  }

  public static SwimStream<Mean> mean(final SwimStream<Double> values) {
    return values.fold(Mean.ZERO, Mean::add, Mean.FORM);
  }

  public static SwimStream<Mean> mean(final SwimStream<Double> values, final Sampling sampling) {
    return values.fold(Mean.ZERO, Mean::add, Mean.FORM, sampling);
  }

  public static <W> SwimStream<Mean> mean(final WindowedSwimStream<Double, W> values) {
    return values.fold(Mean.ZERO, (w, m, v) -> m.add(v), (w, m1, m2) -> m1.combine(m2), Mean.FORM);
  }

  public static <T, W> SwimStream<Mean> mean(final WindowedSwimStream<T, W> values, final ToDoubleFunction<T> transform) {
    return values.fold(Mean.ZERO, (w, m, v) -> m.add(transform.applyAsDouble(v)), (w, m1, m2) -> m1.combine(m2), Mean.FORM);
  }

  public static <K, W> MapSwimStream<K, Mean> mean(final MapWindowedSwimStream<K, Double, W> keyedValues) {
    final KeyedWindowFoldFunction<K, Double, W, Mean> winFun = (k, w, m, v) -> m.add(v);
    return keyedValues.fold(Mean.ZERO, winFun, (m1, m2) -> m1.combine(m2), Mean.FORM);
  }

  public static <K, T, W> MapSwimStream<K, Mean> mean(final MapWindowedSwimStream<K, T, W> keyedValues, final ToDoubleFunction<T> transform) {
    final KeyedWindowFoldFunction<K, T, W, Mean> winFun = (k, w, m, v) -> m.add(transform.applyAsDouble(v));
    return keyedValues.fold(Mean.ZERO, winFun, (m1, m2) -> m1.combine(m2), Mean.FORM);
  }

  public static SwimStream<SummaryStatistics> summaryStatistics(final SwimStream<Double> values) {
    return values.fold(SummaryStatistics.ZERO, SummaryStatistics::add, SummaryStatistics.FORM);
  }

  public static SwimStream<SummaryStatistics> summaryStatistics(final SwimStream<Double> values, final Sampling sampling) {
    return values.fold(SummaryStatistics.ZERO, SummaryStatistics::add, SummaryStatistics.FORM, sampling);
  }

  public static <W> SwimStream<SummaryStatistics> summaryStatistics(final WindowedSwimStream<Double, W> values) {
    return values.fold(SummaryStatistics.ZERO, (w, m, v) -> m.add(v), (w, m1, m2) -> m1.combine(m2), SummaryStatistics.FORM);
  }

  public static <T, W> SwimStream<SummaryStatistics> summaryStatistics(final WindowedSwimStream<T, W> values,
                                                                       final ToDoubleFunction<T> transform) {
    return values.fold(SummaryStatistics.ZERO, (w, m, v) -> m.add(transform.applyAsDouble(v)),
        (w, m1, m2) -> m1.combine(m2), SummaryStatistics.FORM);
  }

  public static <K, W> MapSwimStream<K, SummaryStatistics> summaryStatistics(final MapWindowedSwimStream<K, Double, W> keyedValues) {
    final KeyedWindowFoldFunction<K, Double, W, SummaryStatistics> winFun = (k, w, m, v) -> m.add(v);
    return keyedValues.fold(SummaryStatistics.ZERO, winFun, (s1, s2) -> s1.combine(s2), SummaryStatistics.FORM);
  }

  public static <K, T, W> MapSwimStream<K, SummaryStatistics> summaryStatistics(final MapWindowedSwimStream<K, T, W> keyedValues,
                                                                   final ToDoubleFunction<T> transform) {
    final KeyedWindowFoldFunction<K, T, W, SummaryStatistics> winFun = (k, w, m, v) -> m.add(transform.applyAsDouble(v));
    return keyedValues.fold(SummaryStatistics.ZERO, winFun, (m1, m2) -> m1.combine(m2), SummaryStatistics.FORM);
  }

  public static SwimStream<Double> minDouble(final SwimStream<Double> values) {
    return values.reduce(Math::min);
  }

  public static SwimStream<Double> minDouble(final SwimStream<Double> values, final Sampling sampling) {
    return values.reduce(Math::min, sampling);
  }

  public static <W> SwimStream<Double> minDouble(final WindowedSwimStream<Double, W> values) {
    return values.reduce((w, v1, v2) -> Math.min(v1, v2));
  }

  public static <T, W> SwimStream<Double> minDouble(final WindowedSwimStream<T, W> values, final ToDoubleFunction<T> transform) {
    return values.fold(Double.POSITIVE_INFINITY, (w, u, v) -> Math.min(u, transform.applyAsDouble(v)), Form.forDouble());
  }

  public static <K, W> MapSwimStream<K, Double> minDouble(final MapWindowedSwimStream<K, Double, W> values) {
    return values.reduceByKey((k, w, v1, v2) -> Math.min(v1, v2));
  }

  public static <K, T, W> MapSwimStream<K, Double> minDouble(final MapWindowedSwimStream<K, T, W> values, final ToDoubleFunction<T> transform) {
    return values.fold(Double.POSITIVE_INFINITY, (k, w, u, v) -> Math.min(u, transform.applyAsDouble(v)), Form.forDouble());
  }

  public static SwimStream<Double> maxDouble(final SwimStream<Double> values) {
    return values.reduce(Math::max);
  }

  public static SwimStream<Double> maxDouble(final SwimStream<Double> values, final Sampling sampling) {
    return values.reduce(Math::max, sampling);
  }

  public static <W> SwimStream<Double> maxDouble(final WindowedSwimStream<Double, W> values) {
    return values.reduce((w, v1, v2) -> Math.max(v1, v2));
  }

  public static <T, W> SwimStream<Double> maxDouble(final WindowedSwimStream<T, W> values, final ToDoubleFunction<T> transform) {
    return values.fold(Double.NEGATIVE_INFINITY, (w, u, v) -> Math.max(u, transform.applyAsDouble(v)), Form.forDouble());
  }

  public static <K, W> MapSwimStream<K, Double> maxDouble(final MapWindowedSwimStream<K, Double, W> values) {
    return values.reduceByKey((k, w, v1, v2) -> Math.max(v1, v2));
  }

  public static <K, T, W> MapSwimStream<K, Double> maxDouble(final MapWindowedSwimStream<K, T, W> values, final ToDoubleFunction<T> transform) {
    return values.fold(Double.NEGATIVE_INFINITY, (k, w, u, v) -> Math.max(u, transform.applyAsDouble(v)), Form.forDouble());
  }

  public static SwimStream<Integer> minInt(final SwimStream<Integer> values) {
    return values.reduce(Math::min);
  }

  public static SwimStream<Integer> minInt(final SwimStream<Integer> values, final Sampling sampling) {
    return values.reduce(Math::min, sampling);
  }

  public static <W> SwimStream<Integer> minInt(final WindowedSwimStream<Integer, W> values) {
    return values.reduce((w, v1, v2) -> Math.min(v1, v2));
  }

  public static <T, W> SwimStream<Integer> minInt(final WindowedSwimStream<T, W> values, final ToIntFunction<T> transform) {
    return values.fold(Integer.MAX_VALUE, (w, u, v) -> Math.min(u, transform.applyAsInt(v)), Form.forInteger());
  }

  public static <K, W> MapSwimStream<K, Integer> minInt(final MapWindowedSwimStream<K, Integer, W> values) {
    return values.reduceByKey((k, w, v1, v2) -> Math.min(v1, v2));
  }

  public static <K, T, W> MapSwimStream<K, Integer> minInt(final MapWindowedSwimStream<K, T, W> values, final ToIntFunction<T> transform) {
    return values.fold(Integer.MAX_VALUE, (k, w, u, v) -> Math.min(u, transform.applyAsInt(v)), Form.forInteger());
  }

  public static SwimStream<Integer> maxInt(final SwimStream<Integer> values) {
    return values.reduce(Math::max);
  }

  public static SwimStream<Integer> maxInt(final SwimStream<Integer> values, final Sampling sampling) {
    return values.reduce(Math::max, sampling);
  }

  public static <W> SwimStream<Integer> maxInt(final WindowedSwimStream<Integer, W> values) {
    return values.reduce((w, v1, v2) -> Math.max(v1, v2));
  }

  public static <T, W> SwimStream<Integer> maxInt(final WindowedSwimStream<T, W> values, final ToIntFunction<T> transform) {
    return values.fold(Integer.MIN_VALUE, (w, u, v) -> Math.max(u, transform.applyAsInt(v)), Form.forInteger());
  }

  public static <K, W> MapSwimStream<K, Integer> maxInt(final MapWindowedSwimStream<K, Integer, W> values) {
    return values.reduceByKey((k, w, v1, v2) -> Math.max(v1, v2));
  }

  public static <K, T, W> MapSwimStream<K, Integer> maxInt(final MapWindowedSwimStream<K, T, W> values, final ToIntFunction<T> transform) {
    return values.fold(Integer.MIN_VALUE, (k, w, u, v) -> Math.max(u, transform.applyAsInt(v)), Form.forInteger());
  }

  public static SwimStream<Long> minLong(final SwimStream<Long> values) {
    return values.reduce(Math::min);
  }

  public static SwimStream<Long> minLong(final SwimStream<Long> values, final Sampling sampling) {
    return values.reduce(Math::min, sampling);
  }

  public static <W> SwimStream<Long> minLong(final WindowedSwimStream<Long, W> values) {
    return values.reduce((w, v1, v2) -> Math.min(v1, v2));
  }

  public static <T, W> SwimStream<Long> minLong(final WindowedSwimStream<T, W> values, final ToLongFunction<T> transform) {
    return values.fold(Long.MAX_VALUE, (w, u, v) -> Math.min(u, transform.applyAsLong(v)), Form.forLong());
  }

  public static <K, W> MapSwimStream<K, Long> minLong(final MapWindowedSwimStream<K, Long, W> values) {
    return values.reduceByKey((k, w, v1, v2) -> Math.min(v1, v2));
  }

  public static <K, T, W> MapSwimStream<K, Long> minLong(final MapWindowedSwimStream<K, T, W> values, final ToLongFunction<T> transform) {
    return values.fold(Long.MAX_VALUE, (k, w, u, v) -> Math.min(u, transform.applyAsLong(v)), Form.forLong());
  }

  public static SwimStream<Long> maxLong(final SwimStream<Long> values) {
    return values.reduce(Math::max);
  }

  public static SwimStream<Long> maxLong(final SwimStream<Long> values, final Sampling sampling) {
    return values.reduce(Math::max, sampling);
  }

  public static <W> SwimStream<Long> maxLong(final WindowedSwimStream<Long, W> values) {
    return values.reduce((w, v1, v2) -> Math.max(v1, v2));
  }

  public static <T, W> SwimStream<Long> maxLong(final WindowedSwimStream<T, W> values, final ToLongFunction<T> transform) {
    return values.fold(Long.MIN_VALUE, (w, u, v) -> Math.max(u, transform.applyAsLong(v)), Form.forLong());
  }

  public static <K, W> MapSwimStream<K, Long> maxLong(final MapWindowedSwimStream<K, Long, W> values) {
    return values.reduceByKey((k, w, v1, v2) -> Math.max(v1, v2));
  }

  public static <K, T, W> MapSwimStream<K, Long> maxLong(final MapWindowedSwimStream<K, T, W> values, final ToLongFunction<T> transform) {
    return values.fold(Long.MIN_VALUE, (k, w, u, v) -> Math.min(u, transform.applyAsLong(v)), Form.forLong());
  }

  static <T extends Comparable<T>> T min(final T left, final T right) {
    if (left.compareTo(right) <= 0) {
      return left;
    } else {
      return  right;
    }
  }

  static <T extends Comparable<T>> T max(final T left, final T right) {
    if (left.compareTo(right) >= 0) {
      return left;
    } else {
      return  right;
    }
  }

  public static <T extends Comparable<T>> SwimStream<T> min(final SwimStream<T> values) {
    return values.reduce(StreamStatistics::min);
  }

  public static <T extends Comparable<T>> SwimStream<T> min(final SwimStream<T> values, final Sampling sampling) {
    return values.reduce(StreamStatistics::min, sampling);
  }

  public static <T extends Comparable<T>, W> SwimStream<T> min(final WindowedSwimStream<T, W> values) {
    return values.reduce((w, v1, v2) -> StreamStatistics.min(v1, v2));
  }

  public static <K, T extends Comparable<T>, W> MapSwimStream<K, T> min(final MapWindowedSwimStream<K, T, W> values) {
    return values.reduceByKey((k, w, v1, v2) -> StreamStatistics.min(v1, v2));
  }

  public static <T extends Comparable<T>> SwimStream<T> max(final SwimStream<T> values) {
    return values.reduce(StreamStatistics::max);
  }

  public static <T extends Comparable<T>> SwimStream<T> max(final SwimStream<T> values, final Sampling sampling) {
    return values.reduce(StreamStatistics::max, sampling);
  }

  public static <T extends Comparable<T>, W> SwimStream<T> max(final WindowedSwimStream<T, W> values) {
    return values.reduce((w, v1, v2) -> StreamStatistics.max(v1, v2));
  }

  public static <K, T extends Comparable<T>, W> MapSwimStream<K, T> max(final MapWindowedSwimStream<K, T, W> values) {
    return values.reduceByKey((k, w, v1, v2) -> StreamStatistics.max(v1, v2));
  }
}
