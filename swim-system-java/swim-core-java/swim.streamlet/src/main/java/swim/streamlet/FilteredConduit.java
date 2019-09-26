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

package swim.streamlet;

import java.util.function.Predicate;
import swim.util.Deferred;

/**
 * {@link Conduit} that only passes some of its input values to the output.
 *
 * @param <T> The type of the values.
 */
public class FilteredConduit<T> extends AbstractJunction<T> implements Conduit<T, T> {

  private final Predicate<T> predicate;

  /**
   * @param predicate Predicate to assess the inputs.
   */
  public FilteredConduit(final Predicate<T> predicate) {
    this.predicate = predicate;
  }

  @Override
  public void notifyChange(final Deferred<T> value) {
    final Deferred<T> memoized = value.memoize();
    if (predicate.test(memoized.get())) {
      emit(memoized);
    }
  }
}
