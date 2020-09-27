// Copyright 2015-2020 Swim inc.
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

public final class HostAddress implements EdgeAddressed, MeshAddressed, PartAddressed, HostAddressed, Debug {

  final String edgeName;
  final Uri meshUri;
  final Value partKey;
  final Uri hostUri;

  public HostAddress(String edgeName, Uri meshUri, Value partKey, Uri hostUri) {
    this.edgeName = edgeName;
    this.meshUri = meshUri;
    this.partKey = partKey.commit();
    this.hostUri = hostUri;
  }

  @Override
  public String edgeName() {
    return this.edgeName;
  }

  @Override
  public Uri meshUri() {
    return this.meshUri;
  }

  @Override
  public HostAddress meshUri(Uri meshUri) {
    return copy(this.edgeName, meshUri, this.partKey, this.hostUri);
  }

  @Override
  public HostAddress meshUri(String meshUri) {
    return meshUri(Uri.parse(meshUri));
  }

  @Override
  public Value partKey() {
    return this.partKey;
  }

  @Override
  public HostAddress partKey(Value partKey) {
    return copy(this.edgeName, this.meshUri, partKey, this.hostUri);
  }

  @Override
  public Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public HostAddress hostUri(Uri hostUri) {
    return copy(this.edgeName, this.meshUri, this.partKey, hostUri);
  }

  @Override
  public HostAddress hostUri(String hostUri) {
    return hostUri(Uri.parse(hostUri));
  }

  HostAddress copy(String edgeName, Uri meshUri, Value partKey, Uri hostUri) {
    return new HostAddress(edgeName, meshUri, partKey, hostUri);
  }

  @Override
  public NodeAddress nodeUri(Uri nodeUri) {
    return new NodeAddress(this.edgeName, this.meshUri, this.partKey, this.hostUri, nodeUri);
  }

  @Override
  public NodeAddress nodeUri(String nodeUri) {
    return nodeUri(Uri.parse(nodeUri));
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HostAddress) {
      final HostAddress that = (HostAddress) other;
      return this.edgeName.equals(that.edgeName) && this.meshUri.equals(that.meshUri)
          && this.partKey.equals(that.partKey) && this.hostUri.equals(that.hostUri);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.hash(HostAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.edgeName.hashCode()), this.meshUri.hashCode()), this.partKey.hashCode()),
        this.hostUri.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("HostAddress").write('.').write("from").write('(')
        .debug(this.edgeName).write(", ").debug(this.meshUri.toString()).write(", ")
        .debug(this.partKey).write(", ").debug(this.hostUri.toString()).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static HostAddress from(String edgeName, Uri meshUri, Value partKey, Uri hostUri) {
    return new HostAddress(edgeName, meshUri, partKey, hostUri);
  }

  public static HostAddress from(String edgeName, String meshUri, Value partKey, String hostUri) {
    return new HostAddress(edgeName, Uri.parse(meshUri), partKey, Uri.parse(hostUri));
  }

}
