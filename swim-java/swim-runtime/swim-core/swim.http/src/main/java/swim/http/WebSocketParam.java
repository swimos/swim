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
import swim.codec.Writer;
import swim.util.Murmur3;

public final class WebSocketParam extends HttpPart implements Debug {

  final String key;
  final String value;

  WebSocketParam(String key, String value) {
    this.key = key;
    this.value = value;
  }

  public String key() {
    return this.key;
  }

  public String value() {
    return this.value;
  }

  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.webSocketParamWriter(this.key, this.value);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeWebSocketParam(output, this.key, this.value);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof WebSocketParam) {
      final WebSocketParam that = (WebSocketParam) other;
      return this.key.equals(that.key) && this.value.equals(that.value);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (WebSocketParam.hashSeed == 0) {
      WebSocketParam.hashSeed = Murmur3.seed(WebSocketParam.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(WebSocketParam.hashSeed,
        this.key.hashCode()), this.value.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("WebSocketParam").write('.').write("create").write('(').debug(this.key);
    if (!this.value.isEmpty()) {
      output = output.write(", ").debug(this.value);
    }
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static WebSocketParam serverMaxWindowBits(int maxWindowBits) {
    return new WebSocketParam("server_max_window_bits", Integer.toString(maxWindowBits));
  }

  public static WebSocketParam clientMaxWindowBits(int maxWindowBits) {
    return new WebSocketParam("client_max_window_bits", Integer.toString(maxWindowBits));
  }

  private static WebSocketParam clientMaxWindowBits;

  public static WebSocketParam clientMaxWindowBits() {
    if (WebSocketParam.clientMaxWindowBits == null) {
      WebSocketParam.clientMaxWindowBits = new WebSocketParam("client_max_window_bits", "");
    }
    return WebSocketParam.clientMaxWindowBits;
  }

  private static WebSocketParam serverNoContextTakeover;

  public static WebSocketParam serverNoContextTakeover() {
    if (WebSocketParam.serverNoContextTakeover == null) {
      WebSocketParam.serverNoContextTakeover = new WebSocketParam("server_no_context_takeover", "");
    }
    return WebSocketParam.serverNoContextTakeover;
  }

  private static WebSocketParam clientNoContextTakeover;

  public static WebSocketParam clientNoContextTakeover() {
    if (WebSocketParam.clientNoContextTakeover == null) {
      WebSocketParam.clientNoContextTakeover = new WebSocketParam("client_no_context_takeover", "");
    }
    return WebSocketParam.clientNoContextTakeover;
  }

  public static WebSocketParam create(String key, String value) {
    if ("".equals(value)) {
      return WebSocketParam.create(key);
    } else {
      return new WebSocketParam(key, value);
    }
  }

  public static WebSocketParam create(String key) {
    if ("server_no_context_takeover".equals(key)) {
      return WebSocketParam.serverNoContextTakeover();
    } else if ("client_no_context_takeover".equals(key)) {
      return WebSocketParam.clientNoContextTakeover();
    } else {
      return new WebSocketParam(key, "");
    }
  }

  public static WebSocketParam parse(String string) {
    return Http.standardParser().parseWebSocketParamString(string);
  }

}
