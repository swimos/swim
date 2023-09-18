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

public final class ServerHeader extends HttpHeader {

  final FingerTrieSeq<Product> products;

  ServerHeader(FingerTrieSeq<Product> products) {
    this.products = products;
  }

  @Override
  public String lowerCaseName() {
    return "server";
  }

  @Override
  public String name() {
    return "Server";
  }

  public FingerTrieSeq<Product> products() {
    return this.products;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return ServerHeaderWriter.write(output, http, this.products.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ServerHeader) {
      final ServerHeader that = (ServerHeader) other;
      return this.products.equals(that.products);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ServerHeader.hashSeed == 0) {
      ServerHeader.hashSeed = Murmur3.seed(ServerHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(ServerHeader.hashSeed, this.products.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("ServerHeader").write('.').write("create").write('(');
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

  public static ServerHeader empty() {
    return new ServerHeader(FingerTrieSeq.empty());
  }

  public static ServerHeader create(FingerTrieSeq<Product> products) {
    return new ServerHeader(products);
  }

  public static ServerHeader create(Product... products) {
    return new ServerHeader(FingerTrieSeq.of(products));
  }

  public static ServerHeader create(String... productStrings) {
    final Builder<Product, FingerTrieSeq<Product>> products = FingerTrieSeq.builder();
    for (int i = 0, n = productStrings.length; i < n; i += 1) {
      products.add(Product.parse(productStrings[i]));
    }
    return new ServerHeader(products.bind());
  }

  public static Parser<ServerHeader> parseHeaderValue(Input input, HttpParser http) {
    return ServerHeaderParser.parse(input, http);
  }

}
