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

package swim.system;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Value;
import swim.util.Murmur3;

public final class DownlinkAddress implements LinkAddress, Debug {

  final CellAddress cellAddress;
  final Value linkKey;

  public DownlinkAddress(CellAddress cellAddress, Value linkKey) {
    this.cellAddress = cellAddress;
    this.linkKey = linkKey.commit();
  }

  public CellAddress cellAddress() {
    return this.cellAddress;
  }

  public DownlinkAddress cellAddress(CellAddress cellAddress) {
    return this.copy(cellAddress, this.linkKey);
  }

  public Value linkKey() {
    return this.linkKey;
  }

  public DownlinkAddress linkKey(Value linkKey) {
    return this.copy(this.cellAddress, linkKey);
  }

  DownlinkAddress copy(CellAddress cellAddress, Value linkKey) {
    return new DownlinkAddress(cellAddress, linkKey);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof DownlinkAddress) {
      final DownlinkAddress that = (DownlinkAddress) other;
      return this.cellAddress.equals(that.cellAddress) && this.linkKey.equals(that.linkKey);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (DownlinkAddress.hashSeed == 0) {
      DownlinkAddress.hashSeed = Murmur3.hash(DownlinkAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(DownlinkAddress.hashSeed,
        this.cellAddress.hashCode()), this.linkKey.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("DownlinkAddress").write('.').write("create").write('(')
                   .debug(this.cellAddress.toString()).write(", ").debug(this.linkKey).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static DownlinkAddress create(CellAddress cellAddress, Value linkKey) {
    return new DownlinkAddress(cellAddress, linkKey);
  }

}
