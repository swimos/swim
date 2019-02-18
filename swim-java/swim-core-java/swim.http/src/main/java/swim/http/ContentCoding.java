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

public final class ContentCoding extends HttpPart implements Debug {
  final String name;
  final float weight;

  ContentCoding(String name, float weight) {
    this.name = name;
    this.weight = weight;
  }

  public String name() {
    return this.name;
  }

  public float weight() {
    return this.weight;
  }

  public ContentCoding weight(float weight) {
    if (this.weight == weight) {
      return this;
    } else {
      return from(this.name, weight);
    }
  }

  public boolean isStar() {
    return "*".equals(this.name);
  }

  public boolean isIdentity() {
    return "identity".equalsIgnoreCase(this.name);
  }

  public boolean isCompress() {
    return "compress".equalsIgnoreCase(this.name)
        || "x-compress".equalsIgnoreCase(this.name);
  }

  public boolean isDeflate() {
    return "deflate".equalsIgnoreCase(this.name);
  }

  public boolean isGzip() {
    return "gzip".equalsIgnoreCase(this.name)
        || "x-gzip".equalsIgnoreCase(this.name);
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.contentCodingWriter(this.name, this.weight);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeContentCoding(this.name, this.weight, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ContentCoding) {
      final ContentCoding that = (ContentCoding) other;
      return this.name.equals(that.name) && this.weight == that.weight;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(ContentCoding.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.name.hashCode()), Murmur3.hash(this.weight)));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("ContentCoding").write('.').write("from").write('(').debug(this.name);
    if (this.weight != 1f) {
      output = output.write(", ").debug(this.weight);
    }
    output = output.write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static ContentCoding star;
  private static ContentCoding identity;
  private static ContentCoding compress;
  private static ContentCoding deflate;
  private static ContentCoding gzip;

  public static ContentCoding star() {
    if (star == null) {
      star = new ContentCoding("*", 1f);
    }
    return star;
  }

  public static ContentCoding identity() {
    if (identity == null) {
      identity = new ContentCoding("identity", 1f);
    }
    return identity;
  }

  public static ContentCoding compress() {
    if (compress == null) {
      compress = new ContentCoding("compress", 1f);
    }
    return compress;
  }

  public static ContentCoding deflate() {
    if (deflate == null) {
      deflate = new ContentCoding("deflate", 1f);
    }
    return deflate;
  }

  public static ContentCoding gzip() {
    if (gzip == null) {
      gzip = new ContentCoding("gzip", 1f);
    }
    return gzip;
  }

  public static ContentCoding from(String name, float weight) {
    if (weight == 1f) {
      return from(name);
    } else {
      return new ContentCoding(name, weight);
    }
  }

  public static ContentCoding from(String name) {
    if ("*".equals(name)) {
      return star();
    } else if ("identity".equals(name)) {
      return identity();
    } else if ("compress".equals(name)) {
      return compress();
    } else if ("deflate".equals(name)) {
      return deflate();
    } else if ("gzip".equals(name)) {
      return gzip();
    } else {
      return new ContentCoding(name, 1f);
    }
  }

  public static ContentCoding parse(String string) {
    return Http.standardParser().parseContentCodingString(string);
  }
}
