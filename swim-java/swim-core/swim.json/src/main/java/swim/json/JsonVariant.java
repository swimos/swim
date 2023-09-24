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

package swim.json;

import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class JsonVariant<T> implements WriteSource {

  final @Nullable String typeName;
  final Class<?> classType;
  final JsonParser<T> parser;
  final JsonWriter<T> writer;

  JsonVariant(@Nullable String typeName, Class<?> classType,
              JsonParser<T> parser, JsonWriter<T> writer) {
    this.typeName = typeName;
    this.classType = classType;
    this.parser = parser;
    this.writer = writer;
  }

  public @Nullable String typeName() {
    return this.typeName;
  }

  public Class<?> classType() {
    return this.classType;
  }

  public JsonParser<T> parser() {
    return this.parser;
  }

  public JsonWriter<T> writer() {
    return this.writer;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsonVariant<?> that) {
      return Objects.equals(this.typeName, that.typeName)
          && this.classType.equals(that.classType)
          && this.parser.equals(that.parser)
          && this.writer.equals(that.writer);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(JsonVariant.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(HASH_SEED,
        Objects.hashCode(this.typeName)), this.classType.hashCode()),
        this.parser.hashCode()), this.writer.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonVariant", "of")
            .appendArgument(this.typeName)
            .appendArgument(this.classType)
            .appendArgument(this.parser)
            .appendArgument(this.writer)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static <T> JsonVariant<T> of(@Nullable String typeName, Class<?> classType,
                                      JsonParser<? extends T> parser,
                                      JsonWriter<? super T> writer) {
    return new JsonVariant<T>(typeName, classType, Assume.covariant(parser),
                              Assume.contravariant(writer));
  }

}
