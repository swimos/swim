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
import swim.codec.Diagnostic;
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.collections.FingerTrieList;
import swim.http.Http;
import swim.http.HttpHeader;
import swim.http.HttpHeaderType;
import swim.http.HttpProduct;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class UserAgentHeader extends HttpHeader {

  @Nullable FingerTrieList<HttpProduct> products;

  UserAgentHeader(String name, String value,
                  @Nullable FingerTrieList<HttpProduct> products) {
    super(name, value);
    this.products = products;
  }

  public FingerTrieList<HttpProduct> products() {
    if (this.products == null) {
      this.products = UserAgentHeader.parseValue(this.value);
    }
    return this.products;
  }

  @Override
  public UserAgentHeader withValue(String newValue) {
    return UserAgentHeader.of(this.name, newValue);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("UserAgentHeader", "of")
            .appendArgument(this.products())
            .endInvoke();
  }

  public static final String NAME = "User-Agent";

  public static final HttpHeaderType<FingerTrieList<HttpProduct>> TYPE = new UserAgentHeaderType();

  public static UserAgentHeader of(String name, String value) {
    return new UserAgentHeader(name, value, null);
  }

  public static UserAgentHeader of(String name, FingerTrieList<HttpProduct> products) {
    final String value = UserAgentHeader.writeValue(products.iterator());
    return new UserAgentHeader(name, value, products);
  }

  public static UserAgentHeader of(FingerTrieList<HttpProduct> products) {
    return UserAgentHeader.of(NAME, products);
  }

  public static UserAgentHeader of(HttpProduct... products) {
    return UserAgentHeader.of(NAME, FingerTrieList.of(products));
  }

  private static FingerTrieList<HttpProduct> parseValue(String value) {
    final StringInput input = new StringInput(value);
    FingerTrieList<HttpProduct> products = FingerTrieList.empty();
    int c = 0;
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
        final HttpProduct product = HttpProduct.parse(input).getNonNull();
        products = products.appended(product);
        continue;
      }
      break;
    } while (true);
    if (input.isError()) {
      throw new ParseException(input.getError());
    } else if (!input.isDone()) {
      throw new ParseException(Diagnostic.unexpected(input));
    }
    return products;
  }

  private static String writeValue(Iterator<HttpProduct> products) {
    final StringOutput output = new StringOutput();
    HttpProduct product = null;
    while (products.hasNext()) {
      if (product != null) {
        output.write(' ');
      }
      product = products.next();
      product.write(output).checkDone();
    }
    return output.get();
  }

}

final class UserAgentHeaderType implements HttpHeaderType<FingerTrieList<HttpProduct>>, ToSource {

  @Override
  public String name() {
    return UserAgentHeader.NAME;
  }

  @Override
  public FingerTrieList<HttpProduct> getValue(HttpHeader header) {
    return ((UserAgentHeader) header).products();
  }

  @Override
  public HttpHeader of(String name, String value) {
    return UserAgentHeader.of(name, value);
  }

  @Override
  public HttpHeader of(String name, FingerTrieList<HttpProduct> products) {
    return UserAgentHeader.of(name, products);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.append("UserAgentHeader").append('.').append("TYPE");
  }

  @Override
  public String toString() {
    return this.toSource();
  }

}
