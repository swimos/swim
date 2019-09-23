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
 * Interface for handlers that can consume the outputs of a {@link Junction}.
 *
 * @param <T> The type of the values.
 */
@FunctionalInterface
public interface Receptacle<T> {

  /**
   * @param value The new value.
   */
  void notifyChange(Deferred<T> value);

}
