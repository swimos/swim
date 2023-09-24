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
import java.lang.reflect.Constructor;
import java.lang.reflect.Executable;
import java.lang.reflect.Field;
import java.lang.reflect.Member;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Type;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Supplier;
import swim.annotations.Nullable;
import swim.collections.HashTrieMap;
import swim.collections.UniformMap;
import swim.decl.AutoDetect;
import swim.decl.Creator;
import swim.decl.FilterMode;
import swim.decl.Getter;
import swim.decl.Ignore;
import swim.decl.Include;
import swim.decl.Initializer;
import swim.decl.Marshal;
import swim.decl.Property;
import swim.decl.Setter;
import swim.decl.TypeName;
import swim.decl.Unmarshal;
import swim.decl.Updater;
import swim.decl.Visibility;
import swim.term.Term;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.Result;
import swim.util.WriteMarkup;
import swim.util.WriteSource;
import swim.waml.decl.WamlAutoDetect;
import swim.waml.decl.WamlCreator;
import swim.waml.decl.WamlGetter;
import swim.waml.decl.WamlIgnore;
import swim.waml.decl.WamlInclude;
import swim.waml.decl.WamlInitializer;
import swim.waml.decl.WamlMarshal;
import swim.waml.decl.WamlProperty;
import swim.waml.decl.WamlPropertyFormat;
import swim.waml.decl.WamlSetter;
import swim.waml.decl.WamlTypeName;
import swim.waml.decl.WamlUnmarshal;
import swim.waml.decl.WamlUpdater;

final class WamlClassDef<T> implements WriteMarkup {

  final WamlMetaCodec metaCodec;
  final Class<T> classType;
  @Nullable String typeName;
  FilterMode includeFilter;

  Visibility autoDetect;
  Visibility autoDetectFields;
  Visibility autoDetectGetters;
  Visibility autoDetectUpdaters;
  Visibility autoDetectSetters;

  @Nullable Executable constructor;
  @Nullable Member initializerMember;
  @Nullable Method unmarshalMethod;
  @Nullable Method marshalMethod;

  @Nullable WamlCreatorDef<T> creatorDef;
  UniformMap<String, WamlPropertyDef<T>> propertyDefs;

  WamlClassDef(WamlMetaCodec metaCodec, Class<T> classType) {
    this.metaCodec = metaCodec;
    this.classType = classType;
    this.typeName = null;
    this.includeFilter = INCLUDE_DEFAULT;

    this.autoDetect = DETECT_DEFAULT;
    this.autoDetectFields = DETECT_DEFAULT;
    this.autoDetectGetters = DETECT_DEFAULT;
    this.autoDetectUpdaters = DETECT_DEFAULT;
    this.autoDetectSetters = DETECT_DEFAULT;

    this.constructor = null;
    this.initializerMember = null;
    this.unmarshalMethod = null;
    this.marshalMethod = null;

    this.creatorDef = null;
    this.propertyDefs = new UniformMap<String, WamlPropertyDef<T>>();
  }

  @Nullable WamlPropertyDef<T> getPropertyDef(String name) {
    return this.propertyDefs.get(name);
  }

  WamlPropertyDef<T> getOrCreatePropertyDef(String name) {
    WamlPropertyDef<T> propertyDef = this.propertyDefs.get(name);
    if (propertyDef == null) {
      propertyDef = new WamlPropertyDef<T>(this, name);
      propertyDef.includeFilter = this.includeFilter;
      this.propertyDefs.put(name, propertyDef);
    }
    return propertyDef;
  }

  void reflect() throws WamlProviderException {
    this.reflectClasses(this.classType);
    this.reflectConstructors(this.classType);
    this.reflectFields(this.classType);
    this.reflectMethods(this.classType);
  }

  void reflectClasses(@Nullable Class<?> classType) {
    if (classType == null || classType == Object.class) {
      // Terminate the recursion before reflecting Object.class.
      return;
    }

    // Recursively reflect base classes.
    this.reflectClasses(classType.getSuperclass());

    // Reflect class members.
    this.reflectClass(classType);
  }

  void reflectClass(Class<?> classType) {
    final HashTrieMap<Class<?>, Annotation> annotationMap = Waml.resolveAnnotations(classType);
    this.reflectAutoDetect(classType, annotationMap);
    this.reflectTypeName(classType, annotationMap);
    this.reflectInclude(classType, annotationMap);
  }

  void reflectConstructors(Class<T> classType) throws WamlProviderException {
    if (classType.isInterface() || (classType.getModifiers() & Modifier.ABSTRACT) != 0) {
      return;
    }

    // Reflect declared constructors.
    final Constructor<T>[] constructors = Assume.conforms(classType.getDeclaredConstructors());
    for (int i = 0; i < constructors.length; i += 1) {
      this.reflectConstructor(constructors[i]);
    }
  }

