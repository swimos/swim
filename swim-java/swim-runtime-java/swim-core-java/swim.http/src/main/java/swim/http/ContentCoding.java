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
      return ContentCoding.create(this.name, weight);
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
    return http.writeContentCoding(output, this.name, this.weight);
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ContentCoding.hashSeed == 0) {
      ContentCoding.hashSeed = Murmur3.seed(ContentCoding.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(ContentCoding.hashSeed,
        this.name.hashCode()), Murmur3.hash(this.weight)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("ContentCoding").write('.').write("create").write('(').debug(this.name);
    if (this.weight != 1f) {
      output = output.write(", ").debug(this.weight);
    }
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static ContentCoding star;

  public static ContentCoding star() {
    if (ContentCoding.star == null) {
      ContentCoding.star = new ContentCoding("*", 1f);
    }
    return ContentCoding.star;
  }

  private static ContentCoding identity;

  public static ContentCoding identity() {
    if (ContentCoding.identity == null) {
      ContentCoding.identity = new ContentCoding("identity", 1f);
    }
    return ContentCoding.identity;
  }

  private static ContentCoding compress;

  public static ContentCoding compress() {
    if (ContentCoding.compress == null) {
      ContentCoding.compress = new ContentCoding("compress", 1f);
    }
    return ContentCoding.compress;
  }

  private static ContentCoding deflate;

  public static ContentCoding deflate() {
    if (ContentCoding.deflate == null) {
      ContentCoding.deflate = new ContentCoding("deflate", 1f);
    }
    return ContentCoding.deflate;
  }

  private static ContentCoding gzip;

  public static ContentCoding gzip() {
    if (ContentCoding.gzip == null) {
      ContentCoding.gzip = new ContentCoding("gzip", 1f);
    }
    return ContentCoding.gzip;
  }

  public static ContentCoding create(String name, float weight) {
    if (weight == 1f) {
      return ContentCoding.create(name);
    } else {
      return new ContentCoding(name, weight);
    }
  }

  public static ContentCoding create(String name) {
    if ("*".equals(name)) {
      return ContentCoding.star();
    } else if ("identity".equals(name)) {
      return ContentCoding.identity();
    } else if ("compress".equals(name)) {
      return ContentCoding.compress();
    } else if ("deflate".equals(name)) {
      return ContentCoding.deflate();
    } else if ("gzip".equals(name)) {
      return ContentCoding.gzip();
    } else {
      return new ContentCoding(name, 1f);
    }
  }

  public static ContentCoding parse(String string) {
    return Http.standardParser().parseContentCodingString(string);
  }

}
