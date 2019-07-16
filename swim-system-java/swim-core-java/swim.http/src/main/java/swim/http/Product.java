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
import swim.collections.FingerTrieSeq;
import swim.util.Murmur3;

public final class Product extends HttpPart implements Debug {
  final String name;
  final String version;
  final FingerTrieSeq<String> comments;

  Product(String name, String version, FingerTrieSeq<String> comments) {
    this.name = name;
    this.version = version;
    this.comments = comments;
  }

  Product(String name, String version) {
    this(name, version, FingerTrieSeq.<String>empty());
  }

  Product(String name) {
    this(name, null, FingerTrieSeq.<String>empty());
  }

  public String name() {
    return this.name;
  }

  public String version() {
    return this.version;
  }

  public FingerTrieSeq<String> comments() {
    return this.comments;
  }

  public Product comments(FingerTrieSeq<String> comments) {
    return new Product(this.name, this.version, comments);
  }

  public Product comment(String comment) {
    return new Product(this.name, this.version, this.comments.appended(comment));
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.productWriter(this.name, this.version, this.comments.iterator());
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeProduct(this.name, this.version, this.comments.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Product) {
      final Product that = (Product) other;
      return this.name.equals(that.name)
          && (this.version == null ? that.version == null : this.version.equals(that.version))
          && this.comments.equals(that.comments);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Product.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.name.hashCode()), Murmur3.hash(this.version)), this.comments.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Product").write('.').write("from").write('(').debug(this.name);
    if (this.version != null) {
      output = output.write(", ").debug(this.version);
    }
    output = output.write(')');
    for (String comment : this.comments) {
      output = output.write('.').write("comment").write('(').debug(comment).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static Product from(String name, String version, FingerTrieSeq<String> comments) {
    return new Product(name, version, comments);
  }

  public static Product from(String name, String version, String... comments) {
    return new Product(name, version, FingerTrieSeq.of(comments));
  }

  public static Product from(String name, String version) {
    return new Product(name, version);
  }

  public static Product from(String name) {
    return new Product(name);
  }

  public static Product parse(String string) {
    return Http.standardParser().parseProductString(string);
  }
}