  void reflectConstructor(Constructor<T> constructor) throws WamlProviderException {
    final HashTrieMap<Class<?>, Annotation> annotationMap = Waml.resolveAnnotations(constructor);
    if (constructor.getParameterCount() == 0) {
      this.constructor = constructor;
    }
    this.reflectCreator(constructor, annotationMap);
  }

  void reflectFields(@Nullable Class<?> classType) {
    if (classType == null || classType == Object.class) {
      // Terminate the recursion before reflecting Object.class.
      return;
    }

    // Recursively reflect base class fields.
    this.reflectFields(classType.getSuperclass());

    // Reflect declared fields.
    final Field[] fields = classType.getDeclaredFields();
    for (int i = 0; i < fields.length; i += 1) {
      this.reflectField(fields[i]);
    }
  }

  void reflectField(Field field) {
    final HashTrieMap<Class<?>, Annotation> annotationMap = Waml.resolveAnnotations(field);
    if ((field.getModifiers() & Modifier.STATIC) != 0) {
      this.reflectStaticField(field, annotationMap);
    } else {
      this.reflectInstanceField(field, annotationMap);
    }
  }

  void reflectStaticField(Field field, HashTrieMap<Class<?>, Annotation> annotationMap) {
    this.reflectInitializer(field, annotationMap);
  }

  void reflectInstanceField(Field field, HashTrieMap<Class<?>, Annotation> annotationMap) {
    final WamlPropertyDef<T> propertyDef = this.reflectPropertyField(field, annotationMap);
    if (propertyDef != null) {
      propertyDef.reflectInstanceField(field, annotationMap);
    }
  }

  void reflectMethods(@Nullable Class<?> classType) throws WamlProviderException {
    if (classType == null || classType == Object.class) {
      // Terminate the recursion before reflecting Object.class.
      return;
    }

    // Recursively reflect base class methods.
    this.reflectMethods(classType.getSuperclass());

    // Reflect declared methods.
    final Method[] methods = classType.getDeclaredMethods();
    for (int i = 0; i < methods.length; i += 1) {
      this.reflectMethod(methods[i]);
    }
  }

  void reflectMethod(Method method) throws WamlProviderException {
    final HashTrieMap<Class<?>, Annotation> annotationMap = Waml.resolveAnnotations(method);
    if ((method.getModifiers() & Modifier.STATIC) != 0) {
      this.reflectStaticMethod(method, annotationMap);
    } else {
      this.reflectInstanceMethod(method, annotationMap);
    }
  }

  void reflectStaticMethod(Method method, HashTrieMap<Class<?>, Annotation> annotationMap) throws WamlProviderException {
    Annotation ignoreAnnotation;
    final boolean ignore;
    if ((ignoreAnnotation = annotationMap.get(WamlIgnore.class)) != null) {
      ignore = ((WamlIgnore) ignoreAnnotation).value();
    } else if ((ignoreAnnotation = annotationMap.get(Ignore.class)) != null) {
      ignore = ((Ignore) ignoreAnnotation).value();
    } else {
      ignore = false;
    }
    if (ignore) {
      return;
    }

    this.reflectCreator(method, annotationMap);
    this.reflectInitializer(method, annotationMap);
    this.reflectPropertyFormat(method, annotationMap);
    this.reflectUnmarshal(method, annotationMap);
    this.reflectMarshal(method, annotationMap);
  }

  void reflectInstanceMethod(Method method, HashTrieMap<Class<?>, Annotation> annotationMap) throws WamlProviderException {
    final WamlPropertyDef<T> propertyDef = this.reflectPropertyMethod(method, annotationMap);
    if (propertyDef != null) {
      propertyDef.reflectInstanceMethod(method, annotationMap);
    }
    this.reflectMarshal(method, annotationMap);
  }

