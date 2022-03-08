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

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Murmur3;

public final class ConnectionHeader extends HttpHeader {

  final FingerTrieSeq<String> options;

  ConnectionHeader(FingerTrieSeq<String> options) {
    this.options = options;
  }

  @Override
  public boolean isBlank() {
    return this.options.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "connection";
  }

  @Override
  public String name() {
    return "Connection";
  }

  public FingerTrieSeq<String> options() {
    return this.options;
  }

  public boolean contains(String option) {
    final FingerTrieSeq<String> options = this.options;
    for (int i = 0, n = options.size(); i < n; i += 1) {
      if (option.equalsIgnoreCase(options.get(i))) {
        return true;
      }
    }
    return false;
  }

  @Override
  public Writer<?, ?> writeHeaderValue(Output<?> output, HttpWriter http) {
    return http.writeTokenList(output, this.options.iterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof ConnectionHeader) {
      final ConnectionHeader that = (ConnectionHeader) other;
      return this.options.equals(that.options);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (ConnectionHeader.hashSeed == 0) {
      ConnectionHeader.hashSeed = Murmur3.seed(ConnectionHeader.class);
    }
    return Murmur3.mash(Murmur3.mix(ConnectionHeader.hashSeed, this.options.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("ConnectionHeader").write('.').write("create").write('(');
    final int n = this.options.size();
    if (n > 0) {
      output = output.debug(this.options.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").write(this.options.get(i));
      }
    }
    output = output.write(')');
    return output;
  }

  private static ConnectionHeader close;

  public static ConnectionHeader close() {
    if (ConnectionHeader.close == null) {
      ConnectionHeader.close = new ConnectionHeader(FingerTrieSeq.of("close"));
    }
    return ConnectionHeader.close;
  }

  private static ConnectionHeader upgrade;

  public static ConnectionHeader upgrade() {
    if (ConnectionHeader.upgrade == null) {
      ConnectionHeader.upgrade = new ConnectionHeader(FingerTrieSeq.of("Upgrade"));
    }
    return ConnectionHeader.upgrade;
  }

  public static ConnectionHeader empty() {
    return new ConnectionHeader(FingerTrieSeq.empty());
  }

  public static ConnectionHeader create(FingerTrieSeq<String> options) {
    if (options.size() == 1) {
      final String option = options.head();
      if ("close".equals(option)) {
        return ConnectionHeader.close();
      } else if ("Upgrade".equals(option)) {
        return ConnectionHeader.upgrade();
      }
    }
    return new ConnectionHeader(options);
  }

  public static ConnectionHeader create(String... options) {
    return create(FingerTrieSeq.of(options));
  }

  public static Parser<ConnectionHeader> parseHeaderValue(Input input, HttpParser http) {
    return ConnectionHeaderParser.parse(input, http);
  }

}
