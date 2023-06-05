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

package swim.http;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.StringTrieMap;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public final class HttpUpgrade implements ToSource, ToString {

  final String protocol;
  final @Nullable String version;

  HttpUpgrade(String protocol, @Nullable String version) {
    this.protocol = protocol;
    this.version = version;
  }

  HttpUpgrade(String protocol) {
    this(protocol, null);
  }

  public String protocol() {
    return this.protocol;
  }

  public @Nullable String version() {
    return this.version;
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpUpgrade.write(output, this.protocol, this.version, 0, 1);
  }

  public Write<?> write() {
    return new WriteHttpUpgrade(this.protocol, this.version, 0, 1);
  }

  @SuppressWarnings("ReferenceEquality")
  public boolean matches(HttpUpgrade that) {
    if (this == that) {
      return true;
    } else {
      return this.protocol.equalsIgnoreCase(that.protocol)
          && Objects.equals(this.version, that.version);
    }
  }

  @SuppressWarnings("ReferenceEquality")
  public HttpUpgrade intern() {
    if (this.version == null) {
      StringTrieMap<HttpUpgrade> protocols = (StringTrieMap<HttpUpgrade>) PROTOCOLS.getOpaque();
      do {
        final StringTrieMap<HttpUpgrade> oldProtocols = protocols;
        final StringTrieMap<HttpUpgrade> newProtocols = oldProtocols.updated(this.protocol, this);
        protocols = (StringTrieMap<HttpUpgrade>) PROTOCOLS.compareAndExchangeRelease(oldProtocols, newProtocols);
        if (protocols != oldProtocols) {
          // CAS failed; try again.
          continue;
        }
        protocols = newProtocols;
        break;
      } while (true);
    }
    return this;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpUpgrade that) {
      return this.protocol.equals(that.protocol)
          && Objects.equals(this.version, that.version);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpUpgrade.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.protocol.hashCode()), Objects.hashCode(this.version)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpUpgrade", "of")
            .appendArgument(this.protocol);
    if (this.version != null) {
      notation.appendArgument(this.version);
    }
    notation.endInvoke();
  }

  @Override
  public void writeString(Appendable output) {
    this.write(StringOutput.from(output)).assertDone();
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output).assertDone();
    return output.get();
  }

  public static HttpUpgrade of(String protocol, @Nullable String version) {
    Objects.requireNonNull(protocol, "protocol");
    HttpUpgrade upgrade = ((StringTrieMap<HttpUpgrade>) PROTOCOLS.getOpaque()).get(protocol);
    if (upgrade == null) {
      upgrade = new HttpUpgrade(protocol, version);
    } else if (version != null) {
      upgrade = new HttpUpgrade(upgrade.protocol, version);
    }
    return upgrade;
  }

  public static HttpUpgrade of(String protocol) {
    Objects.requireNonNull(protocol);
    HttpUpgrade upgrade = ((StringTrieMap<HttpUpgrade>) PROTOCOLS.getOpaque()).get(protocol);
    if (upgrade == null) {
      upgrade = new HttpUpgrade(protocol, null);
    }
    return upgrade;
  }

  public static Parse<HttpUpgrade> parse(Input input) {
    return ParseHttpUpgrade.parse(input, (StringTrieMap<HttpUpgrade>) PROTOCOLS.getOpaque(), null, null, 1);
  }

  public static Parse<HttpUpgrade> parse() {
    return new ParseHttpUpgrade((StringTrieMap<HttpUpgrade>) PROTOCOLS.getOpaque(), null, null, 1);
  }

  public static Parse<HttpUpgrade> parse(String string) {
    final StringInput input = new StringInput(string);
    return HttpUpgrade.parse(input).complete(input);
  }

  static StringTrieMap<HttpUpgrade> protocols = StringTrieMap.caseInsensitive();

  /**
   * {@code VarHandle} for atomically accessing the static {@link #protocols} field.
   */
  static final VarHandle PROTOCOLS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      PROTOCOLS = lookup.findStaticVarHandle(HttpUpgrade.class, "protocols", StringTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

  public static final HttpUpgrade H2C = new HttpUpgrade("h2c").intern();
  public static final HttpUpgrade WEBSOCKET = new HttpUpgrade("websocket").intern();

}

final class ParseHttpUpgrade extends Parse<HttpUpgrade> {

  final @Nullable StringTrieMap<HttpUpgrade> protocolTrie;
  final @Nullable StringBuilder protocolBuilder;
  final @Nullable StringBuilder versionBuilder;
  final int step;

  ParseHttpUpgrade(@Nullable StringTrieMap<HttpUpgrade> protocolTrie,
                   @Nullable StringBuilder protocolBuilder,
                   @Nullable StringBuilder versionBuilder, int step) {
    this.protocolTrie = protocolTrie;
    this.protocolBuilder = protocolBuilder;
    this.versionBuilder = versionBuilder;
    this.step = step;
  }

