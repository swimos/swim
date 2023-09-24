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

package swim.waml;

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
import swim.repr.Repr;
import swim.waml.decl.WamlAnnotation;

/**
 * Factory for constructing WAML parsers and writers.
 */
@Public
@Since("5.0")
public final class Waml {

  private Waml() {
    // static
  }

  public static WamlMetaCodec metaCodec() {
    return WamlMetaCodec.INSTANCE;
  }

  public static <T> Parse<T> parse(Type type, Input input, @Nullable WamlParserOptions options) {
    return Waml.metaCodec().parse(type, input, options);
  }

  public static <T> Parse<T> parse(Type type, Input input) {
    return Waml.metaCodec().parse(type, input);
  }

  public static <T> Parse<T> parse(Type type, @Nullable WamlParserOptions options) {
    return Waml.metaCodec().parse(type, options);
  }

  public static <T> Parse<T> parse(Type type) {
    return Waml.metaCodec().parse(type);
  }

  public static <T> Parse<T> parse(Type type, String string, @Nullable WamlParserOptions options) {
    return Waml.metaCodec().parse(type, string, options);
  }

  public static <T> Parse<T> parse(Type type, String string) {
    return Waml.metaCodec().parse(type, string);
  }

  public static Parse<Repr> parse(Input input, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    return WamlReprs.valueFormat().parse(input, options);
  }

  public static Parse<Repr> parse(Input input) {
    return WamlReprs.valueFormat().parse(input, WamlParserOptions.standard());
  }

  public static Parse<Repr> parse(@Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    return WamlReprs.valueFormat().parse(options);
  }

  public static Parse<Repr> parse() {
    return WamlReprs.valueFormat().parse(WamlParserOptions.standard());
  }

  public static Parse<Repr> parse(String string, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    return WamlReprs.valueFormat().parse(string, options);
  }

  public static Parse<Repr> parse(String string) {
    return WamlReprs.valueFormat().parse(string, WamlParserOptions.standard());
  }

  public static <T> Parse<T> parseBlock(Type type, Input input, @Nullable WamlParserOptions options) {
    return Waml.metaCodec().parseBlock(type, input, options);
  }

  public static <T> Parse<T> parseBlock(Type type, Input input) {
    return Waml.metaCodec().parseBlock(type, input);
  }

  public static <T> Parse<T> parseBlock(Type type, @Nullable WamlParserOptions options) {
    return Waml.metaCodec().parseBlock(type, options);
  }

  public static <T> Parse<T> parseBlock(Type type) {
    return Waml.metaCodec().parseBlock(type);
  }

  public static <T> Parse<T> parseBlock(Type type, String string, @Nullable WamlParserOptions options) {
    return Waml.metaCodec().parseBlock(type, string, options);
  }

  public static <T> Parse<T> parseBlock(Type type, String string) {
    return Waml.metaCodec().parseBlock(type, string);
  }

  public static Parse<Repr> parseBlock(Input input, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    return WamlReprs.valueFormat().parseBlock(input, options);
  }

  public static Parse<Repr> parseBlock(Input input) {
    return WamlReprs.valueFormat().parseBlock(input, WamlParserOptions.standard());
  }

  public static Parse<Repr> parseBlock(@Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    return WamlReprs.valueFormat().parseBlock(options);
  }

  public static Parse<Repr> parseBlock() {
    return WamlReprs.valueFormat().parseBlock(WamlParserOptions.standard());
  }

  public static Parse<Repr> parseBlock(String string, @Nullable WamlParserOptions options) {
    if (options == null) {
      options = WamlParserOptions.standard();
    }
    return WamlReprs.valueFormat().parseBlock(string, options);
  }

  public static Parse<Repr> parseBlock(String string) {
    return WamlReprs.valueFormat().parseBlock(string, WamlParserOptions.standard());
  }

  public static Write<?> write(Output<?> output, @Nullable Object value, @Nullable WamlWriterOptions options) {
    return Waml.metaCodec().write(output, value, options);
  }

  public static Write<?> write(Output<?> output, @Nullable Object value) {
    return Waml.metaCodec().write(output, value);
  }

  public static Write<?> write(@Nullable Object value, @Nullable WamlWriterOptions options) {
    return Waml.metaCodec().write(value, options);
  }

  public static Write<?> write(@Nullable Object value) {
    return Waml.metaCodec().write(value);
  }

  public static String toString(@Nullable Object value, @Nullable WamlWriterOptions options) {
    return Waml.metaCodec().toString(value, options);
  }

  public static String toString(@Nullable Object value) {
    return Waml.metaCodec().toString(value);
  }

  public static Write<?> writeBlock(Output<?> output, @Nullable Object value, @Nullable WamlWriterOptions options) {
    return Waml.metaCodec().write(output, value, options);
  }

  public static Write<?> writeBlock(Output<?> output, @Nullable Object value) {
    return Waml.metaCodec().write(output, value);
  }

  public static Write<?> writeBlock(@Nullable Object value, @Nullable WamlWriterOptions options) {
    return Waml.metaCodec().write(value, options);
  }

  public static Write<?> writeBlock(@Nullable Object value) {
    return Waml.metaCodec().write(value);
  }

  public static String toBlockString(@Nullable Object value, @Nullable WamlWriterOptions options) {
    return Waml.metaCodec().toString(value, options);
  }

  public static String toBlockString(@Nullable Object value) {
    return Waml.metaCodec().toString(value);
  }

  static HashTrieMap<Class<?>, Annotation> resolveAnnotations(AnnotatedElement element) {
    return Waml.resolveAnnotations(element, HashTrieMap.empty());
  }

  static HashTrieMap<Class<?>, Annotation> resolveAnnotations(AnnotatedElement element, HashTrieMap<Class<?>, Annotation> annotationMap) {
    final Annotation[] annotations = element.getDeclaredAnnotations();
    for (int i = 0; i < annotations.length; i += 1) {
      final Annotation annotation = annotations[i];
      final Class<? extends Annotation> annotationType = annotation.annotationType();
      if (!annotationType.isAnnotationPresent(WamlAnnotation.class)
          && !annotationType.isAnnotationPresent(DeclAnnotation.class)) {
        continue;
      }
      annotationMap = annotationMap.updated(annotationType, annotation);
      // Resolve meta-annotations.
      annotationMap = Waml.resolveAnnotations(annotationType, annotationMap);
    }
    return annotationMap;
  }

}
