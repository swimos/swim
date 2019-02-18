// Copyright 2015-2019 SWIM.AI inc.
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

package swim.protobuf;

import swim.structure.Item;
import swim.structure.Value;

/**
 * Factory for constructing Protocol Buffer decoders and encoders.
 */
public final class Protobuf {
  private Protobuf() {
    // stub
  }

  private static ProtobufDecoder<Item, Value> modelDecoder;
  //private static ProtobufEncoder<Item, Value> modelEncoder;

  public static ProtobufDecoder<Item, Value> modelDecoder() {
    if (modelDecoder == null) {
      modelDecoder = new ProtobufModelDecoder();
    }
    return modelDecoder;
  }

  //public static ProtobufEncoder<Item, Value> modelEncoder() {
  //  if (modelEncoder == null) {
  //    modelEncoder = new ProtobufModelEncoder();
  //  }
  //  return modelEncoder;
  //}
}
