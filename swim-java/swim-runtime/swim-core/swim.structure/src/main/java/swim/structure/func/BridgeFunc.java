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

package swim.structure.func;

import swim.codec.Output;
import swim.structure.Func;
import swim.structure.Item;

public abstract class BridgeFunc extends Func {

  public BridgeFunc() {
    // nop
  }

  @Override
  public int typeOrder() {
    return 51;
  }

  @Override
  public int compareTo(Item other) {
    if (other instanceof BridgeFunc) {
      return this.compareTo((BridgeFunc) other);
    }
    return Integer.compare(this.typeOrder(), other.typeOrder());
  }

  int compareTo(BridgeFunc that) {
    return this.getClass().getName().compareTo(that.getClass().getName());
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
  public <T> Output<T> debug(Output<T> output) {
    output = output.write(this.getClass().getName()).write('@').write(Integer.toHexString(this.hashCode()));
    return output;
  }

}
