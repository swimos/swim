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

package swim.decipher;

import swim.codec.Decoder;
import swim.codec.Input;
import swim.codec.InputBuffer;
import swim.codec.Output;
import swim.codec.Parser;
import swim.json.Json;
import swim.protobuf.Protobuf;
import swim.recon.Recon;
import swim.structure.Data;
import swim.structure.Item;
import swim.structure.Text;
import swim.structure.Value;
import swim.xml.Xml;

public class DecipherStructureDecoder extends DecipherDecoder<Item, Value> {
  @Override
  public Parser<Value> xmlParser() {
    return Xml.structureParser().documentParser();
  }

  @Override
  public Parser<Value> parseXml(Input input) {
    return Xml.structureParser().parseDocument(input);
  }

  @Override
  public Parser<Value> jsonParser() {
    return Json.structureParser().objectParser();
  }

  @Override
  public Parser<Value> parseJson(Input input) {
    return Json.structureParser().parseObject(input);
  }

  @Override
  public Parser<Value> reconParser() {
    return Recon.structureParser().blockParser();
  }

  @Override
  public Parser<Value> parseRecon(Input input) {
    return Recon.structureParser().parseBlock(input);
  }

  @Override
  public Decoder<Value> protobufDecoder() {
    return Protobuf.structureDecoder().payloadDecoder();
  }

  @Override
  public Decoder<Value> decodeProtobuf(InputBuffer input) {
    return Protobuf.structureDecoder().decodePayload(input);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Output<Value> textOutput() {
    return (Output<Value>) (Output<?>) Text.output();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Output<Value> dataOutput() {
    return (Output<Value>) (Output<?>) Data.output();
  }
}
