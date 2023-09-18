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

public final class LanguageRange extends HttpPart implements Debug {

  final String tag;
  final String subtag;
  final float weight;

  LanguageRange(String tag, String subtag, float weight) {
    this.tag = tag;
    this.subtag = subtag;
    this.weight = weight;
  }

  LanguageRange(String tag, String subtag) {
    this(tag, subtag, 1f);
  }

  LanguageRange(String tag, float weight) {
    this(tag, null, weight);
  }

  LanguageRange(String tag) {
    this(tag, null, 1f);
  }

  public String tag() {
    return this.tag;
  }

  public String subtag() {
    return this.subtag;
  }

  public float weight() {
    return this.weight;
  }

  public LanguageRange weight(float weight) {
    return new LanguageRange(this.tag, this.subtag, weight);
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.languageRangeWriter(this.tag, this.subtag, this.weight);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeLanguageRange(output, this.tag, this.subtag, this.weight);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof LanguageRange) {
      final LanguageRange that = (LanguageRange) other;
      return this.tag.equals(that.tag)
          && (this.subtag == null ? that.subtag == null : this.subtag.equals(that.subtag))
          && this.weight == that.weight;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (LanguageRange.hashSeed == 0) {
      LanguageRange.hashSeed = Murmur3.seed(LanguageRange.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(LanguageRange.hashSeed,
        this.tag.hashCode()), Murmur3.hash(this.subtag)), Murmur3.hash(this.weight)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("LanguageRange").write('.').write("create").write('(').debug(this.tag);
    if (this.subtag != null) {
      output = output.write(", ").debug(this.subtag);
    }
    if (this.weight != 1f) {
      output = output.write(", ").debug(this.weight);
    }
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static LanguageRange star;

  public static LanguageRange star() {
    if (LanguageRange.star == null) {
      LanguageRange.star = new LanguageRange("*");
    }
    return LanguageRange.star;
  }

  public static LanguageRange create(String tag, String subtag, float weight) {
    if (weight == 1f) {
      return LanguageRange.create(tag, subtag);
    } else {
      return new LanguageRange(tag, subtag, weight);
    }
  }

  public static LanguageRange create(String tag, String subtag) {
    if (subtag == null) {
      return LanguageRange.create(tag);
    } else {
      return new LanguageRange(tag, subtag);
    }
  }

  public static LanguageRange create(String tag, float weight) {
    if (weight == 1f) {
      return LanguageRange.create(tag);
    } else {
      return new LanguageRange(tag, weight);
    }
  }

  public static LanguageRange create(String tag) {
    if ("*".equals(tag)) {
      return LanguageRange.star();
    } else {
      return new LanguageRange(tag);
    }
  }

  public static LanguageRange parse(String string) {
    return Http.standardParser().parseLanguageRangeString(string);
  }

}
