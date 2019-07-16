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

import java.util.Iterator;
import swim.codec.Output;
import swim.codec.Writer;
import swim.codec.WriterException;
import swim.http.HttpWriter;
import swim.http.Product;

final class UserAgentWriter extends Writer<Object, Object> {
  final HttpWriter http;
  final Iterator<Product> products;
  final Writer<?, ?> part;
  final int step;

  UserAgentWriter(HttpWriter http, Iterator<Product> products, Writer<?, ?> part, int step) {
    this.http = http;
    this.products = products;
    this.part = part;
    this.step = step;
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.http, this.products, this.part, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, Iterator<Product> products,
                                      Writer<?, ?> part, int step) {
    do {
      if (step == 1) {
        if (part == null) {
          if (!products.hasNext()) {
            return done();
          } else {
            part = products.next().writeHttp(output, http);
          }
        } else {
          part = part.pull(output);
        }
        if (part.isDone()) {
          part = null;
          if (!products.hasNext()) {
            return done();
          } else {
            step = 2;
          }
        } else if (part.isError()) {
          return part.asError();
        }
      }
      if (step == 2 && output.isCont()) {
        output = output.write(' ');
        step = 1;
        continue;
      }
      break;
    } while (true);
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new UserAgentWriter(http, products, part, step);
  }

  static Writer<Object, Object> write(Output<?> output, HttpWriter http, Iterator<Product> products) {
    return write(output, http, products, null, 1);
  }
}
