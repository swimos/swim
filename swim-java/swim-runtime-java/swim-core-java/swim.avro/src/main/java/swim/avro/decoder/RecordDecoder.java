// Copyright 2015-2021 Swim Inc.
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

package swim.avro.decoder;

import swim.avro.schema.AvroFieldType;
import swim.avro.schema.AvroRecordType;
import swim.codec.Decoder;
import swim.codec.DecoderException;
import swim.codec.InputBuffer;

final class RecordDecoder<T, R> extends Decoder<T> {

  final AvroDecoder avro;
  final AvroRecordType<T, R> type;
  final R record;
  final Decoder<?> valueDecoder;
  final int fieldIndex;

  RecordDecoder(AvroDecoder avro, AvroRecordType<T, R> type, R record,
                Decoder<?> valueDecoder, int fieldIndex) {
    this.avro = avro;
    this.type = type;
    this.record = record;
    this.valueDecoder = valueDecoder;
    this.fieldIndex = fieldIndex;
  }

  RecordDecoder(AvroDecoder avro, AvroRecordType<T, R> type) {
    this(avro, type, null, null, 0);
  }

  @Override
  public Decoder<T> feed(InputBuffer input) {
    return RecordDecoder.decode(input, this.avro, this.type, this.record,
                                this.valueDecoder, this.fieldIndex);
  }

  @SuppressWarnings("unchecked")
  static <T, R> Decoder<T> decode(InputBuffer input, AvroDecoder avro, AvroRecordType<T, R> type,
                                  R record, Decoder<?> valueDecoder, int fieldIndex) {
    do {
      if (valueDecoder == null) {
        if (fieldIndex < type.fieldCount()) {
          final AvroFieldType<?, R> fieldType = type.getField(fieldIndex);
          if (fieldType != null) {
            valueDecoder = avro.decodeType(fieldType.valueType(), input);
          } else {
            return Decoder.error(new DecoderException("unknown field: " + fieldIndex));
          }
        } else {
          if (record == null) {
            record = type.create();
          }
          return Decoder.done(type.cast(record));
        }
      }
      while (valueDecoder.isCont() && !input.isEmpty()) {
        valueDecoder = valueDecoder.feed(input);
      }
      if (valueDecoder.isDone()) {
        if (record == null) {
          record = type.create();
        }
        final AvroFieldType<Object, R> fieldType = (AvroFieldType<Object, R>) type.getField(fieldIndex);
        record = fieldType.updated(record, valueDecoder.bind());
        valueDecoder = null;
        fieldIndex += 1;
        continue;
      } else if (valueDecoder.isError()) {
        return valueDecoder.asError();
      }
      break;
    } while (true);
    if (input.isDone()) {
      return Decoder.error(new DecoderException("incomplete"));
    } else if (input.isError()) {
      return Decoder.error(input.trap());
    }
    return new RecordDecoder<T, R>(avro, type, record, valueDecoder, fieldIndex);
  }

  static <T, R> Decoder<T> decode(InputBuffer input, AvroDecoder avro, AvroRecordType<T, R> type) {
    return RecordDecoder.decode(input, avro, type, null, null, 0);
  }

}
