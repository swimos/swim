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

package swim.concurrent;

/**
 * Handle used to eventually complete an asynchronous operation by invoking a
 * {@link Cont}inuation.  A {@code Call} abstracts over the execution context
 * in which a {@code Cont}inuation runs.  Think of a {@code Call} as a way to
 * asynchronously invoke {@link Cont#bind(Object) Cont.bind(T)}, and {@code
 * Cont#trap(Throwable)}.  Use {@link Stage#call(Cont)} to get a {@code Call}
 * that asynchronously executes a {@code Cont}inuation on an execution {@code
 * Stage}.
 *
 * @see Cont
 * @see Stage
 */
public interface Call<T> extends Cont<T> {
  /**
   * Returns the {@code Cont}inuation that this {@code Call} completes.
   */
  Cont<T> cont();

  /**
   * Completes this {@code Call} with a {@code value} by eventually invoking
   * the {@link Cont#bind(Object) bind(T)} method of this {@code Call}'s {@code
   * Cont}inuation.
   *
   * @throws ContException if this {@code Call} has already been completed.
   */
  void bind(T value);

  /**
   * Completes this {@code Call} with an {@code error} by eventually invoking
   * the {@link Cont#trap(Throwable) trap(Throwable)} method of this {@code
   * Call}'s {@code Cont}inuation.
   *
   * @throws ContException if this {@code Call} has already been completed.
   */
  void trap(Throwable error);

  /**
   * Tries to complete this {@code Call} with a {@code value}, returning {@code
   * true} if this operation caused the completion of the {@code Call}; returns
   * {@code false} if this {@code Call} was already completed.  If successful,
   * the {@link Cont#bind(Object) bind(T)} method of this {@code Call}'s {@code
   * Cont}inuation will eventually be invoked.
   */
  boolean tryBind(T value);

  /**
   * Tries to complete this {@code Call} with an {@code error}, returning
   * {@code true} if this operation caused the completion of the {@code Call};
   * returns {@code false} if this {@code Call} was already completed.  If
   * successful, the {@link Cont#trap(Throwable) trap(Throwable)} method of
   * this {@code Call}'s {@code Cont}inuation will eventually be invoked.
   */
  boolean tryTrap(Throwable error);
}
