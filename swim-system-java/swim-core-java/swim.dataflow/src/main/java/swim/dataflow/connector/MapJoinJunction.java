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

/**
 * {@link MapJunction} that consumes two map inputs with the same key type and generates another map output.
 *
 * @param <KIn>  The input key type.
 * @param <VIn1> The first input value type.
 * @param <VIn2> The second input value type.
 * @param <KOut> The output key type.
 * @param <VOut> The output value type.
 */
public interface MapJoinJunction<KIn, VIn1, VIn2, KOut, VOut> extends MapJunction<KOut, VOut> {

  /**
   * @return The first input receptacle.
   */
  MapReceptacle<KIn, VIn1> first();

  /**
   * @return The second input receptacle.
   */
  MapReceptacle<KIn, VIn2> second();
}
