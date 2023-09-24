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
import swim.util.WriteSource;
import swim.util.WriteString;

@Public
@Since("5.0")
public final class HttpMethod implements WriteSource, WriteString {

  final String name;

  HttpMethod(String name) {
    this.name = name;
  }

  public String name() {
    return this.name;
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpMethod.write(output, this.name, 0);
  }

  public Write<?> write() {
    return new WriteHttpMethod(this.name, 0);
  }

  @SuppressWarnings("ReferenceEquality")
  public HttpMethod intern() {
    StringTrieMap<HttpMethod> names = (StringTrieMap<HttpMethod>) NAMES.getOpaque();
    do {
      final StringTrieMap<HttpMethod> oldNames = names;
      final StringTrieMap<HttpMethod> newNames = oldNames.updated(this.name, this);
      names = (StringTrieMap<HttpMethod>) NAMES.compareAndExchangeRelease(oldNames, newNames);
      if (names != oldNames) {
        // CAS failed; try again.
        continue;
      }
      names = newNames;
      break;
    } while (true);
    return this;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpMethod that) {
      return this.name.equals(that.name);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpMethod.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(HASH_SEED, this.name.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if ("GET".equals(this.name) || "HEAD".equals(this.name)
        || "POST".equals(this.name) || "PUT".equals(this.name)
        || "DELETE".equals(this.name) || "CONNECT".equals(this.name)
        || "OPTIONS".equals(this.name) || "TRACE".equals(this.name)) {
      notation.append("HttpMethod").append('.').append(this.name);
    } else {
      notation.beginInvoke("HttpMethod", "of")
              .appendArgument(this.name)
              .endInvoke();
    }
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

  public static HttpMethod of(String name) {
    Objects.requireNonNull(name);
    HttpMethod method = ((StringTrieMap<HttpMethod>) NAMES.getOpaque()).get(name);
    if (method == null) {
      method = new HttpMethod(name);
    }
    return method;
  }

  public static Parse<HttpMethod> parse(Input input) {
    return ParseHttpMethod.parse(input, (StringTrieMap<HttpMethod>) NAMES.getOpaque(), null, 1);
  }

  public static Parse<HttpMethod> parse() {
    return new ParseHttpMethod((StringTrieMap<HttpMethod>) NAMES.getOpaque(), null, 1);
  }

  public static Parse<HttpMethod> parse(String string) {
    final StringInput input = new StringInput(string);
    return HttpMethod.parse(input).complete(input);
  }

  static StringTrieMap<HttpMethod> names = StringTrieMap.caseSensitive();

  /**
   * {@code VarHandle} for atomically accessing the static {@link #names} field.
   */
  static final VarHandle NAMES;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      NAMES = lookup.findStaticVarHandle(HttpMethod.class, "names", StringTrieMap.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

  public static final HttpMethod GET = new HttpMethod("GET").intern();
  public static final HttpMethod HEAD = new HttpMethod("HEAD").intern();
  public static final HttpMethod POST = new HttpMethod("POST").intern();
  public static final HttpMethod PUT = new HttpMethod("PUT").intern();
  public static final HttpMethod DELETE = new HttpMethod("DELETE").intern();
  public static final HttpMethod CONNECT = new HttpMethod("CONNECT").intern();
  public static final HttpMethod OPTIONS = new HttpMethod("OPTIONS").intern();
  public static final HttpMethod TRACE = new HttpMethod("TRACE").intern();

}

final class ParseHttpMethod extends Parse<HttpMethod> {

  final @Nullable StringTrieMap<HttpMethod> nameTrie;
  final @Nullable StringBuilder nameBuilder;
  final int step;

  ParseHttpMethod(@Nullable StringTrieMap<HttpMethod> nameTrie,
                  @Nullable StringBuilder nameBuilder, int step) {
    this.nameTrie = nameTrie;
    this.nameBuilder = nameBuilder;
    this.step = step;
  }

  @Override
  public Parse<HttpMethod> consume(Input input) {
    return ParseHttpMethod.parse(input, this.nameTrie, this.nameBuilder, this.step);
  }

  static Parse<HttpMethod> parse(Input input, @Nullable StringTrieMap<HttpMethod> nameTrie,
                                 @Nullable StringBuilder nameBuilder, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && Http.isTokenChar(c = input.head())) {
        if (nameTrie != null) {
          final StringTrieMap<HttpMethod> subTrie =
              nameTrie.getBranch(nameTrie.normalized(c));
          if (subTrie != null) {
            nameTrie = subTrie;
          } else {
            nameBuilder = new StringBuilder();
            nameBuilder.appendCodePoint(c);
            nameTrie = null;
          }
        } else {
          nameBuilder = new StringBuilder();
          nameBuilder.appendCodePoint(c);
        }
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("method", input));
      }
    }
    if (step == 2) {
      while (input.isCont() && Http.isTokenChar(c = input.head())) {
        if (nameTrie != null) {
          final StringTrieMap<HttpMethod> subTrie =
              nameTrie.getBranch(nameTrie.normalized(c));
          if (subTrie != null) {
            nameTrie = subTrie;
          } else {
            nameBuilder = new StringBuilder(nameTrie.prefix());
            nameBuilder.appendCodePoint(c);
            nameTrie = null;
          }
        } else {
          Assume.nonNull(nameBuilder).appendCodePoint(c);
        }
        input.step();
      }
      if (input.isReady()) {
        HttpMethod method = nameTrie != null ? nameTrie.value() : null;
        if (method == null) {
          final String name = nameTrie != null
                            ? nameTrie.prefix()
                            : Assume.nonNull(nameBuilder).toString();
          method = new HttpMethod(name);
        }
        return Parse.done(method);
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpMethod(nameTrie, nameBuilder, step);
  }

}

final class WriteHttpMethod extends Write<Object> {

  final String name;
  final int index;

  WriteHttpMethod(String name, int index) {
    this.name = name;
    this.index = index;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpMethod.write(output, this.name, this.index);
  }

  static Write<Object> write(Output<?> output, String name, int index) {
    if (name.length() == 0) {
      return Write.error(new WriteException("blank method name"));
    }
    while (index < name.length() && output.isCont()) {
      final int c = name.codePointAt(index);
      if (Http.isTokenChar(c)) {
        output.write(c);
        index = name.offsetByCodePoints(index, 1);
      } else {
        return Write.error(new WriteException("invalid method name: " + name));
      }
    }
    if (index >= name.length()) {
      return Write.done();
    } else if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpMethod(name, index);
  }

}
