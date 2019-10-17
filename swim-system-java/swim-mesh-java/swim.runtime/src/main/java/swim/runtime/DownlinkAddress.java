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

package swim.runtime;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Value;
import swim.util.Murmur3;

public final class DownlinkAddress extends LinkAddress implements Debug {
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
    return copy(cellAddress, this.linkKey);
  }

  public Value linkKey() {
    return this.linkKey;
  }

  public DownlinkAddress linkKey(Value linkKey) {
    return copy(this.cellAddress, linkKey);
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

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.hash(DownlinkAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.cellAddress.hashCode()), this.linkKey.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("DownlinkAddress").write('.').write("from").write('(')
        .debug(this.cellAddress.toString()).write(", ").debug(this.linkKey).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static DownlinkAddress from(CellAddress cellAddress, Value linkKey) {
    return new DownlinkAddress(cellAddress, linkKey);
  }
}
