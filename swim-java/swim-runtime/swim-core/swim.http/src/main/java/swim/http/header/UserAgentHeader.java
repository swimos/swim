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

public final class UserAgentHeader extends HttpHeader {

  final FingerTrieSeq<Product> products;

  UserAgentHeader(FingerTrieSeq<Product> products) {
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
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return UserAgentHeaderWriter.write(output, http, this.products.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UserAgentHeader) {
      final UserAgentHeader that = (UserAgentHeader) other;
      return this.products.equals(that.products);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (UserAgentHeader.hashSeed == 0) {
      UserAgentHeader.hashSeed = Murmur3.seed(UserAgentHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(UserAgentHeader.hashSeed, this.products.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("UserAgentHeader").write('.').write("create").write('(');
    final int n = this.products.size();
    if (n > 0) {
      output = output.debug(this.products.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.products.get(i));
      }
    }
    output = output.write(')');
    return output;
  }

  public static UserAgentHeader empty() {
    return new UserAgentHeader(FingerTrieSeq.empty());
  }

  public static UserAgentHeader create(FingerTrieSeq<Product> products) {
    return new UserAgentHeader(products);
  }

  public static UserAgentHeader create(Product... products) {
    return new UserAgentHeader(FingerTrieSeq.of(products));
  }

  public static UserAgentHeader create(String... productStrings) {
    final Builder<Product, FingerTrieSeq<Product>> products = FingerTrieSeq.builder();
    for (int i = 0, n = productStrings.length; i < n; i += 1) {
      products.add(Product.parse(productStrings[i]));
    }
    return new UserAgentHeader(products.bind());
  }

  public static Parser<UserAgentHeader> parseHeaderValue(Input input, HttpParser http) {
    return UserAgentHeaderParser.parse(input, http);
  }

}
