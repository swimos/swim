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
    return from(this.name, this.params.updated(key, value));
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
    return http.writeTransferCoding(this.name, this.params, output);
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

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(TransferCoding.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.name.hashCode()), this.params.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("TransferCoding").write('.').write("from").write('(')
        .debug(this.name).write(')');
    for (HashTrieMap.Entry<String, String> param : this.params) {
      output = output.write('.').write("param").write('(')
          .debug(param.getKey()).write(", ").debug(param.getValue()).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static TransferCoding chunked;
  private static TransferCoding compress;
  private static TransferCoding deflate;
  private static TransferCoding gzip;

  public static TransferCoding chunked() {
    if (chunked == null) {
      chunked = new TransferCoding("chunked");
    }
    return chunked;
  }

  public static TransferCoding compress() {
    if (compress == null) {
      compress = new TransferCoding("compress");
    }
    return compress;
  }

  public static TransferCoding deflate() {
    if (deflate == null) {
      deflate = new TransferCoding("deflate");
    }
    return deflate;
  }

  public static TransferCoding gzip() {
    if (gzip == null) {
      gzip = new TransferCoding("gzip");
    }
    return gzip;
  }

  public static TransferCoding from(String name, HashTrieMap<String, String> params) {
    if (params.isEmpty()) {
      if ("chunked".equals(name)) {
        return chunked();
      } else if ("compress".equals(name)) {
        return compress();
      } else if ("deflate".equals(name)) {
        return deflate();
      } else if ("gzip".equals(name)) {
        return gzip();
      }
    }
    return new TransferCoding(name, params);
  }

  public static TransferCoding from(String name) {
    return from(name, HashTrieMap.<String, String>empty());
  }

  public static TransferCoding parse(String string) {
    return Http.standardParser().parseTransferCodingString(string);
  }
}
