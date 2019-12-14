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

package swim.dataflow.graph.statistics.model;

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

/**
 * Accumulation type for very simple summary statistics.
 */
public final class SummaryStatistics {

  private final double mean;

  private final double var;

  private final long count;

  private final double min;

  private final double max;

  /**
   * @param meanVal Current value of the mean.
   * @param varAcc Current accumulated variance.
   * @param n Current count of observations.
   * @param minVal The minimum observed value.
   * @param maxVal The maximum observed value.
   */
  private SummaryStatistics(final double meanVal, final double varAcc, final long n, final double minVal, final double maxVal) {
    mean = meanVal;
    var = varAcc;
    count = n;
    min = minVal;
    max = maxVal;
  }

  public double getMean() {
    return mean;
  }

  public long getCount() {
    return count;
  }

  /**
   * @return Population variance of observed values.
   */
  public double getVariance() {
    return var;
  }

  /**
   * @return Population standard deviation of observed values.
   */
  public double getStdDev() {
    return Math.sqrt(getVariance());
  }

  /**
   * @return Sample variance based on observed data.
   */
  public double getSampleVariance() {
    return count < 2 ? 0.0 : var * ((double) count / (double) (count - 1));
  }

  /**
   * @return Sample variance based on observed data.
   */
  public double getSampleStdDev() {
    return Math.sqrt(getSampleVariance());
  }

  public double getMin() {
    return min;
  }

  public double getMax() {
    return max;
  }

  /**
   * Create a record based on a single vale.
   * @param value The value.
   * @return The trivial statistics object.
   */
  public static SummaryStatistics of(final double value) {
    return new SummaryStatistics(value, 0.0, 1, value, value);
  }

  /**
   * Combine together two summaries.
   * @param s1 The first summary.
   * @param s2 The second summary.
   * @return The combined summary.
   */
  public static SummaryStatistics combine(final SummaryStatistics s1, final SummaryStatistics s2) {
    final double m1 = s1.mean;

    final long n1 = s1.count;
    final long n2 = s2.count;

    final long newCount = n1 + n2;

    final double delta = s2.mean - m1;

    final double newMean = m1 + (delta * n2) / newCount;

    final double varDelta = s2.var - s1.var;

    final double c1 = delta * ((double) n1 / (double) newCount);
    final double c2 = delta * ((double) n2 / (double) newCount);

    final double newM2Acc = s1.var + varDelta * ((double) n2 / (double) newCount) + c1 * c2;

    return new SummaryStatistics(newMean, newM2Acc, newCount, Math.min(s1.min, s2.min), Math.max(s1.max, s2.max));
  }

  /**
   * Combine this summary with another.
   * @param other The other summary.
   * @return The combined summary.
   */
  public SummaryStatistics combine(final SummaryStatistics other) {
    return combine(this, other);
  }

  /**
   * Add a value into this summary.
   * @param value The value.
   * @return The new summary.
   */
  public SummaryStatistics add(final double value) {
    return combine(this, SummaryStatistics.of(value));
  }

  public static final SummaryStatistics ZERO = new SummaryStatistics(
      0.0, 0.0, 0, 0.0, 0.0);

  public static final  Form<SummaryStatistics> FORM = new Form<SummaryStatistics>() {

    @Override
    public Class<?> type() {
      return SummaryStatistics.class;
    }

    @Override
    public String tag() {
      return "summaryStatistics";
    }

    @Override
    public Item mold(final SummaryStatistics stats) {
      if (stats != null) {
        return Record.create(1).attr(tag(), Record.create(5)
            .item(stats.mean)
            .item(stats.count)
            .item(stats.var)
            .item(stats.min)
            .item(stats.max));
      } else {
        return Item.absent();
      }
    }

    @Override
    public SummaryStatistics cast(final Item item) {
      final Value header = item.toValue().header(tag());
      if (header.isDefined()) {
        final double mean = header.getItem(0).doubleValue();
        final long count = header.getItem(1).longValue();
        final double var = header.getItem(2).doubleValue();
        final double min = header.getItem(3).doubleValue();
        final double max = header.getItem(4).doubleValue();
        return new SummaryStatistics(mean, var, count, min, max);
      } else {
        return null;
      }
    }
  };

}
