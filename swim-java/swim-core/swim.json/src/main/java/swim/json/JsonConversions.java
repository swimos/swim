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

import java.lang.annotation.Annotation;
import java.lang.invoke.CallSite;
import java.lang.invoke.LambdaConversionException;
import java.lang.invoke.LambdaMetafactory;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.lang.invoke.VarHandle;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.function.Function;
import swim.annotations.FromForm;
import swim.annotations.IntoForm;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.Write;
import swim.expr.ExprParser;
import swim.expr.Term;
import swim.expr.TermException;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonConversions implements JsonProvider, ToSource {

  final JsonCodec codec;
  final int priority;

  private JsonConversions(JsonCodec codec, int priority) {
    this.codec = codec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonForm<?> resolveJsonForm(Type javaType) throws JsonFormException {
    final Class<?> javaClass;
    if (javaType instanceof Class<?>) {
      javaClass = (Class<?>) javaType;
    } else if (javaType instanceof ParameterizedType) {
      final Type rawType = ((ParameterizedType) javaType).getRawType();
      if (rawType instanceof Class<?>) {
        javaClass = (Class<?>) rawType;
      } else {
        return null;
      }
    } else {
      return null;
    }

    return JsonConversions.valueForm(this.codec, javaClass);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonConversions", "provider");
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static JsonConversions provider(JsonCodec codec, int priority) {
    return new JsonConversions(codec, priority);
  }

  public static JsonConversions provider(JsonCodec codec) {
    return new JsonConversions(codec, GENERIC_PRIORITY);
  }

  public static <X, T> JsonUndefinedForm<T> undefinedForm(JsonUndefinedForm<X> interForm,
                                                          Function<X, T> fromJson,
                                                          Function<T, X> intoJson) {
    return new JsonConversions.UndefinedForm<X, T>(null, null, interForm, fromJson, intoJson);
  }

  public static <X, T> JsonNullForm<T> nullForm(JsonNullForm<X> interForm,
                                                Function<X, T> fromJson,
                                                Function<T, X> intoJson) {
    return new JsonConversions.NullForm<X, T>(null, null, interForm, fromJson, intoJson);
  }

  public static <X, T> JsonIdentifierForm<T> identifierForm(JsonIdentifierForm<X> interForm,
                                                            Function<X, T> fromJson,
                                                            Function<T, X> intoJson) {
    return new JsonConversions.IdentifierForm<X, T>(null, null, interForm, fromJson, intoJson);
  }

  public static <X, T> JsonNumberForm<T> numberForm(JsonNumberForm<X> interForm,
                                                    Function<X, T> fromJson,
                                                    Function<T, X> intoJson) {
    return new JsonConversions.NumberForm<X, T>(null, null, interForm, fromJson, intoJson);
  }

  public static <X, B, T> JsonStringForm<B, T> stringForm(JsonStringForm<B, X> interForm,
                                                          Function<X, T> fromJson,
                                                          Function<T, X> intoJson) {
    return new JsonConversions.StringForm<X, B, T>(null, null, interForm, fromJson, intoJson);
  }

  public static <X, E, B, T> JsonArrayForm<E, B, T> arrayForm(JsonArrayForm<E, B, X> interForm,
                                                              Function<X, T> fromJson,
                                                              Function<T, X> intoJson) {
    return new JsonConversions.ArrayForm<X, E, B, T>(null, null, interForm, fromJson, intoJson);
  }

  public static <X, K, V, B, T> JsonObjectForm<K, V, B, T> objectForm(JsonObjectForm<K, V, B, X> interForm,
                                                                      Function<X, T> fromJson,
                                                                      Function<T, X> intoJson) {
    return new JsonConversions.ObjectForm<X, K, V, B, T>(null, null, interForm, fromJson, intoJson);
  }

  public static <X, T> JsonForm<T> valueForm(JsonForm<X> interForm,
                                             Function<X, T> fromJson,
                                             Function<T, X> intoJson) {
    return new JsonConversions.ValueForm<X, T>(null, null, interForm, fromJson, intoJson);
  }

  public static @Nullable JsonForm<?> valueForm(JsonCodec codec, Class<?> javaClass) throws JsonFormException {
    // @FromJson public static T <fromJson>(X value).
    Method fromJsonMethod = null;
    // Parameter type X of fromJsonMethod.
    Class<?> fromInterClass = null;
    // The marker annotation attached to fromJsonMethod.
    Annotation fromJsonAnnotation = null;

    // @IntoJson public static X <intoJson>(T object).
    Method intoJsonMethod = null;
    // Return type X of intoJsonMethod.
    Class<?> intoInterClass = null;
    // The marker annotation attached to intoJsonMethod.
    Annotation intoJsonAnnotation = null;

    // Search all methods declared on javaClass for conversion annotations;
    // methods defined on super classes are deliberately ignored to prevent
    // inadvertent conversion of child classes using base class methods.
    final Method[] declaredMethods = javaClass.getDeclaredMethods();
    for (int i = 0, n = declaredMethods.length; i < n; i += 1) {
      final Method method = declaredMethods[i];

      // Check for @FromJson a annotation.
      Annotation fromAnnotation = method.getAnnotation(FromJson.class);
      if (fromAnnotation == null) {
        // No @FromJson annotation; check for a @FromForm annotation.
        final FromForm formFormAnnotation = method.getAnnotation(FromForm.class);
        if (formFormAnnotation != null) {
          // Check for media type restrictions on the @FromForm annotation.
          final String[] mediaTypes = formFormAnnotation.mediaTypes();
          if (mediaTypes == null || mediaTypes.length == 0) {
            // No media type restrictions on the @FromForm annotation.
            fromAnnotation = formFormAnnotation;
          } else {
            // Check if `json` or `application/json` is an enabled media type.
            final String mediaType = codec.mediaType().toString();
            for (int j = 0; j < mediaTypes.length; j += 1) {
              if ("json".equals(mediaTypes[j]) || mediaType.equals(mediaTypes[j])) {
                // JSON is supported by the @FromForm annotation.
                fromAnnotation = formFormAnnotation;
                break;
              }
            }
          }
        }
      }
      // Check if the method is annotated as a fromJson conversion.
      if (fromAnnotation != null) {
        if (fromJsonMethod != null) {
          throw new JsonFormException("duplicate " + fromAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        if ((method.getModifiers() & Modifier.PUBLIC) == 0) {
          throw new JsonFormException("non-public " + fromAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        if ((method.getModifiers() & Modifier.STATIC) == 0) {
          throw new JsonFormException("non-static " + fromAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        if (method.getParameterCount() != 1) {
          throw new JsonFormException("exactly 1 argument required"
                                    + " for " + fromAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        final Class<?> returnType = method.getReturnType();
        if (!javaClass.isAssignableFrom(returnType)) {
          throw new JsonFormException("return type " + returnType
                                    + " of " + fromAnnotation
                                    + " method " + method.getName()
                                    + " not assignable to enclosing class " + javaClass.getName());
        }
        // Method is a valid fromJson conversion.
        fromJsonMethod = method;
        fromInterClass = method.getParameterTypes()[0];
        fromJsonAnnotation = fromAnnotation;
      }

      // Check for a @IntoJson annotation.
      Annotation intoAnnotation = method.getAnnotation(IntoJson.class);
      if (intoAnnotation == null) {
        // No @IntoJson annotation; check for a @IntoForm annotation.
        final IntoForm intoFormAnnotation = method.getAnnotation(IntoForm.class);
        if (intoFormAnnotation != null) {
          // Check for media type restrictions on the @IntoForm annotation.
          final String[] mediaTypes = intoFormAnnotation.mediaTypes();
          if (mediaTypes == null || mediaTypes.length == 0) {
            // No media type restrictions on the @IntoForm annotation.
            intoAnnotation = intoFormAnnotation;
          } else {
            // Check if `json` or `application/json` is an enabled media type.
            final String mediaType = codec.mediaType().toString();
            for (int j = 0; j < mediaTypes.length; j += 1) {
              if ("json".equals(mediaTypes[j]) || mediaType.equals(mediaTypes[j])) {
                // JSON is supported by the @IntoForm annotation.
                intoAnnotation = intoFormAnnotation;
                break;
              }
            }
          }
        }
      }
      // Check if the method is annotated as an intoJson conversion.
      if (intoAnnotation != null) {
        if (intoJsonMethod != null) {
          throw new JsonFormException("duplicate " + intoAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        if ((method.getModifiers() & Modifier.PUBLIC) == 0) {
          throw new JsonFormException("non-public " + intoAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        if ((method.getModifiers() & Modifier.STATIC) != 0) {
          if (method.getParameterCount() != 1) {
            throw new JsonFormException("exactly 1 argument required"
                                      + " for " + intoAnnotation
                                      + " static method " + method.getName()
                                      + " of class " + javaClass.getName());
          }
          final Class<?> parameterType = method.getParameterTypes()[0];
          if (!parameterType.isAssignableFrom(javaClass)) {
            throw new JsonFormException("argument type " + parameterType
                                      + " of " + intoAnnotation
                                      + " method " + method.getName()
                                      + " not assignable from enclosing class " + javaClass.getName());
          }
        } else {
          if (method.getParameterCount() != 0) {
            throw new JsonFormException("no arguments allowed"
                                      + " for " + intoAnnotation
                                      + " instance method " + method.getName()
                                      + " of class " + javaClass.getName());
          }
        }
        // Method is a valid intoJson conversion.
        intoJsonMethod = method;
        intoInterClass = method.getReturnType();
        intoJsonAnnotation = intoAnnotation;
      }
    }

    // Check if matching conversion methods were found.
    if (fromJsonMethod != null && intoJsonMethod == null) {
      // Report likely inadvertent absence of corresponding @IntoJson method
      throw new JsonFormException("missing @IntoJson method"
                                + " corresponding to " + fromJsonAnnotation
                                + " method " + fromJsonMethod.getName()
                                + " of class " + javaClass.getName());
    } else if (fromJsonMethod == null && intoJsonMethod != null) {
      // Report likely inadvertent absence of corresponding @FromJson method
      throw new JsonFormException("missing @FromJson method"
                                + " corresponding to " + intoJsonAnnotation
                                + " method " + intoJsonMethod.getName()
                                + " of class " + javaClass.getName());
    } else if (fromJsonMethod == null && intoJsonMethod == null) {
      // Don't suggest any errors when neither conversion method was found.
      return null;
    }

    // A pair of conversion methods was found.
    fromJsonMethod = Assume.nonNull(fromJsonMethod);
    fromInterClass = Assume.nonNull(fromInterClass);
    fromJsonAnnotation = Assume.nonNull(fromJsonAnnotation);
    intoJsonMethod = Assume.nonNull(intoJsonMethod);
    intoInterClass = Assume.nonNull(intoInterClass);
    intoJsonAnnotation = Assume.nonNull(intoJsonAnnotation);

    // Verify that the interchange types of both conversion methods match.
    if (!intoInterClass.isAssignableFrom(fromInterClass)) {
      throw new JsonFormException("return type " + fromInterClass.getName()
                                + " of " + fromJsonAnnotation
                                + " method " + fromJsonMethod.getName()
                                + " not assignable to argument type " + intoInterClass.getName()
                                + " of " + intoJsonAnnotation
                                + " method " + intoJsonMethod.getName()
                                + " for class " + javaClass.getName());
    }

    // Resolve the JsonForm of the interchange type.
    final Type interType = intoJsonMethod.getGenericReturnType();
    final JsonForm<?> interForm;
    try {
      interForm = codec.getJsonForm(interType);
    } catch (JsonFormException cause) {
      throw new JsonFormException("no json form for interchange type " + interType
                                + " inferred for class " + javaClass.getName());
    }

    // Get the boxed class of any primitive interchange type,
    // as required to implement the Function interface.
    final Class<?> interClass;
    if (interType == Boolean.TYPE) {
      interClass = Boolean.class;
    } else if (interType == Byte.TYPE) {
      interClass = Byte.class;
    } else if (interType == Character.TYPE) {
      interClass = Character.class;
    } else if (interType == Short.TYPE) {
      interClass = Short.class;
    } else if (interType == Integer.TYPE) {
      interClass = Integer.class;
    } else if (interType == Long.TYPE) {
      interClass = Long.class;
    } else if (interType == Float.TYPE) {
      interClass = Float.class;
    } else if (interType == Double.TYPE) {
      interClass = Double.class;
    } else {
      interClass = intoInterClass;
    }

    // Generate a lambda functions that delegates to each conversion method;
    // generated lambdas outperform Method and MethodHandle invocation.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();

    // Construct a lambda Function that delegates to the fromJson method.
    // First unreflect the fromJson Method to get a direct MethodHandle.
    final MethodHandle fromJsonMethodHandle;
    try {
      fromJsonMethodHandle = lookup.unreflect(fromJsonMethod);
    } catch (IllegalAccessException cause) {
      throw new JsonFormException(cause);
    }
    // Define the dynamic method type to which the fromJson lambda should conform.
    final MethodType fromJsonMethodType = MethodType.methodType(javaClass, interClass);
    final CallSite fromJsonCallSite;
    try {
      // Generate the fromJson lambda bootstrap call site.
      fromJsonCallSite = LambdaMetafactory.metafactory(lookup,
          LAMBDA_METHOD_NAME, LAMBDA_FACTORY_TYPE, LAMBDA_METHOD_TYPE,
          fromJsonMethodHandle, fromJsonMethodType);
    } catch (LambdaConversionException cause) {
      throw new JsonFormException(cause);
    }
    final Function<?, ?> fromJson;
    try {
      // Capture the fromJson lambda.
      fromJson = (Function<?, ?>) fromJsonCallSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      throw new JsonFormException(cause);
    }

    // Construct a lambda Function that delegates to the intoJson method.
    // First unreflect the intoJson Method to get a direct MethodHandle.
    final MethodHandle intoJsonMethodHandle;
    try {
      intoJsonMethodHandle = lookup.unreflect(intoJsonMethod);
    } catch (IllegalAccessException cause) {
      throw new JsonFormException(cause);
    }
    // Define the dynamic method type to which the intoJson lambda should conform.
    final MethodType intoJsonMethodType = MethodType.methodType(interClass, javaClass);
    final CallSite intoJsonCallSite;
    try {
      // Generate the intoJson lambda bootstrap call site.
      intoJsonCallSite = LambdaMetafactory.metafactory(lookup,
          LAMBDA_METHOD_NAME, LAMBDA_FACTORY_TYPE, LAMBDA_METHOD_TYPE,
          intoJsonMethodHandle, intoJsonMethodType);
    } catch (LambdaConversionException cause) {
      throw new JsonFormException(cause);
    }
    final Function<?, ?> intoJson;
    try {
      // Capture the intoJson lambda.
      intoJson = (Function<?, ?>) intoJsonCallSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      throw new JsonFormException(cause);
    }

    // Construct a new conversion form that delegates to the underlying
    // interchange form, and converts interchange values to instances of
    // the javaClass using the synthesized conversion lambdas.
    return new JsonConversions.ValueForm<Object, Object>(codec,
        Assume.conforms(javaClass), Assume.conforms(interForm),
        Assume.conforms(fromJson), Assume.conforms(intoJson));
  }

  /**
   * Returns a specialized conversion form that preserves the dominant
   * {@code JsonForm} subtype of the given {@code interForm}.
   *
   * @param <X> the interchange type through which instances of type {@code T}
   *        should be converted when transcoding to JSON
   * @param <T> the type be transcoded by the returned {@code JsonForm}
   * @param interForm the {@code JsonForm} for the interchange type {@code X}
   * @param fromJson a function that converts values of the interchange type
   *        {@code X} to instances of type {@code T}
   * @param intoJson a function that converts instances of type {@code T}
   *        to values of the interchange type {@code X}
   * @return a specialize {@code JsonForm} that delegates to the given
   *         {@code interForm}, dynamically converting between values of
   *         the interchange type {@code X} and instances of type {@code T}
   */
  public static <X, T> JsonForm<T> conversionForm(JsonForm<X> interForm,
                                                  Function<X, T> fromJson,
                                                  Function<T, X> intoJson) {
    return JsonConversions.conversionForm(null, null, interForm, fromJson, intoJson);
  }

  static <X, T> JsonForm<T> conversionForm(@Nullable JsonCodec codec,
                                           @Nullable Class<T> javaClass,
                                           JsonForm<X> interForm,
                                           Function<X, T> fromJson,
                                           Function<T, X> intoJson) {
    if (interForm instanceof JsonObjectForm<?, ?, ?, ?>) {
      return new JsonConversions.ObjectForm<X, Object, Object, Object, T>(
          codec, javaClass, Assume.conforms(interForm), fromJson, intoJson);
    } else if (interForm instanceof JsonArrayForm<?, ?, ?>) {
      return new JsonConversions.ArrayForm<X, Object, Object, T>(
          codec, javaClass, Assume.conforms(interForm), fromJson, intoJson);
    } else if (interForm instanceof JsonStringForm<?, ?>) {
      return new JsonConversions.StringForm<X, Object, T>(
          codec, javaClass, Assume.conforms(interForm), fromJson, intoJson);
    } else if (interForm instanceof JsonNumberForm<?>) {
      return new JsonConversions.NumberForm<X, T>(
          codec, javaClass, Assume.conforms(interForm), fromJson, intoJson);
    } else if (interForm instanceof JsonIdentifierForm<?>) {
      return new JsonConversions.IdentifierForm<X, T>(
          codec, javaClass, Assume.conforms(interForm), fromJson, intoJson);
    } else if (interForm instanceof JsonNullForm<?>) {
      return new JsonConversions.NullForm<X, T>(
          codec, javaClass, Assume.conforms(interForm), fromJson, intoJson);
    } else if (interForm instanceof JsonUndefinedForm<?>) {
      return new JsonConversions.UndefinedForm<X, T>(
          codec, javaClass, Assume.conforms(interForm), fromJson, intoJson);
    } else {
      return new JsonConversions.ValueForm<X, T>(
          codec, javaClass, interForm, fromJson, intoJson);
    }
  }

  static final String LAMBDA_METHOD_NAME = "apply";
  static final MethodType LAMBDA_FACTORY_TYPE = MethodType.methodType(Function.class);
  static final MethodType LAMBDA_METHOD_TYPE = MethodType.methodType(Object.class, Object.class);

  abstract static class ConversionForm<X, T> implements JsonForm<T> {

    final @Nullable JsonCodec codec;
    final @Nullable Class<T> javaClass;
    final JsonForm<X> interForm;
    final Function<X, T> fromJson;
    final Function<T, X> intoJson;

    ConversionForm(@Nullable JsonCodec codec, @Nullable Class<T> javaClass, JsonForm<X> interForm,
                   Function<X, T> fromJson, Function<T, X> intoJson) {
      this.codec = codec;
      this.javaClass = javaClass;
      this.interForm = interForm;
      this.fromJson = fromJson;
      this.intoJson = intoJson;
    }

    @Override
    public JsonForm<T> taggedForm(String tag) throws JsonException {
      return JsonConversions.conversionForm(this.codec, this.javaClass,
                                            this.interForm.taggedForm(tag),
                                            this.fromJson, this.intoJson);
    }

    @Override
    public JsonUndefinedForm<? extends T> undefinedForm() throws JsonException {
      return new JsonConversions.UndefinedForm<X, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.undefinedForm()),
          this.fromJson, this.intoJson);
    }

    @Override
    public JsonNullForm<? extends T> nullForm() throws JsonException {
      return new JsonConversions.NullForm<X, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.nullForm()),
          this.fromJson, this.intoJson);
    }

    @Override
    public JsonIdentifierForm<? extends T> identifierForm() throws JsonException {
      return new JsonConversions.IdentifierForm<X, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.identifierForm()),
          this.fromJson, this.intoJson);
    }

    @Override
    public JsonNumberForm<? extends T> numberForm() throws JsonException {
      return new JsonConversions.NumberForm<X, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.numberForm()),
          this.fromJson, this.intoJson);
    }

    @Override
    public JsonStringForm<?, ? extends T> stringForm() throws JsonException {
      return new JsonConversions.StringForm<X, Object, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.stringForm()),
          this.fromJson, this.intoJson);
    }

    @Override
    public JsonArrayForm<?, ?, ? extends T> arrayForm() throws JsonException {
      return new JsonConversions.ArrayForm<X, Object, Object, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.arrayForm()),
          this.fromJson, this.intoJson);
    }

    @Override
    public JsonObjectForm<?, ?, ?, ? extends T> objectForm() throws JsonException {
      return new JsonConversions.ObjectForm<X, Object, Object, Object, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.objectForm()),
          this.fromJson, this.intoJson);
    }

    @Nullable T fromJson(@Nullable X value) throws JsonException {
      try {
        return this.fromJson.apply(value);
      } catch (Throwable cause) {
        if (Result.isNonFatal(cause) && !(cause instanceof JsonException)) {
          throw new JsonException(cause);
        } else {
          throw cause;
        }
      }
    }

    @Nullable X intoJson(@Nullable T object) throws JsonException {
      try {
        return this.intoJson.apply(object);
      } catch (Throwable cause) {
        if (Result.isNonFatal(cause) && !(cause instanceof JsonException)) {
          throw new JsonException(cause);
        } else {
          throw cause;
        }
      }
    }

    @Override
    public Parse<T> parse(Input input, JsonParser parser) {
      final Parse<X> parseValue = this.interForm.parse(input, parser);
      if (parseValue.isDone()) {
        try {
          return Parse.done(this.fromJson(parseValue.getUnchecked()));
        } catch (JsonException cause) {
          return Parse.error(cause);
        }
      } else {
        return parseValue.asError();
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable T object, JsonWriter writer) {
      try {
        return this.interForm.write(output, this.intoJson(object), writer);
      } catch (JsonException cause) {
        return Write.error(cause);
      }
    }

    @Override
    public Term intoTerm(@Nullable T object) throws TermException {
      return this.interForm.intoTerm(this.intoJson(object));
    }

    @Override
    public @Nullable T fromTerm(Term term) throws TermException {
      return this.fromJson(this.interForm.fromTerm(term));
    }

  }

  static final class UndefinedForm<X, T> extends JsonConversions.ConversionForm<X, T> implements JsonUndefinedForm<T>, ToSource {

    UndefinedForm(@Nullable JsonCodec codec, @Nullable Class<T> javaClass, JsonUndefinedForm<X> interForm,
                  Function<X, T> fromJson, Function<T, X> intoJson) {
      super(codec, javaClass, interForm, fromJson, intoJson);
    }

    @Override
    public JsonUndefinedForm<? extends T> undefinedForm() throws JsonException {
      return this;
    }

    @Override
    public @Nullable T undefinedValue() throws JsonException {
      return this.fromJson(((JsonUndefinedForm<X>) this.interForm).undefinedValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("JsonConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("undefinedForm")
                .endInvoke();
      } else {
        notation.beginInvoke("JsonConversions", "undefinedForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromJson)
                .appendArgument(this.intoJson)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class NullForm<X, T> extends JsonConversions.ConversionForm<X, T> implements JsonNullForm<T>, ToSource {

    NullForm(@Nullable JsonCodec codec, @Nullable Class<T> javaClass, JsonNullForm<X> interForm,
             Function<X, T> fromJson, Function<T, X> intoJson) {
      super(codec, javaClass, interForm, fromJson, intoJson);
    }

    @Override
    public JsonNullForm<? extends T> nullForm() throws JsonException {
      return this;
    }

    @Override
    public @Nullable T nullValue() throws JsonException {
      return this.fromJson(((JsonNullForm<X>) this.interForm).nullValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("JsonConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("nullForm")
                .endInvoke();
      } else {
        notation.beginInvoke("JsonConversions", "nullForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromJson)
                .appendArgument(this.intoJson)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class IdentifierForm<X, T> extends JsonConversions.ConversionForm<X, T> implements JsonIdentifierForm<T>, ToSource {

    IdentifierForm(@Nullable JsonCodec codec, @Nullable Class<T> javaClass, JsonIdentifierForm<X> interForm,
                   Function<X, T> fromJson, Function<T, X> intoJson) {
      super(codec, javaClass, interForm, fromJson, intoJson);
    }

    @Override
    public JsonIdentifierForm<? extends T> identifierForm() throws JsonException {
      return this;
    }

    @Override
    public @Nullable T identifierValue(String value, ExprParser parser) throws JsonException {
      return this.fromJson(((JsonIdentifierForm<X>) this.interForm).identifierValue(value, parser));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("JsonConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("identifierForm")
                .endInvoke();
      } else {
        notation.beginInvoke("JsonConversions", "identifierForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromJson)
                .appendArgument(this.intoJson)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class NumberForm<X, T> extends JsonConversions.ConversionForm<X, T> implements JsonNumberForm<T>, ToSource {

    NumberForm(@Nullable JsonCodec codec, @Nullable Class<T> javaClass, JsonNumberForm<X> interForm,
               Function<X, T> fromJson, Function<T, X> intoJson) {
      super(codec, javaClass, interForm, fromJson, intoJson);
    }

    @Override
    public JsonNumberForm<? extends T> numberForm() throws JsonException {
      return this;
    }

    @Override
    public @Nullable T integerValue(long value) throws JsonException {
      return this.fromJson(((JsonNumberForm<X>) this.interForm).integerValue(value));
    }

    @Override
    public @Nullable T hexadecimalValue(long value, int digits) throws JsonException {
      return this.fromJson(((JsonNumberForm<X>) this.interForm).hexadecimalValue(value, digits));
    }

    @Override
    public @Nullable T bigIntegerValue(String value) throws JsonException {
      return this.fromJson(((JsonNumberForm<X>) this.interForm).bigIntegerValue(value));
    }

    @Override
    public @Nullable T decimalValue(String value) throws JsonException {
      return this.fromJson(((JsonNumberForm<X>) this.interForm).decimalValue(value));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("JsonConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("numberForm")
                .endInvoke();
      } else {
        notation.beginInvoke("JsonConversions", "numberForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromJson)
                .appendArgument(this.intoJson)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class StringForm<X, B, T> extends JsonConversions.ConversionForm<X, T> implements JsonStringForm<B, T>, ToSource {

    StringForm(@Nullable JsonCodec codec, @Nullable Class<T> javaClass, JsonStringForm<B, X> interForm,
               Function<X, T> fromJson, Function<T, X> intoJson) {
      super(codec, javaClass, interForm, fromJson, intoJson);
    }

    @Override
    public JsonStringForm<?, ? extends T> stringForm() throws JsonException {
      return this;
    }

    @Override
    public B stringBuilder() throws JsonException {
      return Assume.<JsonStringForm<B, X>>conforms(this.interForm).stringBuilder();
    }

    @Override
    public B appendCodePoint(B builder, int c) throws JsonException {
      return Assume.<JsonStringForm<B, X>>conforms(this.interForm).appendCodePoint(builder, c);
    }

    @Override
    public @Nullable T buildString(B builder) throws JsonException {
      return this.fromJson(Assume.<JsonStringForm<B, X>>conforms(this.interForm).buildString(builder));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("JsonConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("stringForm")
                .endInvoke();
      } else {
        notation.beginInvoke("JsonConversions", "stringForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromJson)
                .appendArgument(this.intoJson)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class ArrayForm<X, E, B, T> extends JsonConversions.ConversionForm<X, T> implements JsonArrayForm<E, B, T>, ToSource {

    ArrayForm(@Nullable JsonCodec codec, @Nullable Class<T> javaClass, JsonArrayForm<E, B, X> interForm,
              Function<X, T> fromJson, Function<T, X> intoJson) {
      super(codec, javaClass, interForm, fromJson, intoJson);
    }

    @Override
    public JsonArrayForm<?, ?, ? extends T> arrayForm() throws JsonException {
      return this;
    }

    @Override
    public JsonForm<E> elementForm() {
      return Assume.<JsonArrayForm<E, B, X>>conforms(this.interForm).elementForm();
    }

    @Override
    public B arrayBuilder() throws JsonException {
      return Assume.<JsonArrayForm<E, B, X>>conforms(this.interForm).arrayBuilder();
    }

    @Override
    public B appendElement(B builder, @Nullable E element) throws JsonException {
      return Assume.<JsonArrayForm<E, B, X>>conforms(this.interForm).appendElement(builder, element);
    }

    @Override
    public @Nullable T buildArray(B builder) throws JsonException {
      return this.fromJson(Assume.<JsonArrayForm<E, B, X>>conforms(this.interForm).buildArray(builder));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("JsonConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("arrayForm")
                .endInvoke();
      } else {
        notation.beginInvoke("JsonConversions", "arrayForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromJson)
                .appendArgument(this.intoJson)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class ObjectForm<X, K, V, B, T> extends JsonConversions.ConversionForm<X, T> implements JsonObjectForm<K, V, B, T>, ToSource {

    ObjectForm(@Nullable JsonCodec codec, @Nullable Class<T> javaClass, JsonObjectForm<K, V, B, X> interForm,
               Function<X, T> fromJson, Function<T, X> intoJson) {
      super(codec, javaClass, interForm, fromJson, intoJson);
    }

    @Override
    public JsonObjectForm<?, ?, ?, ? extends T> objectForm() throws JsonException {
      return this;
    }

    @Override
    public JsonForm<K> keyForm() {
      return Assume.<JsonObjectForm<K, V, B, X>>conforms(this.interForm).keyForm();
    }

    @Override
    public JsonFieldForm<K, V, B> getFieldForm(K key) throws JsonException {
      return Assume.<JsonObjectForm<K, V, B, X>>conforms(this.interForm).getFieldForm(key);
    }

    @Override
    public B objectBuilder() throws JsonException {
      return Assume.<JsonObjectForm<K, V, B, X>>conforms(this.interForm).objectBuilder();
    }

    @Override
    public @Nullable T buildObject(B builder) throws JsonException {
      return this.fromJson(Assume.<JsonObjectForm<K, V, B, X>>conforms(this.interForm).buildObject(builder));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("JsonConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("objectForm")
                .endInvoke();
      } else {
        notation.beginInvoke("JsonConversions", "objectForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromJson)
                .appendArgument(this.intoJson)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class ValueForm<X, T> extends JsonConversions.ConversionForm<X, T> implements ToSource {

    @Nullable JsonUndefinedForm<? extends T> undefinedForm;
    @Nullable JsonNullForm<? extends T> nullForm;
    @Nullable JsonIdentifierForm<? extends T> identifierForm;
    @Nullable JsonNumberForm<? extends T> numberForm;
    @Nullable JsonStringForm<?, ? extends T> stringForm;
    @Nullable JsonArrayForm<?, ?, ? extends T> arrayForm;
    @Nullable JsonObjectForm<?, ?, ?, ? extends T> objectForm;

    ValueForm(@Nullable JsonCodec codec, @Nullable Class<T> javaClass, JsonForm<X> interForm,
              Function<X, T> fromJson, Function<T, X> intoJson) {
      super(codec, javaClass, interForm, fromJson, intoJson);
      this.undefinedForm = null;
      this.nullForm = null;
      this.identifierForm = null;
      this.numberForm = null;
      this.stringForm = null;
      this.arrayForm = null;
      this.objectForm = null;
    }

    @Override
    public JsonUndefinedForm<? extends T> undefinedForm() throws JsonException {
      JsonUndefinedForm<? extends T> undefinedForm = (JsonUndefinedForm<? extends T>) UNDEFINED_FORM.getOpaque(this);
      if (undefinedForm == null) {
        UNDEFINED_FORM.compareAndExchangeRelease(this, null, super.undefinedForm());
        undefinedForm = (JsonUndefinedForm<? extends T>) UNDEFINED_FORM.getAcquire(this);
      }
      return undefinedForm;
    }

    @Override
    public JsonNullForm<? extends T> nullForm() throws JsonException {
      JsonNullForm<? extends T> nullForm = (JsonNullForm<? extends T>) NULL_FORM.getOpaque(this);
      if (nullForm == null) {
        NULL_FORM.compareAndExchangeRelease(this, null, super.nullForm());
        nullForm = (JsonNullForm<? extends T>) NULL_FORM.getAcquire(this);
      }
      return nullForm;
    }

    @Override
    public JsonIdentifierForm<? extends T> identifierForm() throws JsonException {
      JsonIdentifierForm<? extends T> identifierForm = (JsonIdentifierForm<? extends T>) IDENTIFIER_FORM.getOpaque(this);
      if (identifierForm == null) {
        IDENTIFIER_FORM.compareAndExchangeRelease(this, null, super.identifierForm());
        identifierForm = (JsonIdentifierForm<? extends T>) IDENTIFIER_FORM.getAcquire(this);
      }
      return identifierForm;
    }

    @Override
    public JsonNumberForm<? extends T> numberForm() throws JsonException {
      JsonNumberForm<? extends T> numberForm = (JsonNumberForm<? extends T>) NUMBER_FORM.getOpaque(this);
      if (numberForm == null) {
        NUMBER_FORM.compareAndExchangeRelease(this, null, super.numberForm());
        numberForm = (JsonNumberForm<? extends T>) NUMBER_FORM.getAcquire(this);
      }
      return numberForm;
    }

    @Override
    public JsonStringForm<?, ? extends T> stringForm() throws JsonException {
      JsonStringForm<?, ? extends T> stringForm = (JsonStringForm<?, ? extends T>) STRING_FORM.getOpaque(this);
      if (stringForm == null) {
        STRING_FORM.compareAndExchangeRelease(this, null, super.stringForm());
        stringForm = (JsonStringForm<?, ? extends T>) STRING_FORM.getAcquire(this);
      }
      return stringForm;
    }

    @Override
    public JsonArrayForm<?, ?, ? extends T> arrayForm() throws JsonException {
      JsonArrayForm<?, ?, ? extends T> arrayForm = (JsonArrayForm<?, ?, ? extends T>) ARRAY_FORM.getOpaque(this);
      if (arrayForm == null) {
        ARRAY_FORM.compareAndExchangeRelease(this, null, super.arrayForm());
        arrayForm = (JsonArrayForm<?, ?, ? extends T>) ARRAY_FORM.getAcquire(this);
      }
      return arrayForm;
    }

    @Override
    public JsonObjectForm<?, ?, ?, ? extends T> objectForm() throws JsonException {
      JsonObjectForm<?, ?, ?, ? extends T> objectForm = (JsonObjectForm<?, ?, ?, ? extends T>) OBJECT_FORM.getOpaque(this);
      if (objectForm == null) {
        OBJECT_FORM.compareAndExchangeRelease(this, null, super.objectForm());
        objectForm = (JsonObjectForm<?, ?, ?, ? extends T>) OBJECT_FORM.getAcquire(this);
      }
      return objectForm;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("JsonConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke();
      } else {
        notation.beginInvoke("JsonConversions", "valueForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromJson)
                .appendArgument(this.intoJson)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final VarHandle UNDEFINED_FORM;
    static final VarHandle NULL_FORM;
    static final VarHandle IDENTIFIER_FORM;
    static final VarHandle NUMBER_FORM;
    static final VarHandle STRING_FORM;
    static final VarHandle ARRAY_FORM;
    static final VarHandle OBJECT_FORM;

    static {
      // Initialize var handles.
      final MethodHandles.Lookup lookup = MethodHandles.lookup();
      try {
        UNDEFINED_FORM = lookup.findVarHandle(JsonConversions.ValueForm.class, "undefinedForm", JsonUndefinedForm.class);
        NULL_FORM = lookup.findVarHandle(JsonConversions.ValueForm.class, "nullForm", JsonNullForm.class);
        IDENTIFIER_FORM = lookup.findVarHandle(JsonConversions.ValueForm.class, "identifierForm", JsonIdentifierForm.class);
        NUMBER_FORM = lookup.findVarHandle(JsonConversions.ValueForm.class, "numberForm", JsonNumberForm.class);
        STRING_FORM = lookup.findVarHandle(JsonConversions.ValueForm.class, "stringForm", JsonStringForm.class);
        ARRAY_FORM = lookup.findVarHandle(JsonConversions.ValueForm.class, "arrayForm", JsonArrayForm.class);
        OBJECT_FORM = lookup.findVarHandle(JsonConversions.ValueForm.class, "objectForm", JsonObjectForm.class);
      } catch (ReflectiveOperationException cause) {
        throw new ExceptionInInitializerError(cause);
      }
    }

  }

}