  @Override
  public Parse<HttpUpgrade> consume(Input input) {
    return ParseHttpUpgrade.parse(input, this.protocolTrie, this.protocolBuilder,
                                  this.versionBuilder, this.step);
  }

  static Parse<HttpUpgrade> parse(Input input,
                                  @Nullable StringTrieMap<HttpUpgrade> protocolTrie,
                                  @Nullable StringBuilder protocolBuilder,
                                  @Nullable StringBuilder versionBuilder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && Http.isTokenChar(c = input.head())) {
        if (protocolTrie != null) {
          final StringTrieMap<HttpUpgrade> subTrie =
              protocolTrie.getBranch(protocolTrie.normalized(c));
          if (subTrie != null) {
            protocolTrie = subTrie;
          } else {
            protocolBuilder = new StringBuilder();
            protocolBuilder.appendCodePoint(c);
            protocolTrie = null;
          }
        } else {
          protocolBuilder = new StringBuilder();
          protocolBuilder.appendCodePoint(c);
        }
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("upgrade protocol", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Http.isTokenChar(c = input.head())) {
        if (protocolTrie != null) {
          final StringTrieMap<HttpUpgrade> subTrie =
              protocolTrie.getBranch(protocolTrie.normalized(c));
          if (subTrie != null) {
            protocolTrie = subTrie;
          } else {
            protocolBuilder = new StringBuilder(protocolTrie.prefix());
            protocolBuilder.appendCodePoint(c);
            protocolTrie = null;
          }
        } else {
          Assume.nonNull(protocolBuilder).appendCodePoint(c);
        }
        input.step();
      }
      if (input.isCont() && c == '/') {
        input.step();
        step = 3;
      } else if (input.isReady()) {
        HttpUpgrade upgrade = protocolTrie != null ? protocolTrie.value() : null;
        if (upgrade == null) {
          final String protocol = protocolTrie != null
                                ? protocolTrie.prefix()
                                : Assume.nonNull(protocolBuilder).toString();
          upgrade = new HttpUpgrade(protocol);
        }
        return Parse.done(upgrade);
      }
    }
    if (step == 3) {
      if (input.isCont() && Http.isTokenChar(c = input.head())) {
        versionBuilder = new StringBuilder();
        versionBuilder.appendCodePoint(c);
        input.step();
        step = 4;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("upgrade protocol version", input));
      }
    }
    if (step == 4) {
      while (input.isCont() && Http.isTokenChar(c = input.head())) {
        Assume.nonNull(versionBuilder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        HttpUpgrade upgrade = protocolTrie != null ? protocolTrie.value() : null;
        if (upgrade == null) {
          final String protocol = protocolTrie != null
                                ? protocolTrie.prefix()
                                : Assume.nonNull(protocolBuilder).toString();
          upgrade = new HttpUpgrade(protocol, Assume.nonNull(versionBuilder).toString());
        } else {
          upgrade = new HttpUpgrade(upgrade.protocol, Assume.nonNull(versionBuilder).toString());
        }
        return Parse.done(upgrade);
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpUpgrade(protocolTrie, protocolBuilder, versionBuilder, step);
  }

}

final class WriteHttpUpgrade extends Write<Object> {

  final String protocol;
  final @Nullable String version;
  final int index;
  final int step;

  WriteHttpUpgrade(String protocol, @Nullable String version, int index, int step) {
    this.protocol = protocol;
    this.version = version;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpUpgrade.write(output, this.protocol, this.version,
                                  this.index, this.step);
  }

  static Write<Object> write(Output<?> output, String protocol,
                             @Nullable String version, int index, int step) {
    int c = 0;
    if (step == 1) {
      if (protocol.length() == 0) {
        return Write.error(new WriteException("blank upgrade protocol"));
      }
      while (index < protocol.length() && output.isCont()) {
        c = protocol.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = protocol.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid upgrade protocol: " + protocol));
        }
      }
      if (index >= protocol.length()) {
        index = 0;
        if (version != null) {
          step = 2;
        } else {
          return Write.done();
        }
      }
    }
    if (step == 2 && output.isCont()) {
      output.write('/');
      step = 3;
    }
    if (step == 3) {
      version = Assume.nonNull(version);
      if (version.length() == 0) {
        return Write.error(new WriteException("blank upgrade protocol version"));
      }
      while (index < version.length() && output.isCont()) {
        c = version.codePointAt(index);
        if (Http.isTokenChar(c)) {
          output.write(c);
          index = version.offsetByCodePoints(index, 1);
        } else {
          return Write.error(new WriteException("invalid upgrade protocol version: " + version));
        }
      }
      if (index >= version.length()) {
        index = 0;
        return Write.done();
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpUpgrade(protocol, version, index, step);
  }

}
