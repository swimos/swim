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

package swim.dynamic;

/**
 * A host object that wraps a guest value and its dynamic bridge.  Used as a
 * base class for strongly typed host objects that wrap guest values, such as
 * host functional interface implementations that invoke guest functions.
 */
public class BridgeGuest implements GuestWrapper {
  protected final Bridge bridge;
  protected final Object guest;

  public BridgeGuest(Bridge bridge, Object guest) {
    this.bridge = bridge;
    this.guest = guest;
  }

  public final Bridge bridge() {
    return this.bridge;
  }

  @Override
  public final Object unwrap() {
    return this.guest;
  }
}