  void reflectAutoDetect(Class<?> classType, HashTrieMap<Class<?>, Annotation> annotationMap) {
    Annotation autoDetectAnnotation;
    Visibility autoDetect;
    Visibility autoDetectFields;
    Visibility autoDetectGetters;
    Visibility autoDetectUpdaters;
    Visibility autoDetectSetters;
    if ((autoDetectAnnotation = annotationMap.get(WamlAutoDetect.class)) != null) {
      autoDetect = ((WamlAutoDetect) autoDetectAnnotation).value();
      autoDetectFields = ((WamlAutoDetect) autoDetectAnnotation).fields();
      autoDetectGetters = ((WamlAutoDetect) autoDetectAnnotation).getters();
      autoDetectUpdaters = ((WamlAutoDetect) autoDetectAnnotation).updaters();
      autoDetectSetters = ((WamlAutoDetect) autoDetectAnnotation).setters();
    } else if ((autoDetectAnnotation = annotationMap.get(AutoDetect.class)) != null) {
      autoDetect = ((AutoDetect) autoDetectAnnotation).value();
      autoDetectFields = ((AutoDetect) autoDetectAnnotation).fields();
      autoDetectGetters = ((AutoDetect) autoDetectAnnotation).getters();
      autoDetectUpdaters = ((AutoDetect) autoDetectAnnotation).updaters();
      autoDetectSetters = ((AutoDetect) autoDetectAnnotation).setters();
    } else {
      return;
    }

    // Propagate default autoDetect mode before resolving Visibility.INHERIT.
    if (autoDetect == Visibility.DEFAULT) {
      autoDetect = DETECT_DEFAULT;
    }
    if (autoDetectFields == Visibility.DEFAULT) {
      autoDetectFields = autoDetect;
    }
    if (autoDetectFields == Visibility.INHERIT) {
      autoDetectFields = this.autoDetectFields;
    }
    if (autoDetectGetters == Visibility.DEFAULT) {
      autoDetectGetters = autoDetect;
    }
    if (autoDetectGetters == Visibility.INHERIT) {
      autoDetectGetters = this.autoDetectGetters;
    }
    if (autoDetectUpdaters == Visibility.DEFAULT) {
      autoDetectUpdaters = autoDetect;
    }
    if (autoDetectUpdaters == Visibility.INHERIT) {
      autoDetectUpdaters = this.autoDetectUpdaters;
    }
    if (autoDetectSetters == Visibility.DEFAULT) {
      autoDetectSetters = autoDetect;
    }
    if (autoDetectSetters == Visibility.INHERIT) {
      autoDetectSetters = this.autoDetectSetters;
    }
    if (autoDetect == Visibility.INHERIT) {
      autoDetect = this.autoDetect;
    }

    this.autoDetect = autoDetect;
    this.autoDetectFields = autoDetectFields;
    this.autoDetectGetters = autoDetectGetters;
    this.autoDetectUpdaters = autoDetectUpdaters;
    this.autoDetectSetters = autoDetectSetters;
  }

  void reflectTypeName(Class<?> classType, HashTrieMap<Class<?>, Annotation> annotationMap) {
    Annotation typeNameAnnotation;
    String typeName;
    if ((typeNameAnnotation = annotationMap.get(WamlTypeName.class)) != null) {
      typeName = ((WamlTypeName) typeNameAnnotation).value();
    } else if ((typeNameAnnotation = annotationMap.get(TypeName.class)) != null) {
      typeName = ((TypeName) typeNameAnnotation).value();
    } else {
      return;
    }

    if (typeName.length() == 0) {
      typeName = null;
    }

    this.typeName = typeName;
  }

  void reflectInclude(Class<?> classType, HashTrieMap<Class<?>, Annotation> annotationMap) {
    Annotation includeAnnotation;
    final FilterMode includeFilter;
    if ((includeAnnotation = annotationMap.get(WamlInclude.class)) != null) {
      includeFilter = ((WamlInclude) includeAnnotation).value();
    } else if ((includeAnnotation = annotationMap.get(Include.class)) != null) {
      includeFilter = ((Include) includeAnnotation).value();
    } else {
      return;
    }

    if (includeFilter == FilterMode.INHERIT) {
      return;
    }

    this.includeFilter = includeFilter;
  }

  void reflectInitializer(Member member, HashTrieMap<Class<?>, Annotation> annotationMap) {
    Annotation initializerAnnotation;
    if ((initializerAnnotation = annotationMap.get(WamlInitializer.class)) == null
        && (initializerAnnotation = annotationMap.get(Initializer.class)) == null) {
      return;
    }

    this.initializerMember = member;
  }

  void reflectUnmarshal(Method method, HashTrieMap<Class<?>, Annotation> annotationMap) throws WamlProviderException {
    Annotation unmarshalAnnotation;
    if ((unmarshalAnnotation = annotationMap.get(WamlUnmarshal.class)) == null
        && (unmarshalAnnotation = annotationMap.get(Unmarshal.class)) == null) {
      return;
    }

    if ((method.getModifiers() & Modifier.STATIC) == 0) {
      throw new WamlProviderException("non-static "
                                    + "@" + unmarshalAnnotation.annotationType().getSimpleName()
                                    + " method " + method);
    } else if (method.getParameterCount() != 1) {
      throw new WamlProviderException("@" + unmarshalAnnotation.annotationType().getSimpleName()
                                    + " method " + method + " must have exactly 1 parameter");
    } else if (!this.classType.isAssignableFrom(method.getReturnType())) {
      throw new WamlProviderException("return type of "
                                    + "@" + unmarshalAnnotation.annotationType().getSimpleName()
                                    + " method " + method
                                    + " must by assignable to enclosing class "
                                    + this.classType.getName());
    } else if (this.unmarshalMethod != null
        && this.unmarshalMethod.getDeclaringClass().equals(method.getDeclaringClass())) {
      throw new WamlProviderException("duplicate "
                                    + "@" + unmarshalAnnotation.annotationType().getSimpleName()
                                    + " method " + method);
    }

    this.unmarshalMethod = method;
  }

