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

import org.junit.jupiter.api.Test;
import swim.codec.ParseException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class WamlThrowablesTests {

  @Test
  public void parseStackTraceElements() throws ParseException {
    assertEquals(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", "Main.java", 101),
                 Waml.parse(StackTraceElement.class, "{loader:\"com.foo.loader\",module:\"foo\",version:\"9.0\",class:\"com.foo.Main\",method:\"run\",file:\"Main.java\",line:101}").getNonNull());
    assertEquals(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", "Main.java", -1),
                 Waml.parse(StackTraceElement.class, "{loader:\"com.foo.loader\",module:\"foo\",version:\"9.0\",class:\"com.foo.Main\",method:\"run\",file:\"Main.java\"}").getNonNull());
    assertEquals(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", null, -1),
                 Waml.parse(StackTraceElement.class, "{loader:\"com.foo.loader\",module:\"foo\",version:\"9.0\",class:\"com.foo.Main\",method:\"run\"}").getNonNull());
    assertEquals(new StackTraceElement("com.foo.loader", null, null, "com.foo.bar.App", "run", "App.java", 12),
                 Waml.parse(StackTraceElement.class, "{loader:\"com.foo.loader\",class:\"com.foo.bar.App\",method:\"run\",file:\"App.java\",line:12}").getNonNull());
    assertEquals(new StackTraceElement(null, "acme", "2.1", "org.acme.Lib", "test", "Lib.java", 80),
                 Waml.parse(StackTraceElement.class, "{module:\"acme\",version:\"2.1\",class:\"org.acme.Lib\",method:\"test\",file:\"Lib.java\",line:80}").getNonNull());
    assertEquals(new StackTraceElement(null, null, null, "MyClass", "mash", "MyClass.java", 9),
                 Waml.parse(StackTraceElement.class, "{class:\"MyClass\",method:\"mash\",file:\"MyClass.java\",line:9}").getNonNull());
  }

  @Test
  public void writeStackTraceElements() {
    assertEquals("{loader:\"com.foo.loader\",module:\"foo\",version:\"9.0\",class:\"com.foo.Main\",method:\"run\",file:\"Main.java\",line:101}",
                 Waml.toString(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", "Main.java", 101), WamlWriterOptions.compact()));
    assertEquals("{loader:\"com.foo.loader\",module:\"foo\",version:\"9.0\",class:\"com.foo.Main\",method:\"run\",file:\"Main.java\"}",
                 Waml.toString(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", "Main.java", -1), WamlWriterOptions.compact()));
    assertEquals("{loader:\"com.foo.loader\",module:\"foo\",version:\"9.0\",class:\"com.foo.Main\",method:\"run\"}",
                 Waml.toString(new StackTraceElement("com.foo.loader", "foo", "9.0", "com.foo.Main", "run", null, -1), WamlWriterOptions.compact()));
    assertEquals("{loader:\"com.foo.loader\",class:\"com.foo.bar.App\",method:\"run\",file:\"App.java\",line:12}",
                 Waml.toString(new StackTraceElement("com.foo.loader", null, null, "com.foo.bar.App", "run", "App.java", 12), WamlWriterOptions.compact()));
    assertEquals("{module:\"acme\",version:\"2.1\",class:\"org.acme.Lib\",method:\"test\",file:\"Lib.java\",line:80}",
                 Waml.toString(new StackTraceElement(null, "acme", "2.1", "org.acme.Lib", "test", "Lib.java", 80), WamlWriterOptions.compact()));
    assertEquals("{class:\"MyClass\",method:\"mash\",file:\"MyClass.java\",line:9}",
                 Waml.toString(new StackTraceElement(null, null, null, "MyClass", "mash", "MyClass.java", 9), WamlWriterOptions.compact()));
  }

  @Test
  public void transcodeThrowables() throws ParseException {
    final Throwable cause0 = new UnsupportedOperationException();
    final Throwable throwable0 = new RuntimeException("whoops", cause0);
    final String wamlString = Waml.toString(throwable0);
    final Throwable throwable1 = Waml.<Throwable>parse(Throwable.class, wamlString).getNonNull();
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
