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

import java.lang.reflect.Constructor;
import java.lang.reflect.Type;
import java.util.Iterator;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.UniformMap;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class WamlThrowables implements WamlProvider, ToSource {

  final int priority;

  private WamlThrowables(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable WamlFormat<?> resolveWamlFormat(Type type) throws WamlProviderException {
    if (type instanceof Class<?>) {
      final Class<?> classType = (Class<?>) type;
      if (StackTraceElement.class.isAssignableFrom(classType)) {
        return WamlThrowables.stackTraceElementFormat();
      } else if (Throwable.class.isAssignableFrom(classType)) {
        return WamlThrowables.throwableFormat();
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlThrowables", "provider");
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final WamlThrowables PROVIDER = new WamlThrowables(GENERIC_PRIORITY);

  public static WamlThrowables provider(int priority) {
    if (priority == GENERIC_PRIORITY) {
      return PROVIDER;
    }
    return new WamlThrowables(priority);
  }

  public static WamlThrowables provider() {
    return PROVIDER;
  }

  public static WamlFormat<StackTraceElement> stackTraceElementFormat() {
    return WamlStackTraceElementFormat.INSTANCE;
  }

  public static WamlFormat<Throwable> throwableFormat() {
    return WamlThrowableFormat.INSTANCE;
  }

}

final class WamlStackTraceElementFormat implements WamlFormat<StackTraceElement>, WamlObjectParser<Object, WamlStackTraceElementBuilder, StackTraceElement>, WamlObjectWriter<Object, StackTraceElement>, ToSource {

  @Override
  public @Nullable String typeName() {
    return "StackTraceElement";
  }

  @Override
  public WamlStackTraceElementBuilder objectBuilder(@Nullable Object attrs) {
    return new WamlStackTraceElementBuilder();
  }

  @Override
  public WamlFieldParser<?, WamlStackTraceElementBuilder> getFieldParser(WamlStackTraceElementBuilder builder, String key) throws WamlException {
    final WamlFieldParser<?, WamlStackTraceElementBuilder> fieldParser = FIELD_PARSERS.get(key);
    if (fieldParser == null) {
      throw new WamlException(Notation.of("unsupported key: ")
                                      .appendSource(key)
                                      .toString());
    }
    return fieldParser;
  }

  @Override
  public @Nullable StackTraceElement buildObject(@Nullable Object attrs, WamlStackTraceElementBuilder builder) throws WamlException {
    try {
      return new StackTraceElement(builder.classLoaderName, builder.moduleName, builder.moduleVersion,
                                   builder.className, builder.methodName, builder.fileName, builder.lineNumber);
    } catch (NullPointerException cause) {
      throw new WamlException(cause);
    }
  }

  @Override
  public WamlFieldWriter<?, StackTraceElement> getFieldWriter(StackTraceElement object, String key) throws WamlException {
    final WamlFieldWriter<?, StackTraceElement> fieldWriter = FIELD_WRITERS.get(key);
    if (fieldWriter == null) {
      throw new WamlException(Notation.of("unsupported key: ")
                                      .appendSource(key)
                                      .toString());
    }
    return fieldWriter;
  }

  @Override
  public Iterator<WamlFieldWriter<?, StackTraceElement>> getFieldWriters(StackTraceElement object) {
    return FIELD_WRITERS.valueIterator();
  }

  @Override
  public @Nullable StackTraceElement initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlThrowables", "stackTraceElementFormat").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  @SuppressWarnings("SameNameButDifferent")
  static final UniformMap<String, WamlFieldParser<?, WamlStackTraceElementBuilder>> FIELD_PARSERS =
      UniformMap.of("loader", LoaderField.INSTANCE,
                    "module", ModuleField.INSTANCE,
                    "version", VersionField.INSTANCE,
                    "class", ClassField.INSTANCE,
                    "method", MethodField.INSTANCE,
                    "file", FileField.INSTANCE,
                    "line", LineField.INSTANCE,
                    "native", NativeField.INSTANCE);

  static final UniformMap<String, WamlFieldWriter<?, StackTraceElement>> FIELD_WRITERS =
      Assume.conforms(FIELD_PARSERS);

  static final WamlStackTraceElementFormat INSTANCE = new WamlStackTraceElementFormat();

  static final class LoaderField implements WamlFieldParser<String, WamlStackTraceElementBuilder>, WamlFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "loader";
    }

    @Override
    public WamlParser<String> valueParser() {
      return WamlLang.stringFormat();
    }

    @Override
    public WamlWriter<String> valueWriter() {
      return WamlLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String classLoaderName) {
      return classLoaderName != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getClassLoaderName();
    }

    @Override
    public WamlStackTraceElementBuilder updatedValue(WamlStackTraceElementBuilder builder, @Nullable String classLoaderName) {
      builder.classLoaderName = classLoaderName;
      return builder;
    }

    static final LoaderField INSTANCE = new LoaderField();

  }

  static final class ModuleField implements WamlFieldParser<String, WamlStackTraceElementBuilder>, WamlFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "module";
    }

    @Override
    public WamlParser<String> valueParser() {
      return WamlLang.stringFormat();
    }

    @Override
    public WamlWriter<String> valueWriter() {
      return WamlLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String moduleName) {
      return moduleName != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getModuleName();
    }

    @Override
    public WamlStackTraceElementBuilder updatedValue(WamlStackTraceElementBuilder builder, @Nullable String moduleName) {
      builder.moduleName = moduleName;
      return builder;
    }

    static final ModuleField INSTANCE = new ModuleField();

  }

  static final class VersionField implements WamlFieldParser<String, WamlStackTraceElementBuilder>, WamlFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "version";
    }

    @Override
    public WamlParser<String> valueParser() {
      return WamlLang.stringFormat();
    }

    @Override
    public WamlWriter<String> valueWriter() {
      return WamlLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String moduleVersion) {
      return moduleVersion != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getModuleVersion();
    }

    @Override
    public WamlStackTraceElementBuilder updatedValue(WamlStackTraceElementBuilder builder, @Nullable String moduleVersion) {
      builder.moduleVersion = moduleVersion;
      return builder;
    }

    static final VersionField INSTANCE = new VersionField();

  }

  static final class ClassField implements WamlFieldParser<String, WamlStackTraceElementBuilder>, WamlFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "class";
    }

    @Override
    public WamlParser<String> valueParser() {
      return WamlLang.stringFormat();
    }

    @Override
    public WamlWriter<String> valueWriter() {
      return WamlLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String className) {
      return className != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getClassName();
    }

    @Override
    public WamlStackTraceElementBuilder updatedValue(WamlStackTraceElementBuilder builder, @Nullable String className) {
      builder.className = className;
      return builder;
    }

    static final ClassField INSTANCE = new ClassField();

  }

  static final class MethodField implements WamlFieldParser<String, WamlStackTraceElementBuilder>, WamlFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "method";
    }

    @Override
    public WamlParser<String> valueParser() {
      return WamlLang.stringFormat();
    }

    @Override
    public WamlWriter<String> valueWriter() {
      return WamlLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String methodName) {
      return methodName != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getMethodName();
    }

    @Override
    public WamlStackTraceElementBuilder updatedValue(WamlStackTraceElementBuilder builder, @Nullable String methodName) {
      builder.methodName = methodName;
      return builder;
    }

    static final MethodField INSTANCE = new MethodField();

  }

  static final class FileField implements WamlFieldParser<String, WamlStackTraceElementBuilder>, WamlFieldWriter<String, StackTraceElement> {

    @Override
    public String key() {
      return "file";
    }

    @Override
    public WamlParser<String> valueParser() {
      return WamlLang.stringFormat();
    }

    @Override
    public WamlWriter<String> valueWriter() {
      return WamlLang.stringFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable String fileName) {
      return fileName != null;
    }

    @Override
    public @Nullable String getValue(StackTraceElement object) {
      return object.getFileName();
    }

    @Override
    public WamlStackTraceElementBuilder updatedValue(WamlStackTraceElementBuilder builder, @Nullable String fileName) {
      builder.fileName = fileName;
      return builder;
    }

    static final FileField INSTANCE = new FileField();

  }

  static final class LineField implements WamlFieldParser<Integer, WamlStackTraceElementBuilder>, WamlFieldWriter<Integer, StackTraceElement> {

    @Override
    public String key() {
      return "line";
    }

    @Override
    public WamlParser<Integer> valueParser() {
      return WamlLang.intFormat();
    }

    @Override
    public WamlWriter<Integer> valueWriter() {
      return WamlLang.intFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable Integer lineNumber) {
      return lineNumber != null && lineNumber.intValue() >= 0;
    }

    @Override
    public @Nullable Integer getValue(StackTraceElement object) {
      return Integer.valueOf(object.getLineNumber());
    }

    @Override
    public WamlStackTraceElementBuilder updatedValue(WamlStackTraceElementBuilder builder, @Nullable Integer lineNumber) {
      builder.lineNumber = lineNumber != null ? lineNumber.intValue() : -1;
      return builder;
    }

    static final LineField INSTANCE = new LineField();

  }

  static final class NativeField implements WamlFieldParser<Boolean, WamlStackTraceElementBuilder>, WamlFieldWriter<Boolean, StackTraceElement> {

    @Override
    public String key() {
      return "native";
    }

    @Override
    public WamlParser<Boolean> valueParser() {
      return WamlLang.booleanFormat();
    }

    @Override
    public WamlWriter<Boolean> valueWriter() {
      return WamlLang.booleanFormat();
    }

    @Override
    public boolean filterValue(StackTraceElement object, @Nullable Boolean nativeMethod) {
      return nativeMethod != null && nativeMethod.booleanValue();
    }

    @Override
    public @Nullable Boolean getValue(StackTraceElement object) {
      return Boolean.valueOf(object.isNativeMethod());
    }

    @Override
    public WamlStackTraceElementBuilder updatedValue(WamlStackTraceElementBuilder builder, @Nullable Boolean nativeMethod) {
      if (builder.lineNumber == -1 && nativeMethod != null && nativeMethod.booleanValue()) {
        builder.lineNumber = -2;
      } else if (builder.lineNumber == -2 && (nativeMethod == null || !nativeMethod.booleanValue())) {
        builder.lineNumber = -1;
      }
      return builder;
    }

    static final NativeField INSTANCE = new NativeField();

  }

}

