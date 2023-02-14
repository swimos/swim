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

import java.util.Objects;
import org.junit.jupiter.api.Test;
import swim.annotations.Nullable;
import swim.util.Murmur3;
import swim.util.Notation;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class JsonConversionsTests {

  public static class TestArticle {

    String name;

    TestArticle(String name) {
      this.name = name;
    }

    @Override
    public boolean equals(@Nullable Object other) {
      if (other instanceof TestArticle) {
        final TestArticle that = (TestArticle) other;
        return Objects.equals(this.name, that.name);
      }
      return false;
    }

    @Override
    public int hashCode() {
      return Murmur3.mash(Murmur3.mix(Murmur3.seed(TestArticle.class),
          Objects.hashCode(this.name)));
    }

    @Override
    public String toString() {
      final Notation notation = new Notation();
      notation.append("new TestArticle(").appendSource(this.name).append(")");
      return notation.toString();
    }

    public static TestArticle fromJsonString(String value) {
      return new TestArticle(value);
    }

    public static String toJsonString(TestArticle article) {
      return article.name;
    }

  }

  @Test
  public void parseUsingStringFactoryForm() {
    assertEquals(new TestArticle("foo"),
                 Json.parse(TestArticle.class, "\"foo\""));
  }

  @Test
  public void writeUsingStringFactoryForm() {
    assertEquals("\"foo\"",
                 Json.toString(new TestArticle("foo")));
  }

}
