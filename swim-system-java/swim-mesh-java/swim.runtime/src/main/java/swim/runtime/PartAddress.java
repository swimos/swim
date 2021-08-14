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
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Murmur3;

public final class PartAddress implements EdgeAddressed, MeshAddressed, PartAddressed, Debug {

  final String edgeName;
  final Uri meshUri;
  final Value partKey;

  public PartAddress(String edgeName, Uri meshUri, Value partKey) {
    this.edgeName = edgeName;
    this.meshUri = meshUri;
    this.partKey = partKey.commit();
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
  public PartAddress meshUri(Uri meshUri) {
    return this.copy(this.edgeName, meshUri, this.partKey);
  }

  @Override
  public PartAddress meshUri(String meshUri) {
    return this.meshUri(Uri.parse(meshUri));
  }

  @Override
  public Value partKey() {
    return this.partKey;
  }

  @Override
  public PartAddress partKey(Value partKey) {
    return this.copy(this.edgeName, this.meshUri, partKey);
  }

  PartAddress copy(String edgeName, Uri meshUri, Value partKey) {
    return new PartAddress(edgeName, meshUri, partKey);
  }

  @Override
  public HostAddress hostUri(Uri hostUri) {
    return new HostAddress(this.edgeName, this.meshUri, this.partKey, hostUri);
  }

  @Override
  public HostAddress hostUri(String hostUri) {
    return this.hostUri(Uri.parse(hostUri));
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (PartAddress.hashSeed == 0) {
      PartAddress.hashSeed = Murmur3.hash(PartAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(PartAddress.hashSeed,
        this.edgeName.hashCode()), this.meshUri.hashCode()), this.partKey.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("PartAddress").write('.').write("create").write('(')
                   .debug(this.edgeName).write(", ").debug(this.meshUri.toString()).write(", ")
                   .debug(this.partKey).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static PartAddress create(String edgeName, Uri meshUri, Value partKey) {
    return new PartAddress(edgeName, meshUri, partKey);
  }

  public static PartAddress create(String edgeName, String meshUri, Value partKey) {
    return new PartAddress(edgeName, Uri.parse(meshUri), partKey);
  }

}
