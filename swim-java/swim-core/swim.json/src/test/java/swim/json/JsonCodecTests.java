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
import swim.codec.Codec;
import swim.codec.Format;
import swim.repr.Repr;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class JsonCodecTests {

  @Test
  public void loadJsonCodec() {
    assertEquals(Json.codec(), Codec.getCodec("application/json"));
    assertEquals(Json.codec(), Codec.getCodec("text/json"));
  }

  @Test
  public void loadJsonReprTranscoder() {
    assertEquals(Json.codec().forType(Repr.class),
                 Codec.getTranscoder("application/json", Repr.class));
  }

  @Test
  public void loadJsonJavaTranscoder() {
    assertEquals(Json.codec().forType(Object.class),
                 Codec.getTranscoder("application/json", Object.class));
  }

  @Test
  public void loadJsonFormat() {
    assertEquals(Json.codec(), Format.getFormat("application/json"));
    assertEquals(Json.codec(), Format.getFormat("text/json"));
  }

  @Test
  public void loadJsonReprTranslator() {
    assertEquals(Json.codec().forType(Repr.class),
                 Format.getTranslator("application/json", Repr.class));
  }

  @Test
  public void loadJsonJavaTranslator() {
    assertEquals(Json.codec().forType(Object.class),
                 Format.getTranslator("application/json", Object.class));
  }

}
