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

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Require;

/**
 * Type to reduce the mean of a stream of values.
 */
public final class Mean {

  private final double mean;

  private final long count;

  /**
   * @param meanAc The accumulated mean.
   * @param n The number of observations.
   */
  private Mean(final double meanAc, final long n) {
    mean = meanAc;
    count = n;
  }

  /**
   * Create a mean object.
   * @param sumValues The sum of the observations.
   * @param n The number of observations.
   * @return The mean.
   */
  public static Mean of(final double sumValues, final long n) {
    Require.that(n >= 0, "Count for a mean must be non-negative.");
    Require.that(n > 0 || sumValues == 0, "Sum of no values must be 0.0.");
    return new Mean(sumValues / n, n);
  }

  public static Mean of(final double value) {
    return new Mean(value, 1);
  }

  /**
   * @return The mean value.
   */
  public double get() {
    return mean;
  }

  /**
   * @return The sum of the observations.
   */
  public double getSum() {
    return mean * count;
  }

  /**
   * @return The count of observations.
   */
  public long getCount() {
    return count;
  }

  /**
   * Add a value into the mean.
   * @param value The value.
   * @return The new mean.
   */
  public Mean add(final double value) {
    final double delta = value - mean;
    final double newMean = mean + (delta / (count + 1));
    return new Mean(newMean, count + 1);
  }

  /**
   * Combine together two means.
   * @param m1 The first mean.
   * @param m2 The second mean.
   * @return The combined mean.
   */
  public static Mean combine(final Mean m1, final Mean m2) {
    final double delta = m2.mean - m1.mean;
    final long newCount = m1.count + m2.count;
    final double newMean = m1.mean + delta * ((double) m2.count / (double) newCount);

    return new Mean(newMean, newCount);
  }

  /**
   * Combine this mean with another.
   * @param other The other mean.
   * @return The combined mean.
   */
  public Mean combine(final Mean other) {
    return combine(this, other);
  }


  public static final Form<Mean> FORM = new Form<Mean>() {
    @Override
    public Class<?> type() {
      return Mean.class;
    }

    @Override
    public String tag() {
      return "mean";
    }

    @Override
    public Item mold(final Mean mean) {
      if (mean != null) {
        return Record.create(1).attr(tag(), Record.create(2)
            .item(mean.mean).item(mean.count));
      } else {
        return Item.absent();
      }
    }

    @Override
    public Mean cast(final Item item) {
      final Value header = item.toValue().header(tag());
      if (header.isDefined()) {
        final double meanAcc = header.getItem(0).doubleValue();
        final long count = header.getItem(1).longValue();
        return Mean.of(meanAcc, count);
      } else {
        return null;
      }
    }

  };

  public static final Mean ZERO = new Mean(0.0, 0);

}
