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
import swim.uri.Uri;
import swim.util.Murmur3;

public final class PartAddress extends CellAddress implements Debug {
  final String edgeName;
  final Uri meshUri;
  final Value partKey;

  public PartAddress(String edgeName, Uri meshUri, Value partKey) {
    this.edgeName = edgeName;
    this.meshUri = meshUri;
    this.partKey = partKey.commit();
  }

  public String edgeName() {
    return this.edgeName;
  }

  public Uri meshUri() {
    return this.meshUri;
  }

  public PartAddress meshUri(Uri meshUri) {
    return copy(this.edgeName, meshUri, this.partKey);
  }

  public PartAddress meshUri(String meshUri) {
    return meshUri(Uri.parse(meshUri));
  }

  public Value partKey() {
    return this.partKey;
  }

  public PartAddress partKey(Value partKey) {
    return copy(this.edgeName, this.meshUri, partKey);
  }

  PartAddress copy(String edgeName, Uri meshUri, Value partKey) {
    return new PartAddress(edgeName, meshUri, partKey);
  }

  public HostAddress hostUri(Uri hostUri) {
    return new HostAddress(this.edgeName, this.meshUri, this.partKey, hostUri);
  }

  public HostAddress hostUri(String hostUri) {
    return hostUri(Uri.parse(hostUri));
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof PartAddress) {
      final PartAddress that = (PartAddress) other;
      return this.edgeName.equals(that.edgeName) && this.meshUri.equals(that.meshUri)
          && this.partKey.equals(that.partKey);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.hash(PartAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.edgeName.hashCode()), this.meshUri.hashCode()), this.partKey.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("PartAddress").write('.').write("from").write('(')
        .debug(this.edgeName).write(", ").debug(this.meshUri.toString()).write(", ")
        .debug(this.partKey).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static PartAddress from(String edgeName, Uri meshUri, Value partKey) {
    return new PartAddress(edgeName, meshUri, partKey);
  }

  public static PartAddress from(String edgeName, String meshUri, Value partKey) {
    return new PartAddress(edgeName, Uri.parse(meshUri), partKey);
  }
}
