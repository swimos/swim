// Copyright 2015-2022 Swim.inc
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

public final class NodeAddress implements EdgeAddressed, MeshAddressed, PartAddressed, HostAddressed, NodeAddressed, Debug {

  final String edgeName;
  final Uri meshUri;
  final Value partKey;
  final Uri hostUri;
  final Uri nodeUri;

  public NodeAddress(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    this.edgeName = edgeName;
    this.meshUri = meshUri;
    this.partKey = partKey.commit();
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
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
  public NodeAddress meshUri(Uri meshUri) {
    return this.copy(this.edgeName, meshUri, this.partKey, this.hostUri, this.nodeUri);
  }

  @Override
  public NodeAddress meshUri(String meshUri) {
    return this.meshUri(Uri.parse(meshUri));
  }

  @Override
  public Value partKey() {
    return this.partKey;
  }

  @Override
  public NodeAddress partKey(Value partKey) {
    return this.copy(this.edgeName, this.meshUri, partKey, this.hostUri, this.nodeUri);
  }

  @Override
  public Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public NodeAddress hostUri(Uri hostUri) {
    return this.copy(this.edgeName, this.meshUri, this.partKey, hostUri, this.nodeUri);
  }

  @Override
  public NodeAddress hostUri(String hostUri) {
    return this.hostUri(Uri.parse(hostUri));
  }

  @Override
  public Uri nodeUri() {
    return this.nodeUri;
  }

  @Override
  public NodeAddress nodeUri(Uri nodeUri) {
    return this.copy(this.edgeName, this.meshUri, this.partKey, this.hostUri, nodeUri);
  }

  @Override
  public NodeAddress nodeUri(String nodeUri) {
    return this.nodeUri(Uri.parse(nodeUri));
  }

  NodeAddress copy(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    return new NodeAddress(edgeName, meshUri, partKey, hostUri, nodeUri);
  }

  @Override
  public LaneAddress laneUri(Uri laneUri) {
    return new LaneAddress(this.edgeName, this.meshUri, this.partKey, this.hostUri, this.nodeUri, laneUri);
  }

  @Override
  public LaneAddress laneUri(String laneUri) {
    return this.laneUri(Uri.parse(laneUri));
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof NodeAddress) {
      final NodeAddress that = (NodeAddress) other;
      return this.edgeName.equals(that.edgeName) && this.meshUri.equals(that.meshUri)
          && this.partKey.equals(that.partKey) && this.hostUri.equals(that.hostUri)
          && this.nodeUri.equals(that.nodeUri);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (NodeAddress.hashSeed == 0) {
      NodeAddress.hashSeed = Murmur3.hash(NodeAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(NodeAddress.hashSeed,
        this.edgeName.hashCode()), this.meshUri.hashCode()), this.partKey.hashCode()),
        this.hostUri.hashCode()), this.nodeUri.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("NodeAddress").write('.').write("create").write('(')
                   .debug(this.edgeName).write(", ").debug(this.meshUri.toString()).write(", ")
                   .debug(this.partKey).write(", ").debug(this.hostUri.toString()).write(", ")
                   .debug(this.nodeUri).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static NodeAddress create(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    return new NodeAddress(edgeName, meshUri, partKey, hostUri, nodeUri);
  }

  public static NodeAddress create(String edgeName, String meshUri, Value partKey, String hostUri, String nodeUri) {
    return new NodeAddress(edgeName, Uri.parse(meshUri), partKey, Uri.parse(hostUri), Uri.parse(nodeUri));
  }

}
