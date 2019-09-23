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

package swim.dataflow.connector;

import swim.collections.FingerTrieSeq;
import swim.dataflow.graph.Require;

/**
 * Abstract implementation of {@link Junction} that provides methods to pass values on to any number
 * of {@link Receptacle}s.
 *
 * @param <T> The type of the values.
 */
public abstract class AbstractJunction<T> implements Junction<T> {

  /**
   * Receptacles subscribed to the output of this junction.
   */
  private FingerTrieSeq<Receptacle<? super T>> receptacles = FingerTrieSeq.empty();

  @Override
  public final void subscribe(final Receptacle<? super T> receiver) {
    Require.that(receiver != null, "Receiver must not be null.");
    receptacles = receptacles.appended(receiver);
  }

  /**
   * Emit a value to the subscribers.
   *
   * @param value The value.
   */
  protected final void emit(final Deferred<? extends T> value) {
    for (final Receptacle<? super T> receptacle : receptacles) {
      emitOn(value, receptacle);
    }
  }

  /**
   * Emit a value to the subscribers.
   *
   * @param value The value.
   */
  protected final void emit(final T value) {
    emit(Deferred.value(value));
  }

  private static <U1, U2 extends U1> void emitOn(final Deferred<U2> value,
                                                 final Receptacle<U1> receptacle) {
    receptacle.notifyChange(Deferred.covCast(value));
  }

}
