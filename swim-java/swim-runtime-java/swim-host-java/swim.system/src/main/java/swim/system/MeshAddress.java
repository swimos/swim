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

public final class MeshAddress implements EdgeAddressed, MeshAddressed, Debug {

  final String edgeName;
  final Uri meshUri;

  public MeshAddress(String edgeName, Uri meshUri) {
    this.edgeName = edgeName;
    this.meshUri = meshUri;
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
  public MeshAddress meshUri(Uri meshUri) {
    return this.copy(this.edgeName, meshUri);
  }

  @Override
  public MeshAddress meshUri(String meshUri) {
    return this.meshUri(Uri.parse(meshUri));
  }

  MeshAddress copy(String edgeName, Uri meshUri) {
    return new MeshAddress(edgeName, meshUri);
  }

  @Override
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (MeshAddress.hashSeed == 0) {
      MeshAddress.hashSeed = Murmur3.hash(MeshAddress.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(MeshAddress.hashSeed,
        this.edgeName.hashCode()), this.meshUri.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("MeshAddress").write('.').write("create").write('(')
                   .debug(this.edgeName).write(", ").debug(this.meshUri.toString()).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static MeshAddress create(String edgeName, Uri meshUri) {
    return new MeshAddress(edgeName, meshUri);
  }

  public static MeshAddress create(String edgeName, String meshUri) {
    return new MeshAddress(edgeName, Uri.parse(meshUri));
  }

}
