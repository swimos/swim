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
import swim.uri.Uri;
import swim.util.Murmur3;

public final class UplinkAddress implements EdgeAddressed, MeshAddressed, PartAddressed, HostAddressed, NodeAddressed, LaneAddressed, UplinkAddressed, Debug {

  final String edgeName;
  final Uri meshUri;
  final Value partKey;
  final Uri hostUri;
  final Uri nodeUri;
  final Uri laneUri;
  final Value linkKey;

  public UplinkAddress(String edgeName, Uri meshUri, Value partKey, Uri hostUri,
                       Uri nodeUri, Uri laneUri, Value linkKey) {
    this.edgeName = edgeName;
    this.meshUri = meshUri;
    this.partKey = partKey.commit();
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.linkKey = linkKey.commit();
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
  public UplinkAddress meshUri(Uri meshUri) {
    return this.copy(this.edgeName, meshUri, this.partKey, this.hostUri, this.nodeUri, this.laneUri, this.linkKey);
  }

  @Override
  public UplinkAddress meshUri(String meshUri) {
    return this.meshUri(Uri.parse(meshUri));
  }

  @Override
  public Value partKey() {
    return this.partKey;
  }

  @Override
  public UplinkAddress partKey(Value partKey) {
    return this.copy(this.edgeName, this.meshUri, partKey, this.hostUri, this.nodeUri, this.laneUri, this.linkKey);
  }

  @Override
  public Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public UplinkAddress hostUri(Uri hostUri) {
    return this.copy(this.edgeName, this.meshUri, this.partKey, hostUri, this.nodeUri, this.laneUri, this.linkKey);
  }

  @Override
  public UplinkAddress hostUri(String hostUri) {
    return this.hostUri(Uri.parse(hostUri));
  }

  @Override
  public Uri nodeUri() {
    return this.nodeUri;
  }

  @Override
  public UplinkAddress nodeUri(Uri nodeUri) {
    return this.copy(this.edgeName, this.meshUri, this.partKey, this.hostUri, nodeUri, this.laneUri, this.linkKey);
  }

  @Override
  public UplinkAddress nodeUri(String nodeUri) {
    return this.nodeUri(Uri.parse(nodeUri));
  }

  @Override
  public Uri laneUri() {
    return this.laneUri;
  }

  @Override
  public UplinkAddress laneUri(Uri laneUri) {
    return this.copy(this.edgeName, this.meshUri, this.partKey, this.hostUri, this.nodeUri, laneUri, this.linkKey);
  }

  @Override
  public UplinkAddress laneUri(String laneUri) {
    return this.laneUri(Uri.parse(laneUri));
  }

  @Override
  public Value linkKey() {
    return this.linkKey;
  }

  @Override
  public UplinkAddress linkKey(Value linkKey) {
    return this.copy(this.edgeName, this.meshUri, this.partKey, this.hostUri, this.nodeUri, this.laneUri, linkKey);
  }

  UplinkAddress copy(String edgeName, Uri meshUri, Value partKey, Uri hostUri,
                     Uri nodeUri, Uri laneUri, Value linkKey) {
    return new UplinkAddress(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri, linkKey);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UplinkAddress) {
      final UplinkAddress that = (UplinkAddress) other;
      return this.edgeName.equals(that.edgeName) && this.meshUri.equals(that.meshUri)
          && this.partKey.equals(that.partKey) && this.hostUri.equals(that.hostUri)
          && this.nodeUri.equals(that.nodeUri) && this.laneUri.equals(that.laneUri)
          && this.linkKey.equals(that.linkKey);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.hash(UplinkAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Murmur3.mix(Murmur3.mix(UplinkAddress.hashSeed, this.edgeName.hashCode()),
        this.meshUri.hashCode()), this.partKey.hashCode()), this.hostUri.hashCode()),
        this.nodeUri.hashCode()), this.laneUri.hashCode()), this.linkKey.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("UplinkAddress").write('.').write("create").write('(')
                   .debug(this.edgeName).write(", ").debug(this.meshUri.toString()).write(", ")
                   .debug(this.partKey).write(", ").debug(this.hostUri.toString()).write(", ")
                   .debug(this.nodeUri).write(", ").debug(this.laneUri.toString()).write(", ")
                   .debug(this.linkKey).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static UplinkAddress create(String edgeName, Uri meshUri, Value partKey,
                                     Uri hostUri, Uri nodeUri, Uri laneUri, Value linkKey) {
    return new UplinkAddress(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri, linkKey);
  }

  public static UplinkAddress create(String edgeName, String meshUri, Value partKey,
                                     String hostUri, String nodeUri, String laneUri, Value linkKey) {
    return new UplinkAddress(edgeName, Uri.parse(meshUri), partKey, Uri.parse(hostUri),
                             Uri.parse(nodeUri), Uri.parse(laneUri), linkKey);
  }

}
