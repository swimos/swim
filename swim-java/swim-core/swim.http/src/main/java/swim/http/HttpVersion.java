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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base10;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public final class HttpVersion implements ToSource, ToString {

  final int major;
  final int minor;

  HttpVersion(int major, int minor) {
    this.major = major;
    this.minor = minor;
  }

  public int major() {
    return this.major;
  }

  public int minor() {
    return this.minor;
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpVersion.write(output, this.major, this.minor, 1);
  }

  public Write<?> write() {
    return new WriteHttpVersion(this.major, this.minor, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpVersion) {
      final HttpVersion that = (HttpVersion) other;
      return this.major == that.major && this.minor == that.minor;
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(HttpVersion.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED, this.major), this.minor));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.major == 1 && (this.minor == 1 || this.minor == 0)) {
      notation.append("HttpVersion").append('.').append("HTTP").append('_')
              .append(this.major).append('_').append(this.minor);
    } else {
      notation.beginInvoke("HttpVersion", "of")
              .appendArgument(this.major)
              .appendArgument(this.minor)
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

  public static final HttpVersion HTTP_1_1 = new HttpVersion(1, 1);
  public static final HttpVersion HTTP_1_0 = new HttpVersion(1, 0);

  public static HttpVersion of(int major, int minor) {
    if (major == 1 && minor == 1) {
      return HttpVersion.HTTP_1_1;
    } else if (major == 1 && minor == 0) {
      return HttpVersion.HTTP_1_0;
    } else if (major >= 0 && minor >= 0) {
      return new HttpVersion(major, minor);
    } else {
      throw new IllegalArgumentException(major + ", " + minor);
    }
  }

  public static Parse<HttpVersion> parse(Input input) {
    return ParseHttpVersion.parse(input, 0, 0, 1);
  }

  public static Parse<HttpVersion> parse() {
    return new ParseHttpVersion(0, 0, 1);
  }

  public static Parse<HttpVersion> parse(String string) {
    final StringInput input = new StringInput(string);
    return HttpVersion.parse(input).complete(input);
  }

}

final class ParseHttpVersion extends Parse<HttpVersion> {

  final int major;
  final int minor;
  final int step;

  ParseHttpVersion(int major, int minor, int step) {
    this.major = major;
    this.minor = minor;
    this.step = step;
  }

  @Override
  public Parse<HttpVersion> consume(Input input) {
    return ParseHttpVersion.parse(input, this.major, this.minor, this.step);
  }

  static Parse<HttpVersion> parse(Input input, int major, int minor, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && input.head() == 'H') {
        input.step();
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('H', input));
      }
    }
    if (step == 2) {
      if (input.isCont() && input.head() == 'T') {
        input.step();
        step = 3;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('T', input));
      }
    }
    if (step == 3) {
      if (input.isCont() && input.head() == 'T') {
        input.step();
        step = 4;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('T', input));
      }
    }
    if (step == 4) {
      if (input.isCont() && input.head() == 'P') {
        input.step();
        step = 5;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('P', input));
      }
    }
    if (step == 5) {
      if (input.isCont() && input.head() == '/') {
        input.step();
        step = 6;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('/', input));
      }
    }
    if (step == 6) {
      if (input.isCont() && Base10.isDigit(c = input.head())) {
        major = Base10.decodeDigit(c);
        input.step();
        step = 7;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("major version", input));
      }
    }
    if (step == 7) {
      if (input.isCont() && input.head() == '.') {
        input.step();
        step = 8;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected('.', input));
      }
    }
    if (step == 8) {
      if (input.isCont() && Base10.isDigit(c = input.head())) {
        minor = Base10.decodeDigit(c);
        input.step();
        return Parse.done(HttpVersion.of(major, minor));
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("minor version", input));
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpVersion(major, minor, step);
  }

}

final class WriteHttpVersion extends Write<Object> {

  final int major;
  final int minor;
  final int step;

  WriteHttpVersion(int major, int minor, int step) {
    this.major = major;
    this.minor = minor;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpVersion.write(output, this.major, this.minor, this.step);
  }

  static Write<Object> write(Output<?> output, int major, int minor, int step) {
    if (step == 1 && output.isCont()) {
      output.write('H');
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output.write('T');
      step = 3;
    }
    if (step == 3 && output.isCont()) {
      output.write('T');
      step = 4;
    }
    if (step == 4 && output.isCont()) {
      output.write('P');
      step = 5;
    }
    if (step == 5 && output.isCont()) {
      output.write('/');
      step = 6;
    }
    if (step == 6 && output.isCont()) {
      output.write(Base10.encodeDigit(major % 10));
      step = 7;
    }
    if (step == 7 && output.isCont()) {
      output.write('.');
      step = 8;
    }
    if (step == 8 && output.isCont()) {
      output.write(Base10.encodeDigit(minor % 10));
      return Write.done();
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpVersion(major, minor, step);
  }

}
