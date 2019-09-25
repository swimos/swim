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

import java.util.function.Function;
import swim.util.Deferred;

/**
 * {@link Conduit} that transforms the values of its input.
 *
 * @param <In>  The input type.
 * @param <Out> The transformed output type.
 */
public final class TransformConduit<In, Out> extends AbstractJunction<Out> implements Conduit<In, Out> {

  private final Function<In, ? extends Out> f;

  /**
   * @param f The transformation function.
   */
  public TransformConduit(final Function<In, ? extends Out> f) {
    this.f = f;
  }

  @Override
  public void notifyChange(final Deferred<In> value) {
    emit(value.andThen(f));
  }
}