final class WamlStackTraceElementBuilder {

  @Nullable String classLoaderName;
  @Nullable String moduleName;
  @Nullable String moduleVersion;
  @Nullable String className;
  @Nullable String methodName;
  @Nullable String fileName;
  int lineNumber;

  WamlStackTraceElementBuilder() {
    this.classLoaderName = null;
    this.moduleName = null;
    this.moduleVersion = null;
    this.className = null;
    this.methodName = null;
    this.fileName = null;
    this.lineNumber = -1;
  }

}

final class WamlThrowableFormat implements WamlFormat<Throwable>, WamlObjectParser<Object, WamlThrowableBuilder, Throwable>, WamlObjectWriter<Object, Throwable>, ToSource {

  @Override
  public @Nullable String typeName() {
    return "Throwable";
  }

  @Override
  public WamlThrowableBuilder objectBuilder(@Nullable Object attrs) {
    return new WamlThrowableBuilder();
  }

  @Override
  public WamlFieldParser<?, WamlThrowableBuilder> getFieldParser(WamlThrowableBuilder builder, String key) throws WamlException {
    final WamlFieldParser<?, WamlThrowableBuilder> fieldParser = FIELD_PARSERS.get(key);
    if (fieldParser == null) {
      throw new WamlException(Notation.of("unsupported key: ")
                                      .appendSource(key)
                                      .toString());
    }
    return fieldParser;
  }

