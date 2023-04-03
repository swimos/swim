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
import swim.codec.CodecException;
import swim.codec.Format;
import swim.codec.MediaType;
import swim.codec.Transcoder;
import swim.codec.Translator;
import swim.repr.Repr;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class JsonCodecTests {

  @Test
  public void loadJsonCodec() throws CodecException {
    assertEquals(Json.codec(), Codec.get(MediaType.parse("application/json").getNonNull()));
    assertEquals(Json.codec(), Codec.get(MediaType.parse("text/json").getNonNull()));
  }

  @Test
  public void loadJsonReprTranscoder() throws CodecException, JsonException {
    assertEquals(Json.codec().getJsonForm(Repr.class),
                 Transcoder.get(MediaType.parse("application/json").getNonNull(), Repr.class));
  }

  @Test
  public void loadJsonJavaTranscoder() throws CodecException, JsonException {
    assertEquals(Json.codec().getJsonForm(Object.class),
                 Transcoder.get(MediaType.parse("application/json").getNonNull(), Object.class));
  }

  @Test
  public void loadJsonFormat() throws CodecException {
    assertEquals(Json.codec(), Format.get(MediaType.parse("application/json").getNonNull()));
    assertEquals(Json.codec(), Format.get(MediaType.parse("text/json").getNonNull()));
  }

  @Test
  public void loadJsonReprTranslator() throws CodecException, JsonException {
    assertEquals(Json.codec().getJsonForm(Repr.class),
                 Translator.get(MediaType.parse("application/json").getNonNull(), Repr.class));
  }

  @Test
  public void loadJsonJavaTranslator() throws CodecException, JsonException {
    assertEquals(Json.codec().getJsonForm(Object.class),
                 Translator.get(MediaType.parse("application/json").getNonNull(), Object.class));
  }

}
