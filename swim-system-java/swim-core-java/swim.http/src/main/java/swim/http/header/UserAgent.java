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

package swim.http.header;

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.http.Product;
import swim.util.Builder;
import swim.util.Murmur3;

public final class UserAgent extends HttpHeader {
  final FingerTrieSeq<Product> products;

  UserAgent(FingerTrieSeq<Product> products) {
    this.products = products;
  }

  @Override
  public String lowerCaseName() {
    return "user-agent";
  }

  @Override
  public String name() {
    return "User-Agent";
  }

  public FingerTrieSeq<Product> products() {
    return this.products;
  }

  @Override
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return UserAgentWriter.write(output, http, this.products.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UserAgent) {
      final UserAgent that = (UserAgent) other;
      return this.products.equals(that.products);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(UserAgent.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.products.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("UserAgent").write('.').write("from").write('(');
    final int n = this.products.size();
    if (n > 0) {
      output.debug(this.products.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.products.get(i));
      }
    }
    output = output.write(')');
  }

  private static int hashSeed;

  public static UserAgent from(FingerTrieSeq<Product> products) {
    return new UserAgent(products);
  }

  public static UserAgent from(Product... products) {
    return new UserAgent(FingerTrieSeq.of(products));
  }

  public static UserAgent from(String... productStrings) {
    final Builder<Product, FingerTrieSeq<Product>> products = FingerTrieSeq.builder();
    for (int i = 0, n = productStrings.length; i < n; i += 1) {
      products.add(Product.parse(productStrings[i]));
    }
    return new UserAgent(products.bind());
  }

  public static Parser<UserAgent> parseHttpValue(Input input, HttpParser http) {
    return UserAgentParser.parse(input, http);
  }
}