  void reflectMarshal(Method method, HashTrieMap<Class<?>, Annotation> annotationMap) throws WamlProviderException {
    Annotation marshalAnnotation;
    if ((marshalAnnotation = annotationMap.get(WamlMarshal.class)) == null
        && (marshalAnnotation = annotationMap.get(Marshal.class)) == null) {
      return;
    }

    if ((method.getModifiers() & Modifier.STATIC) != 0) {
      if (method.getParameterCount() != 1) {
        throw new WamlProviderException("static "
                                      + "@" + marshalAnnotation.annotationType().getSimpleName()
                                      + " method " + method
                                      + " must have exactly 1 parameter");
      } else if (!method.getParameterTypes()[0].isAssignableFrom(this.classType)) {
        throw new WamlProviderException("parameter type of static "
                                      + "@" + marshalAnnotation.annotationType().getSimpleName()
                                      + " method " + method
                                      + " must be assignable from enclosing class "
                                      + this.classType.getName());
      }
    } else {
      if (method.getParameterCount() != 0) {
        throw new WamlProviderException("@" + marshalAnnotation.annotationType().getSimpleName()
                                      + " method " + method
                                      + " must have 0 parameters");
      }
    }
    if (this.marshalMethod != null
        && this.marshalMethod.getDeclaringClass().equals(method.getDeclaringClass())) {
      throw new WamlProviderException("duplicate "
                                    + "@" + marshalAnnotation.annotationType().getSimpleName()
                                    + " method " + method);
    }

    this.marshalMethod = method;
  }

  @Nullable WamlCreatorDef<T> reflectCreator(Executable executable, HashTrieMap<Class<?>, Annotation> annotationMap) throws WamlProviderException {
    Annotation creatorAnnotation;
    if ((creatorAnnotation = annotationMap.get(WamlCreator.class)) == null
        && (creatorAnnotation = annotationMap.get(Creator.class)) == null) {
      return null;
    }

    if (executable.getParameterCount() == 0) {
      this.constructor = executable;
      return null;
    }

    final WamlCreatorDef<T> creatorDef = new WamlCreatorDef<T>(this, executable);
    creatorDef.reflectParameters();
    this.creatorDef = creatorDef;
    return creatorDef;
  }

  @Nullable WamlPropertyDef<T> reflectPropertyFormat(Method method, HashTrieMap<Class<?>, Annotation> annotationMap) {
    final Annotation propertyFormatAnnotation;
    final String propertyName;
    if ((propertyFormatAnnotation = annotationMap.get(WamlPropertyFormat.class)) != null) {
      propertyName = ((WamlPropertyFormat) propertyFormatAnnotation).value();
    } else {
      return null;
    }

    if (propertyName.length() == 0) {
      return null;
    }

    final WamlPropertyDef<T> propertyDef = this.getOrCreatePropertyDef(propertyName);
    propertyDef.formatMethod = method;
    return propertyDef;
  }

  @Nullable WamlPropertyDef<T> reflectPropertyField(Field field, HashTrieMap<Class<?>, Annotation> annotationMap) {
    Annotation propertyAnnotation;
    String propertyName;
    if ((propertyAnnotation = annotationMap.get(WamlProperty.class)) != null) {
      propertyName = ((WamlProperty) propertyAnnotation).value();
    } else if ((propertyAnnotation = annotationMap.get(Property.class)) != null) {
      propertyName = ((Property) propertyAnnotation).value();
    } else if ((field.getModifiers() & Modifier.TRANSIENT) == 0
        && this.autoDetectFields.isVisible(field)) {
      propertyName = "";
    } else {
      return null;
    }

    if (propertyName.length() == 0) {
      propertyName = field.getName();
    }

    final WamlPropertyDef<T> propertyDef = this.getOrCreatePropertyDef(propertyName);
    propertyDef.field = field;
    return propertyDef;
  }

