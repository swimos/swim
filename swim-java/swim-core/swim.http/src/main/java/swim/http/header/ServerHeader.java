// Copyright 2015-2022 Swim.inc
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

import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpProduct;
import swim.http.HttpStatus;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class ServerHeader extends HttpHeader {

  @Nullable FingerTrieList<HttpProduct> products;

  ServerHeader(String name, String value,
               @Nullable FingerTrieList<HttpProduct> products) {
    super(name, value);
    this.products = products;
  }

  public FingerTrieList<HttpProduct> products() throws HttpException {
    if (this.products == null) {
      this.products = ServerHeader.parseValue(this.value);
    }
    return this.products;
  }

  @Override
  public ServerHeader withValue(String newValue) {
    return ServerHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("ServerHeader", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  public static final String NAME = "Server";

  public static final HttpHeaderType<ServerHeader, FingerTrieList<HttpProduct>> TYPE = new ServerHeaderType();

  public static ServerHeader of(String name, String value) {
    return new ServerHeader(name, value, null);
  }

  public static ServerHeader of(String name, FingerTrieList<HttpProduct> products) {
    final String value = ServerHeader.writeValue(products.iterator());
    return new ServerHeader(name, value, products);
  }

  public static ServerHeader of(FingerTrieList<HttpProduct> products) {
    return ServerHeader.of(NAME, products);
  }

  public static ServerHeader of(HttpProduct... products) {
    return ServerHeader.of(NAME, FingerTrieList.of(products));
  }

  public static ServerHeader of(String value) {
    return ServerHeader.of(NAME, value);
  }

  static FingerTrieList<HttpProduct> parseValue(String value) throws HttpException {
    final StringInput input = new StringInput(value);
    int c = 0;
    FingerTrieList<HttpProduct> products = FingerTrieList.empty();
    do {
      while (input.isCont()) {
        c = input.head();
        if (Http.isSpace(c)) {
          input.step();
        } else {
          break;
        }
      }
      if (input.isCont() && Http.isTokenChar(c)) {
        final Parse<HttpProduct> parseProduct = HttpProduct.parse(input);
        if (parseProduct.isDone()) {
          products = products.appended(parseProduct.getNonNullUnchecked());
        } else if (parseProduct.isError()) {
          throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Server: " + value, parseProduct.getError());
        } else {
          throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Server: " + value);
        }
        continue;
      }
      break;
    } while (true);
    if (input.isError()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Server: " + value, input.getError());
    } else if (!input.isDone()) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "malformed Server: " + value);
    }
    return products;
  }

  static String writeValue(Iterator<HttpProduct> products) {
    final StringOutput output = new StringOutput();
    HttpProduct product = null;
    while (products.hasNext()) {
      if (product != null) {
        output.write(' ');
      }
      product = products.next();
      product.write(output).assertDone();
    }
    return output.get();
  }

}

final class ServerHeaderType implements HttpHeaderType<ServerHeader, FingerTrieList<HttpProduct>>, ToSource {

  @Override
  public String name() {
    return ServerHeader.NAME;
  }

  @Override
  public FingerTrieList<HttpProduct> getValue(ServerHeader header) throws HttpException {
    return header.products();
  }

  @Override
  public ServerHeader of(String name, String value) {
    return ServerHeader.of(name, value);
  }

  @Override
  public ServerHeader of(String name, FingerTrieList<HttpProduct> products) {
    return ServerHeader.of(name, products);
  }

  @Override
  public @Nullable ServerHeader cast(HttpHeader header) {
    if (header instanceof ServerHeader) {
      return (ServerHeader) header;
    } else {
      return null;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("ServerHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
