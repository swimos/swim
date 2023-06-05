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
import swim.codec.CodecException;
import swim.codec.Format;
import swim.codec.MediaType;
import swim.codec.MetaCodec;
import swim.codec.MetaFormat;
import swim.repr.Repr;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class WamlMetaCodecTests {

  @Test
  public void loadWamlMetaCodec() throws CodecException {
    assertEquals(Waml.metaCodec(), MetaCodec.get(MediaType.parse("application/x-waml").getNonNull()));
  }

  @Test
  public void loadWamlReprCodec() throws CodecException, WamlException {
    assertEquals(Waml.metaCodec().getWamlFormat(Repr.class),
                 Codec.get(MediaType.parse("application/x-waml").getNonNull(), Repr.class));
  }

  @Test
  public void loadWamlJavaCodec() throws CodecException, WamlException {
    assertEquals(Waml.metaCodec().getWamlFormat(Object.class),
                 Codec.get(MediaType.parse("application/x-waml").getNonNull(), Object.class));
  }

  @Test
  public void loadWamlMetaFormat() throws CodecException {
    assertEquals(Waml.metaCodec(), MetaFormat.get(MediaType.parse("application/x-waml").getNonNull()));
  }

  @Test
  public void loadWamlReprFormat() throws CodecException, WamlException {
    assertEquals(Waml.metaCodec().getWamlFormat(Repr.class),
                 Format.get(MediaType.parse("application/x-waml").getNonNull(), Repr.class));
  }

  @Test
  public void loadWamlJavaFormat() throws CodecException, WamlException {
    assertEquals(Waml.metaCodec().getWamlFormat(Object.class),
                 Format.get(MediaType.parse("application/x-waml").getNonNull(), Object.class));
  }

}
