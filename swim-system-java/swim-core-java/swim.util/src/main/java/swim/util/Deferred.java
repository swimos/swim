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

package swim.util;

import java.util.function.Function;

/**
 * Deferred computation of a value.
 *
 * @param <T> The type of the value.
 */
@FunctionalInterface
public interface Deferred<T> {

  /**
   * @return Evaluate the result.
   */
  T get();

  /**
   * Apply a function over the computed value.
   *
   * @param f   The function.
   * @param <U> The type of the result.
   * @return The new deferred value.
   */
  default <U> Deferred<U> andThen(final Function<T, U> f) {
    return () -> f.apply(get());
  }

  /**
   * Memoize the result of this computation for successive calls to {@link #get}.
   *
   * @return The memoized, deferred value.
   */
  default Deferred<T> memoize() {
    return new Memoized<>(this);
  }

  /**
   * Apply a deferred function to a deferred input.
   *
   * @param f     The function.
   * @param value The value.
   * @param <U1>  The type of the input.
   * @param <U2>  The type of the ouput.
   * @return The deferred result.
   */
  static <U1, U2> Deferred<U2> apply(final Deferred<Function<U1, ? extends U2>> f, final Deferred<U1> value) {
    return () -> f.get().apply(value.get());
  }

  /**
   * Convert an already evaluated value to a constant deferred value.
   *
   * @param val The value.
   * @param <T> The type of the value.
   * @return The trivial deferred result.
   */
  static <T> Deferred<T> value(final T val) {
    return new Deferred<T>() {
      @Override
      public T get() {
        return val;
      }

      @Override
      public Deferred<T> memoize() {
        return this;
      }
    };
  }

  /**
   * {@link Deferred} is covariance in its type parameter by the Java type checker cannot verify this. Perform a
   * covariant cast on an instance.
   *
   * @param value The deferred value.
   * @param <U1>  The target type.
   * @param <U2>  The extension of the target type.
   * @return The same deferred instance with the requested type.
   */
  @SuppressWarnings("unchecked")
  static <U1, U2 extends U1> Deferred<U1> covCast(final Deferred<U2> value) {
    return (Deferred<U1>) value;
  }

}

/**
 * Memoizing wrapper around a deferred value.
 *
 * @param <U> The type of the result.
 */
class Memoized<U> implements Deferred<U> {

  private Deferred<U> source;
  private U value = null;

  /**
   * @param valSrc The deferred value to memoize.
   */
  Memoized(final Deferred<U> valSrc) {
    source = valSrc;
  }

  @Override
  public U get() {
    if (source != null) {
      value = source.get();
      //Allow the source to be garbage collected after we have evaluated it.
      source = null;
    }
    return value;
  }

  @Override
  public Deferred<U> memoize() {
    return this;
  }

}


