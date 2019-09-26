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

package swim.streaming.windows.eviction;

import java.util.function.Function;
import swim.streaming.windows.IntervalWindow;
import swim.structure.Form;

/**
 * Evict elements from the window by judging some criterion against a threshold.
 *
 * @param <T> The type of the elements in the window.
 * @param <K> The type of the threshold criterion.
 * @param <W> The type of the window.
 */
public final class ThresholdEviction<T, K extends Comparable<K>, W> implements EvictionStrategy<T, W> {

  private final EvictionCriterionFunction<T, K> criterion;

  private final EvictionThresholdFunction<T, W, K> threshold;

  private final Form<K> criterionForm;

  private final boolean assumeOrdered;

  /**
   * @param criterion     Determines the criterion from a value in the window.
   * @param threshold     Determines the threshold for a window using the most recently added element.
   * @param criterionForm The form of type of the criterion values.
   * @param assumeOrdered Whether to assume that the state is ordered.
   */
  private ThresholdEviction(final EvictionCriterionFunction<T, K> criterion,
                            final EvictionThresholdFunction<T, W, K> threshold,
                            final Form<K> criterionForm, final boolean assumeOrdered) {
    this.criterion = criterion;
    this.threshold = threshold;
    this.criterionForm = criterionForm;
    this.assumeOrdered = assumeOrdered;
  }

  /**
   * @param criterion     Determines the criterion from a value in the window.
   * @param threshold     Determines the threshold for a window using the most recently added element.
   * @param criterionForm The form of type of the criterion values.
   */
  public ThresholdEviction(final EvictionCriterionFunction<T, K> criterion,
                           final EvictionThresholdFunction<T, W, K> threshold, final Form<K> criterionForm) {
    this(criterion, threshold, criterionForm, false);
  }

  public EvictionCriterionFunction<T, K> getCriterion() {
    return criterion;
  }

  public EvictionThresholdFunction<T, W, K> getThreshold() {
    return threshold;
  }

  public Form<K> getCriterionForm() {
    return criterionForm;
  }

  public boolean assumeStateOrdered() {
    return assumeOrdered;
  }

  public static <T, W extends IntervalWindow> ThresholdEviction<T, Long, W> byTimestamp() {
    return new ThresholdEviction<>((val, ts) -> ts, (val, win, ts) -> ts - win.length(), Form.forLong(), true);
  }

  @Override
  public <U> U match(final Function<NoEviction<T, W>, U> none, final Function<ThresholdEviction<T, ?, W>, U> threshold) {
    return threshold.apply(this);
  }
}
