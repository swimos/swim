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

public final class HttpVersion extends HttpPart implements Debug {
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

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.versionWriter(this.major, this.minor);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeVersion(this.major, this.minor, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HttpVersion) {
      final HttpVersion that = (HttpVersion) other;
      return this.major == that.major && this.minor == that.minor;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(HttpVersion.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed, this.major), this.minor));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("HttpVersion").write('.');
    if (this.major == 1 && (this.minor == 1 || this.minor == 0)) {
      output = output.write("HTTP").write('_').debug(this.major).write('_').debug(this.minor);
    } else {
      output = output.write("from").write('(').debug(this.major).write(", ").debug(this.minor).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static final HttpVersion HTTP_1_1 = new HttpVersion(1, 1);
  public static final HttpVersion HTTP_1_0 = new HttpVersion(1, 0);

  public static HttpVersion from(int major, int minor) {
    if (major == 1 && minor == 1) {
      return HTTP_1_1;
    } else if (major == 1 && minor == 0) {
      return HTTP_1_0;
    } else if (major >= 0 && minor >= 0) {
      return new HttpVersion(major, minor);
    } else {
      throw new IllegalArgumentException(major + ", " + minor);
    }
  }

  public static HttpVersion parseHttp(String string) {
    return Http.standardParser().parseVersionString(string);
  }
}
