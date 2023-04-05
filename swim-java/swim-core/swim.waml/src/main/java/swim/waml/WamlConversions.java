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

package swim.waml;

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
import swim.repr.Attrs;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WamlConversions implements WamlProvider, ToSource {

  final WamlCodec codec;
  final int priority;

  private WamlConversions(WamlCodec codec, int priority) {
    this.codec = codec;
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable WamlForm<?> resolveWamlForm(Type javaType) throws WamlFormException {
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

    return WamlConversions.valueForm(this.codec, javaClass);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlConversions", "provider");
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static WamlConversions provider(WamlCodec codec, int priority) {
    return new WamlConversions(codec, priority);
  }

  public static WamlConversions provider(WamlCodec codec) {
    return new WamlConversions(codec, GENERIC_PRIORITY);
  }

  public static <X, T> WamlUndefinedForm<T> undefinedForm(WamlUndefinedForm<X> interForm,
                                                          Function<X, T> fromWaml,
                                                          Function<T, X> intoWaml) {
    return new WamlConversions.UndefinedForm<X, T>(null, null, interForm, fromWaml, intoWaml);
  }

  public static <X, T> WamlUnitForm<T> unitForm(WamlUnitForm<X> interForm,
                                                Function<X, T> fromWaml,
                                                Function<T, X> intoWaml) {
    return new WamlConversions.UnitForm<X, T>(null, null, interForm, fromWaml, intoWaml);
  }

  public static <X, T> WamlIdentifierForm<T> identifierForm(WamlIdentifierForm<X> interForm,
                                                            Function<X, T> fromWaml,
                                                            Function<T, X> intoWaml) {
    return new WamlConversions.IdentifierForm<X, T>(null, null, interForm, fromWaml, intoWaml);
  }

  public static <X, T> WamlNumberForm<T> numberForm(WamlNumberForm<X> interForm,
                                                    Function<X, T> fromWaml,
                                                    Function<T, X> intoWaml) {
    return new WamlConversions.NumberForm<X, T>(null, null, interForm, fromWaml, intoWaml);
  }

  public static <X, B, T> WamlStringForm<B, T> stringForm(WamlStringForm<B, X> interForm,
                                                          Function<X, T> fromWaml,
                                                          Function<T, X> intoWaml) {
    return new WamlConversions.StringForm<X, B, T>(null, null, interForm, fromWaml, intoWaml);
  }

  public static <X, E, B, T> WamlArrayForm<E, B, T> arrayForm(WamlArrayForm<E, B, X> interForm,
                                                              Function<X, T> fromWaml,
                                                              Function<T, X> intoWaml) {
    return new WamlConversions.ArrayForm<X, E, B, T>(null, null, interForm, fromWaml, intoWaml);
  }

  public static <X, N, B, T> WamlMarkupForm<N, B, T> markupForm(WamlMarkupForm<N, B, X> interForm,
                                                                Function<X, T> fromWaml,
                                                                Function<T, X> intoWaml) {
    return new WamlConversions.MarkupForm<X, N, B, T>(null, null, interForm, fromWaml, intoWaml);
  }

  public static <X, K, V, B, T> WamlObjectForm<K, V, B, T> objectForm(WamlObjectForm<K, V, B, X> interForm,
                                                                      Function<X, T> fromWaml,
                                                                      Function<T, X> intoWaml) {
    return new WamlConversions.ObjectForm<X, K, V, B, T>(null, null, interForm, fromWaml, intoWaml);
  }

  public static <X, L, P, B, T> WamlTupleForm<L, P, B, T> tupleForm(WamlTupleForm<L, P, B, X> interForm,
                                                                    Function<X, T> fromWaml,
                                                                    Function<T, X> intoWaml) {
    return new WamlConversions.TupleForm<X, L, P, B, T>(null, null, interForm, fromWaml, intoWaml);
  }

  public static <X, T> WamlForm<T> valueForm(WamlForm<X> interForm,
                                             Function<X, T> fromWaml,
                                             Function<T, X> intoWaml) {
    return new WamlConversions.ValueForm<X, T>(null, null, interForm, fromWaml, intoWaml);
  }

  public static @Nullable WamlForm<?> valueForm(WamlCodec codec, Class<?> javaClass) throws WamlFormException {
    // @FromWaml public static T <fromWaml>(X value).
    Method fromWamlMethod = null;
    // Parameter type X of fromWamlMethod.
    Class<?> fromInterClass = null;
    // The marker annotation attached to fromWamlMethod.
    Annotation fromWamlAnnotation = null;

    // @IntoWaml public static X <intoWaml>(T object).
    Method intoWamlMethod = null;
    // Return type X of intoWamlMethod.
    Class<?> intoInterClass = null;
    // The marker annotation attached to intoWamlMethod.
    Annotation intoWamlAnnotation = null;

    // Search all methods declared on javaClass for conversion annotations;
    // methods defined on super classes are deliberately ignored to prevent
    // inadvertent conversion of child classes using base class methods.
    final Method[] declaredMethods = javaClass.getDeclaredMethods();
    for (int i = 0, n = declaredMethods.length; i < n; i += 1) {
      final Method method = declaredMethods[i];

      // Check for @FromWaml a annotation.
      Annotation fromAnnotation = method.getAnnotation(FromWaml.class);
      if (fromAnnotation == null) {
        // No @FromWaml annotation; check for a @FromForm annotation.
        final FromForm formFormAnnotation = method.getAnnotation(FromForm.class);
        if (formFormAnnotation != null) {
          // Check for media type restrictions on the @FromForm annotation.
          final String[] mediaTypes = formFormAnnotation.mediaTypes();
          if (mediaTypes == null || mediaTypes.length == 0) {
            // No media type restrictions on the @FromForm annotation.
            fromAnnotation = formFormAnnotation;
          } else {
            // Check if `waml` or `application/x-waml` is an enabled media type.
            final String mediaType = codec.mediaType().toString();
            for (int j = 0; j < mediaTypes.length; j += 1) {
              if ("waml".equals(mediaTypes[j]) || mediaType.equals(mediaTypes[j])) {
                // WAML is supported by the @FromForm annotation.
                fromAnnotation = formFormAnnotation;
                break;
              }
            }
          }
        }
      }
      // Check if the method is annotated as a fromWaml conversion.
      if (fromAnnotation != null) {
        if (fromWamlMethod != null) {
          throw new WamlFormException("duplicate " + fromAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        if ((method.getModifiers() & Modifier.PUBLIC) == 0) {
          throw new WamlFormException("non-public " + fromAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        if ((method.getModifiers() & Modifier.STATIC) == 0) {
          throw new WamlFormException("non-static " + fromAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        if (method.getParameterCount() != 1) {
          throw new WamlFormException("exactly 1 argument required"
                                    + " for " + fromAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        final Class<?> returnType = method.getReturnType();
        if (!javaClass.isAssignableFrom(returnType)) {
          throw new WamlFormException("return type " + returnType
                                    + " of " + fromAnnotation
                                    + " method " + method.getName()
                                    + " not assignable to enclosing class " + javaClass.getName());
        }
        // Method is a valid fromWaml conversion.
        fromWamlMethod = method;
        fromInterClass = method.getParameterTypes()[0];
        fromWamlAnnotation = fromAnnotation;
      }

      // Check for a @IntoWaml annotation.
      Annotation intoAnnotation = method.getAnnotation(IntoWaml.class);
      if (intoAnnotation == null) {
        // No @IntoWaml annotation; check for a @IntoForm annotation.
        final IntoForm intoFormAnnotation = method.getAnnotation(IntoForm.class);
        if (intoFormAnnotation != null) {
          // Check for media type restrictions on the @IntoForm annotation.
          final String[] mediaTypes = intoFormAnnotation.mediaTypes();
          if (mediaTypes == null || mediaTypes.length == 0) {
            // No media type restrictions on the @IntoForm annotation.
            intoAnnotation = intoFormAnnotation;
          } else {
            // Check if `waml` or `application/x-waml` is an enabled media type.
            final String mediaType = codec.mediaType().toString();
            for (int j = 0; j < mediaTypes.length; j += 1) {
              if ("waml".equals(mediaTypes[j]) || mediaType.equals(mediaTypes[j])) {
                // WAML is supported by the @IntoForm annotation.
                intoAnnotation = intoFormAnnotation;
                break;
              }
            }
          }
        }
      }
      // Check if the method is annotated as an intoWaml conversion.
      if (intoAnnotation != null) {
        if (intoWamlMethod != null) {
          throw new WamlFormException("duplicate " + intoAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        if ((method.getModifiers() & Modifier.PUBLIC) == 0) {
          throw new WamlFormException("non-public " + intoAnnotation
                                    + " method " + method.getName()
                                    + " of class " + javaClass.getName());
        }
        if ((method.getModifiers() & Modifier.STATIC) != 0) {
          if (method.getParameterCount() != 1) {
            throw new WamlFormException("exactly 1 argument required"
                                      + " for " + intoAnnotation
                                      + " static method " + method.getName()
                                      + " of class " + javaClass.getName());
          }
          final Class<?> parameterType = method.getParameterTypes()[0];
          if (!parameterType.isAssignableFrom(javaClass)) {
            throw new WamlFormException("argument type " + parameterType
                                      + " of " + intoAnnotation
                                      + " method " + method.getName()
                                      + " not assignable from enclosing class " + javaClass.getName());
          }
        } else {
          if (method.getParameterCount() != 0) {
            throw new WamlFormException("no arguments allowed"
                                      + " for " + intoAnnotation
                                      + " instance method " + method.getName()
                                      + " of class " + javaClass.getName());
          }
        }
        // Method is a valid intoWaml conversion.
        intoWamlMethod = method;
        intoInterClass = method.getReturnType();
        intoWamlAnnotation = intoAnnotation;
      }
    }

    // Check if matching conversion methods were found.
    if (fromWamlMethod != null && intoWamlMethod == null) {
      // Report likely inadvertent absence of corresponding @IntoWaml method
      throw new WamlFormException("missing @IntoWaml method"
                                + " corresponding to " + fromWamlAnnotation
                                + " method " + fromWamlMethod.getName()
                                + " of class " + javaClass.getName());
    } else if (fromWamlMethod == null && intoWamlMethod != null) {
      // Report likely inadvertent absence of corresponding @FromWaml method
      throw new WamlFormException("missing @FromWaml method"
                                + " corresponding to " + intoWamlAnnotation
                                + " method " + intoWamlMethod.getName()
                                + " of class " + javaClass.getName());
    } else if (fromWamlMethod == null && intoWamlMethod == null) {
      // Don't suggest any errors when neither conversion method was found.
      return null;
    }

    // A pair of conversion methods was found.
    fromWamlMethod = Assume.nonNull(fromWamlMethod);
    fromInterClass = Assume.nonNull(fromInterClass);
    fromWamlAnnotation = Assume.nonNull(fromWamlAnnotation);
    intoWamlMethod = Assume.nonNull(intoWamlMethod);
    intoInterClass = Assume.nonNull(intoInterClass);
    intoWamlAnnotation = Assume.nonNull(intoWamlAnnotation);

    // Verify that the interchange types of both conversion methods match.
    if (!intoInterClass.isAssignableFrom(fromInterClass)) {
      throw new WamlFormException("return type " + fromInterClass.getName()
                                + " of " + fromWamlAnnotation
                                + " method " + fromWamlMethod.getName()
                                + " not assignable to argument type " + intoInterClass.getName()
                                + " of " + intoWamlAnnotation
                                + " method " + intoWamlMethod.getName()
                                + " for class " + javaClass.getName());
    }

    // Resolve the WamlForm of the interchange type.
    final Type interType = intoWamlMethod.getGenericReturnType();
    final WamlForm<?> interForm;
    try {
      interForm = codec.getWamlForm(interType);
    } catch (WamlFormException cause) {
      throw new WamlFormException("no waml form for interchange type " + interType
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

    // Construct a lambda Function that delegates to the fromWaml method.
    // First unreflect the fromWaml Method to get a direct MethodHandle.
    final MethodHandle fromWamlMethodHandle;
    try {
      fromWamlMethodHandle = lookup.unreflect(fromWamlMethod);
    } catch (IllegalAccessException cause) {
      throw new WamlFormException(cause);
    }
    // Define the dynamic method type to which the fromWaml lambda should conform.
    final MethodType fromWamlMethodType = MethodType.methodType(javaClass, interClass);
    final CallSite fromWamlCallSite;
    try {
      // Generate the fromWaml lambda bootstrap call site.
      fromWamlCallSite = LambdaMetafactory.metafactory(lookup,
          LAMBDA_METHOD_NAME, LAMBDA_FACTORY_TYPE, LAMBDA_METHOD_TYPE,
          fromWamlMethodHandle, fromWamlMethodType);
    } catch (LambdaConversionException cause) {
      throw new WamlFormException(cause);
    }
    final Function<?, ?> fromWaml;
    try {
      // Capture the fromWaml lambda.
      fromWaml = (Function<?, ?>) fromWamlCallSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      throw new WamlFormException(cause);
    }

    // Construct a lambda Function that delegates to the intoWaml method.
    // First unreflect the intoWaml Method to get a direct MethodHandle.
    final MethodHandle intoWamlMethodHandle;
    try {
      intoWamlMethodHandle = lookup.unreflect(intoWamlMethod);
    } catch (IllegalAccessException cause) {
      throw new WamlFormException(cause);
    }
    // Define the dynamic method type to which the intoWaml lambda should conform.
    final MethodType intoWamlMethodType = MethodType.methodType(interClass, javaClass);
    final CallSite intoWamlCallSite;
    try {
      // Generate the intoWaml lambda bootstrap call site.
      intoWamlCallSite = LambdaMetafactory.metafactory(lookup,
          LAMBDA_METHOD_NAME, LAMBDA_FACTORY_TYPE, LAMBDA_METHOD_TYPE,
          intoWamlMethodHandle, intoWamlMethodType);
    } catch (LambdaConversionException cause) {
      throw new WamlFormException(cause);
    }
    final Function<?, ?> intoWaml;
    try {
      // Capture the intoWaml lambda.
      intoWaml = (Function<?, ?>) intoWamlCallSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      throw new WamlFormException(cause);
    }

    // Construct a new conversion form that delegates to the underlying
    // interchange form, and converts interchange values to instances of
    // the javaClass using the synthesized conversion lambdas.
    return new WamlConversions.ValueForm<Object, Object>(codec,
        Assume.conforms(javaClass), Assume.conforms(interForm),
        Assume.conforms(fromWaml), Assume.conforms(intoWaml));
  }

  /**
   * Returns a specialized conversion form that preserves the dominant
   * {@code WamlForm} subtype of the given {@code interForm}.
   *
   * @param <X> the interchange type through which instances of type {@code T}
   *        should be converted when transcoding to WAML
   * @param <T> the type be transcoded by the returned {@code WamlForm}
   * @param interForm the {@code WamlForm} for the interchange type {@code X}
   * @param fromWaml a function that converts values of the interchange type
   *        {@code X} to instances of type {@code T}
   * @param intoWaml a function that converts instances of type {@code T}
   *        to values of the interchange type {@code X}
   * @return a specialize {@code WamlForm} that delegates to the given
   *         {@code interForm}, dynamically converting between values of
   *         the interchange type {@code X} and instances of type {@code T}
   */
  public static <X, T> WamlForm<T> conversionForm(WamlForm<X> interForm,
                                                  Function<X, T> fromWaml,
                                                  Function<T, X> intoWaml) {
    return WamlConversions.conversionForm(null, null, interForm, fromWaml, intoWaml);
  }

  static <X, T> WamlForm<T> conversionForm(@Nullable WamlCodec codec,
                                           @Nullable Class<T> javaClass,
                                           WamlForm<X> interForm,
                                           Function<X, T> fromWaml,
                                           Function<T, X> intoWaml) {
    if (interForm instanceof WamlTupleForm<?, ?, ?, ?>) {
      return new WamlConversions.TupleForm<X, Object, Object, Object, T>(
          codec, javaClass, Assume.conforms(interForm), fromWaml, intoWaml);
    } else if (interForm instanceof WamlObjectForm<?, ?, ?, ?>) {
      return new WamlConversions.ObjectForm<X, Object, Object, Object, T>(
          codec, javaClass, Assume.conforms(interForm), fromWaml, intoWaml);
    } else if (interForm instanceof WamlMarkupForm<?, ?, ?>) {
      return new WamlConversions.MarkupForm<X, Object, Object, T>(
          codec, javaClass, Assume.conforms(interForm), fromWaml, intoWaml);
    } else if (interForm instanceof WamlStringForm<?, ?>) {
      return new WamlConversions.ArrayForm<X, Object, Object, T>(
          codec, javaClass, Assume.conforms(interForm), fromWaml, intoWaml);
    } else if (interForm instanceof WamlStringForm<?, ?>) {
      return new WamlConversions.StringForm<X, Object, T>(
          codec, javaClass, Assume.conforms(interForm), fromWaml, intoWaml);
    } else if (interForm instanceof WamlNumberForm<?>) {
      return new WamlConversions.NumberForm<X, T>(
          codec, javaClass, Assume.conforms(interForm), fromWaml, intoWaml);
    } else if (interForm instanceof WamlIdentifierForm<?>) {
      return new WamlConversions.IdentifierForm<X, T>(
          codec, javaClass, Assume.conforms(interForm), fromWaml, intoWaml);
    } else if (interForm instanceof WamlUnitForm<?>) {
      return new WamlConversions.UnitForm<X, T>(
          codec, javaClass, Assume.conforms(interForm), fromWaml, intoWaml);
    } else if (interForm instanceof WamlUndefinedForm<?>) {
      return new WamlConversions.UndefinedForm<X, T>(
          codec, javaClass, Assume.conforms(interForm), fromWaml, intoWaml);
    } else {
      return new WamlConversions.ValueForm<X, T>(
          codec, javaClass, interForm, fromWaml, intoWaml);
    }
  }

  public static <X, A, T> WamlAttrForm<A, T> attrForm(WamlAttrForm<A, X> attrForm,
                                                      Function<X, T> fromWaml,
                                                      Function<T, X> intoWaml) {
    return new WamlConversions.AttrForm<X, A, T>(null, null, attrForm, fromWaml, intoWaml);
  }

  static <X, A, T> WamlAttrForm<A, T> attrForm(@Nullable WamlCodec codec,
                                               @Nullable Class<T> javaClass,
                                               WamlAttrForm<A, X> attrForm,
                                               Function<X, T> fromWaml,
                                               Function<T, X> intoWaml) {
    return new WamlConversions.AttrForm<X, A, T>(codec, javaClass, attrForm, fromWaml, intoWaml);
  }

  static final String LAMBDA_METHOD_NAME = "apply";
  static final MethodType LAMBDA_FACTORY_TYPE = MethodType.methodType(Function.class);
  static final MethodType LAMBDA_METHOD_TYPE = MethodType.methodType(Object.class, Object.class);

  static final class AttrForm<X, A, T> implements WamlAttrForm<A, T>, ToSource {

    final @Nullable WamlCodec codec;
    final @Nullable Class<T> javaClass;
    final WamlAttrForm<A, X> attrForm;
    final Function<X, T> fromWaml;
    final Function<T, X> intoWaml;

    AttrForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlAttrForm<A, X> attrForm,
             Function<X, T> fromWaml, Function<T, X> intoWaml) {
      this.codec = codec;
      this.javaClass = javaClass;
      this.attrForm = attrForm;
      this.fromWaml = fromWaml;
      this.intoWaml = intoWaml;
    }

    @Override
    public WamlForm<A> argsForm() {
      return this.attrForm.argsForm();
    }

    @Override
    public boolean isNullary(@Nullable A args) {
      return this.attrForm.isNullary(args);
    }

    @Override
    public WamlForm<T> refineForm(WamlForm<T> form, String name, @Nullable A args) throws WamlException {
      final WamlForm<X> interForm = Assume.<WamlConversions.ConversionForm<X, T>>conforms(form).interForm;
      return WamlConversions.conversionForm(this.codec, this.javaClass,
                                            this.attrForm.refineForm(interForm, name, args),
                                            this.fromWaml, this.intoWaml);
    }

    @Override
    public WamlForm<T> refineForm(WamlForm<T> form, String name) throws WamlException {
      final WamlForm<X> interForm = Assume.<WamlConversions.ConversionForm<X, T>>conforms(form).interForm;
      return WamlConversions.conversionForm(this.codec, this.javaClass,
                                            this.attrForm.refineForm(interForm, name),
                                            this.fromWaml, this.intoWaml);
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      notation.beginInvoke("WamlConversions", "attrForm")
              .appendArgument(this.attrForm)
              .appendArgument(this.fromWaml)
              .appendArgument(this.intoWaml)
              .endInvoke();
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  abstract static class ConversionForm<X, T> implements WamlReprForm<T> {

    final @Nullable WamlCodec codec;
    final @Nullable Class<T> javaClass;
    final WamlForm<X> interForm;
    final Function<X, T> fromWaml;
    final Function<T, X> intoWaml;

    ConversionForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlForm<X> interForm,
                   Function<X, T> fromWaml, Function<T, X> intoWaml) {
      this.codec = codec;
      this.javaClass = javaClass;
      this.interForm = interForm;
      this.fromWaml = fromWaml;
      this.intoWaml = intoWaml;
    }

    @Override
    public Attrs attrs() {
      if (this.interForm instanceof WamlReprForm<?>) {
        return ((WamlReprForm<X>) this.interForm).attrs();
      } else {
        return Attrs.empty();
      }
    }

    @Override
    public WamlForm<T> withAttrs(Attrs attrs) {
      if (this.interForm instanceof WamlReprForm<?>) {
        return WamlConversions.conversionForm(this.codec, this.javaClass,
                                              ((WamlReprForm<X>) this.interForm).withAttrs(attrs),
                                              this.fromWaml, this.intoWaml);
      } else {
        return this;
      }
    }

    @Override
    public WamlAttrForm<?, ? extends T> getAttrForm(String name) throws WamlException {
      // Unsound if the returned attrForm is a subtype X' of X,
      // and intoWaml does not return values of type X'.
      return WamlConversions.attrForm(this.codec, this.javaClass,
                                      Assume.conforms(this.interForm.getAttrForm(name)),
                                      this.fromWaml, this.intoWaml);
    }

    @Override
    public WamlForm<T> taggedForm(String tag) throws WamlException {
      return WamlConversions.conversionForm(this.codec, this.javaClass,
                                            this.interForm.taggedForm(tag),
                                            this.fromWaml, this.intoWaml);
    }

    @Override
    public WamlUndefinedForm<? extends T> undefinedForm() throws WamlException {
      return new WamlConversions.UndefinedForm<X, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.undefinedForm()),
          this.fromWaml, this.intoWaml);
    }

    @Override
    public WamlUnitForm<? extends T> unitForm() throws WamlException {
      return new WamlConversions.UnitForm<X, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.unitForm()),
          this.fromWaml, this.intoWaml);
    }

    @Override
    public WamlIdentifierForm<? extends T> identifierForm() throws WamlException {
      return new WamlConversions.IdentifierForm<X, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.identifierForm()),
          this.fromWaml, this.intoWaml);
    }

    @Override
    public WamlNumberForm<? extends T> numberForm() throws WamlException {
      return new WamlConversions.NumberForm<X, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.numberForm()),
          this.fromWaml, this.intoWaml);
    }

    @Override
    public WamlStringForm<?, ? extends T> stringForm() throws WamlException {
      return new WamlConversions.StringForm<X, Object, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.stringForm()),
          this.fromWaml, this.intoWaml);
    }

    @Override
    public WamlArrayForm<?, ?, ? extends T> arrayForm() throws WamlException {
      return new WamlConversions.ArrayForm<X, Object, Object, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.arrayForm()),
          this.fromWaml, this.intoWaml);
    }

    @Override
    public WamlMarkupForm<?, ?, ? extends T> markupForm() throws WamlException {
      return new WamlConversions.MarkupForm<X, Object, Object, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.markupForm()),
          this.fromWaml, this.intoWaml);
    }

    @Override
    public WamlObjectForm<?, ?, ?, ? extends T> objectForm() throws WamlException {
      return new WamlConversions.ObjectForm<X, Object, Object, Object, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.objectForm()),
          this.fromWaml, this.intoWaml);
    }

    @Override
    public WamlTupleForm<?, ?, ?, ? extends T> tupleForm() throws WamlException {
      return new WamlConversions.TupleForm<X, Object, Object, Object, T>(
          this.codec, this.javaClass, Assume.conforms(this.interForm.objectForm()),
          this.fromWaml, this.intoWaml);
    }

    @Nullable T fromWaml(@Nullable X value) throws WamlException {
      try {
        return this.fromWaml.apply(value);
      } catch (Throwable cause) {
        if (Result.isNonFatal(cause) && !(cause instanceof WamlException)) {
          throw new WamlException(cause);
        } else {
          throw cause;
        }
      }
    }

    @Nullable X intoWaml(@Nullable T object) throws WamlException {
      try {
        return this.intoWaml.apply(object);
      } catch (Throwable cause) {
        if (Result.isNonFatal(cause) && !(cause instanceof WamlException)) {
          throw new WamlException(cause);
        } else {
          throw cause;
        }
      }
    }

    @Override
    public Parse<T> parse(Input input, WamlParser parser) {
      final Parse<X> parseValue = this.interForm.parse(input, parser);
      if (parseValue.isDone()) {
        try {
          return Parse.done(this.fromWaml(parseValue.getUnchecked()));
        } catch (WamlException cause) {
          return Parse.error(cause);
        }
      } else {
        return parseValue.asError();
      }
    }

    @Override
    public Write<?> write(Output<?> output, @Nullable T object, WamlWriter writer) {
      try {
        return this.interForm.write(output, this.intoWaml(object), writer);
      } catch (WamlException cause) {
        return Write.error(cause);
      }
    }

    @Override
    public Term intoTerm(@Nullable T object) throws TermException {
      return this.interForm.intoTerm(this.intoWaml(object));
    }

    @Override
    public @Nullable T fromTerm(Term term) throws TermException {
      return this.fromWaml(this.interForm.fromTerm(term));
    }

  }

  static final class UndefinedForm<X, T> extends WamlConversions.ConversionForm<X, T> implements WamlUndefinedForm<T>, ToSource {

    UndefinedForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlUndefinedForm<X> interForm,
                  Function<X, T> fromWaml, Function<T, X> intoWaml) {
      super(codec, javaClass, interForm, fromWaml, intoWaml);
    }

    @Override
    public WamlUndefinedForm<? extends T> undefinedForm() throws WamlException {
      return this;
    }

    @Override
    public @Nullable T undefinedValue() throws WamlException {
      return this.fromWaml(((WamlUndefinedForm<X>) this.interForm).undefinedValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("WamlConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("undefinedForm")
                .endInvoke();
      } else {
        notation.beginInvoke("WamlConversions", "undefinedForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromWaml)
                .appendArgument(this.intoWaml)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class UnitForm<X, T> extends WamlConversions.ConversionForm<X, T> implements WamlUnitForm<T>, ToSource {

    UnitForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlUnitForm<X> interForm,
             Function<X, T> fromWaml, Function<T, X> intoWaml) {
      super(codec, javaClass, interForm, fromWaml, intoWaml);
    }

    @Override
    public WamlUnitForm<? extends T> unitForm() throws WamlException {
      return this;
    }

    @Override
    public @Nullable T unitValue() throws WamlException {
      return this.fromWaml(((WamlUnitForm<X>) this.interForm).unitValue());
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("WamlConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("unitForm")
                .endInvoke();
      } else {
        notation.beginInvoke("WamlConversions", "unitForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromWaml)
                .appendArgument(this.intoWaml)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class IdentifierForm<X, T> extends WamlConversions.ConversionForm<X, T> implements WamlIdentifierForm<T>, ToSource {

    IdentifierForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlIdentifierForm<X> interForm,
                   Function<X, T> fromWaml, Function<T, X> intoWaml) {
      super(codec, javaClass, interForm, fromWaml, intoWaml);
    }

    @Override
    public WamlIdentifierForm<? extends T> identifierForm() throws WamlException {
      return this;
    }

    @Override
    public @Nullable T identifierValue(String value, ExprParser parser) throws WamlException {
      return this.fromWaml(((WamlIdentifierForm<X>) this.interForm).identifierValue(value, parser));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("WamlConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("identifierForm")
                .endInvoke();
      } else {
        notation.beginInvoke("WamlConversions", "identifierForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromWaml)
                .appendArgument(this.intoWaml)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class NumberForm<X, T> extends WamlConversions.ConversionForm<X, T> implements WamlNumberForm<T>, ToSource {

    NumberForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlNumberForm<X> interForm,
               Function<X, T> fromWaml, Function<T, X> intoWaml) {
      super(codec, javaClass, interForm, fromWaml, intoWaml);
    }

    @Override
    public WamlNumberForm<? extends T> numberForm() throws WamlException {
      return this;
    }

    @Override
    public @Nullable T integerValue(long value) throws WamlException {
      return this.fromWaml(((WamlNumberForm<X>) this.interForm).integerValue(value));
    }

    @Override
    public @Nullable T hexadecimalValue(long value, int digits) throws WamlException {
      return this.fromWaml(((WamlNumberForm<X>) this.interForm).hexadecimalValue(value, digits));
    }

    @Override
    public @Nullable T bigIntegerValue(String value) throws WamlException {
      return this.fromWaml(((WamlNumberForm<X>) this.interForm).bigIntegerValue(value));
    }

    @Override
    public @Nullable T decimalValue(String value) throws WamlException {
      return this.fromWaml(((WamlNumberForm<X>) this.interForm).decimalValue(value));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("WamlConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("numberForm")
                .endInvoke();
      } else {
        notation.beginInvoke("WamlConversions", "numberForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromWaml)
                .appendArgument(this.intoWaml)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class StringForm<X, B, T> extends WamlConversions.ConversionForm<X, T> implements WamlStringForm<B, T>, ToSource {

    StringForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlStringForm<B, X> interForm,
               Function<X, T> fromWaml, Function<T, X> intoWaml) {
      super(codec, javaClass, interForm, fromWaml, intoWaml);
    }

    @Override
    public WamlStringForm<?, ? extends T> stringForm() throws WamlException {
      return this;
    }

    @Override
    public B stringBuilder() throws WamlException {
      return Assume.<WamlStringForm<B, X>>conforms(this.interForm).stringBuilder();
    }

    @Override
    public B appendCodePoint(B builder, int c) throws WamlException {
      return Assume.<WamlStringForm<B, X>>conforms(this.interForm).appendCodePoint(builder, c);
    }

    @Override
    public @Nullable T buildString(B builder) throws WamlException {
      return this.fromWaml(Assume.<WamlStringForm<B, X>>conforms(this.interForm).buildString(builder));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("WamlConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("stringForm")
                .endInvoke();
      } else {
        notation.beginInvoke("WamlConversions", "stringForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromWaml)
                .appendArgument(this.intoWaml)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class ArrayForm<X, E, B, T> extends WamlConversions.ConversionForm<X, T> implements WamlArrayForm<E, B, T>, ToSource {

    ArrayForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlArrayForm<E, B, X> interForm,
              Function<X, T> fromWaml, Function<T, X> intoWaml) {
      super(codec, javaClass, interForm, fromWaml, intoWaml);
    }

    @Override
    public WamlArrayForm<?, ?, ? extends T> arrayForm() throws WamlException {
      return this;
    }

    @Override
    public WamlForm<E> elementForm() {
      return Assume.<WamlArrayForm<E, B, X>>conforms(this.interForm).elementForm();
    }

    @Override
    public B arrayBuilder() throws WamlException {
      return Assume.<WamlArrayForm<E, B, X>>conforms(this.interForm).arrayBuilder();
    }

    @Override
    public B appendElement(B builder, @Nullable E element) throws WamlException {
      return Assume.<WamlArrayForm<E, B, X>>conforms(this.interForm).appendElement(builder, element);
    }

    @Override
    public @Nullable T buildArray(B builder) throws WamlException {
      return this.fromWaml(Assume.<WamlArrayForm<E, B, X>>conforms(this.interForm).buildArray(builder));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("WamlConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("arrayForm")
                .endInvoke();
      } else {
        notation.beginInvoke("WamlConversions", "arrayForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromWaml)
                .appendArgument(this.intoWaml)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class MarkupForm<X, N, B, T> extends WamlConversions.ConversionForm<X, T> implements WamlMarkupForm<N, B, T>, ToSource {

    MarkupForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlMarkupForm<N, B, X> interForm,
              Function<X, T> fromWaml, Function<T, X> intoWaml) {
      super(codec, javaClass, interForm, fromWaml, intoWaml);
    }

    @Override
    public WamlMarkupForm<?, ?, ? extends T> markupForm() throws WamlException {
      return this;
    }

    @Override
    public WamlForm<N> nodeForm() {
      return Assume.<WamlMarkupForm<N, B, X>>conforms(this.interForm).nodeForm();
    }

    @Override
    public @Nullable String asText(@Nullable N node) throws WamlException {
      return Assume.<WamlMarkupForm<N, B, X>>conforms(this.interForm).asText(node);
    }

    @Override
    public B markupBuilder() throws WamlException {
      return Assume.<WamlMarkupForm<N, B, X>>conforms(this.interForm).markupBuilder();
    }

    @Override
    public B appendNode(B builder, @Nullable N node) throws WamlException {
      return Assume.<WamlMarkupForm<N, B, X>>conforms(this.interForm).appendNode(builder, node);
    }

    @Override
    public B appendText(B builder, String text) throws WamlException {
      return Assume.<WamlMarkupForm<N, B, X>>conforms(this.interForm).appendText(builder, text);
    }

    @Override
    public @Nullable T buildMarkup(B builder) throws WamlException {
      return this.fromWaml(Assume.<WamlMarkupForm<N, B, X>>conforms(this.interForm).buildMarkup(builder));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("WamlConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("markupForm")
                .endInvoke();
      } else {
        notation.beginInvoke("WamlConversions", "markupForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromWaml)
                .appendArgument(this.intoWaml)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class ObjectForm<X, K, V, B, T> extends WamlConversions.ConversionForm<X, T> implements WamlObjectForm<K, V, B, T>, ToSource {

    ObjectForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlObjectForm<K, V, B, X> interForm,
               Function<X, T> fromWaml, Function<T, X> intoWaml) {
      super(codec, javaClass, interForm, fromWaml, intoWaml);
    }

    @Override
    public WamlObjectForm<?, ?, ?, ? extends T> objectForm() throws WamlException {
      return this;
    }

    @Override
    public WamlForm<K> keyForm() throws WamlException {
      return Assume.<WamlObjectForm<K, V, B, X>>conforms(this.interForm).keyForm();
    }

    @Override
    public WamlFieldForm<K, V, B> getFieldForm(K key) throws WamlException {
      return Assume.<WamlObjectForm<K, V, B, X>>conforms(this.interForm).getFieldForm(key);
    }

    @Override
    public B objectBuilder() throws WamlException {
      return Assume.<WamlObjectForm<K, V, B, X>>conforms(this.interForm).objectBuilder();
    }

    @Override
    public @Nullable T buildObject(B builder) throws WamlException {
      return this.fromWaml(Assume.<WamlObjectForm<K, V, B, X>>conforms(this.interForm).buildObject(builder));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("WamlConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("objectForm")
                .endInvoke();
      } else {
        notation.beginInvoke("WamlConversions", "objectForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromWaml)
                .appendArgument(this.intoWaml)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class TupleForm<X, L, P, B, T> extends WamlConversions.ConversionForm<X, T> implements WamlTupleForm<L, P, B, T>, ToSource {

    TupleForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlTupleForm<L, P, B, X> interForm,
              Function<X, T> fromWaml, Function<T, X> intoWaml) {
      super(codec, javaClass, interForm, fromWaml, intoWaml);
    }

    @Override
    public WamlTupleForm<?, ?, ?, ? extends T> tupleForm() throws WamlException {
      return this;
    }

    @Override
    public WamlForm<L> labelForm() {
      return Assume.<WamlTupleForm<L, P, B, X>>conforms(this.interForm).labelForm();
    }

    @Override
    public WamlForm<P> paramForm() {
      return Assume.<WamlTupleForm<L, P, B, X>>conforms(this.interForm).paramForm();
    }

    @Override
    public @Nullable T emptyTuple() throws WamlException {
      return this.fromWaml(Assume.<WamlTupleForm<L, P, B, X>>conforms(this.interForm).emptyTuple());
    }

    @Override
    public @Nullable T unaryTuple(@Nullable P param) throws WamlException {
      return this.fromWaml(Assume.<WamlTupleForm<L, P, B, X>>conforms(this.interForm).unaryTuple(param));
    }

    @Override
    public B tupleBuilder() throws WamlException {
      return Assume.<WamlTupleForm<L, P, B, X>>conforms(this.interForm).tupleBuilder();
    }

    @Override
    public B appendParam(B builder, @Nullable P param) throws WamlException {
      return Assume.<WamlTupleForm<L, P, B, X>>conforms(this.interForm).appendParam(builder, param);
    }

    @Override
    public B appendParam(B builder, @Nullable P label, @Nullable P param) throws WamlException {
      return Assume.<WamlTupleForm<L, P, B, X>>conforms(this.interForm).appendParam(builder, label, param);
    }

    @Override
    public @Nullable T buildTuple(B builder) throws WamlException {
      return this.fromWaml(Assume.<WamlTupleForm<L, P, B, X>>conforms(this.interForm).buildTuple(builder));
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("WamlConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke()
                .beginInvoke("tupleForm")
                .endInvoke();
      } else {
        notation.beginInvoke("WamlConversions", "tupleForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromWaml)
                .appendArgument(this.intoWaml)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

  }

  static final class ValueForm<X, T> extends WamlConversions.ConversionForm<X, T> implements ToSource {

    @Nullable WamlUndefinedForm<? extends T> undefinedForm;
    @Nullable WamlUnitForm<? extends T> unitForm;
    @Nullable WamlIdentifierForm<? extends T> identifierForm;
    @Nullable WamlNumberForm<? extends T> numberForm;
    @Nullable WamlStringForm<?, ? extends T> stringForm;
    @Nullable WamlArrayForm<?, ?, ? extends T> arrayForm;
    @Nullable WamlMarkupForm<?, ?, ? extends T> markupForm;
    @Nullable WamlObjectForm<?, ?, ?, ? extends T> objectForm;
    @Nullable WamlTupleForm<?, ?, ?, ? extends T> tupleForm;

    ValueForm(@Nullable WamlCodec codec, @Nullable Class<T> javaClass, WamlForm<X> interForm,
              Function<X, T> fromWaml, Function<T, X> intoWaml) {
      super(codec, javaClass, interForm, fromWaml, intoWaml);
      this.undefinedForm = null;
      this.unitForm = null;
      this.identifierForm = null;
      this.numberForm = null;
      this.stringForm = null;
      this.arrayForm = null;
      this.markupForm = null;
      this.objectForm = null;
      this.tupleForm = null;
    }

    @Override
    public WamlUndefinedForm<? extends T> undefinedForm() throws WamlException {
      WamlUndefinedForm<? extends T> undefinedForm = (WamlUndefinedForm<? extends T>) UNDEFINED_FORM.getOpaque(this);
      if (undefinedForm == null) {
        UNDEFINED_FORM.compareAndExchangeRelease(this, null, super.undefinedForm());
        undefinedForm = (WamlUndefinedForm<? extends T>) UNDEFINED_FORM.getAcquire(this);
      }
      return undefinedForm;
    }

    @Override
    public WamlUnitForm<? extends T> unitForm() throws WamlException {
      WamlUnitForm<? extends T> unitForm = (WamlUnitForm<? extends T>) UNIT_FORM.getOpaque(this);
      if (unitForm == null) {
        UNIT_FORM.compareAndExchangeRelease(this, null, super.unitForm());
        unitForm = (WamlUnitForm<? extends T>) UNIT_FORM.getAcquire(this);
      }
      return unitForm;
    }

    @Override
    public WamlIdentifierForm<? extends T> identifierForm() throws WamlException {
      WamlIdentifierForm<? extends T> identifierForm = (WamlIdentifierForm<? extends T>) IDENTIFIER_FORM.getOpaque(this);
      if (identifierForm == null) {
        IDENTIFIER_FORM.compareAndExchangeRelease(this, null, super.identifierForm());
        identifierForm = (WamlIdentifierForm<? extends T>) IDENTIFIER_FORM.getAcquire(this);
      }
      return identifierForm;
    }

    @Override
    public WamlNumberForm<? extends T> numberForm() throws WamlException {
      WamlNumberForm<? extends T> numberForm = (WamlNumberForm<? extends T>) NUMBER_FORM.getOpaque(this);
      if (numberForm == null) {
        NUMBER_FORM.compareAndExchangeRelease(this, null, super.numberForm());
        numberForm = (WamlNumberForm<? extends T>) NUMBER_FORM.getAcquire(this);
      }
      return numberForm;
    }

    @Override
    public WamlStringForm<?, ? extends T> stringForm() throws WamlException {
      WamlStringForm<?, ? extends T> stringForm = (WamlStringForm<?, ? extends T>) STRING_FORM.getOpaque(this);
      if (stringForm == null) {
        STRING_FORM.compareAndExchangeRelease(this, null, super.stringForm());
        stringForm = (WamlStringForm<?, ? extends T>) STRING_FORM.getAcquire(this);
      }
      return stringForm;
    }

    @Override
    public WamlArrayForm<?, ?, ? extends T> arrayForm() throws WamlException {
      WamlArrayForm<?, ?, ? extends T> arrayForm = (WamlArrayForm<?, ?, ? extends T>) ARRAY_FORM.getOpaque(this);
      if (arrayForm == null) {
        ARRAY_FORM.compareAndExchangeRelease(this, null, super.arrayForm());
        arrayForm = (WamlArrayForm<?, ?, ? extends T>) ARRAY_FORM.getAcquire(this);
      }
      return arrayForm;
    }

    @Override
    public WamlMarkupForm<?, ?, ? extends T> markupForm() throws WamlException {
      WamlMarkupForm<?, ?, ? extends T> markupForm = (WamlMarkupForm<?, ?, ? extends T>) MARKUP_FORM.getOpaque(this);
      if (markupForm == null) {
        MARKUP_FORM.compareAndExchangeRelease(this, null, super.markupForm());
        markupForm = (WamlMarkupForm<?, ?, ? extends T>) MARKUP_FORM.getAcquire(this);
      }
      return markupForm;
    }

    @Override
    public WamlObjectForm<?, ?, ?, ? extends T> objectForm() throws WamlException {
      WamlObjectForm<?, ?, ?, ? extends T> objectForm = (WamlObjectForm<?, ?, ?, ? extends T>) OBJECT_FORM.getOpaque(this);
      if (objectForm == null) {
        OBJECT_FORM.compareAndExchangeRelease(this, null, super.objectForm());
        objectForm = (WamlObjectForm<?, ?, ?, ? extends T>) OBJECT_FORM.getAcquire(this);
      }
      return objectForm;
    }

    @Override
    public WamlTupleForm<?, ?, ?, ? extends T> tupleForm() throws WamlException {
      WamlTupleForm<?, ?, ?, ? extends T> tupleForm = (WamlTupleForm<?, ?, ?, ? extends T>) TUPLE_FORM.getOpaque(this);
      if (tupleForm == null) {
        TUPLE_FORM.compareAndExchangeRelease(this, null, super.tupleForm());
        tupleForm = (WamlTupleForm<?, ?, ?, ? extends T>) TUPLE_FORM.getAcquire(this);
      }
      return tupleForm;
    }

    @Override
    public void writeSource(Appendable output) {
      final Notation notation = Notation.from(output);
      if (this.codec != null && this.javaClass != null) {
        notation.beginInvoke("WamlConversions", "valueForm")
                .appendArgument(this.codec)
                .appendArgument(this.javaClass)
                .endInvoke();
      } else {
        notation.beginInvoke("WamlConversions", "valueForm")
                .appendArgument(this.interForm)
                .appendArgument(this.fromWaml)
                .appendArgument(this.intoWaml)
                .endInvoke();
      }
    }

    @Override
    public String toString() {
      return this.toSource();
    }

    static final VarHandle UNDEFINED_FORM;
    static final VarHandle UNIT_FORM;
    static final VarHandle IDENTIFIER_FORM;
    static final VarHandle NUMBER_FORM;
    static final VarHandle STRING_FORM;
    static final VarHandle ARRAY_FORM;
    static final VarHandle MARKUP_FORM;
    static final VarHandle OBJECT_FORM;
    static final VarHandle TUPLE_FORM;

    static {
      // Initialize var handles.
      final MethodHandles.Lookup lookup = MethodHandles.lookup();
      try {
        UNDEFINED_FORM = lookup.findVarHandle(WamlConversions.ValueForm.class, "undefinedForm", WamlUndefinedForm.class);
        UNIT_FORM = lookup.findVarHandle(WamlConversions.ValueForm.class, "unitForm", WamlUnitForm.class);
        IDENTIFIER_FORM = lookup.findVarHandle(WamlConversions.ValueForm.class, "identifierForm", WamlIdentifierForm.class);
        NUMBER_FORM = lookup.findVarHandle(WamlConversions.ValueForm.class, "numberForm", WamlNumberForm.class);
        STRING_FORM = lookup.findVarHandle(WamlConversions.ValueForm.class, "stringForm", WamlStringForm.class);
        ARRAY_FORM = lookup.findVarHandle(WamlConversions.ValueForm.class, "arrayForm", WamlArrayForm.class);
        MARKUP_FORM = lookup.findVarHandle(WamlConversions.ValueForm.class, "markupForm", WamlMarkupForm.class);
        OBJECT_FORM = lookup.findVarHandle(WamlConversions.ValueForm.class, "objectForm", WamlObjectForm.class);
        TUPLE_FORM = lookup.findVarHandle(WamlConversions.ValueForm.class, "tupleForm", WamlTupleForm.class);
      } catch (ReflectiveOperationException cause) {
        throw new ExceptionInInitializerError(cause);
      }
    }

  }

}
