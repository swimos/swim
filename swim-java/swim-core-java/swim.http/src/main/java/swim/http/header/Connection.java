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

import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Writer;
import swim.collections.FingerTrieSeq;
import swim.http.HttpHeader;
import swim.http.HttpParser;
import swim.http.HttpWriter;
import swim.util.Murmur3;

public final class Connection extends HttpHeader {
  final FingerTrieSeq<String> options;

  Connection(FingerTrieSeq<String> options) {
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
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return http.writeTokenList(this.options.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Connection) {
      final Connection that = (Connection) other;
      return this.options.equals(that.options);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Connection.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.options.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Connection").write('.').write("from").write('(');
    final int n = this.options.size();
    if (n > 0) {
      output.debug(this.options.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").write(this.options.get(i));
      }
    }
    output = output.write(')');
  }

  private static int hashSeed;

  private static Connection close;
  private static Connection upgrade;

  public static Connection close() {
    if (close == null) {
      close = new Connection(FingerTrieSeq.of("close"));
    }
    return close;
  }

  public static Connection upgrade() {
    if (upgrade == null) {
      upgrade = new Connection(FingerTrieSeq.of("Upgrade"));
    }
    return upgrade;
  }

  public static Connection from(FingerTrieSeq<String> options) {
    if (options.size() == 1) {
      final String option = options.head();
      if ("close".equals(option)) {
        return close();
      } else if ("Upgrade".equals(option)) {
        return upgrade();
      }
    }
    return new Connection(options);
  }

  public static Connection from(String... options) {
    return from(FingerTrieSeq.of(options));
  }

  public static Parser<Connection> parseHttpValue(Input input, HttpParser http) {
    return ConnectionParser.parse(input, http);
  }
}
