// Copyright 2015-2023 Nstream, inc.
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

package swim.dynamic.observable.function;

import swim.dynamic.Bridge;
import swim.dynamic.BridgeGuest;
import swim.observable.function.DidMoveIndex;

public class GuestDidMoveIndex<V> extends BridgeGuest implements DidMoveIndex<V> {

  public GuestDidMoveIndex(Bridge bridge, Object guest) {
    super(bridge, guest);
  }

  @Override
  public void didMove(int fromIndex, int toIndex, V value) {
    this.bridge.guestExecuteVoid(this.guest, fromIndex, toIndex, value);
  }

}
