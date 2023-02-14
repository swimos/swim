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

import org.junit.jupiter.api.Test;
import swim.util.Assume;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class JsonThrowablesTests {

  @Test
  public void parseStackTraceElements() {
    assertEquals(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", "Main.java", 101),
                 Json.parse(StackTraceElement.class, "{\"loader\":\"com.foo.loader\",\"module\":\"foo\",\"version\":\"9.0\",\"class\":\"com.foo.Main\",\"method\":\"run\",\"file\":\"Main.java\",\"line\":101}"));
    assertEquals(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", "Main.java", -1),
                 Json.parse(StackTraceElement.class, "{\"loader\":\"com.foo.loader\",\"module\":\"foo\",\"version\":\"9.0\",\"class\":\"com.foo.Main\",\"method\":\"run\",\"file\":\"Main.java\"}"));
    assertEquals(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", null, -1),
                 Json.parse(StackTraceElement.class, "{\"loader\":\"com.foo.loader\",\"module\":\"foo\",\"version\":\"9.0\",\"class\":\"com.foo.Main\",\"method\":\"run\"}"));
    assertEquals(new StackTraceElement("com.foo.loader", null, null, "com.foo.bar.App", "run", "App.java", 12),
                 Json.parse(StackTraceElement.class, "{\"loader\":\"com.foo.loader\",\"class\":\"com.foo.bar.App\",\"method\":\"run\",\"file\":\"App.java\",\"line\":12}"));
    assertEquals(new StackTraceElement(null, "acme", "2.1", "org.acme.Lib", "test", "Lib.java", 80),
                 Json.parse(StackTraceElement.class, "{\"module\":\"acme\",\"version\":\"2.1\",\"class\":\"org.acme.Lib\",\"method\":\"test\",\"file\":\"Lib.java\",\"line\":80}"));
    assertEquals(new StackTraceElement(null, null, null, "MyClass", "mash", "MyClass.java", 9),
                 Json.parse(StackTraceElement.class, "{\"class\":\"MyClass\",\"method\":\"mash\",\"file\":\"MyClass.java\",\"line\":9}"));
  }

  @Test
  public void writeStackTraceElements() {
    assertEquals("{\"loader\":\"com.foo.loader\",\"module\":\"foo\",\"version\":\"9.0\",\"class\":\"com.foo.Main\",\"method\":\"run\",\"file\":\"Main.java\",\"line\":101}",
                 Json.toString(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", "Main.java", 101)));
    assertEquals("{\"loader\":\"com.foo.loader\",\"module\":\"foo\",\"version\":\"9.0\",\"class\":\"com.foo.Main\",\"method\":\"run\",\"file\":\"Main.java\"}",
                 Json.toString(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", "Main.java", -1)));
    assertEquals("{\"loader\":\"com.foo.loader\",\"module\":\"foo\",\"version\":\"9.0\",\"class\":\"com.foo.Main\",\"method\":\"run\"}",
                 Json.toString(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", null, -1)));
    assertEquals("{\"loader\":\"com.foo.loader\",\"class\":\"com.foo.bar.App\",\"method\":\"run\",\"file\":\"App.java\",\"line\":12}",
                 Json.toString(new StackTraceElement("com.foo.loader", null, null, "com.foo.bar.App", "run", "App.java", 12)));
    assertEquals("{\"module\":\"acme\",\"version\":\"2.1\",\"class\":\"org.acme.Lib\",\"method\":\"test\",\"file\":\"Lib.java\",\"line\":80}",
                 Json.toString(new StackTraceElement(null, "acme", "2.1", "org.acme.Lib", "test", "Lib.java", 80)));
    assertEquals("{\"class\":\"MyClass\",\"method\":\"mash\",\"file\":\"MyClass.java\",\"line\":9}",
                 Json.toString(new StackTraceElement(null, null, null, "MyClass", "mash", "MyClass.java", 9)));
  }

  @Test
  public void transcodeThrowables() {
    final Throwable cause0 = new UnsupportedOperationException();
    final Throwable throwable0 = new RuntimeException("whoops", cause0);
    final String jsonString = Json.toString(throwable0);
    final Throwable throwable1 = Assume.nonNull(Json.parse(Throwable.class, jsonString));
    final Throwable cause1 = throwable1.getCause();

    assertInstanceOf(RuntimeException.class, throwable1);
    assertEquals(throwable0.getMessage(), throwable1.getMessage());
    assertStackTraceEquals(throwable0.getStackTrace(), throwable1.getStackTrace());

    assertNotNull(cause1);
    assertInstanceOf(UnsupportedOperationException.class, cause1);
    assertEquals(cause0.getMessage(), cause1.getMessage());
    assertStackTraceEquals(cause0.getStackTrace(), cause1.getStackTrace());
    assertNull(cause0.getCause());
  }

  static void assertStackTraceEquals(StackTraceElement[] expected, StackTraceElement[] actual) {
    assertEquals(expected.length, actual.length);
    for (int i = 0; i < expected.length; i += 1) {
      final StackTraceElement expectedElement = expected[i];
      final StackTraceElement actualElement = actual[i];
      assertEquals(expectedElement.getClassLoaderName(), actualElement.getClassLoaderName());
      assertEquals(expectedElement.getModuleName(), actualElement.getModuleName());
      assertEquals(expectedElement.getModuleVersion(), actualElement.getModuleVersion());
      assertEquals(expectedElement.getClassName(), actualElement.getClassName());
      assertEquals(expectedElement.getMethodName(), actualElement.getMethodName());
      assertEquals(expectedElement.getFileName(), actualElement.getFileName());
      if (expectedElement.getLineNumber() >= 0) {
        assertEquals(expectedElement.getLineNumber(), actualElement.getLineNumber());
      } else {
        assertTrue(actualElement.getLineNumber() < 0);
      }
    }
  }

}
