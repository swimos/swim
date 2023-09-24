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

package swim.json;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class JsonReflections implements JsonProvider, WriteSource {

  final JsonMetaCodec metaCodec;
  final int priority;

  private JsonReflections(JsonMetaCodec metaCodec, int priority) {
    this.metaCodec = metaCodec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonFormat<?> resolveJsonFormat(Type type) throws JsonProviderException {
    final Class<?> classType;
    if (type instanceof Class<?>) {
      classType = (Class<?>) type;
    } else if (type instanceof ParameterizedType) {
      final Type rawType = ((ParameterizedType) type).getRawType();
      if (rawType instanceof Class<?>) {
        classType = (Class<?>) rawType;
      } else {
        return null;
      }
    } else {
      return null;
    }

    return JsonReflections.reflectionFormat(this.metaCodec, classType);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonReflections", "provider")
            .appendArgument(this.metaCodec);
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static JsonReflections provider(JsonMetaCodec metaCodec, int priority) {
    return new JsonReflections(metaCodec, priority);
  }

  public static JsonReflections provider(JsonMetaCodec metaCodec) {
    return new JsonReflections(metaCodec, GENERIC_PRIORITY);
  }

  public static <T> JsonFormat<T> reflectionFormat(JsonMetaCodec metaCodec, Class<T> classType) throws JsonProviderException {
    return JsonClassDef.reflect(metaCodec, classType).toFormat();
  }

}
