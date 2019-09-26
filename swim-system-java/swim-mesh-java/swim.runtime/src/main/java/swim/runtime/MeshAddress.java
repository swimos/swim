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

public final class MeshAddress extends CellAddress implements Debug {
  final String edgeName;
  final Uri meshUri;

  public MeshAddress(String edgeName, Uri meshUri) {
    this.edgeName = edgeName;
    this.meshUri = meshUri;
  }

  public String edgeName() {
    return this.edgeName;
  }

  public Uri meshUri() {
    return this.meshUri;
  }

  public MeshAddress meshUri(Uri meshUri) {
    return copy(this.edgeName, meshUri);
  }

  public MeshAddress meshUri(String meshUri) {
    return meshUri(Uri.parse(meshUri));
  }

  MeshAddress copy(String edgeName, Uri meshUri) {
    return new MeshAddress(edgeName, meshUri);
  }

  public PartAddress partKey(Value partKey) {
    return new PartAddress(this.edgeName, this.meshUri, partKey);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MeshAddress) {
      final MeshAddress that = (MeshAddress) other;
      return this.edgeName.equals(that.edgeName) && this.meshUri.equals(that.meshUri);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.hash(MeshAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.edgeName.hashCode()), this.meshUri.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MeshAddress").write('.').write("from").write('(')
        .debug(this.edgeName).write(", ").debug(this.meshUri.toString()).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static MeshAddress from(String edgeName, Uri meshUri) {
    return new MeshAddress(edgeName, meshUri);
  }

  public static MeshAddress from(String edgeName, String meshUri) {
    return new MeshAddress(edgeName, Uri.parse(meshUri));
  }
}
