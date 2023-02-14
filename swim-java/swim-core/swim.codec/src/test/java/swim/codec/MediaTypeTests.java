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

package swim.codec;

import org.junit.jupiter.api.Test;

public class MediaTypeTests {

  @Test
  public void parseSimpleMediaTypes() {
    assertParses(MediaType.create("text", "plain"), "text/plain");
  }

  @Test
  public void writeSimpleMediaTypes() {
    assertWrites("text/plain", MediaType.create("text", "plain"));
  }

  @Test
  public void parseMediaTypesWithParams() {
    assertParses(MediaType.create("text", "html")
                          .withParam("charset", "UTF-8"),
                 "text/html;charset=UTF-8");
    assertParses(MediaType.create("text", "html")
                          .withParam("charset", "UTF-8"),
                 "text/html ; charset=UTF-8");
  }

  @Test
  public void writeMediaTypesWithParams() {
    assertWrites("text/html; charset=UTF-8",
                 MediaType.create("text", "html")
                          .withParam("charset", "UTF-8"));
  }

  @Test
  public void parseMediaTypesWithQuotedParams() {
    assertParses(MediaType.create("application", "json")
                          .withParam("format", "pretty print"),
                 "application/json;format=\"pretty print\"");
    assertParses(MediaType.create("application", "json")
                          .withParam("format", "pretty print"),
                 "application/json ; format=\"pretty print\"");
  }

  @Test
  public void writeMediaTypesWithQuotedParams() {
    assertWrites("application/json; format=\"pretty print\"",
                 MediaType.create("application", "json")
                          .withParam("format", "pretty print"));
  }

  @Test
  public void parseMediaTypesWithMultipleParams() {
    assertParses(MediaType.create("application", "json")
                          .withParam("charset", "UTF-8")
                          .withParam("format", "pretty print"),
                 "application/json;charset=UTF-8;format=\"pretty print\"");
    assertParses(MediaType.create("application", "json")
                          .withParam("charset", "UTF-8")
                          .withParam("format", "pretty print"),
                 "application/json ; charset=UTF-8 ; format=\"pretty print\"");
  }

  @Test
  public void writeMediaTypesWithMultipleParams() {
    assertWrites("application/json; charset=UTF-8; format=\"pretty print\"",
                 MediaType.create("application", "json")
                          .withParam("charset", "UTF-8")
                          .withParam("format", "pretty print"));
  }

  public static void assertParses(MediaType expected, String string) {
    CodecAssertions.assertParses(MediaType.parse(), expected, string);
  }

  public static void assertWrites(String expected, MediaType mediaType) {
    CodecAssertions.assertWrites(expected, mediaType::write);
  }

}
