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

import java.lang.reflect.Constructor;
import java.lang.reflect.Type;
import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.Iterator;
import java.util.Map;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Output;
import swim.codec.Write;
import swim.collections.HashTrieMap;
import swim.expr.Term;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class JsonThrowables implements JsonProvider, ToSource {

  final int priority;

  private JsonThrowables(int priority) {
    this.priority = priority;
  }

  @Override
  public int priority() {
    return this.priority;
  }

  @Override
  public @Nullable JsonForm<?> resolveJsonForm(Type javaType) {
    if (javaType instanceof Class<?>) {
      final Class<?> javaClass = (Class<?>) javaType;
      if (StackTraceElement.class.isAssignableFrom(javaClass)) {
        return STACK_TRACE_ELEMENT_FORM;
      } else if (Throwable.class.isAssignableFrom(javaClass)) {
        return THROWABLE_FORM;
      }
    }
    return null;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonThrowables", "provider");
    if (this.priority != GENERIC_PRIORITY) {
      notation.appendArgument(this.priority);
    }
    notation.endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static JsonThrowables PROVIDER = new JsonThrowables(GENERIC_PRIORITY);

  public static JsonThrowables provider(int priority) {
    if (priority == GENERIC_PRIORITY) {
      return PROVIDER;
    } else {
      return new JsonThrowables(priority);
    }
  }

  public static JsonThrowables provider() {
    return PROVIDER;
  }

  private static final JsonStackTraceElementForm STACK_TRACE_ELEMENT_FORM = new JsonStackTraceElementForm();

  public static JsonForm<StackTraceElement> stackTraceElementForm() {
    return STACK_TRACE_ELEMENT_FORM;
  }

  static final JsonForm<StackTraceElement[]> STACK_TRACE_ELEMENT_ARRAY_FORM = JsonJava.arrayForm(StackTraceElement.class, STACK_TRACE_ELEMENT_FORM);

  private static final JsonThrowableForm THROWABLE_FORM = new JsonThrowableForm();

  public static JsonForm<Throwable> throwableForm() {
    return THROWABLE_FORM;
  }

}

final class JsonStackTraceElementForm implements JsonObjectForm<String, Object, StackTraceElement, StackTraceElement>, ToSource {

  @Override
  public JsonForm<String> keyForm() {
    return JsonJava.keyForm();
  }

  @Override
  public @Nullable JsonFieldForm<String, Object, StackTraceElement> getFieldForm(String key) {
    return Assume.conformsNullable(FIELDS.get(key));
  }

  @Override
  public StackTraceElement objectBuilder() {
    return new StackTraceElement(null, null, null, "", "", null, -1);
  }

  @Override
  public StackTraceElement buildObject(StackTraceElement element) {
    return element;
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable StackTraceElement value, JsonWriter writer) {
    if (value != null) {
      return writer.writeObject(output, this, new JsonStackTraceElementForm.FieldIterator(value, 0));
    } else {
      return writer.writeNull(output);
    }
  }

  @Override
  public Term intoTerm(@Nullable StackTraceElement value) {
    return Term.from(value);
  }

  @Override
  public @Nullable StackTraceElement fromTerm(Term term) {
    return term.objectValue(StackTraceElement.class);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonThrowables", "stackTraceElementForm").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final HashTrieMap<String, JsonFieldForm<String, ?, StackTraceElement>> FIELDS;

  static {
    HashTrieMap<String, JsonFieldForm<String, ?, StackTraceElement>> fields = HashTrieMap.empty();
    fields = fields.updated("loader", new JsonStackTraceElementForm.ClassLoaderNameField());
    fields = fields.updated("module", new JsonStackTraceElementForm.ModuleNameField());
    fields = fields.updated("version", new JsonStackTraceElementForm.ModuleVersionField());
    fields = fields.updated("class", new JsonStackTraceElementForm.ClassNameField());
    fields = fields.updated("method", new JsonStackTraceElementForm.MethodNameField());
    fields = fields.updated("file", new JsonStackTraceElementForm.FileNameField());
    fields = fields.updated("line", new JsonStackTraceElementForm.LineNumberField());
    fields = fields.updated("native", new JsonStackTraceElementForm.IsNativeField());
    FIELDS = fields;
  }

  static final class ClassLoaderNameField implements JsonFieldForm<String, String, StackTraceElement> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<String> valueForm() {
      return JsonJava.stringForm();
    }

    @Override
    public StackTraceElement updateField(StackTraceElement element, String key, @Nullable String classLoaderName) {
      return new StackTraceElement(classLoaderName,
                                   element.getModuleName(),
                                   element.getModuleVersion(),
                                   element.getClassName(),
                                   element.getMethodName(),
                                   element.getFileName(),
                                   element.getLineNumber());
    }

  }

  static final class ModuleNameField implements JsonFieldForm<String, String, StackTraceElement> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<String> valueForm() {
      return JsonJava.stringForm();
    }

    @Override
    public StackTraceElement updateField(StackTraceElement element, String key, @Nullable String moduleName) {
      return new StackTraceElement(element.getClassLoaderName(),
                                   moduleName,
                                   element.getModuleVersion(),
                                   element.getClassName(),
                                   element.getMethodName(),
                                   element.getFileName(),
                                   element.getLineNumber());
    }

  }

  static final class ModuleVersionField implements JsonFieldForm<String, String, StackTraceElement> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<String> valueForm() {
      return JsonJava.stringForm();
    }

    @Override
    public StackTraceElement updateField(StackTraceElement element, String key, @Nullable String moduleVersion) {
      return new StackTraceElement(element.getClassLoaderName(),
                                   element.getModuleName(),
                                   moduleVersion,
                                   element.getClassName(),
                                   element.getMethodName(),
                                   element.getFileName(),
                                   element.getLineNumber());
    }

  }

  static final class ClassNameField implements JsonFieldForm<String, String, StackTraceElement> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<String> valueForm() {
      return JsonJava.stringForm();
    }

    @Override
    public StackTraceElement updateField(StackTraceElement element, String key, @Nullable String className) {
      return new StackTraceElement(element.getClassLoaderName(),
                                   element.getModuleName(),
                                   element.getModuleVersion(),
                                   className,
                                   element.getMethodName(),
                                   element.getFileName(),
                                   element.getLineNumber());
    }

  }

  static final class MethodNameField implements JsonFieldForm<String, String, StackTraceElement> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<String> valueForm() {
      return JsonJava.stringForm();
    }

    @Override
    public StackTraceElement updateField(StackTraceElement element, String key, @Nullable String methodName) {
      return new StackTraceElement(element.getClassLoaderName(),
                                   element.getModuleName(),
                                   element.getModuleVersion(),
                                   element.getClassName(),
                                   methodName,
                                   element.getFileName(),
                                   element.getLineNumber());
    }

  }

  static final class FileNameField implements JsonFieldForm<String, String, StackTraceElement> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<String> valueForm() {
      return JsonJava.stringForm();
    }

    @Override
    public StackTraceElement updateField(StackTraceElement element, String key, @Nullable String fileName) {
      return new StackTraceElement(element.getClassLoaderName(),
                                   element.getModuleName(),
                                   element.getModuleVersion(),
                                   element.getClassName(),
                                   element.getMethodName(),
                                   fileName,
                                   element.getLineNumber());
    }

  }

  static final class LineNumberField implements JsonFieldForm<String, Integer, StackTraceElement> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<Integer> valueForm() {
      return JsonJava.intForm();
    }

    @Override
    public StackTraceElement updateField(StackTraceElement element, String key, @Nullable Integer lineNumber) {
      return new StackTraceElement(element.getClassLoaderName(),
                                   element.getModuleName(),
                                   element.getModuleVersion(),
                                   element.getClassName(),
                                   element.getMethodName(),
                                   element.getFileName(),
                                   lineNumber);
    }

  }

  static final class IsNativeField implements JsonFieldForm<String, Boolean, StackTraceElement> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<Boolean> valueForm() {
      return JsonJava.booleanForm();
    }

    @Override
    public StackTraceElement updateField(StackTraceElement element, String key, @Nullable Boolean value) {
      return element; // can't create native stack trace elements
    }

  }

  static final class FieldIterator implements Iterator<Map.Entry<String, Object>> {

    final StackTraceElement element;
    int index;

    FieldIterator(StackTraceElement element, int index) {
      this.element = element;
      this.index = index;
    }

    @SuppressWarnings("fallthrough")
    @Override
    public boolean hasNext() {
      switch (this.index) {
        case 0:
          if (this.element.getClassLoaderName() != null) {
            return true;
          } else {
            this.index = 1;
          }
        case 1:
          if (this.element.getModuleName() != null) {
            return true;
          } else {
            this.index = 2;
          }
        case 2:
          if (this.element.getModuleVersion() != null) {
            return true;
          } else {
            this.index = 3;
          }
        case 3:
          if (this.element.getClassName() != null) {
            return true;
          } else {
            this.index = 4;
          }
        case 4:
          if (this.element.getMethodName() != null) {
            return true;
          } else {
            this.index = 5;
          }
        case 5:
          if (this.element.getFileName() != null) {
            return true;
          } else {
            this.index = 6;
          }
        case 6:
          if (this.element.getLineNumber() >= 0) {
            return true;
          } else {
            this.index = 7;
          }
        case 7:
          if (this.element.isNativeMethod()) {
            return true;
          } else {
            this.index = 8;
          }
        default:
          return false;
      }
    }

    @SuppressWarnings("fallthrough")
    @Override
    public Map.Entry<String, Object> next() {
      switch (this.index) {
        case 0:
          this.index = 1;
          if (this.element.getClassLoaderName() != null) {
            return new SimpleImmutableEntry<String, Object>("loader", this.element.getClassLoaderName());
          }
        case 1:
          this.index = 2;
          if (this.element.getModuleName() != null) {
            return new SimpleImmutableEntry<String, Object>("module", this.element.getModuleName());
          }
        case 2:
          this.index = 3;
          if (this.element.getModuleVersion() != null) {
            return new SimpleImmutableEntry<String, Object>("version", this.element.getModuleVersion());
          }
        case 3:
          this.index = 4;
          if (this.element.getClassName() != null) {
            return new SimpleImmutableEntry<String, Object>("class", this.element.getClassName());
          }
        case 4:
          this.index = 5;
          if (this.element.getMethodName() != null) {
            return new SimpleImmutableEntry<String, Object>("method", this.element.getMethodName());
          }
        case 5:
          this.index = 6;
          if (this.element.getFileName() != null) {
            return new SimpleImmutableEntry<String, Object>("file", this.element.getFileName());
          }
        case 6:
          this.index = 7;
          if (this.element.getLineNumber() >= 0) {
            return new SimpleImmutableEntry<String, Object>("line", this.element.getLineNumber());
          }
        case 7:
          this.index = 8;
          if (this.element.isNativeMethod()) {
            return new SimpleImmutableEntry<String, Object>("native", this.element.isNativeMethod());
          }
        default:
          throw new UnsupportedOperationException();
      }
    }

  }

}