  @Nullable WamlPropertyDef<T> reflectPropertyMethod(Method method, HashTrieMap<Class<?>, Annotation> annotationMap) throws WamlProviderException {
    final String methodName = method.getName();
    String propertyName = null;
    Method getterMethod = null;
    Method updaterMethod = null;
    Method setterMethod = null;

    Annotation propertyAnnotation;
    if ((propertyAnnotation = annotationMap.get(WamlProperty.class)) != null) {
      propertyName = ((WamlProperty) propertyAnnotation).value();
    } else if ((propertyAnnotation = annotationMap.get(Property.class)) != null) {
      propertyName = ((Property) propertyAnnotation).value();
    }

    Annotation getterAnnotation;
    if ((getterAnnotation = annotationMap.get(WamlGetter.class)) != null) {
      if (propertyName == null || propertyName.length() == 0) {
        propertyName = ((WamlGetter) getterAnnotation).value();
      }
      getterMethod = method;
    } else if ((getterAnnotation = annotationMap.get(Getter.class)) != null) {
      if (propertyName == null || propertyName.length() == 0) {
        propertyName = ((Getter) getterAnnotation).value();
      }
      getterMethod = method;
    } else if (methodName.startsWith("get") && methodName.length() > 3
        && this.autoDetectGetters.isVisible(method) && method.getParameterCount() == 0) {
      if (propertyName == null || propertyName.length() == 0) {
        propertyName = Term.toCamelCase(methodName.substring(3));
      }
      getterMethod = method;
    } else if (methodName.startsWith("is") && methodName.length() > 2
        && this.autoDetectGetters.isVisible(method) && method.getParameterCount() == 0) {
      if (propertyName == null || propertyName.length() == 0) {
        propertyName = Term.toCamelCase(methodName.substring(2));
      }
      getterMethod = method;
    }

    Annotation updaterAnnotation;
    if ((updaterAnnotation = annotationMap.get(WamlUpdater.class)) != null) {
      if (propertyName == null || propertyName.length() == 0) {
        propertyName = ((WamlUpdater) updaterAnnotation).value();
      }
      updaterMethod = method;
    } else if ((updaterAnnotation = annotationMap.get(Updater.class)) != null) {
      if (propertyName == null || propertyName.length() == 0) {
        propertyName = ((Updater) updaterAnnotation).value();
      }
      updaterMethod = method;
    } else if (methodName.startsWith("with")  && methodName.length() > 4
        && this.autoDetectUpdaters.isVisible(method) && method.getParameterCount() == 1
        && method.getDeclaringClass().isAssignableFrom(method.getReturnType())) {
      if (propertyName == null || propertyName.length() == 0) {
        propertyName = Term.toCamelCase(methodName.substring(4));
      }
      updaterMethod = method;
    }

    Annotation setterAnnotation;
    if ((setterAnnotation = annotationMap.get(WamlSetter.class)) != null) {
      if (propertyName == null || propertyName.length() == 0) {
        propertyName = ((WamlSetter) setterAnnotation).value();
      }
      setterMethod = method;
    } else if ((setterAnnotation = annotationMap.get(Setter.class)) != null) {
      if (propertyName == null || propertyName.length() == 0) {
        propertyName = ((Setter) setterAnnotation).value();
      }
      setterMethod = method;
    } else if (methodName.startsWith("set") && methodName.length() > 3
        && this.autoDetectSetters.isVisible(method) && method.getParameterCount() == 1
        && method.getDeclaringClass().isAssignableFrom(method.getReturnType())) {
      if (propertyName == null || propertyName.length() == 0) {
        propertyName = Term.toCamelCase(methodName.substring(3));
      }
      setterMethod = method;
    }

    if (propertyName == null) {
      return null;
    }

    if (getterAnnotation != null && updaterAnnotation != null) {
      throw new WamlProviderException("conflicting "
                                    + "@" + getterAnnotation.annotationType().getSimpleName()
                                    + " and @" + updaterAnnotation.annotationType().getSimpleName()
                                    + " annotations on method " + method);
    } else if (getterAnnotation != null && setterAnnotation != null) {
      throw new WamlProviderException("conflicting "
                                    + "@" + getterAnnotation.annotationType().getSimpleName()
                                    + " and @" + setterAnnotation.annotationType().getSimpleName()
                                    + " annotations on method " + method);
    } else if (updaterAnnotation != null && setterAnnotation != null) {
      throw new WamlProviderException("conflicting "
                                    + "@" + updaterAnnotation.annotationType().getSimpleName()
                                    + " and @" + setterAnnotation.annotationType().getSimpleName()
                                    + " annotations on method " + method.getName());
    }

    if (getterMethod == null && setterMethod == null) {
      if (method.getParameterCount() == 0) {
        getterMethod = method;
      } else if (!Void.TYPE.equals(method.getReturnType())) {
        updaterMethod = method;
      } else {
        setterMethod = method;
      }
    }

    if (propertyName.length() == 0) {
      if (getterMethod != null && methodName.startsWith("get") && methodName.length() > 3) {
        propertyName = Term.toCamelCase(methodName.substring(3));
      } else if (getterMethod != null && methodName.startsWith("is") && methodName.length() > 2) {
        propertyName = Term.toCamelCase(methodName.substring(2));
      } else if (updaterMethod != null && methodName.startsWith("with") && methodName.length() > 4) {
        propertyName = Term.toCamelCase(methodName.substring(4));
      } else if (setterMethod != null && methodName.startsWith("set") && methodName.length() > 3) {
        propertyName = Term.toCamelCase(methodName.substring(3));
      } else {
        propertyName = methodName;
      }
    }

    final WamlPropertyDef<T> propertyDef = this.getOrCreatePropertyDef(propertyName);
    if (getterMethod != null) {
      propertyDef.getterMethod = getterMethod;
    }
    if (updaterMethod != null) {
      propertyDef.updaterMethod = updaterMethod;
    }
    if (setterMethod != null) {
      propertyDef.setterMethod = setterMethod;
    }
    return propertyDef;
  }

