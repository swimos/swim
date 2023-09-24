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

import java.lang.annotation.Annotation;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Type;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.collections.HashTrieMap;
import swim.decl.DeclAnnotation;
import swim.json.decl.JsonAnnotation;
import swim.repr.Repr;

/**
 * Factory for constructing JSON parsers and writers.
 */
@Public
@Since("5.0")
public final class Json {

  private Json() {
    // static
  }

  public static JsonMetaCodec metaCodec() {
    return JsonMetaCodec.INSTANCE;
  }

  public static <T> Parse<T> parse(Type type, Input input, @Nullable JsonParserOptions options) {
    return Json.metaCodec().parse(type, input, options);
  }

  public static <T> Parse<T> parse(Type type, Input input) {
    return Json.metaCodec().parse(type, input);
  }

  public static <T> Parse<T> parse(Type type, @Nullable JsonParserOptions options) {
    return Json.metaCodec().parse(type, options);
  }

  public static <T> Parse<T> parse(Type type) {
    return Json.metaCodec().parse(type);
  }

  public static <T> Parse<T> parse(Type type, String string, @Nullable JsonParserOptions options) {
    return Json.metaCodec().parse(type, string, options);
  }

  public static <T> Parse<T> parse(Type type, String string) {
    return Json.metaCodec().parse(type, string);
  }

  public static Parse<Repr> parse(Input input, @Nullable JsonParserOptions options) {
    if (options == null) {
      options = JsonParserOptions.standard();
    }
    return JsonReprs.valueFormat().parse(input, options);
  }

  public static Parse<Repr> parse(Input input) {
    return JsonReprs.valueFormat().parse(input, JsonParserOptions.standard());
  }

  public static Parse<Repr> parse(@Nullable JsonParserOptions options) {
    if (options == null) {
      options = JsonParserOptions.standard();
    }
    return JsonReprs.valueFormat().parse(options);
  }

  public static Parse<Repr> parse() {
    return JsonReprs.valueFormat().parse(JsonParserOptions.standard());
  }

  public static Parse<Repr> parse(String string, @Nullable JsonParserOptions options) {
    if (options == null) {
      options = JsonParserOptions.standard();
    }
    return JsonReprs.valueFormat().parse(string, options);
  }

  public static Parse<Repr> parse(String string) {
    return JsonReprs.valueFormat().parse(string, JsonParserOptions.standard());
  }

  public static Write<?> write(Output<?> output, @Nullable Object value, @Nullable JsonWriterOptions options) {
    return Json.metaCodec().write(output, value, options);
  }

  public static Write<?> write(Output<?> output, @Nullable Object value) {
    return Json.metaCodec().write(output, value);
  }

  public static Write<?> write(@Nullable Object value, @Nullable JsonWriterOptions options) {
    return Json.metaCodec().write(value, options);
  }

  public static Write<?> write(@Nullable Object value) {
    return Json.metaCodec().write(value);
  }

  public static String toString(@Nullable Object value, @Nullable JsonWriterOptions options) {
    return Json.metaCodec().toString(value, options);
  }

  public static String toString(@Nullable Object value) {
    return Json.metaCodec().toString(value);
  }

  static HashTrieMap<Class<?>, Annotation> resolveAnnotations(AnnotatedElement element) {
    return Json.resolveAnnotations(element, HashTrieMap.empty());
  }

  static HashTrieMap<Class<?>, Annotation> resolveAnnotations(AnnotatedElement element, HashTrieMap<Class<?>, Annotation> annotationMap) {
    final Annotation[] annotations = element.getDeclaredAnnotations();
    for (int i = 0; i < annotations.length; i += 1) {
      final Annotation annotation = annotations[i];
      final Class<? extends Annotation> annotationType = annotation.annotationType();
      if (!annotationType.isAnnotationPresent(JsonAnnotation.class)
          && !annotationType.isAnnotationPresent(DeclAnnotation.class)) {
        continue;
      }
      annotationMap = annotationMap.updated(annotationType, annotation);
      // Resolve meta-annotations.
      annotationMap = Json.resolveAnnotations(annotationType, annotationMap);
    }
    return annotationMap;
  }

}
