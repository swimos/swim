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

public final class LaneAddress extends CellAddress implements Debug {
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

  public String edgeName() {
    return this.edgeName;
  }

  public Uri meshUri() {
    return this.meshUri;
  }

  public LaneAddress meshUri(Uri meshUri) {
    return copy(this.edgeName, meshUri, this.partKey, this.hostUri, this.nodeUri, this.laneUri);
  }

  public LaneAddress meshUri(String meshUri) {
    return meshUri(Uri.parse(meshUri));
  }

  public Value partKey() {
    return this.partKey;
  }

  public LaneAddress partKey(Value partKey) {
    return copy(this.edgeName, this.meshUri, partKey, this.hostUri, this.nodeUri, this.laneUri);
  }

  public Uri hostUri() {
    return this.hostUri;
  }

  public LaneAddress hostUri(Uri hostUri) {
    return copy(this.edgeName, this.meshUri, this.partKey, hostUri, this.nodeUri, this.laneUri);
  }

  public LaneAddress hostUri(String hostUri) {
    return hostUri(Uri.parse(hostUri));
  }

  public Uri nodeUri() {
    return this.nodeUri;
  }

  public LaneAddress nodeUri(Uri nodeUri) {
    return copy(this.edgeName, this.meshUri, this.partKey, this.hostUri, nodeUri, this.laneUri);
  }

  public LaneAddress nodeUri(String nodeUri) {
    return nodeUri(Uri.parse(nodeUri));
  }

  public Uri laneUri() {
    return this.laneUri;
  }

  public LaneAddress laneUri(Uri laneUri) {
    return copy(this.edgeName, this.meshUri, this.partKey, this.hostUri, this.nodeUri, laneUri);
  }

  public LaneAddress laneUri(String laneUri) {
    return laneUri(Uri.parse(laneUri));
  }

  LaneAddress copy(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    return new LaneAddress(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri);
  }

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

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.hash(LaneAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.edgeName.hashCode()), this.meshUri.hashCode()), this.partKey.hashCode()),
        this.hostUri.hashCode()), this.nodeUri.hashCode()), this.laneUri.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("LaneAddress").write('.').write("from").write('(')
        .debug(this.edgeName).write(", ").debug(this.meshUri.toString()).write(", ")
        .debug(this.partKey).write(", ").debug(this.hostUri.toString()).write(", ")
        .debug(this.nodeUri).write(", ").debug(this.laneUri.toString()).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static LaneAddress from(String edgeName, Uri meshUri, Value partKey,
                                 Uri hostUri, Uri nodeUri, Uri laneUri) {
    return new LaneAddress(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri);
  }

  public static LaneAddress from(String edgeName, String meshUri, Value partKey,
                                 String hostUri, String nodeUri, String laneUri) {
    return new LaneAddress(edgeName, Uri.parse(meshUri), partKey, Uri.parse(hostUri),
                           Uri.parse(nodeUri), Uri.parse(laneUri));
  }
}
