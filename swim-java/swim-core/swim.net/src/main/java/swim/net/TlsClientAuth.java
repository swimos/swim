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

package swim.net;

import java.io.IOException;
import javax.net.ssl.SSLEngine;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.WriteSource;

/**
 * Transport-layer security client authentication configuration.
 */
@Public
@Since("5.0")
public enum TlsClientAuth implements WriteSource {

  /**
   * Client authentication disabled.
   */
  NONE("none"),

  /**
   * Client authentication requested.
   */
  WANT("want"),

  /**
   * Client authentication required.
   */
  NEED("need");

  final String label;

  TlsClientAuth(String label) {
    this.label = label;
  }

  public String label() {
    return this.label;
  }

  @Override
  public void writeSource(Appendable output) throws IOException {
    output.append("TlsClientAuth").append('.').append(this.name());
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static TlsClientAuth from(SSLEngine sslEngine) {
    if (sslEngine.getNeedClientAuth()) {
      return NEED;
    } else if (sslEngine.getWantClientAuth()) {
      return WANT;
    } else {
      return NONE;
    }
  }

  /**
   * Returns the {@code TlsClientAuth} with the given case-insensitive
   * {@code name}, one of <em>none</em>, <em>want</em>, or <em>need</em>.
   *
   * @throws IllegalArgumentException if {@code name} is not a valid
   *         {@code TlsClientAuth} token.
   */
  public static TlsClientAuth parse(String name) {
    if ("none".equalsIgnoreCase(name)) {
      return TlsClientAuth.NONE;
    } else if ("want".equalsIgnoreCase(name)) {
      return TlsClientAuth.WANT;
    } else if ("need".equalsIgnoreCase(name)) {
      return TlsClientAuth.NEED;
    } else {
      throw new IllegalArgumentException(name);
    }
  }

}
