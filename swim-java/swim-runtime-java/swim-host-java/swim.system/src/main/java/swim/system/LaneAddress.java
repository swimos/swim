// Copyright 2015-2021 Swim Inc.
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

public final class LaneAddress implements EdgeAddressed, MeshAddressed, PartAddressed, HostAddressed, NodeAddressed, LaneAddressed, Debug {

  final String edgeName;
  final Uri meshUri;
  final Value partKey;
  final Uri hostUri;
  final Uri nodeUri;
  final Uri laneUri;

  public LaneAddress(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    this.edgeName = edgeName;
    this.meshUri = meshUri;
    this.partKey = partKey.commit();
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
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
  public LaneAddress meshUri(Uri meshUri) {
    return this.copy(this.edgeName, meshUri, this.partKey, this.hostUri, this.nodeUri, this.laneUri);
  }

  @Override
  public LaneAddress meshUri(String meshUri) {
    return this.meshUri(Uri.parse(meshUri));
  }

  @Override
  public Value partKey() {
    return this.partKey;
  }

  @Override
  public LaneAddress partKey(Value partKey) {
    return this.copy(this.edgeName, this.meshUri, partKey, this.hostUri, this.nodeUri, this.laneUri);
  }

  @Override
  public Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public LaneAddress hostUri(Uri hostUri) {
    return this.copy(this.edgeName, this.meshUri, this.partKey, hostUri, this.nodeUri, this.laneUri);
  }

  @Override
  public LaneAddress hostUri(String hostUri) {
    return this.hostUri(Uri.parse(hostUri));
  }

  @Override
  public Uri nodeUri() {
    return this.nodeUri;
  }

  @Override
  public LaneAddress nodeUri(Uri nodeUri) {
    return this.copy(this.edgeName, this.meshUri, this.partKey, this.hostUri, nodeUri, this.laneUri);
  }

  @Override
  public LaneAddress nodeUri(String nodeUri) {
    return this.nodeUri(Uri.parse(nodeUri));
  }

  @Override
  public Uri laneUri() {
    return this.laneUri;
  }

  @Override
  public LaneAddress laneUri(Uri laneUri) {
    return this.copy(this.edgeName, this.meshUri, this.partKey, this.hostUri, this.nodeUri, laneUri);
  }

  @Override
  public LaneAddress laneUri(String laneUri) {
    return this.laneUri(Uri.parse(laneUri));
  }

  LaneAddress copy(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    return new LaneAddress(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri);
  }

  @Override
  public UplinkAddress linkKey(Value linkKey) {
    return new UplinkAddress(this.edgeName, this.meshUri, this.partKey, this.hostUri, this.nodeUri, this.laneUri, linkKey);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof LaneAddress) {
      final LaneAddress that = (LaneAddress) other;
      return this.edgeName.equals(that.edgeName) && this.meshUri.equals(that.meshUri)
          && this.partKey.equals(that.partKey) && this.hostUri.equals(that.hostUri)
          && this.nodeUri.equals(that.nodeUri) && this.laneUri.equals(that.laneUri);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (LaneAddress.hashSeed == 0) {
      LaneAddress.hashSeed = Murmur3.hash(LaneAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(LaneAddress.hashSeed,
        this.edgeName.hashCode()), this.meshUri.hashCode()), this.partKey.hashCode()),
        this.hostUri.hashCode()), this.nodeUri.hashCode()), this.laneUri.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("LaneAddress").write('.').write("create").write('(')
                   .debug(this.edgeName).write(", ").debug(this.meshUri.toString()).write(", ")
                   .debug(this.partKey).write(", ").debug(this.hostUri.toString()).write(", ")
                   .debug(this.nodeUri).write(", ").debug(this.laneUri.toString()).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static LaneAddress create(String edgeName, Uri meshUri, Value partKey,
                                   Uri hostUri, Uri nodeUri, Uri laneUri) {
    return new LaneAddress(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri);
  }

  public static LaneAddress create(String edgeName, String meshUri, Value partKey,
                                   String hostUri, String nodeUri, String laneUri) {
    return new LaneAddress(edgeName, Uri.parse(meshUri), partKey, Uri.parse(hostUri),
                           Uri.parse(nodeUri), Uri.parse(laneUri));
  }

}
