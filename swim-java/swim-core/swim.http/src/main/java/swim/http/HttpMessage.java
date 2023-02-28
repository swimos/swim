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

package swim.http;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Binary;
import swim.codec.Codec;
import swim.codec.Decode;
import swim.codec.DecodeException;
import swim.codec.InputBuffer;
import swim.codec.MediaType;
import swim.codec.Output;
import swim.codec.Transcoder;
import swim.codec.Write;
import swim.collections.FingerTrieList;
import swim.http.header.ContentLengthHeader;
import swim.http.header.ContentTypeHeader;
import swim.http.header.TransferEncodingHeader;
import swim.util.Assume;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public abstract class HttpMessage<T> implements ToSource, ToString {

  HttpMessage() {
    // sealed
  }

  public abstract HttpVersion version();

  public abstract HttpHeaders headers();

  public abstract HttpMessage<T> withHeaders(HttpHeaders headers);

  public abstract HttpMessage<T> withHeaders(HttpHeader... headers);

  public abstract HttpPayload<T> payload();

  public abstract <T2> HttpMessage<T2> withPayload(HttpPayload<T2> payload);

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload(InputBuffer input, Transcoder<T2> transcoder) {
    final HttpHeaders headers = this.headers();
    long contentLength = -1;
    FingerTrieList<HttpTransferCoding> transferCodings = FingerTrieList.empty();

    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (header instanceof ContentLengthHeader) {
        contentLength = ((ContentLengthHeader) header).length();
      } else if (header instanceof TransferEncodingHeader) {
        transferCodings = ((TransferEncodingHeader) header).codings();
      }
    }

    if (!transferCodings.isEmpty()) {
      if (transferCodings.size() != 1 || !Assume.nonNull(transferCodings.head()).isChunked()) {
        return Decode.error(new DecodeException("Unsupported transfer-encoding: " + transferCodings.toMarkup()));
      }
      return HttpChunked.decode(input, transcoder);
    }

    if (contentLength >= 0L) {
      return HttpBody.decode(input, transcoder, contentLength);
    }

    return HttpEmpty.decode(input);
  }

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload(Transcoder<T2> transcoder) {
    final HttpHeaders headers = this.headers();
    long contentLength = -1;
    FingerTrieList<HttpTransferCoding> transferCodings = FingerTrieList.empty();

    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (header instanceof ContentLengthHeader) {
        contentLength = ((ContentLengthHeader) header).length();
      } else if (header instanceof TransferEncodingHeader) {
        transferCodings = ((TransferEncodingHeader) header).codings();
      }
    }

    if (!transferCodings.isEmpty()) {
      if (transferCodings.size() != 1 || !Assume.nonNull(transferCodings.head()).isChunked()) {
        return Decode.error(new DecodeException("Unsupported transfer-encoding: " + transferCodings.toMarkup()));
      }
      return HttpChunked.decode(transcoder);
    }

    if (contentLength >= 0L) {
      return HttpBody.decode(transcoder, contentLength);
    }

    return HttpEmpty.decode();
  }

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload(InputBuffer input) {
    final HttpHeaders headers = this.headers();
    MediaType contentType = null;
    long contentLength = -1;
    FingerTrieList<HttpTransferCoding> transferCodings = FingerTrieList.empty();

    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (header instanceof ContentTypeHeader) {
        contentType = ((ContentTypeHeader) header).mediaType();
      } else if (header instanceof ContentLengthHeader) {
        contentLength = ((ContentLengthHeader) header).length();
      } else if (header instanceof TransferEncodingHeader) {
        transferCodings = ((TransferEncodingHeader) header).codings();
      }
    }

    Codec codec = null;
    Transcoder<T2> transcoder = null;
    if (contentType != null) {
      codec = Codec.registry().getCodec(contentType);
    }
    if (codec != null) {
      transcoder = codec.getTranscoder(Object.class);
    }
    if (transcoder == null) {
      transcoder = Assume.conforms(Binary.byteBufferTranscoder());
    }

    if (!transferCodings.isEmpty()) {
      if (transferCodings.size() != 1 || !Assume.nonNull(transferCodings.head()).isChunked()) {
        return Decode.error(new DecodeException("Unsupported transfer-encoding: " + transferCodings.toMarkup()));
      }
      return HttpChunked.decode(input, transcoder);
    }

    if (contentLength >= 0L) {
      return HttpBody.decode(input, transcoder, contentLength);
    }

    return HttpEmpty.decode(input);
  }

  public <T2> Decode<? extends HttpPayload<T2>> decodePayload() {
    final HttpHeaders headers = this.headers();
    MediaType contentType = null;
    long contentLength = -1;
    FingerTrieList<HttpTransferCoding> transferCodings = FingerTrieList.empty();

    for (int i = 0, n = headers.size(); i < n; i += 1) {
      final HttpHeader header = headers.get(i);
      if (header instanceof ContentTypeHeader) {
        contentType = ((ContentTypeHeader) header).mediaType();
      } else if (header instanceof ContentLengthHeader) {
        contentLength = ((ContentLengthHeader) header).length();
      } else if (header instanceof TransferEncodingHeader) {
        transferCodings = ((TransferEncodingHeader) header).codings();
      }
    }

    Codec codec = null;
    Transcoder<T2> transcoder = null;
    if (contentType != null) {
      codec = Codec.registry().getCodec(contentType);
    }
    if (codec != null) {
      transcoder = codec.getTranscoder(Object.class);
    }
    if (transcoder == null) {
      transcoder = Assume.conforms(Binary.byteBufferTranscoder());
    }

    if (!transferCodings.isEmpty()) {
      if (transferCodings.size() != 1 || !Assume.nonNull(transferCodings.head()).isChunked()) {
        return Decode.error(new DecodeException("Unsupported transfer-encoding: " + transferCodings.toMarkup()));
      }
      return HttpChunked.decode(transcoder);
    }

    if (contentLength >= 0L) {
      return HttpBody.decode(transcoder, contentLength);
    }

    return HttpEmpty.decode();
  }

  public abstract Write<? extends HttpMessage<T>> write(Output<?> output);

  public abstract Write<? extends HttpMessage<T>> write();

}