  void flattenProperties() throws WamlProviderException {
    for (WamlPropertyDef<T> propertyDef : this.propertyDefs.clone().values()) {
      if (propertyDef.ignore || propertyDef.annex || !propertyDef.flatten) {
        continue;
      }
      final UniformMap<String, WamlFieldFormat<?, T>> flattenedFieldFormats =
          propertyDef.toFlattenedFieldFormats();
      if (flattenedFieldFormats == null) {
        continue;
      }
      for (WamlFieldFormat<?, T> flattenedFieldFormat : flattenedFieldFormats.values()) {
        final WamlPropertyDef<T> flattenedPropertyDefs =
            this.getOrCreatePropertyDef(flattenedFieldFormat.key());
        flattenedPropertyDefs.fieldParser = flattenedFieldFormat;
        flattenedPropertyDefs.fieldWriter = flattenedFieldFormat;
        flattenedPropertyDefs.fieldFormat = flattenedFieldFormat;
      }
    }
  }

  UniformMap<String, WamlFieldParser<?, T>> toFieldParsers() throws WamlProviderException {
    final UniformMap<String, WamlFieldParser<?, T>> fieldParsers = UniformMap.of();
    for (Map.Entry<String, WamlPropertyDef<T>> entry : this.propertyDefs) {
      final WamlPropertyDef<T> propertyDef = entry.getValue();
      if (propertyDef.ignore || propertyDef.annex) {
        continue;
      }
      final WamlFieldParser<?, T> fieldParser = propertyDef.toFieldParser();
      if (fieldParser == null) {
        continue;
      }
      fieldParsers.put(entry.getKey(), fieldParser);
    }
    for (WamlPropertyDef<T> propertyDef : this.propertyDefs.values()) {
      if (propertyDef.ignore || propertyDef.annex || propertyDef.aliases.isEmpty()) {
        continue;
      }
      final WamlFieldParser<?, T> fieldParser = propertyDef.toFieldParser();
      if (fieldParser == null) {
        continue;
      }
      for (String alias : propertyDef.aliases) {
        if (fieldParsers.containsKey(alias)) {
          throw new WamlProviderException(Notation.of("non-unique alias ")
                                                  .appendSource(alias)
                                                  .append(" for property ")
                                                  .appendSource(propertyDef.name)
                                                  .append(" of class ")
                                                  .append(this.classType.getName())
                                                  .toString());
        }
        fieldParsers.put(alias, fieldParser);
      }
    }
    return fieldParsers;
  }

  UniformMap<String, WamlFieldWriter<?, T>> toFieldWriters() throws WamlProviderException {
    final UniformMap<String, WamlFieldWriter<?, T>> fieldWriters = UniformMap.of();
    for (Map.Entry<String, WamlPropertyDef<T>> entry : this.propertyDefs) {
      final WamlPropertyDef<T> propertyDef = entry.getValue();
      if (propertyDef.ignore || propertyDef.annex || propertyDef.flatten) {
        continue;
      }
      final WamlFieldWriter<?, T> fieldWriter = propertyDef.toFieldWriter();
      if (fieldWriter == null) {
        continue;
      }
      fieldWriters.put(entry.getKey(), fieldWriter);
    }
    return fieldWriters;
  }

  UniformMap<String, WamlFieldFormat<?, T>> toFieldFormats() throws WamlProviderException {
    final UniformMap<String, WamlFieldFormat<?, T>> fieldFormats = UniformMap.of();
    for (Map.Entry<String, WamlPropertyDef<T>> entry : this.propertyDefs) {
      final WamlPropertyDef<T> propertyDef = entry.getValue();
      if (propertyDef.ignore || propertyDef.annex) {
        continue;
      }
      final WamlFieldFormat<?, T> fieldFormat = propertyDef.toFieldFormat();
      if (fieldFormat == null) {
        continue;
      }
      fieldFormats.put(entry.getKey(), fieldFormat);
    }
    return fieldFormats;
  }

  @Nullable WamlFieldFormat<?, T> toAnnexFieldFormat() throws WamlProviderException {
    WamlFieldFormat<?, T> annexFieldFormat = null;
    for (WamlPropertyDef<T> propertyDef : this.propertyDefs.values()) {
      if (!propertyDef.annex) {
        continue;
      } else if (annexFieldFormat != null) {
        throw new WamlProviderException(Notation.of("duplicate annex property ")
                                                .appendSource(propertyDef.name)
                                                .append(" for class ")
                                                .append(this.classType.getName())
                                                .toString());
      }
      annexFieldFormat = propertyDef.toFieldFormat();
    }
    return annexFieldFormat;
  }

  @Nullable Supplier<T> toInitializer() throws WamlProviderException {
    if (this.initializerMember instanceof Field) {
      return WamlClassDef.initializer((Field) this.initializerMember);
    } else if (this.initializerMember instanceof Method) {
      return WamlClassDef.initializer((Method) this.initializerMember);
    }
    return null;
  }

