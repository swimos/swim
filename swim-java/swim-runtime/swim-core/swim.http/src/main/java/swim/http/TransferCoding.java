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
import swim.collections.HashTrieMap;
import swim.util.Murmur3;

public final class TransferCoding extends HttpPart implements Debug {

  final String name;
  final HashTrieMap<String, String> params;

  TransferCoding(String name, HashTrieMap<String, String> params) {
    this.name = name;
    this.params = params;
  }

  TransferCoding(String name) {
    this(name, HashTrieMap.<String, String>empty());
  }

  public String name() {
    return this.name;
  }

  public HashTrieMap<String, String> params() {
    return this.params;
  }

  public String getParam(String key) {
    return this.params.get(key);
  }

  public TransferCoding param(String key, String value) {
    return TransferCoding.create(this.name, this.params.updated(key, value));
  }

  public boolean isChunked() {
    return "chunked".equals(this.name);
  }

  public boolean isCompress() {
    return "compress".equals(this.name);
  }

  public boolean isDeflate() {
    return "deflate".equals(this.name);
  }

  public boolean isGzip() {
    return "gzip".equals(this.name);
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.transferCodingWriter(this.name, this.params);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeTransferCoding(output, this.name, this.params);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof TransferCoding) {
      final TransferCoding that = (TransferCoding) other;
      return this.name.equals(that.name) && this.params.equals(that.params);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (TransferCoding.hashSeed == 0) {
      TransferCoding.hashSeed = Murmur3.seed(TransferCoding.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(TransferCoding.hashSeed,
        this.name.hashCode()), this.params.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("TransferCoding").write('.').write("create").write('(')
                   .debug(this.name).write(')');
    for (HashTrieMap.Entry<String, String> param : this.params) {
      output = output.write('.').write("param").write('(')
                     .debug(param.getKey()).write(", ")
                     .debug(param.getValue()).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static TransferCoding chunked;

  public static TransferCoding chunked() {
    if (TransferCoding.chunked == null) {
      TransferCoding.chunked = new TransferCoding("chunked");
    }
    return TransferCoding.chunked;
  }

  private static TransferCoding compress;

  public static TransferCoding compress() {
    if (TransferCoding.compress == null) {
      TransferCoding.compress = new TransferCoding("compress");
    }
    return TransferCoding.compress;
  }

  private static TransferCoding deflate;

  public static TransferCoding deflate() {
    if (TransferCoding.deflate == null) {
      TransferCoding.deflate = new TransferCoding("deflate");
    }
    return TransferCoding.deflate;
  }

  private static TransferCoding gzip;

  public static TransferCoding gzip() {
    if (TransferCoding.gzip == null) {
      TransferCoding.gzip = new TransferCoding("gzip");
    }
    return TransferCoding.gzip;
  }

  public static TransferCoding create(String name, HashTrieMap<String, String> params) {
    if (params.isEmpty()) {
      if ("chunked".equals(name)) {
        return TransferCoding.chunked();
      } else if ("compress".equals(name)) {
        return TransferCoding.compress();
      } else if ("deflate".equals(name)) {
        return TransferCoding.deflate();
      } else if ("gzip".equals(name)) {
        return TransferCoding.gzip();
      }
    }
    return new TransferCoding(name, params);
  }

  public static TransferCoding create(String name) {
    return TransferCoding.create(name, HashTrieMap.<String, String>empty());
  }

  public static TransferCoding parse(String string) {
    return Http.standardParser().parseTransferCodingString(string);
  }

}