final class JsonThrowableForm implements JsonObjectForm<String, Object, Throwable, Throwable>, ToSource {

  @Override
  public JsonForm<String> keyForm() {
    return JsonJava.keyForm();
  }

  @Override
  public @Nullable JsonFieldForm<String, Object, Throwable> getFieldForm(String key) {
    return Assume.conformsNullable(FIELDS.get(key));
  }

  @Override
  public Throwable objectBuilder() {
    return new Throwable();
  }

  @Override
  public Throwable buildObject(Throwable throwable) {
    return throwable;
  }

  @Override
  public Write<?> write(Output<?> output, @Nullable Throwable throwable, JsonWriter writer) {
    if (throwable != null) {
      return writer.writeObject(output, this, new JsonThrowableForm.FieldIterator(throwable, 0));
    } else {
      return writer.writeNull(output);
    }
  }

  @Override
  public Term intoTerm(@Nullable Throwable value) {
    return Term.from(value);
  }

  @Override
  public @Nullable Throwable fromTerm(Term term) {
    return term.objectValue(Throwable.class);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("JsonThrowables", "throwableForm").endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final HashTrieMap<String, JsonFieldForm<String, ?, Throwable>> FIELDS;

  static {
    HashTrieMap<String, JsonFieldForm<String, ?, Throwable>> fields = HashTrieMap.empty();
    fields = fields.updated("class", new JsonThrowableForm.ClassField());
    fields = fields.updated("message", new JsonThrowableForm.MessageField());
    fields = fields.updated("trace", new JsonThrowableForm.StackTraceField());
    fields = fields.updated("cause", new JsonThrowableForm.CauseField());
    FIELDS = fields;
  }

  static final class ClassField implements JsonFieldForm<String, String, Throwable> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<String> valueForm() {
      return JsonJava.stringForm();
    }

    @Override
    public Throwable updateField(Throwable throwable, String key, @Nullable String className) {
      final Class<?> throwableClass;
      try {
        throwableClass = Class.forName(className);
        if (!Throwable.class.isAssignableFrom(throwableClass)) {
          return throwable;
        }
      } catch (ReflectiveOperationException error) {
        return throwable; // swallow
      }

      try {
        // new Throwable(String message, Throwable cause);
        final Constructor<?> constructor = throwableClass.getConstructor(String.class, Throwable.class);
        final Throwable newThrowable = (Throwable) constructor.newInstance(throwable.getMessage(), throwable.getCause());
        newThrowable.setStackTrace(throwable.getStackTrace());
        return newThrowable;
      } catch (ReflectiveOperationException error) {
        // swallow
      }

      try {
        // new Throwable(String message);
        final Constructor<?> constructor = throwableClass.getConstructor(String.class);
        final Throwable newThrowable = (Throwable) constructor.newInstance(throwable.getMessage());
        newThrowable.setStackTrace(throwable.getStackTrace());
        return newThrowable;
      } catch (ReflectiveOperationException error) {
        // swallow
      }

      try {
        // new Throwable(Throwable cause);
        final Constructor<?> constructor = throwableClass.getConstructor(Throwable.class);
        final Throwable newThrowable = (Throwable) constructor.newInstance(throwable.getCause());
        newThrowable.setStackTrace(throwable.getStackTrace());
        return newThrowable;
      } catch (ReflectiveOperationException error) {
        // swallow
      }

      try {
        // new Throwable();
        final Constructor<?> constructor = throwableClass.getConstructor();
        final Throwable newThrowable = (Throwable) constructor.newInstance();
        newThrowable.setStackTrace(throwable.getStackTrace());
        return newThrowable;
      } catch (ReflectiveOperationException error) {
        // swallow
      }

      return throwable; // unable to instantiate specialized throwable
    }

  }

