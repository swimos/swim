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

import swim.streaming.Junction;
import swim.streaming.Receptacle;
import swim.util.Deferred;

/**
 * Abstract {@link Junction} that consumers data from two input sources.
 *
 * @param <In1> The type of the first input.
 * @param <In2> The type of the second input.
 * @param <Out> The type of the output.
 */
public abstract class AbstractJunction2<In1, In2, Out> extends AbstractJunction<Out> implements Junction2<In1, In2, Out> {

  private final Receptacle<In1> firstReceptacle = this::notifyChangeFirst;

  private final Receptacle<In2> secondReceptacle = this::notifyChangeSecond;

  /**
   * Handle a change on the first input.
   *
   * @param value The input value.
   */
  protected abstract void notifyChangeFirst(Deferred<In1> value);

  /**
   * Handle a change on the second input.
   *
   * @param value The input value.
   */
  protected abstract void notifyChangeSecond(Deferred<In2> value);


  @Override
  public final Receptacle<In1> first() {
    return firstReceptacle;
  }

  @Override
  public final Receptacle<In2> second() {
    return secondReceptacle;
  }
}
