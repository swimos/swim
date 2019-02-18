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
import swim.collections.HashTrieMap;
import swim.util.Murmur3;

public final class MediaRange extends HttpPart implements Debug {
  final String type;
  final String subtype;
  final float weight;
  final HashTrieMap<String, String> params;

  MediaRange(String type, String subtype, float weight, HashTrieMap<String, String> params) {
    this.type = type;
    this.subtype = subtype;
    this.weight = weight;
    this.params = params;
  }

  MediaRange(String type, String subtype, float weight) {
    this(type, subtype, weight, HashTrieMap.<String, String>empty());
  }

  MediaRange(String type, String subtype, HashTrieMap<String, String> params) {
    this(type, subtype, 1f, params);
  }

  MediaRange(String type, String subtype) {
    this(type, subtype, 1f, HashTrieMap.<String, String>empty());
  }

  public boolean isApplication() {
    return "application".equalsIgnoreCase(this.type);
  }

  public boolean isAudio() {
    return "audio".equalsIgnoreCase(this.type);
  }

  public boolean isImage() {
    return "image".equalsIgnoreCase(this.type);
  }

  public boolean isMultipart() {
    return "multipart".equalsIgnoreCase(this.type);
  }

  public boolean isText() {
    return "text".equalsIgnoreCase(this.type);
  }

  public boolean isVideo() {
    return "video".equalsIgnoreCase(this.type);
  }

  public String type() {
    return this.type;
  }

  public String subtype() {
    return this.subtype;
  }

  public float weight() {
    return this.weight;
  }

  public MediaRange weight(float weight) {
    return new MediaRange(this.type, this.subtype, weight, this.params);
  }

  public HashTrieMap<String, String> params() {
    return this.params;
  }

  public String getParam(String key) {
    return this.params.get(key);
  }

  public MediaRange param(String key, String value) {
    return new MediaRange(this.type, this.subtype, this.weight, this.params.updated(key, value));
  }

  @Override
  public Writer<?, ?> httpWriter(HttpWriter http) {
    return http.mediaRangeWriter(this.type, this.subtype, this.weight, this.params);
  }

  @Override
  public Writer<?, ?> writeHttp(Output<?> output, HttpWriter http) {
    return http.writeMediaRange(this.type, this.subtype, this.weight, this.params, output);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof MediaRange) {
      final MediaRange that = (MediaRange) other;
      return this.type.equals(that.type) && this.subtype.equals(that.subtype)
          && this.weight == that.weight && this.params.equals(that.params);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(MediaRange.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        hashSeed, this.type.hashCode()), this.subtype.hashCode()),
        Murmur3.hash(this.weight)), this.params.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("MediaRange").write('.').write("from").write('(')
        .debug(this.type).write(", ").debug(this.subtype);
    if (this.weight != 1f) {
      output = output.write(", ").debug(this.weight);
    }
    output = output.write(')');
    for (HashTrieMap.Entry<String, String> param : this.params) {
      output = output.write('.').write("param").write('(')
          .debug(param.getKey()).write(", ").debug(param.getValue()).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static MediaRange from(String type, String subtype, float weight, HashTrieMap<String, String> params) {
    return new MediaRange(type, subtype, weight, params);
  }

  public static MediaRange from(String type, String subtype, float weight) {
    return new MediaRange(type, subtype, weight);
  }

  public static MediaRange from(String type, String subtype, HashTrieMap<String, String> params) {
    return new MediaRange(type, subtype, params);
  }

  public static MediaRange from(String type, String subtype) {
    return new MediaRange(type, subtype);
  }

  public static MediaRange parse(String string) {
    return Http.standardParser().parseMediaRangeString(string);
  }
}