  static final class MessageField implements JsonFieldForm<String, String, Throwable> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<String> valueForm() {
      return JsonJava.stringForm();
    }

    @Override
    public Throwable updateField(Throwable throwable, String key, @Nullable String message) {
      final Class<?> throwableClass = throwable.getClass();

      try {
        // new Throwable(String message, Throwable cause);
        final Constructor<?> constructor = throwableClass.getConstructor(String.class, Throwable.class);
        final Throwable newThrowable = (Throwable) constructor.newInstance(message, throwable.getCause());
        newThrowable.setStackTrace(throwable.getStackTrace());
        return newThrowable;
      } catch (ReflectiveOperationException error) {
        // swallow
      }

      try {
        // new Throwable(String message);
        final Constructor<?> constructor = throwableClass.getConstructor(String.class);
        final Throwable newThrowable = (Throwable) constructor.newInstance(message);
        newThrowable.setStackTrace(throwable.getStackTrace());
        return newThrowable;
      } catch (ReflectiveOperationException error) {
        // swallow
      }

      return throwable; // unable to instantiate throwable with message
    }

  }

  static final class StackTraceField implements JsonFieldForm<String, StackTraceElement[], Throwable> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<StackTraceElement[]> valueForm() {
      return JsonThrowables.STACK_TRACE_ELEMENT_ARRAY_FORM;
    }

    @Override
    public Throwable updateField(Throwable throwable, String key, @Nullable StackTraceElement[] stackTrace) {
      throwable.setStackTrace(stackTrace);
      return throwable;
    }

  }

  static final class CauseField implements JsonFieldForm<String, Throwable, Throwable> {

    @Override
    public JsonForm<String> keyForm() {
      return JsonJava.keyForm();
    }

    @Override
    public JsonForm<Throwable> valueForm() {
      return JsonThrowables.throwableForm();
    }

    @Override
    public Throwable updateField(Throwable throwable, String key, @Nullable Throwable cause) {
      final Class<?> throwableClass = throwable.getClass();

      try {
        // new Throwable(String message, Throwable cause);
        final Constructor<?> constructor = throwableClass.getConstructor(String.class, Throwable.class);
        final Throwable newThrowable = (Throwable) constructor.newInstance(throwable.getMessage(), cause);
        newThrowable.setStackTrace(throwable.getStackTrace());
        return newThrowable;
      } catch (ReflectiveOperationException error) {
        // swallow
      }

      try {
        throwable.initCause(cause);
      } catch (IllegalStateException error) {
        // swallow
      }

      return throwable;
    }

  }

  static final class FieldIterator implements Iterator<Map.Entry<String, Object>> {

    final Throwable throwable;
    int index;

    FieldIterator(Throwable throwable, int index) {
      this.throwable = throwable;
      this.index = index;
    }

    @SuppressWarnings("fallthrough")
    @Override
    public boolean hasNext() {
      switch (this.index) {
        case 0:
          return true;
        case 1:
          if (this.throwable.getMessage() != null) {
            return true;
          } else {
            this.index = 2;
          }
        case 2:
          if (this.throwable.getStackTrace().length != 0) {
            return true;
          } else {
            this.index = 3;
          }
        case 3:
          if (this.throwable.getCause() != null) {
            return true;
          } else {
            this.index = 4;
          }
        default:
          return false;
      }
    }

    @SuppressWarnings("fallthrough")
    @Override
    public Map.Entry<String, Object> next() {
      switch (this.index) {
        case 0:
          this.index = 1;
          return new SimpleImmutableEntry<String, Object>("class", this.throwable.getClass().getName());
        case 1:
          this.index = 2;
          if (this.throwable.getMessage() != null) {
            return new SimpleImmutableEntry<String, Object>("message", this.throwable.getMessage());
          }
        case 2:
          this.index = 3;
          if (this.throwable.getStackTrace().length != 0) {
            return new SimpleImmutableEntry<String, Object>("trace", this.throwable.getStackTrace());
          }
        case 3:
          this.index = 4;
          if (this.throwable.getCause() != null) {
            return new SimpleImmutableEntry<String, Object>("cause", this.throwable.getCause());
          }
        default:
          throw new UnsupportedOperationException();
      }
    }

  }

}
