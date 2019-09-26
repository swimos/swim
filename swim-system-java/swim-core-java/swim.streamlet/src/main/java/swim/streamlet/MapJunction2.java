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

/**
 * A {@link MapJunction} with two inputs, one consuming map data and the other simple values.
 *
 * @param <KIn>  The type of the input keys.
 * @param <KOut> The type of the output keys.
 * @param <VIn>  The type of the input map values.
 * @param <VOut> The type of the output map values.
 * @param <T>    The type of the auxiliary channel.
 */
public interface MapJunction2<KIn, KOut, VIn, VOut, T> extends MapJunction<KOut, VOut> {

  /**
   * @return The map input channel.
   */
  MapReceptacle<KIn, VIn> first();

  /**
   * @return The auxiliary input channel.
   */
  Receptacle<T> second();

}
