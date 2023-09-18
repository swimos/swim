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
import swim.codec.Parser;
import swim.collections.FingerTrieSeq;
import swim.http.Http;
import swim.http.HttpParser;
import swim.http.Product;
import swim.util.Builder;

final class ServerHeaderParser extends Parser<ServerHeader> {

  final HttpParser http;
  final Parser<Product> productParser;
  final Builder<Product, FingerTrieSeq<Product>> products;
  final int step;

  ServerHeaderParser(HttpParser http, Parser<Product> productParser,
                     Builder<Product, FingerTrieSeq<Product>> products, int step) {
    this.http = http;
    this.productParser = productParser;
    this.products = products;
    this.step = step;
  }

  ServerHeaderParser(HttpParser http) {
    this(http, null, null, 1);
  }

  @Override
  public Parser<ServerHeader> feed(Input input) {
    return ServerHeaderParser.parse(input, this.http, this.productParser, this.products, this.step);
  }

  static Parser<ServerHeader> parse(Input input, HttpParser http, Parser<Product> productParser,
                                    Builder<Product, FingerTrieSeq<Product>> products, int step) {
    int c = 0;
    if (step == 1) {
      if (productParser == null) {
        productParser = http.parseProduct(input);
      } else {
        productParser = productParser.feed(input);
      }
      if (productParser.isDone()) {
        if (products == null) {
          products = FingerTrieSeq.builder();
        }
        products.add(productParser.bind());
        productParser = null;
        step = 2;
      } else if (productParser.isError()) {
        return productParser.asError();
      }
    }
    do {
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input = input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && Http.isTokenChar(c)) {
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.done(ServerHeader.create(products.bind()));
        }
      }
      if (step == 3) {
        if (productParser == null) {
          productParser = http.parseProduct(input);
        } else {
          productParser = productParser.feed(input);
        }
        if (productParser.isDone()) {
          products.add(productParser.bind());
          productParser = null;
          step = 2;
          continue;
        } else if (productParser.isError()) {
          return productParser.asError();
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parser.error(input.trap());
    }
    return new ServerHeaderParser(http, productParser, products, step);
  }

  static Parser<ServerHeader> parse(Input input, HttpParser http) {
    return ServerHeaderParser.parse(input, http, null, null, 1);
  }

}
