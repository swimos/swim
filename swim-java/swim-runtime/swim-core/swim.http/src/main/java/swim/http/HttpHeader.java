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

package swim.http;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Utf8;
import swim.codec.Writer;

public abstract class HttpHeader extends HttpPart implements Comparable<HttpHeader>, Debug {

  public HttpHeader() {
    // nop
  }

  public boolean isBlank() {
    return false;
  }

  public abstract String lowerCaseName();

  public abstract String name();

  public String value() {
    final Output<String> output = Utf8.decodedString();
    this.writeHeaderValue(output, Http.standardWriter()).bind();
    return output.bind();
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.headerWriter(this);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeHeader(output, this);
  }

  public abstract Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http);

  @Override
  public int compareTo(HttpHeader that) {
    int order = this.name().compareTo(that.name());
    if (order == 0) {
      order = this.value().compareTo(that.value());
    }
    return order;
  }

  @Override
  public abstract <T> Output<T> debug(Output<T> output);

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static HttpHeader parseHttp(String string) {
    return Http.standardParser().parseHeaderString(string);
  }

}
