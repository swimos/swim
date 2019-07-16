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

package swim.io;

/**
 * Flow-controlled network channel context.
 *
 * @see FlowControl
 * @see FlowModifier
 */
public interface FlowContext {
  /**
   * Returns the current {@code FlowControl} state of the underlying network
   * channel.
   */
  FlowControl flowControl();

  /**
   * Enqueues an atomic replacement of the underlying network channel's flow
   * control state with a new {@code flowControl}.
   */
  void flowControl(FlowControl flowControl);

  /**
   * Enqueues an atomic modification to the underlying network channel's flow
   * control state by applying a {@code flowModifier} delta.
   */
  FlowControl flowControl(FlowModifier flowModifier);
}
