// Copyright 2015-2021 Swim Inc.
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

public final class SecWebSocketVersion extends HttpHeader {

  final FingerTrieSeq<Integer> versions;

  SecWebSocketVersion(FingerTrieSeq<Integer> versions) {
    this.versions = versions;
  }

  @Override
  public boolean isBlank() {
    return this.versions.isEmpty();
  }

  @Override
  public String lowerCaseName() {
    return "sec-websocket-version";
  }

  @Override
  public String name() {
    return "Sec-WebSocket-Version";
  }

  public FingerTrieSeq<Integer> versions() {
    return this.versions;
  }

  public boolean supports(int version) {
    return this.versions.contains(version);
  }

  @Override
  public Writer<?, ?> writeHttpValue(Output<?> output, HttpWriter http) {
    return http.writeTokenList(this.versions.iterator(), output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SecWebSocketVersion) {
      final SecWebSocketVersion that = (SecWebSocketVersion) other;
      return this.versions.equals(that.versions);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (SecWebSocketVersion.hashSeed == 0) {
      SecWebSocketVersion.hashSeed = Murmur3.seed(SecWebSocketVersion.class);
    }
    return Murmur3.mash(Murmur3.mix(SecWebSocketVersion.hashSeed, this.versions.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("SecWebSocketVersion").write('.').write("create").write('(');
    final int n = this.versions.size();
    if (n > 0) {
      output = output.debug(this.versions.head());
      for (int i = 1; i < n; i += 1) {
        output = output.write(", ").debug(this.versions.get(i));
      }
    }
    output = output.write(')');
    return output;
  }

  private static SecWebSocketVersion version13;

  public static SecWebSocketVersion version13() {
    if (SecWebSocketVersion.version13 == null) {
      SecWebSocketVersion.version13 = new SecWebSocketVersion(FingerTrieSeq.of(13));
    }
    return SecWebSocketVersion.version13;
  }

  public static SecWebSocketVersion create(FingerTrieSeq<Integer> versions) {
    if (versions.size() == 1) {
      final int version = versions.head();
      if (version == 13) {
        return SecWebSocketVersion.version13();
      }
    }
    return new SecWebSocketVersion(versions);
  }

  public static SecWebSocketVersion create(Integer... versions) {
    if (versions.length == 1) {
      final int version = versions[0];
      if (version == 13) {
        return SecWebSocketVersion.version13();
      }
    }
    return new SecWebSocketVersion(FingerTrieSeq.of(versions));
  }

  public static Parser<SecWebSocketVersion> parseHttpValue(Input input, HttpParser http) {
    return SecWebSocketVersionParser.parse(input);
  }

}
