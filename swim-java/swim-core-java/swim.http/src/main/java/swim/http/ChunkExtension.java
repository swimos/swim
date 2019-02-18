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

package swim.http;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Writer;
import swim.util.Murmur3;

public final class ChunkExtension extends HttpPart implements Debug {
  final String name;
  final String value;

  ChunkExtension(String name, String value) {
    this.name = name;
    this.value = value;
  }

  public String name() {
    return this.name;
  }

  public String value() {
    return this.value;
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.chunkExtensionWriter(this.name, this.value);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeChunkExtension(this.name, this.value, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ChunkExtension) {
      final ChunkExtension that = (ChunkExtension) other;
      return this.name.equals(that.name) && this.value.equals(that.value);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(ChunkExtension.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.name.hashCode()), this.value.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("ChunkExtension").write('.').write("from").write('(')
        .debug(this.name).write(", ").write(this.value).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static ChunkExtension from(String name, String value) {
    return new ChunkExtension(name, value);
  }

  public static ChunkExtension from(String name) {
    return new ChunkExtension(name, "");
  }

  public static ChunkExtension parseHttp(String string) {
    return Http.standardParser().parseChunkExtensionString(string);
  }
}
