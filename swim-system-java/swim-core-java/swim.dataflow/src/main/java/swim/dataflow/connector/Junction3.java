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
 * A {@link Junction} that has three input channels.
 *
 * @param <In1> The type of the first input channel.
 * @param <In2> The type of the second input channel.
 * @param <In3> The type of the third input channel.
 * @param <Out> The type of the outputs derived from the inputs.
 */
public interface Junction3<In1, In2, In3, Out> extends Junction<Out> {

  Receptacle<In1> first();

  Receptacle<In2> second();

  Receptacle<In3> third();

}
