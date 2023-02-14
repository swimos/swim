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

import org.junit.jupiter.api.Test;
import swim.codec.Codec;
import swim.codec.Format;
import swim.repr.Repr;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class WamlCodecTests {

  @Test
  public void loadWamlCodec() {
    assertEquals(Waml.codec(), Codec.getCodec("application/x-waml"));
  }

  @Test
  public void loadWamlReprTranscoder() {
    assertEquals(Waml.codec().forType(Repr.class),
                 Codec.getTranscoder("application/x-waml", Repr.class));
  }

  @Test
  public void loadWamlJavaTranscoder() {
    assertEquals(Waml.codec().forType(Object.class),
                 Codec.getTranscoder("application/x-waml", Object.class));
  }

  @Test
  public void loadWamlFormat() {
    assertEquals(Waml.codec(), Format.getFormat("application/x-waml"));
  }

  @Test
  public void loadWamlReprTranslator() {
    assertEquals(Waml.codec().forType(Repr.class),
                 Format.getTranslator("application/x-waml", Repr.class));
  }

  @Test
  public void loadWamlJavaTranslator() {
    assertEquals(Waml.codec().forType(Object.class),
                 Format.getTranslator("application/x-waml", Object.class));
  }

}
