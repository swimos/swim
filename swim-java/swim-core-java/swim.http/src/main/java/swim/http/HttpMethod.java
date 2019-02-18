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
import swim.util.Murmur3;

public final class HttpMethod extends HttpPart implements Debug {
  final String name;

  HttpMethod(String name) {
    this.name = name;
  }

  public String name() {
    return this.name;
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.methodWriter(this.name);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeMethod(this.name, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpMethod) {
      final HttpMethod that = (HttpMethod) other;
      return this.name.equals(that.name);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(HttpMethod.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.name.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("HttpMethod").write('.');
    if (this.name.equals("GET") || this.name.equals("HEAD") || this.name.equals("POST")
        || this.name.equals("PUT") || this.name.equals("DELETE") || this.name.equals("CONNECT")
        || this.name.equals("OPTIONS") || this.name.equals("TRACE")) {
      output = output.write(name);
    } else {
      output = output.write("from").write('(').debug(this.name).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static final HttpMethod GET     = new HttpMethod("GET");
  public static final HttpMethod HEAD    = new HttpMethod("HEAD");
  public static final HttpMethod POST    = new HttpMethod("POST");
  public static final HttpMethod PUT     = new HttpMethod("PUT");
  public static final HttpMethod DELETE  = new HttpMethod("DELETE");
  public static final HttpMethod CONNECT = new HttpMethod("CONNECT");
  public static final HttpMethod OPTIONS = new HttpMethod("OPTIONS");
  public static final HttpMethod TRACE   = new HttpMethod("TRACE");

  public static HttpMethod from(String name) {
    if (name.equals("GET")) {
      return GET;
    } else if (name.equals("HEAD")) {
      return HEAD;
    } else if (name.equals("POST")) {
      return POST;
    } else if (name.equals("PUT")) {
      return PUT;
    } else if (name.equals("DELETE")) {
      return DELETE;
    } else if (name.equals("CONNECT")) {
      return CONNECT;
    } else if (name.equals("OPTIONS")) {
      return OPTIONS;
    } else if (name.equals("TRACE")) {
      return TRACE;
    } else {
      return new HttpMethod(name);
    }
  }

  public static HttpMethod parseHttp(String string) {
    return Http.standardParser().parseMethodString(string);
  }
}
