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
import swim.dynamic.HostArrayType;

public class VmHostArray<T> extends VmHostProxy<T> implements ProxyArray {
  final VmBridge bridge;
  final HostArrayType<? super T> type;
  final T self;

  public VmHostArray(VmBridge bridge, HostArrayType<? super T> type, T self) {
    this.bridge = bridge;
    this.type = type;
    this.self = self;
  }

  @Override
  public final T unwrap() {
    return this.self;
  }

  @Override
  public long getSize() {
    return this.type.elementCount(this.bridge, this.self);
  }

  @Override
  public Object get(long index) {
    return this.type.getElement(this.bridge, this.self, index);
  }

  @Override
  public void set(long index, Value value) {
    this.type.setElement(this.bridge, this.self, index, value);
  }

  @Override
  public boolean remove(long index) {
    return this.type.removeElement(this.bridge, this.self, index);
  }
}
