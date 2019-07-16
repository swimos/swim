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

package swim.vm;

import org.graalvm.polyglot.Value;
import org.graalvm.polyglot.proxy.ProxyArray;

public class VmBridgeArray extends VmHostProxy<Object[]> implements ProxyArray {
  final VmBridge bridge;
  final Object[] array;

  public VmBridgeArray(VmBridge bridge, Object[] array) {
    this.bridge = bridge;
    this.array = array;
  }

  @Override
  public final Object[] unwrap() {
    return this.array;
  }

  @Override
  public long getSize() {
    return (long) this.array.length;
  }

  @Override
  public Object get(long index) {
    return this.bridge.hostToGuest(this.array[(int) index]);
  }

  @Override
  public void set(long index, Value value) {
    this.array[(int) index] = this.bridge.guestToHost(value);
  }

  @Override
  public boolean remove(long index) {
    throw new UnsupportedOperationException();
  }
}
