// Copyright 2015-2021 Swim inc.
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

package swim.runtime;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public final class StoreAddress implements CellAddress, Debug {

  final String storeName;

  public StoreAddress(String storeName) {
    this.storeName = storeName;
  }

  public String storeName() {
    return this.storeName;
  }

  public StoreAddress storeName(String storeName) {
    return this.copy(storeName);
  }

  StoreAddress copy(String storeName) {
    return new StoreAddress(storeName);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof StoreAddress) {
      final StoreAddress that = (StoreAddress) other;
      return this.storeName.equals(that.storeName);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (StoreAddress.hashSeed == 0) {
      StoreAddress.hashSeed = Murmur3.hash(StoreAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(StoreAddress.hashSeed, this.storeName.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("StoreAddress").write('.').write("create").write('(')
                   .debug(this.storeName).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static StoreAddress create(String storeName) {
    return new StoreAddress(storeName);
  }

}