  @Override
  public @Nullable Throwable buildObject(@Nullable Object attrs, WamlThrowableBuilder builder) throws WamlException {
    final Class<?> throwableClass;
    try {
      throwableClass = Class.forName(builder.className);
    } catch (ReflectiveOperationException cause) {
      throw new WamlException("unknown throwable class: " + builder.className, cause);
    }
    if (!Throwable.class.isAssignableFrom(throwableClass)) {
      throw new WamlException("non-throwable class: " + builder.className);
    }

    try {
      // new Throwable(String message, Throwable cause);
      final Constructor<?> constructor = throwableClass.getConstructor(String.class, Throwable.class);
      final Throwable throwable = (Throwable) constructor.newInstance(builder.message, builder.cause);
      throwable.setStackTrace(builder.stackTrace);
      return throwable;
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    try {
      // new Throwable(String message);
      final Constructor<?> constructor = throwableClass.getConstructor(String.class);
      final Throwable throwable = (Throwable) constructor.newInstance(builder.message);
      throwable.setStackTrace(builder.stackTrace);
      return throwable;
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    try {
      // new Throwable(Throwable cause);
      final Constructor<?> constructor = throwableClass.getConstructor(Throwable.class);
      final Throwable throwable = (Throwable) constructor.newInstance(builder.cause);
      throwable.setStackTrace(builder.stackTrace);
      return throwable;
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    try {
      // new Throwable();
      final Constructor<?> constructor = throwableClass.getConstructor();
      final Throwable throwable = (Throwable) constructor.newInstance();
      throwable.setStackTrace(builder.stackTrace);
      return throwable;
    } catch (ReflectiveOperationException cause) {
      // ignore
    }

    throw new WamlException("unable to construct throwable class: " + builder.className);
  }

  @Override
  public WamlFieldWriter<?, Throwable> getFieldWriter(Throwable object, String key) throws WamlException {
    final WamlFieldWriter<?, Throwable> fieldWriter = FIELD_WRITERS.get(key);
    if (fieldWriter == null) {
      throw new WamlException(Notation.of("unsupported key: ")
                                      .appendSource(key)
                                      .toString());
    }
    return fieldWriter;
  }

  @Override
  public Iterator<WamlFieldWriter<?, Throwable>> getFieldWriters(Throwable object) {
    return FIELD_WRITERS.valueIterator();
  }

  @Override
  public @Nullable Throwable initializer(@Nullable Object attrs) {
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("WamlThrowables", "throwableFormat").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  @SuppressWarnings("SameNameButDifferent")
  static final UniformMap<String, WamlFieldParser<?, WamlThrowableBuilder>> FIELD_PARSERS =
      UniformMap.of("class", ClassField.INSTANCE,
                    "message", MessageField.INSTANCE,
                    "trace", TraceField.INSTANCE,
                    "cause", CauseField.INSTANCE);

  static final UniformMap<String, WamlFieldWriter<?, Throwable>> FIELD_WRITERS =
      Assume.conforms(FIELD_PARSERS);

  static final WamlThrowableFormat INSTANCE = new WamlThrowableFormat();

  static final class ClassField implements WamlFieldParser<String, WamlThrowableBuilder>, WamlFieldWriter<String, Throwable> {

    @Override
    public String key() {
      return "class";
    }

    @Override
    public WamlParser<String> valueParser() {
      return WamlLang.stringFormat();
    }

    @Override
    public WamlWriter<String> valueWriter() {
      return WamlLang.stringFormat();
    }

    @Override
    public boolean filterValue(Throwable object, @Nullable String className) {
      return true;
    }

    @Override
    public @Nullable String getValue(Throwable object) {
      return object.getClass().getName();
    }

    @Override
    public WamlThrowableBuilder updatedValue(WamlThrowableBuilder builder, @Nullable String className) {
      builder.className = className;
      return builder;
    }

    static final ClassField INSTANCE = new ClassField();

  }

  static final class MessageField implements WamlFieldParser<String, WamlThrowableBuilder>, WamlFieldWriter<String, Throwable> {

    @Override
    public String key() {
      return "message";
    }

    @Override
    public WamlParser<String> valueParser() {
      return WamlLang.stringFormat();
    }

    @Override
    public WamlWriter<String> valueWriter() {
      return WamlLang.stringFormat();
    }

    @Override
    public boolean filterValue(Throwable object, @Nullable String message) {
      return message != null;
    }

    @Override
    public @Nullable String getValue(Throwable object) {
      return object.getMessage();
    }

    @Override
    public WamlThrowableBuilder updatedValue(WamlThrowableBuilder builder, @Nullable String message) {
      builder.message = message;
      return builder;
    }

    static final MessageField INSTANCE = new MessageField();

  }

  static final class TraceField implements WamlFieldParser<StackTraceElement[], WamlThrowableBuilder>, WamlFieldWriter<StackTraceElement[], Throwable> {

    @Override
    public String key() {
      return "trace";
    }

    @Override
    public WamlParser<StackTraceElement[]> valueParser() {
      return VALUE_FORMAT;
    }

    @Override
    public WamlWriter<StackTraceElement[]> valueWriter() {
      return VALUE_FORMAT;
    }

    @Override
    public boolean filterValue(Throwable object, @Nullable StackTraceElement[] stackTrace) {
      return stackTrace != null && stackTrace.length != 0;
    }

    @Override
    public @Nullable StackTraceElement[] getValue(Throwable object) {
      return object.getStackTrace();
    }

    @Override
    public WamlThrowableBuilder updatedValue(WamlThrowableBuilder builder, @Nullable StackTraceElement[] stackTrace) {
      builder.stackTrace = stackTrace;
      return builder;
    }

    static final WamlFormat<StackTraceElement[]> VALUE_FORMAT =
        WamlLang.arrayFormat(StackTraceElement.class, WamlThrowables.stackTraceElementFormat());

    static final TraceField INSTANCE = new TraceField();

  }

  static final class CauseField implements WamlFieldParser<Throwable, WamlThrowableBuilder>, WamlFieldWriter<Throwable, Throwable> {

    @Override
    public String key() {
      return "cause";
    }

    @Override
    public WamlParser<Throwable> valueParser() {
      return WamlThrowables.throwableFormat();
    }

    @Override
    public WamlWriter<Throwable> valueWriter() {
      return WamlThrowables.throwableFormat();
    }

    @Override
    public boolean filterValue(Throwable object, @Nullable Throwable cause) {
      return cause != null;
    }

    @Override
    public @Nullable Throwable getValue(Throwable object) {
      return object.getCause();
    }

    @Override
    public WamlThrowableBuilder updatedValue(WamlThrowableBuilder builder, @Nullable Throwable cause) {
      builder.cause = cause;
      return builder;
    }

    static final CauseField INSTANCE = new CauseField();

  }

}

final class WamlThrowableBuilder {

  @Nullable String className;
  @Nullable String message;
  @Nullable StackTraceElement[] stackTrace;
  @Nullable Throwable cause;

  WamlThrowableBuilder() {
    this.className = null;
    this.message = null;
    this.stackTrace = null;
    this.cause = null;
  }

}
