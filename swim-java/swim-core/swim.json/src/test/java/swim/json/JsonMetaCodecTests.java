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
import swim.codec.MetaCodec;
import swim.codec.MetaFormat;
import swim.repr.Repr;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class JsonMetaCodecTests {

  @Test
  public void loadJsonMetaCodec() throws CodecException {
    assertEquals(Json.metaCodec(), MetaCodec.get(MediaType.parse("application/json").getNonNull()));
    assertEquals(Json.metaCodec(), MetaCodec.get(MediaType.parse("text/json").getNonNull()));
  }

  @Test
  public void loadJsonReprCodec() throws CodecException, JsonException {
    assertEquals(Json.metaCodec().getJsonFormat(Repr.class),
                 Codec.get(MediaType.parse("application/json").getNonNull(), Repr.class));
  }

  @Test
  public void loadJsonJavaCodec() throws CodecException, JsonException {
    assertEquals(Json.metaCodec().getJsonFormat(Object.class),
                 Codec.get(MediaType.parse("application/json").getNonNull(), Object.class));
  }

  @Test
  public void loadJsonMetaFormat() throws CodecException {
    assertEquals(Json.metaCodec(), MetaFormat.get(MediaType.parse("application/json").getNonNull()));
    assertEquals(Json.metaCodec(), MetaFormat.get(MediaType.parse("text/json").getNonNull()));
  }

  @Test
  public void loadJsonReprFormat() throws CodecException, JsonException {
    assertEquals(Json.metaCodec().getJsonFormat(Repr.class),
                 Format.get(MediaType.parse("application/json").getNonNull(), Repr.class));
  }

  @Test
  public void loadJsonJavaFormat() throws CodecException, JsonException {
    assertEquals(Json.metaCodec().getJsonFormat(Object.class),
                 Format.get(MediaType.parse("application/json").getNonNull(), Object.class));
  }

}
