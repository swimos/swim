// Copyright 2015-2023 Swim.inc
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

import java.util.Iterator;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.util.Murmur3;

public final class HttpChunkTrailer extends HttpPart implements Debug {

  final FingerTrieSeq<HttpHeader> headers;

  HttpChunkTrailer(FingerTrieSeq<HttpHeader> headers) {
    this.headers = headers;
  }

  public FingerTrieSeq<HttpHeader> headers() {
    return this.headers;
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.chunkTrailerWriter(this.headers.iterator());
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeChunkTrailer(output, this.headers.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpChunkTrailer) {
      final HttpChunkTrailer that = (HttpChunkTrailer) other;
      return this.headers.equals(that.headers);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HttpChunkTrailer.hashSeed == 0) {
      HttpChunkTrailer.hashSeed = Murmur3.seed(HttpChunkTrailer.class);
    }
    return Murmur3.mash(Murmur3.mix(HttpChunkTrailer.hashSeed, this.headers.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HttpChunkTrailer").write('.');
    final Iterator<HttpHeader> headers = this.headers.iterator();
    if (headers.hasNext()) {
      output = output.write("create").write('(').debug(headers.next());
      while (headers.hasNext()) {
        output = output.write(", ").debug(headers.next());
      }
    } else {
      output = output.write("empty").write('(');
    }
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static HttpChunkTrailer empty;

  public static HttpChunkTrailer empty() {
    if (HttpChunkTrailer.empty == null) {
      HttpChunkTrailer.empty = new HttpChunkTrailer(FingerTrieSeq.<HttpHeader>empty());
    }
    return HttpChunkTrailer.empty;
  }

  public static HttpChunkTrailer create(FingerTrieSeq<HttpHeader> headers) {
    if (headers.isEmpty()) {
      return HttpChunkTrailer.empty();
    } else {
      return new HttpChunkTrailer(headers);
    }
  }

  public static HttpChunkTrailer create(HttpHeader... headers) {
    if (headers.length == 0) {
      return HttpChunkTrailer.empty();
    } else {
      return new HttpChunkTrailer(FingerTrieSeq.of(headers));
    }
  }

  public static HttpChunkTrailer parse(String chunkTrailer) {
    return Http.standardParser().parseChunkTrailerString(chunkTrailer);
  }

}
