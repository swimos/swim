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

package swim.http;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.util.Murmur3;

public final class HttpChunkHeader extends HttpPart implements Debug {

  final long size;
  final FingerTrieSeq<ChunkExtension> extensions;

  HttpChunkHeader(long size, FingerTrieSeq<ChunkExtension> extensions) {
    this.size = size;
    this.extensions = extensions;
  }

  public boolean isEmpty() {
    return this.size == 0L;
  }

  public long size() {
    return this.size;
  }

  public FingerTrieSeq<ChunkExtension> extensions() {
    return this.extensions;
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.chunkHeaderWriter(this.size, this.extensions.iterator());
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeChunkHeader(output, this.size, this.extensions.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpChunkHeader) {
      final HttpChunkHeader that = (HttpChunkHeader) other;
      return this.size == that.size && this.extensions.equals(that.extensions);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HttpChunkHeader.hashSeed == 0) {
      HttpChunkHeader.hashSeed = Murmur3.seed(HttpChunkHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HttpChunkHeader.hashSeed,
        Murmur3.hash(this.size)), this.extensions.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpChunkHeader").write('.');
    if (this.size != 0L || !this.extensions.isEmpty()) {
      output = output.write("create").write('(').debug(this.size);
      for (ChunkExtension extension : this.extensions) {
        output = output.write(", ").debug(extension);
      }
      output = output.write(')');
    } else {
      output = output.write("sentinel").write('(').write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static HttpChunkHeader sentinel;

  public static HttpChunkHeader sentinel() {
    if (HttpChunkHeader.sentinel == null) {
      HttpChunkHeader.sentinel = new HttpChunkHeader(0L, FingerTrieSeq.<ChunkExtension>empty());
    }
    return HttpChunkHeader.sentinel;
  }

  public static HttpChunkHeader create(long size, FingerTrieSeq<ChunkExtension> extensions) {
    if (size == 0L && extensions.isEmpty()) {
      return HttpChunkHeader.sentinel();
    } else {
      return new HttpChunkHeader(size, extensions);
    }
  }

  public static HttpChunkHeader create(long size, ChunkExtension... extensions) {
    if (size == 0L && extensions.length == 0) {
      return HttpChunkHeader.sentinel();
    } else {
      return new HttpChunkHeader(size, FingerTrieSeq.of(extensions));
    }
  }

  public static HttpChunkHeader create(long size) {
    if (size == 0L) {
      return HttpChunkHeader.sentinel();
    } else {
      return new HttpChunkHeader(size, FingerTrieSeq.<ChunkExtension>empty());
    }
  }

  public static HttpChunkHeader parse(String string) {
    return Http.standardParser().parseChunkHeaderString(string);
  }

}