  WamlParser<T> toUnmarshallingParser(Method method) throws WamlProviderException {
    // Resolve the WamlFormat of the unmarshal type.
    final Type unmarshalType = method.getGenericParameterTypes()[0];
    final Class<?> unmarshalClass = MethodType.methodType(method.getParameterTypes()[0]).wrap().returnType();
    final WamlFormat<?> unmarshalFormat;
    try {
      unmarshalFormat = this.metaCodec.getWamlFormat(unmarshalType);
    } catch (WamlProviderException cause) {
      throw new WamlProviderException("no waml format for unmarshal type "
                                    + unmarshalType.getTypeName()
                                    + " inferred for class "
                                    + this.classType.getName(), cause);
    }

    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(method.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    // Unreflect the decode conversion Method to a direct MethodHandle.
    final MethodHandle methodHandle;
    try {
      methodHandle = lookup.unreflect(method);
    } catch (IllegalAccessException cause) {
      throw new WamlProviderException("inaccessible decode conversion method " + method, cause);
    }
    // Bootstrap the decode conversion call site.
    final CallSite callSite;
    try {
      callSite = LambdaMetafactory.metafactory(lookup, "apply",
                                               MethodType.methodType(Function.class),
                                               MethodType.methodType(Object.class, Object.class),
                                               methodHandle,
                                               MethodType.methodType(this.classType, unmarshalClass));
    } catch (LambdaConversionException cause) {
      throw new WamlProviderException(cause);
    }
    // Capture the decode conversion function.
    final Function<?, T> mapper;
    try {
      mapper = (Function<?, T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlProviderException(cause);
    }

    return unmarshalFormat.map(Assume.conforms(mapper));
  }

  WamlWriter<T> toMarshallingWriter(Method method) throws WamlProviderException {
    // Resolve the WamlFormat of the marshal type.
    final Type marshalType = method.getGenericReturnType();
    final Class<?> marshalClass = method.getReturnType();
    final WamlFormat<?> marshalFormat;
    try {
      marshalFormat = this.metaCodec.getWamlFormat(marshalType);
    } catch (WamlProviderException cause) {
      throw new WamlProviderException("no waml format for marshal type "
                                    + marshalType.getTypeName()
                                    + " inferred for class "
                                    + this.classType.getName(), cause);
    }

    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(method.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    // Unreflect the encode conversion Method to a direct MethodHandle.
    final MethodHandle methodHandle;
    try {
      methodHandle = lookup.unreflect(method);
    } catch (IllegalAccessException cause) {
      throw new WamlProviderException("inaccessible encode conversion method " + method, cause);
    }
    // Bootstrap the encode conversion call site.
    final CallSite callSite;
    try {
      callSite = LambdaMetafactory.metafactory(lookup, "apply",
                                               MethodType.methodType(Function.class),
                                               MethodType.methodType(Object.class, Object.class),
                                               methodHandle,
                                               MethodType.methodType(marshalClass, this.classType));
    } catch (LambdaConversionException cause) {
      throw new WamlProviderException(cause);
    }
    // Capture the encode conversion function.
    final Function<?, T> unmapper;
    try {
      unmapper = (Function<?, T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlProviderException(cause);
    }

    return marshalFormat.unmap(Assume.conforms(unmapper));
  }

  WamlParser<T> toParser() throws WamlProviderException {
    if (this.unmarshalMethod != null) {
      return this.toUnmarshallingParser(this.unmarshalMethod);
    } else if (this.creatorDef != null) {
      return WamlObjectParser.creator(this.typeName, this.creatorDef.executable,
                                      this.toInitializer(), WamlLang.keyFormat(),
                                      Assume.conforms(this.creatorDef.toArgumnetFormats()),
                                      this.creatorDef.toFlattenedArgumentFormats(),
                                      this.creatorDef.toAnnexArgumentFormat());
    } else if (this.constructor != null) {
      return WamlObjectParser.mutator(this.typeName, this.constructor,
                                      this.toInitializer(), WamlLang.keyFormat(),
                                      this.toFieldParsers(),
                                      this.toAnnexFieldFormat());
    }
    return WamlParser.unsupported(this.classType);
  }

  WamlWriter<T> toWriter() throws WamlProviderException {
    if (this.marshalMethod != null) {
      return this.toMarshallingWriter(this.marshalMethod);
    }
    return WamlObjectWriter.serializer(this.typeName, this.toFieldWriters(),
                                       this.toAnnexFieldFormat());
  }

  WamlFormat<T> toFormat() throws WamlProviderException {
    final WamlParser<T> parser = this.toParser();
    final WamlWriter<T> writer = this.toWriter();
    if (parser instanceof WamlObjectParser<?, ?, ?>
        && writer instanceof WamlObjectWriter<?, ?>) {
      return WamlObjectFormat.combining(this.typeName, Assume.conforms(parser),
                                        Assume.conforms(writer), this.toFieldFormats());
    }
    return WamlFormat.combining(this.typeName, parser, writer);
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginObject("WamlClassDef")
            .appendField("metaCodec", this.metaCodec)
            .appendField("className", this.classType.getName());
    if (this.typeName != null) {
      notation.appendField("typeName", this.typeName);
    }
    if (this.includeFilter != INCLUDE_DEFAULT) {
      notation.appendField("includeFilter", this.includeFilter);
    }

    if (this.autoDetect != DETECT_DEFAULT) {
      notation.appendField("autoDetect", this.autoDetect);
    }
    if (this.autoDetectFields != DETECT_DEFAULT) {
      notation.appendField("autoDetectFields", this.autoDetectFields);
    }
    if (this.autoDetectGetters != DETECT_DEFAULT) {
      notation.appendField("autoDetectGetters", this.autoDetectGetters);
    }
    if (this.autoDetectUpdaters != DETECT_DEFAULT) {
      notation.appendField("autoDetectUpdaters", this.autoDetectUpdaters);
    }
    if (this.autoDetectSetters != DETECT_DEFAULT) {
      notation.appendField("autoDetectSetters", this.autoDetectSetters);
    }

    if (this.constructor != null) {
      notation.appendField("constructor", this.constructor);
    }
    if (this.initializerMember != null) {
      notation.appendField("initializerMember", this.initializerMember);
    }
    if (this.unmarshalMethod != null) {
      notation.appendField("unmarshalMethod", this.unmarshalMethod);
    }
    if (this.marshalMethod != null) {
      notation.appendField("marshalMethod", this.marshalMethod);
    }

    if (this.creatorDef != null) {
      notation.appendField("creatorDef", this.creatorDef);
    }
    if (!this.propertyDefs.isEmpty()) {
      notation.appendKey("propertyDefs")
              .beginValue()
              .beginObject();
      for (Map.Entry<String, WamlPropertyDef<T>> entry : this.propertyDefs) {
        notation.appendKey(entry.getKey());
        notation.beginValue();
        entry.getValue().writeMarkup(notation);
        notation.endValue();
      }
      notation.endObject()
              .endValue();
    }
    notation.endObject();
  }

  @Override
  public String toString() {
    return WriteMarkup.toString(this);
  }

  static final FilterMode INCLUDE_DEFAULT = FilterMode.DEFAULT;

  static final Visibility DETECT_DEFAULT = Visibility.PACKAGE;

  static <T> WamlClassDef<T> reflect(WamlMetaCodec metaCodec, Class<T> classType) throws WamlProviderException {
    final WamlClassDef<T> classDef = new WamlClassDef<T>(metaCodec, classType);
    classDef.reflect();
    classDef.flattenProperties();
    return classDef;
  }

  static <T> Supplier<T> initializer(@Nullable T value) {
    if (value == null) {
      return Assume.conforms(WamlClassIntializer.NULL);
    }
    return new WamlClassIntializer<T>(value);
  }

  static <T> Supplier<T> initializer(VarHandle fieldHandle) throws WamlProviderException {
    if (fieldHandle.coordinateTypes().size() != 1) {
      throw new WamlProviderException("invalid initializer field handle " + fieldHandle);
    }
    return WamlClassDef.initializer((T) fieldHandle.get());
  }

  static <T> Supplier<T> initializer(Field field) throws WamlProviderException {
    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(field.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    final VarHandle fieldHandle;
    try {
      fieldHandle = lookup.unreflectVarHandle(field);
    } catch (IllegalAccessException cause) {
      throw new WamlProviderException("inaccessible initializer field " + field, cause);
    }

    return WamlClassDef.initializer(fieldHandle);
  }

  static <T> Supplier<T> initializer(MethodHandle methodHandle) throws WamlProviderException {
    final MethodType methodType = methodHandle.type();
    if (methodType.parameterCount() != 0) {
      throw new WamlProviderException("invalid initializer method signature " + methodHandle);
    }

    final CallSite callSite;
    try {
      callSite = LambdaMetafactory.metafactory(MethodHandles.lookup(), "get",
                                               MethodType.methodType(Supplier.class),
                                               MethodType.methodType(Object.class),
                                               methodHandle, methodType);
    } catch (LambdaConversionException cause) {
      throw new WamlProviderException(cause);
    }

    final Supplier<T> supplier;
    try {
      supplier = (Supplier<T>) callSite.getTarget().invokeExact();
    } catch (Throwable cause) {
      Result.throwFatal(cause);
      throw new WamlProviderException(cause);
    }

    return supplier;
  }

  static <T> Supplier<T> initializer(Method method) throws WamlProviderException {
    MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      lookup = MethodHandles.privateLookupIn(method.getDeclaringClass(), lookup);
    } catch (IllegalAccessException | SecurityException cause) {
      // Proceed with the original lookup object.
    }

    final MethodHandle methodHandle;
    try {
      methodHandle = lookup.unreflect(method);
    } catch (IllegalAccessException cause) {
      throw new WamlProviderException("inaccessible initializer method " + method, cause);
    }

    return WamlClassDef.initializer(methodHandle);
  }

}

final class WamlClassIntializer<T> implements Supplier<T>, WriteSource {

  final @Nullable T value;

  WamlClassIntializer(@Nullable T value) {
    this.value = value;
  }

  @Override
  public @Nullable T get() {
    return this.value;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlClassDef", "initializer")
            .appendArgument(this.value)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final WamlClassIntializer<Object> NULL = new WamlClassIntializer<Object>(null);

}
