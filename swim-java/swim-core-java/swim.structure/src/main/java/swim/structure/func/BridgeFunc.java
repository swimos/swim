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

package swim.structure.func;

import swim.codec.Output;
import swim.structure.Func;
import swim.structure.Item;

public abstract class BridgeFunc extends Func {
  @Override
  public int typeOrder() {
    return 51;
  }

  @Override
  public int compareTo(Item other) {
    if (other instanceof BridgeFunc) {
      return compareTo((BridgeFunc) other);
    }
    return Integer.compare(typeOrder(), other.typeOrder());
  }

  int compareTo(BridgeFunc that) {
    return getClass().getName().compareTo(that.getClass().getName());
  }

  @Override
  public boolean equals(Object other) {
    return this == other;
  }

  @Override
  public int hashCode() {
    return System.identityHashCode(this);
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write(getClass().getName()).write('@').write(Integer.toHexString(hashCode()));
  }
}
